"use client";

import React, { useState } from "react";

interface NewsImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
}

export default function NewsImage({
  src,
  alt,
  className = "",
  width,
  height,
  fallbackSrc = "/new.png",
}: NewsImageProps) {
  const getInitialSrc = (url?: string) => {
    if (!url || url.trim() === "") return fallbackSrc;
    if (url.includes("res.cloudinary.com")) {
      return decodeURIComponent(url.split("/image/fetch/f_auto,q_auto/")[1] || url);
    }
    return url;
  };

  const [imgSrc, setImgSrc] = useState<string>(() => getInitialSrc(src));

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
