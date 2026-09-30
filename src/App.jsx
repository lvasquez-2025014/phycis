import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from './components/controls/TopBar';
import LeftToolbar from './components/toolbar/LeftToolbar';
import CanvasBoard from './components/canvas/CanvasBoard';
import ZoomControls from './components/controls/ZoomControls';
import Minimap from './components/controls/Minimap';
import ShareModal from './components/modals/ShareModal';
import SaveBoardModal from './components/modals/SaveBoardModal';
import TemplatesModal from './components/modals/TemplatesModal';
import ToastContainer from './components/controls/ToastContainer';
import CanvasStatusBar from './components/controls/CanvasStatusBar';
import PhysicsSandbox from './components/canvas/PhysicsSandbox';
import MruExerciseSolverModal from './components/modals/MruExerciseSolverModal';
import { getMruTemplate } from './data/mruTemplates';
import { createPhysicsElement, createAtwoodMachineAssembly, createMruLabAssembly } from './physics/physicsRegistry';
import { buildExerciseBoardElements } from './services/mruExerciseSolver';

class SandboxErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('PhysicsSandbox error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #ef4444',
            borderRadius: 12, padding: 24, maxWidth: 500, color: '#f8fafc'
          }}>
            <h3 style={{ color: '#ef4444', marginBottom: 8 }}>Error al iniciar el Sandbox Físico</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
              {this.state.error?.message || 'Error inesperado'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onClose();
              }}
              style={{
                padding: '8px 16px', background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [boardName, setBoardName] = useState('Untitled whiteboard');

  // Canvas Transform (Centered by default)
  const [transform, setTransform] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    scale: 1.0,
  });

  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Tools Configuration
  const [activeTool, setActiveTool] = useState('select');
  const [activeShape, setActiveShape] = useState('rectangle');
  const [stickyColor, setStickyColor] = useState('#fff9b1');
  const [penColor, setPenColor] = useState('#050038');
  const [penWidth, setPenWidth] = useState(3);

  // Modals & Popups
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isMruSolverOpen, setIsMruSolverOpen] = useState(false);
  const [isPhysicsSandboxOpen, setIsPhysicsSandboxOpen] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Empty initial board as requested
  const [elements, setElements] = useState([]);

  // Undo / Redo History
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  const canvasRef = useRef(null);

  const pushHistory = useCallback((customSnapshot) => {
    const snap = customSnapshot !== undefined ? customSnapshot : elementsRef.current;
    setHistory((prev) => [...prev.slice(-40), JSON.stringify(snap)]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const last = prevHistory[prevHistory.length - 1];
      setRedoStack((prevRedo) => [JSON.stringify(elementsRef.current), ...prevRedo]);
      setElements(JSON.parse(last));
      return prevHistory.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const next = prevRedo[0];
      setHistory((prevHistory) => [...prevHistory, JSON.stringify(elementsRef.current)]);
      setElements(JSON.parse(next));
      return prevRedo.slice(1);
    });
  }, []);

  // Global Keyboard Shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isInput =
        e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Global prevention of browser page zoom (Ctrl+wheel / Cmd+wheel)
  useEffect(() => {
    const handlePreventBrowserZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', handlePreventBrowserZoom, { passive: false });
    return () => {
      window.removeEventListener('wheel', handlePreventBrowserZoom);
    };
  }, []);

  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Zoom Handlers
  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(10.0, +(prev.scale * 1.15).toFixed(2)),
    }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.1, +(prev.scale / 1.15).toFixed(2)),
    }));
  };

  const handleResetZoom = () => {
    setTransform({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      scale: 1.0,
    });
    addToast('🎯 Fit to screen (100%)');
  };

  // Pan to world coordinate (Minimap)
  const handlePanTo = (worldX, worldY) => {
    setTransform((prev) => ({
      ...prev,
      x: window.innerWidth / 2 - worldX * prev.scale,
      y: window.innerHeight / 2 - worldY * prev.scale,
    }));
  };

  // Export to High-Res PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw canvas lines & shapes
    ctx.drawImage(canvas, 0, 0);

    // Render sticky notes
    ctx.save();
    ctx.scale(dpr, dpr);
    elements
      .filter((el) => el.type === 'sticky')
      .forEach((sticky) => {
        const sx = sticky.x * transform.scale + transform.x;
        const sy = sticky.y * transform.scale + transform.y;
        const sw = sticky.width * transform.scale;
        const sh = sticky.height * transform.scale;

        ctx.save();
        ctx.fillStyle = sticky.color || '#fff9b1';
        ctx.shadowColor = 'rgba(5, 0, 56, 0.12)';
        ctx.shadowBlur = 8;
        ctx.fillRect(sx, sy, sw, sh);

        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.strokeRect(sx, sy, sw, sh);

        // Text
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `500 ${Math.max(11, 14 * transform.scale)}px Inter, sans-serif`;
        const lines = sticky.text.split('\n');
        lines.forEach((l, i) => {
          ctx.fillText(l, sx + 12, sy + 24 + i * 18);
        });
        ctx.restore();
      });
    ctx.restore();

    const link = document.createElement('a');
    link.download = `${boardName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    addToast('🖼️ Whiteboard image saved as PNG!');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ boardName, elements }, null, 2));
    const link = document.createElement('a');
    link.download = `${boardName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.href = dataStr;
    link.click();
    addToast('💾 Board saved as backup file');
  };

  // Insert Greek / Math symbol directly onto canvas
  const handleInsertSymbol = useCallback(
    (symbolChar) => {
      pushHistory();
      // Calculate world coordinates for the center of the current viewport
      const wx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const wy = (window.innerHeight / 2 - transform.y) / transform.scale;
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;

      const newId = `symbol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newEl = {
        id: newId,
        type: 'text',
        x: Math.round(wx - 20 + jitterX),
        y: Math.round(wy - 20 + jitterY),
        text: symbolChar,
        fontSize: 48,
        color: penColor || '#050038',
        isMath: true,
      };

      setElements((prev) => [...prev, newEl]);
      addToast(`✨ Símbolo '${symbolChar}' insertado en el lienzo`);
    },
    [pushHistory, transform, penColor]
  );

  const handleClearBoard = useCallback(() => {
    if (elementsRef.current.length === 0) return;
    pushHistory();
    setElements([]);
    addToast('🧹 Pizarra limpiada por completo');
  }, [pushHistory]);

  // Insert Physical Object (Mass, MRU cart, track, etc.) onto canvas
  const handleAddPhysicsObject = useCallback(
    (type = 'mass', preset = null, worldPos = null) => {
      pushHistory();
      let wx, wy;
      if (worldPos) {
        wx = worldPos.x;
        wy = worldPos.y;
      } else {
        // Place in center of current viewport
        wx = (window.innerWidth / 2 - transform.x) / transform.scale;
        wy = (window.innerHeight / 2 - transform.y) / transform.scale;

        if (type === 'mru_cart') {
          const currentTracks = elementsRef.current.filter((e) => e.physicsType === 'mru_track');
          const currentCarts = elementsRef.current.filter((e) => e.physicsType === 'mru_cart');

          if (currentTracks.length > 0) {
            // Find track nearest to viewport center
            const track = currentTracks[0];
            wy = track.y - 12; // seat directly on top of the track surface

            if (currentCarts.length === 0) {
              // First cart sits near origin of track
              wx = track.x + 80;
            } else {
              // Stagger behind rightmost cart on track
              const cartsOnTrack = currentCarts.filter(
                (c) => Math.abs(track.y - (c.y + c.height)) < 65
              );
              if (cartsOnTrack.length > 0) {
                const rightmost = cartsOnTrack.reduce((prev, curr) => (curr.x > prev.x ? curr : prev));
                const nextX = rightmost.x + rightmost.width + 45;
                if (nextX + 105 < track.x + track.width - 20) {
                  wx = nextX + 105 / 2;
                } else {
                  wx = track.x + 80;
                }
              } else {
                wx = track.x + 80;
              }
            }
          } else if (currentCarts.length > 0) {
            // Stagger free carts horizontally so they don't spawn completely overlapping
            const offsetCount = currentCarts.length % 5;
            wx += offsetCount * 130;
          }
        }
      }
      const newEl = createPhysicsElement(type, wx, wy, preset);
      setElements((prev) => [...prev, newEl]);
      setActiveTool('select');
      addToast(`⚖️ Objeto añadido: ${preset?.label || 'Objeto físico'}`);
      return newEl;
    },
    [pushHistory, transform, setActiveTool]
  );

  // Quick Assemblies (e.g. Atwood Machine)
  const handleAddAssembly = useCallback(
    (assemblyType) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale - 60;

      if (assemblyType === 'atwood') {
        const atwoodElements = createAtwoodMachineAssembly(cx, cy);
        setElements((prev) => [...prev, ...atwoodElements]);
        setActiveTool('select');
        addToast('⚙️ Máquina de Atwood montada en el lienzo');
      } else if (assemblyType === 'mru') {
        const mruElements = createMruLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...mruElements]);
        setActiveTool('select');
        addToast('🏎️ Laboratorio MRU montado en el lienzo');
      }
    },
    [pushHistory, transform, setActiveTool]
  );

  const handleMountExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`📐 Ejercicio montado en el lienzo: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool]
  );

  return (
    <div className="webwhiteboard-app">
      {/* Top Bar with PhyBoard / Physics branding */}
      <TopBar
        boardName={boardName}
        setBoardName={setBoardName}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenMruSolver={() => setIsMruSolverOpen(true)}
        onOpenPhysicsSandbox={() => setIsPhysicsSandboxOpen(true)}
        onClearBoard={handleClearBoard}
      />

      {/* Signature Vertical Left Toolbar with Undo/Redo & Flyouts */}
      <LeftToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        setActiveShape={setActiveShape}
        stickyColor={stickyColor}
        setStickyColor={setStickyColor}
        penColor={penColor}
        setPenColor={setPenColor}
        penWidth={penWidth}
        setPenWidth={setPenWidth}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onInsertSymbol={handleInsertSymbol}
        onAddPhysicsObject={handleAddPhysicsObject}
        onAddAssembly={handleAddAssembly}
        onSelectRopeTool={() => setActiveTool('rope')}
        onOpenMruSolver={() => setIsMruSolverOpen(true)}
        onLoadTemplate={(tplArg) => {
          pushHistory();
          // 1. Direct object format from modal { elements, boardName, toast }
          if (tplArg && typeof tplArg === 'object' && Array.isArray(tplArg.elements)) {
            setElements(tplArg.elements);
            if (tplArg.boardName) setBoardName(tplArg.boardName);
            addToast(tplArg.toast || '📋 Plantilla cargada');
            return;
          }

          // 2. MRU & Movimiento Unidimensional subtopic template
          const mruData = getMruTemplate(tplArg);
          if (mruData) {
            setElements(mruData.elements);
            if (mruData.boardName) setBoardName(mruData.boardName);
            addToast(mruData.toast || '📋 Plantilla cargada');
            return;
          }

          // 3. Fallbacks
          if (tplArg === 'blank') {
            setElements([]);
            addToast('🧹 Pizarra en blanco');
          }
        }}
      />

      {/* Main Canvas with dot grid, stickies and contextual toolbar */}
      <CanvasBoard
        elements={elements}
        setElements={setElements}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        stickyColor={stickyColor}
        penColor={penColor}
        penWidth={penWidth}
        transform={transform}
        setTransform={setTransform}
        viewportSize={viewportSize}
        setViewportSize={setViewportSize}
        pushHistory={pushHistory}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canvasRef={canvasRef}
        onNotify={addToast}
      />

      {/* Bottom Right Miro Zoom Controls */}
      <ZoomControls
        scale={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        minimapOpen={isMinimapOpen}
        onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
      />

      {/* Minimap (if toggled) */}
      {isMinimapOpen && (
        <Minimap
          elements={elements}
          transform={transform}
          viewportSize={viewportSize}
          onPanTo={handlePanTo}
        />
      )}

      {/* Share Board Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onNotify={addToast}
      />

      {/* 24-hr Save to Miro Modal */}
      <SaveBoardModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onNotify={addToast}
      />

      {/* Templates Library Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoadTemplate={({ elements: tplEls, boardName: tplName }) => {
          pushHistory();
          setElements(tplEls);
          if (tplName) setBoardName(tplName);
          addToast(`📋 Template loaded: ${tplName}`);
        }}
      />

      {/* MRU Exercise Solver & Laboratory Generator Modal */}
      <MruExerciseSolverModal
        isOpen={isMruSolverOpen}
        onClose={() => setIsMruSolverOpen(false)}
        onMountExerciseOnBoard={handleMountExercise}
      />

      {/* Physics Sandbox Modal (Matter.js Atwood Machine) */}
      {isPhysicsSandboxOpen && (
        <SandboxErrorBoundary onClose={() => setIsPhysicsSandboxOpen(false)}>
          <PhysicsSandbox onClose={() => setIsPhysicsSandboxOpen(false)} />
        </SandboxErrorBoundary>
      )}

      {/* Bottom Left Tool Hints & Status Bar */}
      <CanvasStatusBar activeTool={activeTool} />

      {/* Toast Feedback Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <style>{`
        .webwhiteboard-app {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
}
