# 👻 GhostKey

**GhostKey** is a lightweight, freestanding keyboard and mouse input overlay built natively for macOS. Designed specifically for streamers, speedrunners, and content creators, GhostKey floats cleanly above your games and apps to visualize your keystrokes and mouse clicks in real time—with zero bloated background scripts or clunky browser sources required.

Powered by a native **Rust core (`rdev`)** and **Tauri v2**, GhostKey taps directly into macOS CoreGraphics event hooks with sub-millisecond responsiveness, rendering a slick, hardware-accelerated UI on macOS's built-in WebKit engine.

---

### ✨ Features

- **Freestanding & Floating:** Borderless, transparent, and always-on-top HUD window that can be positioned anywhere and captured directly in OBS via macOS Screen or Window Capture.
- **Ultra-Lightweight (~15 MB):** Leaves bloated 200 MB Electron apps in the dust. GhostKey idles at ~30 MB RAM with negligible CPU impact while you game or stream.
- **Sub-Millisecond Latency:** Direct OS-level event listening via macOS Accessibility taps broadcasts inputs straight to the UI over Tauri's native IPC bridge.
- **Zero Configuration Run:** No local WebSocket ports to open, no terminal daemons to leave running, and no browser source setups. Just launch the `.app` and capture it.
- **Modern Aesthetic:** Styled with subtle glassmorphic backdrop filters, mechanical key travel states, and high-visibility mouse click indicators.

---

### 🛠️ Tech Stack

- **Application Shell:** [Tauri v2](https://v2.tauri.app/) (Rust)
- **Input Capture:** Native OS hooks via `rdev` / CoreGraphics
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
