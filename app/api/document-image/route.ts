import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';

// Determine safe cache directory (prefer .next/cache/document_images, fallback to os tmpdir)
function getCacheDir(): string {
  try {
    const dir = path.join(process.cwd(), '.next', 'cache', 'document_images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch {
    const fallback = path.join(os.tmpdir(), 'petrolink_document_images');
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }
}

// In-memory cache for ultra-fast access to frequently requested images
const memoryCache = new Map<string, { buffer: Buffer; contentType: string }>();
const MAX_MEMORY_ITEMS = 60;

function extractDriveId(url: string): string | null {
  if (!url) return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  // If the string itself looks like a drive ID (25-45 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const directId = searchParams.get('id');

  const fileId = directId || (targetUrl ? extractDriveId(targetUrl) : null);

  if (!fileId && !targetUrl) {
    return NextResponse.redirect(new URL('/images/formato vacio rif.png', req.url));
  }

  // Generate deterministic cache key
  const cacheKeyRaw = fileId ? `drive_${fileId}` : `url_${targetUrl}`;
  const cacheHash = crypto.createHash('sha256').update(cacheKeyRaw).digest('hex');

  // 1. Check in-memory cache
  if (memoryCache.has(cacheHash)) {
    const item = memoryCache.get(cacheHash)!;
    return new NextResponse(new Uint8Array(item.buffer), {
      status: 200,
      headers: {
        'Content-Type': item.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'HIT-MEMORY',
      },
    });
  }

  // 2. Check local disk cache
  const cacheDir = getCacheDir();
  const binPath = path.join(cacheDir, `${cacheHash}.bin`);
  const metaPath = path.join(cacheDir, `${cacheHash}.meta.json`);

  try {
    if (fs.existsSync(binPath) && fs.existsSync(metaPath)) {
      const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
      const buffer = await fs.promises.readFile(binPath);

      // Populate memory cache
      if (memoryCache.size < MAX_MEMORY_ITEMS) {
        memoryCache.set(cacheHash, { buffer, contentType: meta.contentType || 'image/jpeg' });
      }

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': meta.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT-DISK',
        },
      });
    }
  } catch {
    // Disk read failed, fallback to network fetch
  }

  // 3. Fetch from remote candidates
  const candidates: string[] = [];
  if (fileId) {
    candidates.push(`https://lh3.googleusercontent.com/d/${fileId}`);
    candidates.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`);
    candidates.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
  } else if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
    candidates.push(targetUrl);
  }

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        // Verify it returned an image
        if (contentType.startsWith('image/')) {
          const arrayBuf = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);

          // Asynchronously write to local disk cache
          try {
            await fs.promises.writeFile(binPath, buffer);
            await fs.promises.writeFile(
              metaPath,
              JSON.stringify({
                contentType,
                cachedAt: new Date().toISOString(),
                source: candidate,
              })
            );
          } catch (writeErr) {
            console.error('Failed to write image disk cache:', writeErr);
          }

          // Save to memory cache
          if (memoryCache.size < MAX_MEMORY_ITEMS) {
            memoryCache.set(cacheHash, { buffer, contentType });
          }

          return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Cache': 'MISS',
            },
          });
        }
      }
    } catch {
      // Try next candidate
    }
  }

  // Fallback to placeholder if not fetchable
  return NextResponse.redirect(new URL('/images/formato vacio rif.png', req.url));
}
