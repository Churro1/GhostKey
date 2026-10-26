# GhostKey

**GhostKey** is a lightweight, freestanding keyboard and mouse input overlay built natively for macOS. Designed specifically for streamers, speedrunners, and content creators, GhostKey floats cleanly above your games and apps to visualize your keystrokes and mouse clicks in real time—with zero bloated background scripts or clunky browser sources required.

## How to Install

Because GhostKey is a free, open-source tool, macOS will be a bit overprotective on your first launch, but getting set up takes under a minute:

1. **Download:** Grab the latest `.dmg` installer from the [Releases page](../../releases/latest).
2. **Install:** Open the `.dmg` and drag the GhostKey app into your `Applications` folder.
3. **Bypass Gatekeeper:** macOS will block a standard double-click launch. Instead, open your `Applications` folder, **Right-Click** (or Control-click) GhostKey, and select **Open**. Click **Open** again in the security prompt.
4. **Enable Input Tracking:** GhostKey needs OS-level permission to display your keystrokes. Go to **System Settings → Privacy & Security → Accessibility** and toggle GhostKey to ON.
5. **Capture in OBS:** Launch the app, position the transparent overlay wherever you want it, and add it to OBS as a standard macOS Window Capture source.

## Tech Stack

- **Application Shell:** [Tauri v2](https://v2.tauri.app/) (Rust)
- **Input Capture:** Native OS hardware polling via `device_query`
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
