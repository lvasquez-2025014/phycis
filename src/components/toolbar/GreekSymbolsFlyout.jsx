import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { GREEK_ALPHABET } from '../../data/greekSymbols';

export default function GreekSymbolsFlyout({ isOpen, onClose, onInsertSymbol }) {
  if (!isOpen) return null;

  const [symbolSearch, setSymbolSearch] = useState('');
  const [symbolCategory, setSymbolCategory] = useState('all');

  const filteredSymbols = GREEK_ALPHABET.filter((item) => {
    if (symbolCategory !== 'all' && item.category !== symbolCategory) {
      return false;
    }
    if (symbolSearch.trim()) {
      const q = symbolSearch.trim().toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchEn = item.nameEn.toLowerCase().includes(q);
      const matchDesc = item.desc.toLowerCase().includes(q);
      const matchSym = item.symbol.toLowerCase() === q || item.symbol.includes(q);
      return matchName || matchEn || matchDesc || matchSym;
    }
    return true;
  });

  const getCategoryCount = (cat) => {
    return GREEK_ALPHABET.filter((item) => {
      if (cat !== 'all' && item.category !== cat) return false;
      if (symbolSearch.trim()) {
        const q = symbolSearch.trim().toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.symbol.includes(q)
        );
      }
      return true;
    }).length;
  };

  return (
    <div className="symbols-drawer-card miro-island">
      {/* Header */}
      <div className="symbols-drawer-header">
        <div className="symbols-header-titles">
          <div className="symbols-badge-row">
            <span className="symbols-header-badge">Abecedario Griego</span>
            <span className="symbols-count-badge">{filteredSymbols.length} símbolos</span>
          </div>
          <h3 className="symbols-drawer-title">Letras Griegas y Símbolos</h3>
          <p className="symbols-drawer-subtitle">
            Haz clic en una letra para insertarla en el lienzo y copiarla
          </p>
        </div>
        <button
          className="symbols-close-btn"
          onClick={onClose}
          title="Cerrar (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Bar with Instant Filter */}
      <div className="symbols-search-container">
        <Search size={16} className="symbols-search-icon" />
        <input
          type="text"
          className="symbols-search-input"
          placeholder="Buscar (ej. sigma, alfa, theta, pi, omega, integral)..."
          value={symbolSearch}
          onChange={(e) => setSymbolSearch(e.target.value)}
          autoFocus
        />
        {symbolSearch && (
          <button
            className="symbols-clear-btn"
            onClick={() => setSymbolSearch('')}
            title="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="symbols-category-tabs">
        <button
          className={`symbols-tab-pill ${symbolCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSymbolCategory('all')}
        >
          Todos ({getCategoryCount('all')})
        </button>
        <button
          className={`symbols-tab-pill ${symbolCategory === 'lowercase' ? 'active' : ''}`}
          onClick={() => setSymbolCategory('lowercase')}
        >
          Minúsculas ({getCategoryCount('lowercase')})
        </button>
        <button
          className={`symbols-tab-pill ${symbolCategory === 'uppercase' ? 'active' : ''}`}
          onClick={() => setSymbolCategory('uppercase')}
        >
          Mayúsculas ({getCategoryCount('uppercase')})
        </button>
        <button
          className={`symbols-tab-pill ${symbolCategory === 'math' ? 'active' : ''}`}
          onClick={() => setSymbolCategory('math')}
        >
          Matemática ({getCategoryCount('math')})
        </button>
      </div>

      {/* Scrollable Grid of Symbols */}
      <div className="symbols-grid-scrollable">
        {filteredSymbols.length > 0 ? (
          <div className="symbols-grid">
            {filteredSymbols.map((item, idx) => (
              <button
                key={`${item.symbol}-${idx}`}
                className="symbol-tile-card"
                onClick={() => {
                  if (onInsertSymbol) {
                    onInsertSymbol(item.symbol);
                  }
                  try {
                    navigator.clipboard.writeText(item.symbol);
                  } catch {
                    // ignore
                  }
                }}
                title={`${item.desc} (${item.symbol}) - Clic para insertar en el lienzo`}
              >
                <span className="symbol-glyph">{item.symbol}</span>
                <span className="symbol-label">{item.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="symbols-empty-state">
            <span className="empty-emoji">🔍</span>
            <p className="empty-title">No se encontró "{symbolSearch}"</p>
            <p className="empty-desc">
              Busca por nombre en español (sigma, alfa, beta, delta, pi) o escribe el símbolo directamente.
            </p>
            <button
              className="empty-clear-btn"
              onClick={() => setSymbolSearch('')}
            >
              Ver todos los símbolos
            </button>
          </div>
        )}
      </div>

      {/* Footer Quick Tip */}
      <div className="symbols-drawer-footer">
        <span className="footer-tip-text">
          ✨ <strong>Inserción rápida:</strong> Clic en cualquier símbolo para colocarlo en el centro del lienzo.
        </span>
      </div>
    </div>
  );
}
