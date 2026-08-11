"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        aria-label="Close"
      >
        <X className="h-7 w-7" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i - 1 + images.length) % images.length);
          }}
          className="absolute left-2 sm:left-6 text-white/80 hover:text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-9 w-9" />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt="Phone"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full object-contain rounded-lg"
      />

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i + 1) % images.length);
          }}
          className="absolute right-2 sm:right-6 text-white/80 hover:text-white"
          aria-label="Next"
        >
          <ChevronRight className="h-9 w-9" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 text-white/70 text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
