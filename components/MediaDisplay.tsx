import React from 'react';

interface MediaDisplayProps {
  src?: string | null;
  alt: string;
  className: string;
  draggable?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>) => void;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ src, alt, className, draggable = false, onError }) => {
  if (!src) {
    return null;
  }

  const isVideo = src.startsWith('data:video');

  if (isVideo) {
    return (
      <video
        className={className}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        draggable={draggable}
        onError={onError}
        key={src} // Add key to ensure video reloads on src change
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={draggable}
      onError={onError}
      key={src} // Add key for consistency and to help React
    />
  );
};
