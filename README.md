# AI Obfuscator

AI Obfuscator is a Visual Studio Code extension designed to protect your sensitive code and data from being read or indexed by AI assistants. It provides a simple way to encrypt and decrypt files directly from your workspace.

## Features

- **Context Menu Integration**: Right-click any file in the Explorer or Editor to Encrypt or Decrypt.
- **Smart Visibility**: Only shows "Encrypt" when a file is plain text, and "Decrypt" when a file is already obfuscated (ends in `.obf`).
- **Secure Encryption**: Uses AES-256-CBC with a persistent, unique key generated specifically for your installation.
- **In-Place Transformation**: Files are encrypted and renamed with a `.obf` extension to signal their protected state.

## How to Use

### Encrypting a file
1. Right-click a file in the **Explorer** or inside the **Editor**.
2. Select **AI Obfuscator: Encrypt (Obfuscate for AI)**.
3. The file will be encrypted and renamed to `filename.extension.obf`.

### Decrypting a file
1. Right-click a file with the `.obf` extension.
2. Select **AI Obfuscator: Decrypt (Restore Content)**.
3. The file will be decrypted and restored to its original name and content.

## Security Note

The decryption key is generated on the first run and stored in your VS Code's private global storage. Please ensure you don't lose access to your local configuration if you intend to decrypt these files later on the same machine.

## Extension Settings

This extension currently does not require any additional settings.

## Release Notes

### 1.0.0
- Initial release.
- Added AES-256-CBC encryption.
- Context menu integration.
- Automatic file renaming to `.obf`.
