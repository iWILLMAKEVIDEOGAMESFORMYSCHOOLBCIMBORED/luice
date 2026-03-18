/**
 * GoogleDriveService.js
 *
 * Connects directly to the public Juice WRLD Google Drive folder:
 * https://drive.google.com/drive/folders/1oDmvdWmmopdYP8j10T1ectgopHVANSVl
 *
 * Uses the Google Drive API v3 to:
 *   1. List all MP3/audio files in the folder (+ subfolders)
 *   2. Build stream URLs for each file
 *   3. Fetch thumbnail/cover art per file
 *   4. Parse metadata from filenames
 */

// ─────────────────────────────────────────────────────────────
// CONFIGURATION — fill in your Google API key
// Get one free at: https://console.cloud.google.com
//   → Enable "Google Drive API"
//   → Create API Key (restrict to Drive API + your bundle ID)
// ─────────────────────────────────────────────────────────────
export const GOOGLE_API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY_HERE';

// The shared folder ID from the Drive URL
const ROOT_FOLDER_ID = '1oDmvdWmmopdYP8j10T1ectgopHVANSVl';

const BASE = 'https://www.googleapis.com/drive/v3';

// Audio MIME types to accept
const AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/flac',
  'audio/ogg',
  'application/octet-stream', // some Drive uploads
];

// ─────────────────────────────────────────────────────────────
// Fetch all files in a folder (paginates automatically)
// ─────────────────────────────────────────────────────────────
async function listFilesInFolder(folderId, apiKey, pageToken = null) {
  const mimeQuery = AUDIO_MIMES.map(m => `mimeType='${m}'`).join(' or ');
  const query = encodeURIComponent(
    `'${folderId}' in parents and (${mimeQuery}) and trashed=false`
  );

  let url =
    `${BASE}/files?` +
    `q=${query}` +
    `&key=${apiKey}` +
    `&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,size,modifiedTime)` +
    `&pageSize=1000` +
    `&orderBy=name`;

  if (pageToken) url += `&pageToken=${pageToken}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Fetch all subfolders inside a folder
// ─────────────────────────────────────────────────────────────
async function listSubfolders(folderId, apiKey) {
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const url =
    `${BASE}/files?` +
    `q=${query}` +
    `&key=${apiKey}` +
    `&fields=files(id,name)` +
    `&pageSize=100`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.files || [];
}

// ─────────────────────────────────────────────────────────────
// Recursively collect every audio file from folder tree
// ─────────────────────────────────────────────────────────────
async function getAllAudioFiles(folderId, apiKey, folderName = '') {
  let allFiles = [];

  // Get audio files in this folder
  let pageToken = null;
  do {
    const data = await listFilesInFolder(folderId, apiKey, pageToken);
    const files = (data.files || []).map(f => ({ ...f, _folderName: folderName }));
    allFiles = allFiles.concat(files);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  // Recurse into subfolders
  const subfolders = await listSubfolders(folderId, apiKey);
  for (const sub of subfolders) {
    const subFiles = await getAllAudioFiles(sub.id, apiKey, sub.name);
    allFiles = allFiles.concat(subFiles);
  }

  return allFiles;
}

// ─────────────────────────────────────────────────────────────
// Parse a filename like:
//   "Juice WRLD - Lucid Dreams (feat. Elegant).mp3"
//   "01. All Girls Are the Same.mp3"
//   "Robbery [Unreleased].flac"
// ─────────────────────────────────────────────────────────────
function parseFilename(filename) {
  // Strip extension
  const name = filename.replace(/\.(mp3|flac|wav|m4a|ogg|aac)$/i, '').trim();

  // Try "Artist - Title" pattern
  const dashParts = name.split(/\s*[-–—]\s*/);

  let title = name;
  let artist = 'Juice WRLD';

  if (dashParts.length >= 2) {
    // If first part looks like an artist name (contains "Juice" or short)
    if (
      dashParts[0].toLowerCase().includes('juice') ||
      dashParts[0].toLowerCase().includes('jw') ||
      dashParts[0].length < 30
    ) {
      artist = dashParts[0].replace(/^\d+\.\s*/, '').trim();
      title = dashParts.slice(1).join(' - ').trim();
    }
  }

  // Strip leading track numbers  "01. Title" or "01 - Title"
  title = title.replace(/^\d{1,3}[\.\)]\s*/, '').trim();
  artist = artist.replace(/^\d{1,3}[\.\)]\s*/, '').trim();

  // Detect if unreleased tag in filename
  const isUnreleased =
    /unreleased|leak|vault|snippet|demo|wip|rare/i.test(filename);

  // Try to extract year from filename
  const yearMatch = filename.match(/\b(201[5-9]|202[0-4])\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 2019;

  return { title, artist, isUnreleased, year };
}

// ─────────────────────────────────────────────────────────────
// Build the streaming URL for a Drive file
// Using /uc?export=download which works for public files
// ─────────────────────────────────────────────────────────────
export function getStreamUrl(fileId) {
  // This URL streams/downloads the file directly
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

// Alternative: use the Drive API stream endpoint (requires API key)
export function getApiStreamUrl(fileId, apiKey) {
  return `${BASE}/files/${fileId}?alt=media&key=${apiKey}`;
}

// ─────────────────────────────────────────────────────────────
// Get thumbnail URL — Drive provides thumbnails for media files
// ─────────────────────────────────────────────────────────────
export function getThumbnailUrl(file) {
  // Drive's thumbnailLink is the best source (has embedded art)
  if (file.thumbnailLink) {
    // Upgrade resolution: replace s220 with s500
    return file.thumbnailLink.replace(/=s\d+$/, '=s500');
  }
  // Fallback: generic Drive file thumbnail
  return `https://drive.google.com/thumbnail?id=${file.id}&sz=w500`;
}

