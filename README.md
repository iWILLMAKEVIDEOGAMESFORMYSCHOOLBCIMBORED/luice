# 🍇 Juiceify

> The ultimate Juice WRLD music app — all released and unreleased songs in one place.

---

## 📱 App Features

- 🎵 **60+ Juice WRLD songs** — released albums + unreleased vault tracks
- 🔒 **Unreleased Vault** — dedicated section for leaked/rare tracks
- 🔍 **Smart Search** — filter by title, album, year, or released/unreleased
- 💿 **Albums view** — Goodbye & Good Riddance, Death Race for Love, Legends Never Die, Fighting Demons
- 🎧 **Full-screen player** — with queue, like/unlike, skip, shuffle
- 📻 **Mini Player** — persistent playback bar at bottom
- ⏱ **Recently Played** — auto-tracks your listening history
- 🎵 **Curated Playlists** — Essentials, Heartbreak Mode, Late Night Drive, etc.
- ▶️ **YouTube-powered playback** — plays via YouTube in background

---

## 🛠 Setup Instructions

### 1. Prerequisites

```bash
node >= 18
npm >= 9
expo-cli (installed globally)
eas-cli (for building)
```

### 2. Install Dependencies

```bash
cd Juiceify
npm install
```

### 3. Add YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Create an API key
4. Open `app.json` and replace:
   ```json
   "youtubeApiKey": "YOUR_YOUTUBE_DATA_API_V3_KEY_HERE"
   ```

### 4. Run Locally

```bash
npx expo start
# Then press 'i' for iOS simulator
```

---

## 🏗 Building with Codemagic

### Step 1: Push to GitHub/GitLab/Bitbucket

```bash
git init
git add .
git commit -m "Initial Juiceify release"
git remote add origin https://github.com/YOUR_USERNAME/juiceify.git
git push -u origin main
```

### Step 2: Set Up Codemagic

1. Go to [codemagic.io](https://codemagic.io) → Sign up / Log in
2. Click **"Add application"**
3. Connect your GitHub/GitLab/Bitbucket
4. Select the **Juiceify** repo
5. Choose **"React Native App"** as the project type
6. Codemagic will auto-detect `codemagic.yaml`

### Step 3: Configure Signing (iOS)

#### Option A — Ad Hoc (install directly on your phone)
1. In `codemagic.yaml`, change `distribution_type: app_store` → `ad_hoc`
2. In Codemagic dashboard → **Code Signing** → upload your:
   - Apple Developer `.p12` certificate
   - Provisioning profile (Ad Hoc)

#### Option B — App Store (for TestFlight / App Store)
1. In Codemagic → **Teams** → **Integrations** → **App Store Connect API**
2. Upload your App Store Connect API key (`.p8` file) with Issuer ID + Key ID

#### App Store Connect API Key Setup:
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Users and Access** → **Keys** → Create new key with **Developer** role
3. Download the `.p8` file (only downloadable once!)
4. In Codemagic, add as an integration and note the name

### Step 4: Add Environment Variables in Codemagic

In Codemagic dashboard → **Environment variables**:
```
EXPO_TOKEN         → your Expo account token (expo.io → Account Settings → Access Tokens)
YOUTUBE_API_KEY    → your YouTube Data API v3 key
```

### Step 5: Configure `codemagic.yaml`

Open `codemagic.yaml` and update:
```yaml
integrations:
  app_store_connect: YOUR_APP_STORE_CONNECT_API_KEY_NAME  # Name from Codemagic integrations

publishing:
  email:
    recipients:
      - your-email@example.com
```

### Step 6: Set Up EAS (Expo Application Services)

```bash
npm install -g eas-cli
eas login
eas build:configure    # Creates/updates eas.json
```

Copy the **EAS Project ID** into `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "your-project-id-from-eas"
  }
}
```

### Step 7: Trigger Build

Option A — Push to `main` branch (auto-triggers):
```bash
git push origin main
```

Option B — Manually in Codemagic dashboard:
1. Go to your app → **Start new build**
2. Select `ios-release` workflow
3. Click **Start build**

### Step 8: Download Your IPA

1. Wait ~20-40 minutes for build
2. Codemagic emails you when done
3. Download the `.ipa` file from the build artifacts
4. **Install on your phone** (if Ad Hoc) using:
   - Apple Configurator 2
   - AltStore
   - Xcode Devices

---

## 📲 Installing the IPA on Your iPhone

### Method 1: AltStore (No Mac required after setup)
1. Install [AltStore](https://altstore.io) on your phone
2. Use **AltServer** on Mac/PC to sideload the `.ipa`

### Method 2: Apple Configurator 2 (Mac only)
1. Download from Mac App Store
2. Connect iPhone via USB, trust the computer
3. Drag and drop the `.ipa` onto your device

### Method 3: TestFlight (App Store distribution)
1. Upload via Codemagic → App Store Connect
2. Create internal test in TestFlight
3. Install via TestFlight on any invited device

---

## 🎨 App Design

- **Color palette:** Deep purple (#9B59B6), near-black (#0A0A0F), dark gradient backgrounds
- **Theme:** Juice WRLD inspired — dark, moody, purple/violet tones
- **Typography:** System fonts with heavy weight headings
- **UI pattern:** Spotify-like layout with SoundCloud-inspired waveform elements

---

## 📁 Project Structure

```
Juiceify/
├── App.js                   # Entry point
├── app.json                 # Expo config
├── eas.json                 # EAS Build profiles
├── codemagic.yaml           # CI/CD pipeline
├── babel.config.js
├── package.json
└── src/
    ├── screens/
    │   ├── HomeScreen.js    # Home feed
    │   ├── SearchScreen.js  # Search + filters
    │   └── LibraryScreen.js # Songs/Albums/Playlists/Unreleased
    ├── components/
    │   ├── MiniPlayer.js    # Bottom persistent player
    │   └── FullPlayer.js    # Expanded player modal
    ├── context/
    │   └── MusicContext.js  # Global playback state
    ├── navigation/
    │   └── AppNavigator.js  # Tab navigation
    └── data/
        └── songs.js         # All 60+ Juice WRLD songs
```

---

## ⚠️ Important Notes

1. **YouTube API Quota** — Free tier = 10,000 units/day. The app uses YouTube for playback.
2. **Unreleased songs** — These reference YouTube uploads of leaked tracks. Video IDs may change.
3. **Copyright** — This app is for personal use only.
4. **Apple Developer Account** — Required for building ($99/year). Needed for Codemagic iOS builds.

---

## 🔧 Troubleshooting

**Build fails on Codemagic?**
- Ensure `EXPO_TOKEN` is set in environment variables
- Check that EAS project ID matches in `app.json`
- Verify signing certificate is not expired

**YouTube not playing?**
- Check your API key in `app.json`
- Ensure YouTube Data API v3 is enabled in Google Cloud Console
- Some video IDs may have changed — update `src/data/songs.js`

**App won't install on iPhone?**
- Make sure your device UDID is in the provisioning profile (Ad Hoc builds)
- For personal use, use AltStore to bypass this limitation

---

Made with 🍇 for the 999 Club
