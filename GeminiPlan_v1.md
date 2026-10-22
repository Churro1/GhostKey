<!-- ### Step 1: Environment & Tooling Setup

Run these commands in your macOS terminal to ensure the core toolchain is installed and up to date:

```bash
# 1. Install Xcode Command Line Tools (required for Apple SDK headers and C/C++ build steps)
xcode-select --install

# 2. Install Rust via rustup (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 3. Verify toolchain versions
rustc --version
cargo --version
node -v
npm -v  # or npm / yarn

```

---

### Step 2: Scaffold the Project

Use the official Tauri generator to scaffold the shell, choosing **React** and **TypeScript**:

```bash
# Create the project directory and scaffold with Tauri v2
npm create tauri-app@latest ghostkey --template react-ts

# Enter directory
cd ghostkey

# Install the frontend dependencies
npm install

```

---

### Step 3: Add Styling (Tailwind CSS)

Configure Tailwind inside your Vite project for fast styling:

```bash
# Install Tailwind CSS and its Vite plugins
npm add -D tailwindcss @tailwindcss/vite

```

In your `vite.config.ts`, include the Tailwind plugin:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
```

In `src/index.css` (or `src/App.css`), import Tailwind:

```css
@import "tailwindcss";
```

---

### Step 4: Configure the Rust Backend

Inside the `src-tauri` folder, configure your Rust dependencies.

```bash
cd src-tauri

# Add the global input listener and serialization crates to Cargo.toml
cargo add rdev
cargo add serde --features derive
cargo add serde_json

cd ..

```

---

### Step 5: Configure Frameless Transparency (`tauri.conf.json`)

To turn GhostKey into a floating HUD overlay:

1. Open `src-tauri/tauri.conf.json`.
2. Update the `app.windows` configuration to disable chrome and enable transparency:

- **`title`**: `"GhostKey"`
- **`width`**: `480`
- **`height`**: `240`
- **`decorations`**: `false` (removes standard Mac window borders and traffic-light buttons)
- **`transparent`**: `true` (enables window alpha channel)
- **`alwaysOnTop`**: `true` (keeps overlay on top of other apps)
- **`resizable`**: `true` (allows adjustment while testing)

---

### Step 6: macOS Permissions Config (`Info.plist`)

macOS requires an explicit declaration in `Info.plist` before allowing global event taps.

Create `src-tauri/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSAccessibilityUsageDescription</key>
    <string>GhostKey requires accessibility permissions to display your keystrokes and mouse clicks on stream.</string>
</dict>
</plist>

```

--- -->

### Step 7: Local Development Workflow

To launch the app in live development mode:

```bash
npm run tauri dev

```

What happens when you run this:

1. Vite spins up a local dev server at `http://localhost:1420` with instant Hot Module Replacement (HMR).
2. Cargo compiles your Rust backend (`src-tauri/src/`).
3. Tauri launches a native macOS window powered by `WKWebView` pointing directly to your local Vite server.
4. Any styling tweaks you make in React/Tailwind update instantly without recompiling the Rust core.

---

### Step 8: Production Build (Local `.app` & `.dmg`)

When you are ready to test packaging a standalone `.app` bundle on your Mac:

```bash
npm tauri build

```

This compiles your optimized Rust binary, embeds the static web assets, and generates:

- A standalone `GhostKey.app` inside `src-tauri/target/release/bundle/macos/`
- An installable `GhostKey.dmg` image inside `src-tauri/target/release/bundle/dmg/`

---

### Step 9: Immediate Next Steps for Implementation

1. **Verify Window Transparency:** Strip the default Vite boilerplate from `src/App.tsx` and verify you see your desktop through a styled, translucent container.
2. **Implement the Listener Thread:** In `src-tauri/src/lib.rs`, spawn the `rdev` thread and emit input events across the Tauri event channel.
3. **Bind State in React:** Wire the frontend listener to a React state set and hook up your keycaps.