// Default album art fallback (Juice WRLD themed)
const DEFAULT_ART = [
  'https://i.scdn.co/image/ab67616d0000b273c65e3b9b4c48f7ca2cca32a3', // Fighting Demons
  'https://i.scdn.co/image/ab67616d0000b2737f7e9ec43de02b498b5ceef7', // LND
  'https://i.scdn.co/image/ab67616d0000b273fdf22c7bd15b9ddb14a0d3ac', // DRFL
  'https://i.scdn.co/image/ab67616d0000b2734a3fbe9a88c37d8d7ad66380', // GGR
];

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT: Fetch all songs from the Drive folder
// Returns array of song objects ready for the app
// ─────────────────────────────────────────────────────────────
export async function fetchDriveSongs(apiKey = GOOGLE_API_KEY) {
  if (!apiKey || apiKey === 'YOUR_GOOGLE_DRIVE_API_KEY_HERE') {
    console.warn('[Drive] No API key — returning empty list');
    return [];
  }

  try {
    console.log('[Drive] Fetching songs from folder:', ROOT_FOLDER_ID);
    const rawFiles = await getAllAudioFiles(ROOT_FOLDER_ID, apiKey);
    console.log(`[Drive] Found ${rawFiles.length} audio files`);

    const songs = rawFiles.map((file, index) => {
      const { title, artist, isUnreleased, year } = parseFilename(file.name);
      const art = getThumbnailUrl(file) || DEFAULT_ART[index % DEFAULT_ART.length];

      return {
        id: `drive_${file.id}`,
        title,
        artist,
        album: isUnreleased
          ? (file._folderName || 'Unreleased Vault')
          : (file._folderName || 'Juice WRLD'),
        year,
        duration: 0, // Will be resolved when audio loads
        // Two stream URLs — try primary, fall back to secondary
        streamUrl: getStreamUrl(file.id),
        streamUrlApi: getApiStreamUrl(file.id, apiKey),
        albumArt: art,
        thumbnailLink: file.thumbnailLink || null,
        type: isUnreleased ? 'unreleased' : 'released',
        driveFileId: file.id,
        driveFileName: file.name,
        source: 'googledrive',
      };
    });

    // Sort: released first, then unreleased, then alphabetically
    songs.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'released' ? -1 : 1;
      return a.title.localeCompare(b.title);
    });

    return songs;
  } catch (err) {
    console.error('[Drive] Failed to fetch songs:', err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Fetch just the file metadata for a single song (e.g. duration)
// ─────────────────────────────────────────────────────────────
export async function fetchFileMetadata(fileId, apiKey = GOOGLE_API_KEY) {
  try {
    const url =
      `${BASE}/files/${fileId}?` +
      `key=${apiKey}` +
      `&fields=id,name,size,thumbnailLink,imageMediaMetadata,videoMediaMetadata`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
