# Build Linux

Tested on 2026-05-25.

```sh
bun install
bun run typecheck
bun run build:web
```

For the desktop app:

```sh
bun run dev
bun run tauri build
```

The desktop build may require Rust, system webkit/gtk dependencies, and Tauri Linux packaging dependencies.
