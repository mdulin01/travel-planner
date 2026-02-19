import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoLightbox({ images = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Touch state
  const touchState = useRef({
    startX: 0, startY: 0,
    lastTap: 0,
    pinchStartDist: 0,
    pinchStartScale: 1,
    isPinching: false,
    isDragging: false,
    dragStartX: 0, dragStartY: 0,
    dragStartTranslateX: 0, dragStartTranslateY: 0,
    swipeStartX: 0,
    swipeStartY: 0,
    swipeStartTime: 0,
  });

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < images.length) {
      setCurrentIndex(idx);
      resetZoom();
    }
  }, [images.length, resetZoom]);

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getTouchDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    const ts = touchState.current;

    if (e.touches.length === 2) {
      // Pinch start
      ts.isPinching = true;
      ts.pinchStartDist = getTouchDist(e.touches);
      ts.pinchStartScale = scale;
      return;
    }

    if (e.touches.length === 1) {
      const now = Date.now();
      const touch = e.touches[0];

      // Double-tap detection
      if (now - ts.lastTap < 300) {
        e.preventDefault();
        if (isZoomed) {
          resetZoom();
        } else {
          setScale(2.5);
          setIsZoomed(true);
          // Center zoom on tap point
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const tapX = touch.clientX - rect.left - rect.width / 2;
            const tapY = touch.clientY - rect.top - rect.height / 2;
            setTranslate({ x: -tapX * 0.6, y: -tapY * 0.6 });
          }
        }
        ts.lastTap = 0;
        return;
      }
      ts.lastTap = now;

      if (isZoomed) {
        // Pan start
        ts.isDragging = true;
        ts.dragStartX = touch.clientX;
        ts.dragStartY = touch.clientY;
        ts.dragStartTranslateX = translate.x;
        ts.dragStartTranslateY = translate.y;
      } else {
        // Swipe start
        ts.swipeStartX = touch.clientX;
        ts.swipeStartY = touch.clientY;
        ts.swipeStartTime = now;
      }
    }
  };

  const handleTouchMove = (e) => {
    const ts = touchState.current;

    if (ts.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const newScale = Math.max(1, Math.min(5, ts.pinchStartScale * (dist / ts.pinchStartDist)));
      setScale(newScale);
      setIsZoomed(newScale > 1.1);
      if (newScale <= 1.05) setTranslate({ x: 0, y: 0 });
      return;
    }

    if (ts.isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - ts.dragStartX;
      const dy = touch.clientY - ts.dragStartY;
      setTranslate({
        x: ts.dragStartTranslateX + dx,
        y: ts.dragStartTranslateY + dy,
      });
    }
  };

  const handleTouchEnd = (e) => {
    const ts = touchState.current;

    if (ts.isPinching) {
      ts.isPinching = false;
      if (scale <= 1.05) resetZoom();
      return;
    }

    if (ts.isDragging) {
      ts.isDragging = false;
      return;
    }

    // Swipe detection (only when not zoomed)
    if (!isZoomed && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - ts.swipeStartX;
      const dy = touch.clientY - ts.swipeStartY;
      const dt = Date.now() - ts.swipeStartTime;

      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 400) {
        if (dx > 0) goPrev();
        else goNext();
      }
    }
  };

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="text-white/60 text-sm font-medium">
          {images.length > 1 && `${currentIndex + 1} / ${images.length}`}
        </div>
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={e => e.stopPropagation()}
      >
        {/* Prev button (desktop) */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white rounded-full transition hidden md:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          ref={imgRef}
          src={images[currentIndex]}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: touchState.current.isDragging || touchState.current.isPinching ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />

        {/* Next button (desktop) */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white rounded-full transition hidden md:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Dot indicators for mobile */}
      {images.length > 1 && images.length <= 20 && (
        <div className="flex justify-center gap-1.5 pb-6 pt-2 shrink-0" onClick={e => e.stopPropagation()}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
