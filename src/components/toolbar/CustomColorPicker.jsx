import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';

/**
 * Utility functions for color conversions between HEX, RGB and HSV
 */
export function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n) => {
    const val = Math.round((n + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsv(hex) {
  let c = (hex || '#4262ff').replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return { h: 228, s: 0.74, v: 1.0 };

  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

const QUICK_SWATCHES = [
  '#000000',
  '#ffffff',
  '#4262ff',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#64748b',
];

export default function CustomColorPicker({
  color = '#4262ff',
  onChange,
  onClose,
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color);
  const containerRef = useRef(null);
  const satValRef = useRef(null);
  const hueRef = useRef(null);
  const isDraggingSatVal = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync internal HSV when external color prop changes (if not dragging)
  useEffect(() => {
    if (!isDraggingSatVal.current && !isDraggingHue.current) {
      const parsed = hexToHsv(color);
      setHsv(parsed);
      setHexInput(color);
    }
  }, [color]);

  const updateColor = useCallback(
    (newHsv) => {
      setHsv(newHsv);
      const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
      setHexInput(newHex);
      if (onChange) {
        onChange(newHex);
      }
    },
    [onChange]
  );

  // Saturation / Value 2D Box interactions
  const handleSatValPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSatVal.current = true;
    const el = satValRef.current;
    if (!el) return;
    el.setPointerCapture?.(e.pointerId);

    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s: x, v: 1 - y });
  };

  const handleSatValPointerMove = (e) => {
    if (!isDraggingSatVal.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = satValRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s: x, v: 1 - y });
  };

  const handleSatValPointerUp = (e) => {
    if (isDraggingSatVal.current) {
      isDraggingSatVal.current = false;
      try {
        satValRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Hue Slider interactions
  const handleHuePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingHue.current = true;
    const el = hueRef.current;
    if (!el) return;
    el.setPointerCapture?.(e.pointerId);

    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor({ ...hsv, h: Math.round(x * 360) % 360 });
  };

  const handleHuePointerMove = (e) => {
    if (!isDraggingHue.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor({ ...hsv, h: Math.round(x * 360) % 360 });
  };

  const handleHuePointerUp = (e) => {
    if (isDraggingHue.current) {
      isDraggingHue.current = false;
      try {
        hueRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Manual Hex Input
  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    const trimmed = val.trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(trimmed)) {
      const cleanHex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      const parsed = hexToHsv(cleanHex);
      setHsv(parsed);
      if (onChange) onChange(cleanHex);
    }
  };

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div
      ref={containerRef}
      className="custom-color-picker-card"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header with Title and Close Button */}
      <div className="picker-header">
        <span className="picker-title">Color Personalizado</span>
        {onClose && (
          <button
            type="button"
            className="picker-close-btn"
            onClick={onClose}
            title="Cerrar selector de color"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 1. Main 2D Saturation / Value Gradient Canvas */}
      <div
        ref={satValRef}
        className="sat-val-board"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
        onPointerDown={handleSatValPointerDown}
        onPointerMove={handleSatValPointerMove}
        onPointerUp={handleSatValPointerUp}
      >
        <div className="sat-gradient-layer" />
        <div className="val-gradient-layer" />
        {/* Draggable Circle Thumb */}
        <div
          className="sat-val-thumb"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* 2. Horizontal Hue Spectrum Slider */}
      <div
        ref={hueRef}
        className="hue-slider-track"
        onPointerDown={handleHuePointerDown}
        onPointerMove={handleHuePointerMove}
        onPointerUp={handleHuePointerUp}
      >
        <div
          className="hue-slider-thumb"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          }}
        />
      </div>

      {/* 3. Color Preview & Hex input */}
      <div className="picker-footer-row">
        <div className="preview-chip-box">
          <span
            className="preview-chip-dot"
            style={{ backgroundColor: currentHex }}
          />
          <input
            type="text"
            className="hex-text-input"
            value={hexInput}
            onChange={handleHexInputChange}
            maxLength={7}
            placeholder="#4262ff"
          />
        </div>

        {onClose && (
          <button
            type="button"
            className="picker-apply-btn"
            onClick={onClose}
            title="Aplicar color"
          >
            <Check size={14} />
            <span>Listo</span>
          </button>
        )}
      </div>

      {/* 4. Quick Swatches */}
      <div className="picker-swatches-row">
        {QUICK_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            className={`picker-swatch-dot ${swatch.toLowerCase() === currentHex.toLowerCase() ? 'active' : ''}`}
            style={{ backgroundColor: swatch }}
            onClick={() => {
              const parsed = hexToHsv(swatch);
              updateColor(parsed);
            }}
            title={swatch}
          />
        ))}
      </div>

      <style>{`
        .custom-color-picker-card {
          width: 254px;
          padding: 12px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 10px 32px rgba(5, 0, 56, 0.16), 0 2px 8px rgba(5, 0, 56, 0.08);
          border: 1px solid #e1e3ea;
          display: flex;
          flex-direction: column;
          gap: 10px;
          user-select: none;
          box-sizing: border-box;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }

        .picker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 2px;
        }

        .picker-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #050038;
          letter-spacing: -0.01em;
        }

        .picker-close-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .picker-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* 2D SATURATION / VALUE FIELD */
        .sat-val-board {
          position: relative;
          width: 100%;
          height: 142px;
          border-radius: 8px;
          overflow: hidden;
          cursor: crosshair;
          touch-action: none;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.2);
        }

        .sat-gradient-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
        }

        .val-gradient-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, #000000);
        }

        .sat-val-thumb {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.25);
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: transform 0.04s ease-out;
        }

        /* HUE SLIDER TRACK */
        .hue-slider-track {
          position: relative;
          width: 100%;
          height: 10px;
          border-radius: 5px;
          cursor: pointer;
          touch-action: none;
          background: linear-gradient(
            to right,
            #ff0000 0%,
            #ffff00 17%,
            #00ff00 33%,
            #00ffff 50%,
            #0000ff 67%,
            #ff00ff 83%,
            #ff0000 100%
          );
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .hue-slider-thumb {
          position: absolute;
          top: 50%;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* FOOTER / INPUT ROW */
        .picker-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .preview-chip-box {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          flex: 1;
        }

        .preview-chip-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid #ffffff;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
        }

        .hex-text-input {
          width: 100%;
          border: none;
          background: transparent;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          text-transform: uppercase;
        }

        .picker-apply-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          background: #4262ff;
          color: #ffffff;
          border: none;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .picker-apply-btn:hover {
          background: #334ecc;
        }

        /* QUICK SWATCHES */
        .picker-swatches-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          padding-top: 2px;
          border-top: 1px solid #f1f5f9;
        }

        .picker-swatch-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease;
          padding: 0;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .picker-swatch-dot:hover {
          transform: scale(1.18);
        }

        .picker-swatch-dot.active {
          border-color: #050038;
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}
