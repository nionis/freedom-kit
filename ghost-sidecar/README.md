# Ghost Sidecar for Tauri

This package bundles Ghost CMS as a standalone executable to be used as a Tauri sidecar.

## How it works

1. **Development Mode**: When running the Node.js script directly, it uses the `local` folder in place
2. **Production Mode**: When packaged with `pkg`, the `local` folder is bundled into the binary and extracted to `~/.ghost-freedom-kit/local` on first run

## Building

To build the Ghost sidecar binary:

```bash
cd ghost-sidecar
yarn install
yarn build
```

This will create a `ghost-sidecar` binary in `../src-tauri/binaries/` directory.

### Building for multiple platforms

```bash
yarn build:all
```

This will build for macOS (ARM64), Linux (x64), and Windows (x64).

## Package Structure

- `index.js` - Main entry point that starts Ghost
- `local/` - Ghost installation and data directory
  - `current/` - Ghost application files
  - `content/` - User data (posts, images, themes, etc.)
  - `config.development.json` - Ghost configuration

## Data Location

When running as a packaged binary, Ghost data is stored at:

- **macOS/Linux**: `~/.ghost-freedom-kit/local`
- **Windows**: `C:\Users\<username>\.ghost-freedom-kit\local`

On first run, the bundled `local` folder is copied to this location. This ensures Ghost can write to its data directory and persist changes between runs.

## Configuration

The `pkg` configuration in `package.json` specifies:

- **output**: Name of the binary
- **assets**: Files to bundle (entire `local` folder)
- **outputPath**: Where to place the built binary
- **targets**: Platform/architecture targets

## Integration with Tauri

The binary is configured as an external binary in Tauri's `tauri.conf.json`:

```json
{
  "bundle": {
    "externalBin": ["binaries/ghost-sidecar"]
  }
}
```

Tauri will automatically bundle this binary with your application.
