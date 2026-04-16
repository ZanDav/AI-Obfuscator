import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as pathMod from 'path';

const ALGORITHM = 'aes-256-cbc';
const MAGIC_PREFIX = 'AIOBF:';

/**
 * AI Obfuscator Extension
 * Encrypts/Decrypts files using HEX encoding to allow text-safe storage.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('AI Obfuscator is now active');

    const storagePath = context.globalStorageUri.fsPath;
    const keyPath = pathMod.join(storagePath, 'secret.key');

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }

    let secretKey: Buffer;
    if (fs.existsSync(keyPath)) {
        secretKey = fs.readFileSync(keyPath);
    } else {
        secretKey = crypto.randomBytes(32);
        fs.writeFileSync(keyPath, secretKey);
        vscode.window.showInformationMessage('AI Obfuscator: A unique encryption key has been generated.');
    }

    const iv = crypto.createHash('sha256').update(secretKey).digest().slice(0, 16);

    // --- ENCRYPT COMMAND ---
    let encryptCommand = vscode.commands.registerCommand('ai-obfuscator.encrypt', async (uri: vscode.Uri) => {
        if (!uri) return;
        try {
            const rawData = await vscode.workspace.fs.readFile(uri);
            const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
            
            const encryptedPayload = Buffer.concat([cipher.update(rawData), cipher.final()]);
            
            // Store as MAGIC + HEX string so it's safe to open/edit as text in VS Code
            const outputText = MAGIC_PREFIX + encryptedPayload.toString('hex');
            
            const obfUri = vscode.Uri.file(uri.fsPath + '.obf');
            await vscode.workspace.fs.writeFile(uri, Buffer.from(outputText));
            await vscode.workspace.fs.rename(uri, obfUri);

            vscode.window.setStatusBarMessage(`$(lock) Encrypted: ${pathMod.basename(obfUri.fsPath)}`, 3000);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Encryption error: ${err.message}`);
        }
    });

    // --- DECRYPT COMMAND ---
    let decryptCommand = vscode.commands.registerCommand('ai-obfuscator.decrypt', async (uri: vscode.Uri) => {
        if (!uri) return;
        try {
            const rawContent = await vscode.workspace.fs.readFile(uri);
            const contentStr = Buffer.from(rawContent).toString('utf8');

            if (!contentStr.startsWith(MAGIC_PREFIX)) {
                throw new Error("This file does not have a valid AI Obfuscator header.");
            }

            const hexPayload = contentStr.slice(MAGIC_PREFIX.length).trim();
            
            // Check if hex character count is even
            if (hexPayload.length % 2 !== 0) {
                throw new Error("File content is corrupted (invalid length).");
            }

            const encryptedBuffer = Buffer.from(hexPayload, 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

            const restoredPath = uri.fsPath.endsWith('.obf') ? uri.fsPath.slice(0, -4) : uri.fsPath;
            const restoredUri = vscode.Uri.file(restoredPath);

            await vscode.workspace.fs.writeFile(uri, decrypted);
            if (uri.fsPath !== restoredUri.fsPath) {
                await vscode.workspace.fs.rename(uri, restoredUri);
            }

            vscode.window.setStatusBarMessage(`$(lock-open) Decrypted: ${pathMod.basename(restoredUri.fsPath)}`, 3000);
        } catch (err: any) {
            // Provide a user-friendly message instead of technical crypto errors
            const userMessage = "Decryption failed. The file appears to have been manually modified, corrupted, or used with a different key.";
            vscode.window.showErrorMessage(`AI Obfuscator: ${userMessage}`);
            console.error(err);
        }
    });

    context.subscriptions.push(encryptCommand, decryptCommand);
}

export function deactivate() {}