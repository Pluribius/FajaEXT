'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import {
  resolveDocumentImageUrl,
  getDirectDriveThumbnail,
  getOriginalDocumentUrl,
  extractDriveId,
} from '@/lib/documentUtils';

interface DocumentImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  showOpenButton?: boolean;
  showLoadingSpinner?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
  onClick?: () => void;
}

export const DocumentImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc = '/images/formato vacio rif.png',
  showOpenButton = false,
  showLoadingSpinner = true,
  objectFit = 'cover',
  onClick,
}: DocumentImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const originalUrl = getOriginalDocumentUrl(src);
  const isDriveDoc = !!extractDriveId(src);

  // Set initial source
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setAttempt(0);

    const resolved = resolveDocumentImageUrl(src);
    setCurrentSrc(resolved);
  }, [src]);

  const handleError = () => {
    if (attempt === 0) {
      // First fallback: try direct Google CDN if it was a drive file
      const directCdn = getDirectDriveThumbnail(src);
      if (directCdn && directCdn !== currentSrc) {
        setAttempt(1);
        setCurrentSrc(directCdn);
        return;
      }
    }

    if (attempt <= 1) {
      // Second fallback: try default placeholder
      setAttempt(2);
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(false);
    setHasError(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div
      className={`relative overflow-hidden group select-none ${containerClassName}`}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 z-10">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}

      {/* Actual image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc || fallbackSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit }}
        className={`w-full h-full transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
      />

      {/* Floating external link button (for Google Drive or external documents) */}
      {showOpenButton && originalUrl && originalUrl.startsWith('http') && (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Abrir documento original en Google Drive"
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 shadow backdrop-blur-xs flex items-center gap-1 text-[11px] font-bold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Abrir en Drive</span>
        </a>
      )}
    </div>
  );
};
