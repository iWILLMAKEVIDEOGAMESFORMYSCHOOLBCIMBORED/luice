# 🔑 Google Drive API Key Setup (5 minutes)

This is the ONE thing you need to do to connect your 618-song Drive folder to Juiceify.

---

## Step 1 — Create a Google Cloud Project

1. Go to **https://console.cloud.google.com**
2. Click **"Select a project"** → **"New Project"**
3. Name it `Juiceify` → Click **Create**

---

## Step 2 — Enable Google Drive API

1. In your new project, go to **APIs & Services** → **Library**
2. Search for **"Google Drive API"**
3. Click it → Click **Enable**

---

## Step 3 — Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"API Key"**
3. Your key will appear — **copy it** (looks like `AIzaSyXXXXXXXXXXXXXXXXXXXXXX`)

### Restrict the key (recommended):
- Click **Edit API Key**
- Under **Application restrictions** → Select **"iOS apps"**
- Add your bundle ID: `com.juiceify.app`
- Under **API restrictions** → Select **"Restrict key"** → Choose **Google Drive API**
- Click **Save**

---

## Step 4 — Add the key to the app

Open `src/services/GoogleDriveService.js` and replace line 21:

```js
// BEFORE:
export const GOOGLE_API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY_HERE';

// AFTER:
export const GOOGLE_API_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXX';
```

Also update `app.json` line:
```json
"googleDriveApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXX"
```

---

## Step 5 — Make sure your Drive folder is public

Your folder link already suggests it's shared:
`https://drive.google.com/drive/folders/1oDmvdWmmopdYP8j10T1ectgopHVANSVl`

To verify:
1. Open the folder in Google Drive
2. Click **Share** (top right)
3. Make sure it says **"Anyone with the link"** → **Viewer**
4. If not, change it and save

---

## That's it! 🍇

When you build and run the app:

1. It opens with the hardcoded released songs (instant)
2. A banner appears: **"Loading songs from your Drive..."**
3. Within a few seconds it fetches all 618 files from your folder
4. The banner shows: **"618 songs loaded from your Drive ✅"**
5. All songs appear in Library → Unreleased Vault tab

Songs auto-update — add a new MP3 to your Drive folder and it'll show up next time the app loads. No app update needed.

---

## How the filename parsing works

The app reads each filename and extracts the title, and detects if it's unreleased:

| Filename | Title | Unreleased? |
|----------|-------|-------------|
| `Juice WRLD - Lucid Dreams.mp3` | Lucid Dreams | No |
| `01. All Girls Are the Same.mp3` | All Girls Are the Same | No |
| `Robbery [Unreleased].mp3` | Robbery | Yes |
| `Juice WRLD - Dark Place (Vault Leak).mp3` | Dark Place | Yes |
| `Stay High unreleased snippet.mp3` | Stay High unreleased snippet | Yes |

Words that trigger "unreleased": `unreleased`, `leak`, `vault`, `snippet`, `demo`, `wip`, `rare`

---

## Cover art

The app uses Google Drive's built-in thumbnail system for cover art. Drive automatically generates thumbnails from embedded MP3 cover art (ID3 tags). If a file has no cover art embedded, it falls back to a Juice WRLD album cover.
