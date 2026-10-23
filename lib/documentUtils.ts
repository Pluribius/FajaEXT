/**
 * Utilities for extracting, transforming, and rendering stashed government ID documents
 */

export function extractDriveId(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match1 = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  const match2 = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  // If string is already just a 25-45 char Google Drive ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }
  return null;
}

/**
 * Returns a browser-renderable image URL from any stashed document URL (Google Drive, local, or data URL)
 */
export function resolveDocumentImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) {
    return '/images/formato vacio rif.png';
  }

  const clean = url.trim();

  // Data URLs and local static images can be rendered directly
  if (clean.startsWith('data:') || clean.startsWith('/')) {
    return clean;
  }

  // Google Drive files: route through our high-performance document-image proxy
  const driveId = extractDriveId(clean);
  if (driveId) {
    return `/api/document-image?id=${driveId}`;
  }

  // Other external HTTP/HTTPS images: route through proxy to bypass CORS/hotlinking
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return `/api/document-image?url=${encodeURIComponent(clean)}`;
  }

  return clean;
}

/**
 * Direct Google CDN URL for fast thumbnail display with no-referrer
 */
export function getDirectDriveThumbnail(url: string | null | undefined): string | null {
  const driveId = extractDriveId(url);
  if (!driveId) return null;
  return `https://lh3.googleusercontent.com/d/${driveId}`;
}

/**
 * Returns the original web link (e.g. to open in Google Drive in a new tab)
 */
export function getOriginalDocumentUrl(url: string | null | undefined): string {
  if (!url) return '';
  const clean = url.trim();
  const driveId = extractDriveId(clean);
  if (driveId && !clean.startsWith('http')) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
  }
  return clean;
}
