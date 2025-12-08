# Development Workflow Guide

This guide explains how to develop, test, and update the **Sharencrypt** application for both Web and Android platforms.

## 1. Web Development Logic
The core of the application is built with **React** and **TypeScript**. You will do 99% of your coding here.

**To start the local web server:**
```bash
npm run dev
```
- Open `http://localhost:5173` in your browser.
- Any changes you save in `src/` will **instantly** update in the browser (Hot Module Replacement).

---

## 2. updating the Android App
The Android app is a native wrapper around your built web code. It does **not** update automatically when you change the code.

**Whenever you make changes to the code and want to see them on Android:**

### Step A: Build the Web App
First, convert your React code into standard HTML/CSS/JS that android can understand.
```bash
npm run build
```
*This updates the `dist/` folder.*

### Step B: Sync to Android
Next, copy the updated `dist/` folder into the Android native project.
```bash
npx cap sync
```
*This updates the `android/` folder with your new code/assets.*

### Step C: Run/Build Android
Finally, run the app on your device or emulator.
```bash
npx cap open android
```
- This launches **Android Studio**.
- Click the **Play (Run)** button to launch the app on your connected device or emulator.
- Alternatively, go to **Build > Build APK** to generate a file you can share.

---

## Summary Cheat Sheet

| Goal | Commands |
|------|----------|
| **Work on features** | `npm run dev` (Browser) |
| **Test on Phone** | `npm run build` && `npx cap sync` && `npx cap open android` |
| **Fix Android Bug** | Modify `src/` -> `npm run build` -> `npx cap sync` -> Re-run from Android Studio |

## Advanced: Live Reload on Android (Optional)
If you want to see changes on your phone *instantly* without rebuilding every time (development only):

1.  Find your computer's local IP address (e.g., `192.168.1.5`).
2.  Open `capacitor.config.ts`.
3.  Add a `server` block pointing to your computer:
    ```typescript
    const config: CapacitorConfig = {
      appId: 'com.sharencrypt.app',
      appName: 'Sharencrypt',
      webDir: 'dist',
      server: {
        url: 'http://192.168.1.5:5173', // Your PC's IP
        cleartext: true
      }
    };
    ```
4.  Run `npx cap sync`.
5.  Run `npm run dev` on your computer.
6.  Run the app on Android. It will now load directly from your dev server! 
    *(**Note**: Remove this `server` block before building the final APK for release!)*

---

## Frequently Asked Questions (FAQ)

### 1. Does transferring large files use my Netlify/Hosting bandwidth?
**No.** Sharencrypt uses **WebRTC P2P (Peer-to-Peer)** technology.
-   **Netlify/Hosting:** Only provides the initial HTML/JS/CSS app code (approx. 1-2MB). Once the app is loaded, Netlify is no longer involved.
-   **Signaling (PeerJS):** Uses very minimal data (KB) just to find the other user.
-   **File Transfer:** The 5GB file goes **directly** from User A's device to User B's device through their internet connection. It does **not** pass through your server.
-   **Cost:** hosting this app on Netlify Free Tier is perfectly safe, even for huge file transfers.

### 2. What if devices can't connect?
If direct P2P fails (e.g. strict corporate firewalls), the specific connection might fail because we don't use a Relay (TURN) server by default (to save costs).
-   **Solution:** You can add a free or paid TURN server in `Settings -> Network` if you encounter connectivity issues in strict environments.
