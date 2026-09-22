// Media utility functions for detecting, storing, and handling pictures (JPG, GIF, PNG, WebP, SVG, AVIF, BMP) and .mp4 video content

export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
export const PICTURE_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', 
    '.avif', '.bmp', '.ico', '.tiff', '.tif'
];

// Cache of created object URLs to prevent memory leaks and redundant conversions
const blobUrlCache = new Map<string, string>();

/**
 * Checks whether a given media URL or item is a video (.mp4 or other supported format)
 */
export function isVideoUrl(url?: string | null, explicitType?: 'image' | 'video'): boolean {
    if (explicitType === 'video') return true;
    if (explicitType === 'image') return false;
    if (!url || typeof url !== 'string') return false;

    const trimmed = url.trim().toLowerCase();

    // Data URLs
    if (trimmed.startsWith('data:video/')) return true;

    // Blob URLs created from video
    if (trimmed.startsWith('blob:') && blobUrlCache.has(url)) {
        const meta = blobUrlCache.get(`type-${url}`);
        if (meta === 'video') return true;
    }

    // Strip URL parameters and hash
    const cleanUrl = trimmed.split('?')[0].split('#')[0];
    return VIDEO_EXTENSIONS.some(ext => cleanUrl.endsWith(ext));
}

/**
 * Checks if a given media URL or item is an animated GIF
 */
export function isGifUrl(url?: string | null): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('data:image/gif')) return true;
    const cleanUrl = trimmed.split('?')[0].split('#')[0];
    return cleanUrl.endsWith('.gif');
}

/**
 * Checks if a given media URL is an SVG vector image
 */
export function isSvgUrl(url?: string | null): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('data:image/svg+xml')) return true;
    const cleanUrl = trimmed.split('?')[0].split('#')[0];
    return cleanUrl.endsWith('.svg');
}

/**
 * Returns clean uppercase format badge string (e.g., 'JPG', 'PNG', 'GIF', 'WEBP', 'SVG', 'AVIF', 'MP4')
 */
export function getMediaFormat(url?: string | null, explicitType?: 'image' | 'video'): string {
    if (!url) return explicitType === 'video' ? 'MP4' : 'JPG';
    const trimmed = url.trim().toLowerCase();

    // Data URLs
    if (trimmed.startsWith('data:image/gif')) return 'GIF';
    if (trimmed.startsWith('data:image/png')) return 'PNG';
    if (trimmed.startsWith('data:image/jpeg') || trimmed.startsWith('data:image/jpg')) return 'JPG';
    if (trimmed.startsWith('data:image/webp')) return 'WEBP';
    if (trimmed.startsWith('data:image/svg')) return 'SVG';
    if (trimmed.startsWith('data:image/avif')) return 'AVIF';
    if (trimmed.startsWith('data:video/mp4')) return 'MP4';
    if (trimmed.startsWith('data:video/webm')) return 'WEBM';

    const cleanUrl = trimmed.split('?')[0].split('#')[0];
    if (cleanUrl.endsWith('.gif')) return 'GIF';
    if (cleanUrl.endsWith('.png')) return 'PNG';
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'JPG';
    if (cleanUrl.endsWith('.webp')) return 'WEBP';
    if (cleanUrl.endsWith('.svg')) return 'SVG';
    if (cleanUrl.endsWith('.avif')) return 'AVIF';
    if (cleanUrl.endsWith('.bmp')) return 'BMP';
    if (cleanUrl.endsWith('.ico')) return 'ICO';
    if (cleanUrl.endsWith('.tiff') || cleanUrl.endsWith('.tif')) return 'TIFF';
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.m4v')) return 'MP4';
    if (cleanUrl.endsWith('.webm')) return 'WEBM';
    if (cleanUrl.endsWith('.mov')) return 'MOV';

    if (isVideoUrl(url, explicitType)) return 'MP4';
    return 'IMAGE';
}

/**
 * Returns formatted technical metadata description for the detected format
 */
export function getFormatDescription(format: string): string {
    switch (format.toUpperCase()) {
        case 'GIF':
            return 'GIF Animation (Looping raster frames)';
        case 'PNG':
            return 'PNG Image (Lossless with Alpha transparency)';
        case 'JPG':
        case 'JPEG':
            return 'JPEG Photograph (High-quality lossy)';
        case 'WEBP':
            return 'WebP (Modern high-compression web standard)';
        case 'SVG':
            return 'SVG Vector Graphic (Scalable vector markup)';
        case 'AVIF':
            return 'AVIF Image (Next-gen AV1 compressed still)';
        case 'BMP':
            return 'BMP Bitmap (Uncompressed raster)';
        case 'MP4':
            return 'MP4 / H.264 Video (Progressive stream)';
        case 'WEBM':
            return 'WebM / VP9 Video (Modern open video)';
        case 'MOV':
            return 'QuickTime MOV Video';
        default:
            return 'Standard Digital Media';
    }
}

/**
 * Helper to format byte sizes into readable string (e.g., "4.2 MB")
 */
