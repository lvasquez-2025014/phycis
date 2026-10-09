import React from 'react';
import { Layers } from 'lucide-react';

const STICKY_PALETTE = [
  ['#fff9b1', '#fde047'], // Yellows
  ['#fb923c', '#f87171'], // Orange, Coral
  ['#fbcfe8', '#f472b6'], // Light pink, Magenta
  ['#bfdbfe', '#c4b5fd'], // Soft blue, Lavender
  ['#7dd3fc', '#60a5fa'], // Sky cyan, Royal blue
  ['#5eead4', '#4ade80'], // Teal mint, Emerald
  ['#bef264', '#a3e635'], // Lime green, Olive
  ['#ffffff', '#1c1917'], // White, Black
];

export default function StickyFlyout({
  isOpen,
  stickyColor,
  setStickyColor,
  setActiveTool,
  onOpenTemplates,
}) {
  if (!isOpen) return null;

  return (
    <div className="sticky-flyout-card miro-island">
      <div className="sticky-palette-grid">
        {STICKY_PALETTE.map(([c1, c2], rowIdx) => (
          <React.Fragment key={rowIdx}>
            <button
              className={`sticky-square-tile ${stickyColor === c1 ? 'active' : ''}`}
              style={{ backgroundColor: c1 }}
              onClick={() => {
                setStickyColor(c1);
                setActiveTool('sticky');
              }}
            />
            <button
              className={`sticky-square-tile ${stickyColor === c2 ? 'active' : ''}`}
              style={{ backgroundColor: c2 }}
              onClick={() => {
                setStickyColor(c2);
                setActiveTool('sticky');
              }}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="sticky-actions-list">
        <button className="sticky-action-row-btn" onClick={() => setActiveTool('sticky')}>
          <Layers size={16} />
          <span>Apilar</span>
        </button>
        <div className="bulk-mode-label">Modo rápido</div>
      </div>
    </div>
  );
}