export function formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* =========================================================================
   IndexedDB Local Media Storage for large uploaded files (PC upload)
   Allows persistent storing of .mp4 videos without Firestore document size limits
   ========================================================================= */

const DB_NAME = 'JaakkoPortfolioMediaDB';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

function openMediaDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this environment'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Saves a file (video or image) from PC into IndexedDB and returns a persistent key and live Object URL
 */
export async function saveLocalMediaFile(file: File): Promise<{
    id: string;
    url: string;
    type: 'video' | 'image';
    size: number;
    name: string;
}> {
    const isVideo = file.type.startsWith('video/') || isVideoUrl(file.name);
    const mediaId = `local-media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
        const db = await openMediaDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(file, mediaId);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });

        // Create and register object URL
        const objectUrl = URL.createObjectURL(file);
        blobUrlCache.set(objectUrl, mediaId);
        blobUrlCache.set(mediaId, objectUrl);
        blobUrlCache.set(`type-${objectUrl}`, isVideo ? 'video' : 'image');
        blobUrlCache.set(`type-${mediaId}`, isVideo ? 'video' : 'image');

        // Also store a mapping in localStorage so other components know this mediaId exists
        try {
            localStorage.setItem(`media-meta-${mediaId}`, JSON.stringify({
                name: file.name,
                type: isVideo ? 'video' : 'image',
                format: getMediaFormat(file.name, file.type),
                size: file.size,
                savedAt: Date.now()
            }));
        } catch (e) {
            console.warn('LocalStorage meta store failed', e);
        }

        return {
            id: mediaId,
            url: objectUrl,
            type: isVideo ? 'video' : 'image',
            size: file.size,
            name: file.name
        };
    } catch (err) {
        console.warn('IndexedDB failed, falling back to FileReader DataURL', err);
        // Fallback to FileReader data URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve({
                    id: mediaId,
                    url: dataUrl,
                    type: isVideo ? 'video' : 'image',
                    size: file.size,
                    name: file.name
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Resolves a stored media reference (e.g., `local-media-...` or standard URL) to a playable/displayable URL
 */
export async function resolveMediaUrl(urlOrKey: string): Promise<string> {
    if (!urlOrKey) return '';

    // If it's an HTTP/HTTPS or data URL, it's already directly usable
    if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://') || urlOrKey.startsWith('data:') || urlOrKey.startsWith('blob:')) {
        return urlOrKey;
    }

    // Check in-memory cache
    if (blobUrlCache.has(urlOrKey)) {
        return blobUrlCache.get(urlOrKey)!;
    }

    // If it's a local media key (e.g. `local-media-12345`), retrieve blob from IndexedDB
    if (urlOrKey.startsWith('local-media-')) {
        try {
            const db = await openMediaDB();
            const blob = await new Promise<Blob | null>((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(urlOrKey);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });

            if (blob) {
                const objectUrl = URL.createObjectURL(blob);
                const isVideo = blob.type.startsWith('video/') || isVideoUrl(urlOrKey);
                blobUrlCache.set(urlOrKey, objectUrl);
                blobUrlCache.set(objectUrl, urlOrKey);
                blobUrlCache.set(`type-${objectUrl}`, isVideo ? 'video' : 'image');
                blobUrlCache.set(`type-${urlOrKey}`, isVideo ? 'video' : 'image');
                return objectUrl;
            }
        } catch (e) {
            console.error('Failed to resolve local media key from IndexedDB', e);
        }
    }

    return urlOrKey;
}

/**
 * Curated presets across picture formats (JPG, GIF, PNG, SVG, WebP) and MP4 video
 */
export const SAMPLE_MEDIA_PRESETS = [
    {
        title: 'Geometric Loop (GIF)',
        format: 'GIF',
        url: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
        caption: 'Looping geometric kinetic graphic animation in GIF format.'
    },
    {
        title: 'Brand Identity (PNG)',
        format: 'PNG',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: 'Abstract visual identity composition with transparent alpha rendering.'
    },
    {
        title: 'Design Editorial (JPG)',
        format: 'JPG',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-contrast typography and minimalist layout photography.'
    },
    {
        title: '3D Form Render (WebP)',
        format: 'WEBP',
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-definition digital 3D sculpture rendered in WebP.'
    },
    {
        title: 'Motion Reel (MP4)',
        format: 'MP4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Dynamic 1080p motion graphics video clip.'
    }
];

/**
 * Preset sample .mp4 video clips for backwards compatibility
 */
export const SAMPLE_MP4_VIDEOS = [
    {
        title: 'Motion Graphics Reel (Sample)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'High-energy motion graphics and visual effects showcase in 1080p.'
    },
    {
        title: '3D CGI Animation Loop (Sample)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: 'Open-source 3D character animation and dynamic camera tracking.'
    },
    {
        title: 'Visual Storytelling Clip (Sample)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        caption: 'Narrative animation exploring surreal environments and lighting design.'
    }
];
