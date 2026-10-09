import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from './components/controls/TopBar';
import LeftToolbar from './components/toolbar/LeftToolbar';
import CanvasBoard from './components/canvas/CanvasBoard';
import Minimap from './components/controls/Minimap';
import ShareModal from './components/modals/ShareModal';
import SaveBoardModal from './components/modals/SaveBoardModal';
import ToastContainer from './components/controls/ToastContainer';
import CanvasStatusBar from './components/controls/CanvasStatusBar';
import SimulationView from './components/simulation/SimulationView';
import { buildCustomExampleBoardElements } from './services/customExampleBuilder';
import { getMruTemplate } from './data/mruTemplates';
import { 
  createPhysicsElement, 
  createAtwoodMachineAssembly, 
  createMruLabAssembly, 
  createMruvLabAssembly,
  createFreefallLabAssembly,
  createVerticalLaunchLabAssembly,
  createHorizontalLaunchLabAssembly,
  createProjectileMotionLabAssembly,
  createMcuLabAssembly,
  createMcuvLabAssembly,
  createPoleasMcuLabAssembly,
  createDclLabAssembly,
  createTranslationalEquilibriumLabAssembly,
  createNewtonSecondLawAssembly,
  getCannonMuzzlePosition,
} from './physics/physicsRegistry';
import { buildExerciseBoardElements } from './services/mruExerciseSolver';
import { buildMruvExerciseBoardElements } from './services/mruvExerciseSolver';
import { buildFreefallExerciseBoardElements } from './services/freefallExerciseSolver';
import { buildVerticalLaunchExerciseBoardElements } from './services/tiroVerticalExerciseSolver';
import { buildHorizontalLaunchExerciseBoardElements } from './services/horizontalLaunchExerciseSolver';
import { buildProjectileMotionExerciseBoardElements } from './services/projectileMotionExerciseSolver';

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
  const [eraserSize, setEraserSize] = useState(24);
  const [eraserShape, setEraserShape] = useState('circle');
  const [boardTemplate, setBoardTemplate] = useState('cartesian');
  const [activeNav, setActiveNav] = useState('board'); // 'board' | 'simulation'

  // Modals & Popups
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
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
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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

  const handleSelectTemplate = useCallback(
    (tmpl) => {
      setBoardTemplate(tmpl);
      if (tmpl === 'chalkboard') {
        if (penColor === '#050038' || !penColor) {
          setPenColor('#ffffff');
        }
        addToast('🏫 Pizarra verde de tiza activada');
      } else {
        if (penColor === '#ffffff') {
          setPenColor('#050038');
        }
      }
    },
    [penColor, addToast]
  );

  const handleInsertFlowchart = useCallback(() => {
    pushHistory();
    const wx = Math.round((window.innerWidth / 2 - transform.x) / transform.scale);
    const wy = Math.round((window.innerHeight / 2 - transform.y) / transform.scale);
    const startX = wx - 270;
    const startY = wy - 27;

    const newElements = [
      {
        id: `flow-start-${Date.now()}`,
        type: 'capsule',
        startX: startX,
        startY: startY,
        endX: startX + 105,
        endY: startY + 54,
        color: '#10b981',
        fill: '#ecfdf5',
        size: 2,
        text: 'Inicio',
      },
      {
        id: `flow-arr1-${Date.now()}`,
        type: 'arrow',
        startX: startX + 105,
        startY: startY + 27,
        endX: startX + 155,
        endY: startY + 27,
        color: '#64748b',
        size: 2,
      },
      {
        id: `flow-proc-${Date.now()}`,
        type: 'rectangle',
        startX: startX + 155,
        startY: startY,
        endX: startX + 285,
        endY: startY + 54,
        color: '#2563eb',
        fill: '#eff6ff',
        size: 2,
        text: 'Proceso',
      },
      {
        id: `flow-arr2-${Date.now()}`,
        type: 'arrow',
        startX: startX + 285,
        startY: startY + 27,
        endX: startX + 335,
        endY: startY + 27,
        color: '#64748b',
        size: 2,
      },
      {
        id: `flow-dec-${Date.now()}`,
        type: 'diamond',
        startX: startX + 335,
        startY: startY - 8,
        endX: startX + 435,
        endY: startY + 62,
        color: '#d97706',
        fill: '#fef3c7',
        size: 2,
        text: '¿Válido?',
      },
      {
        id: `flow-arr3-${Date.now()}`,
        type: 'arrow',
        startX: startX + 435,
        startY: startY + 27,
        endX: startX + 485,
        endY: startY + 27,
        color: '#64748b',
        size: 2,
      },
      {
        id: `flow-end-${Date.now()}`,
        type: 'capsule',
        startX: startX + 485,
        startY: startY,
        endX: startX + 590,
        endY: startY + 54,
        color: '#ef4444',
        fill: '#fef2f2',
        size: 2,
        text: 'Fin',
      },
    ];

    setElements((prev) => [...prev, ...newElements]);
    setSelectedIds(newElements.map((e) => e.id));
    setActiveTool('select');
    addToast('📊 Flujograma insertado en el lienzo');
  }, [pushHistory, transform, addToast]);

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
        } else if (type === 'horizontal_projectile') {
          const currentCliffs = elementsRef.current.filter((e) => e.physicsType === 'cliff_platform');
          if (currentCliffs.length > 0) {
            const cliff = currentCliffs[0];
            const projW = 44;
            const projH = 44;
            // Dock on top launch ledge
            wx = cliff.x + cliff.width - projW / 2;
            wy = cliff.y - projH / 2;
          }
        } else if (type === 'freefall_body') {
          const currentTowers = elementsRef.current.filter((e) => e.physicsType === 'freefall_tower');
          if (currentTowers.length > 0) {
            const tower = currentTowers[0];
            wx = tower.x + tower.width + 25;
            wy = tower.y + 10;
          }
        } else if (type === 'vertical_projectile') {
          const currentTowers = elementsRef.current.filter((e) => e.physicsType === 'freefall_tower');
          if (currentTowers.length > 0) {
            const tower = currentTowers[0];
            wx = tower.x + tower.width + 25;
            wy = tower.y + tower.height - 40;
          }
        } else if (type === 'oblique_projectile') {
          const currentCannons = elementsRef.current.filter((e) => e.physicsType === 'cannon_launcher');
          if (currentCannons.length > 0) {
            const cannon = currentCannons[0];
            const projSize = preset?.width || 26;
            const thetaDeg = cannon.properties?.angleDeg ?? cannon.properties?.initialAngleDeg ?? 37.0;
            const muzzle = getCannonMuzzlePosition(cannon.x, cannon.y, cannon.width || 90, cannon.height || 70, thetaDeg);
            wx = muzzle.muzzleCenterX - projSize / 2;
            wy = muzzle.muzzleCenterY - projSize / 2;
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
      } else if (assemblyType === 'mruv') {
        const mruvElements = createMruvLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...mruvElements]);
        setActiveTool('select');
        addToast('🏎️ Laboratorio MRUV montado en el lienzo');
      } else if (assemblyType === 'freefall') {
        const freefallElements = createFreefallLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...freefallElements]);
        setActiveTool('select');
        addToast('🌍 Laboratorio de Caída Libre montado en el lienzo');
      } else if (assemblyType === 'tiro_vertical') {
        const vtElements = createVerticalLaunchLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...vtElements]);
        setActiveTool('select');
        addToast('🚀 Laboratorio de Tiro Vertical montado en el lienzo');
      } else if (assemblyType === 'lanzamiento_horizontal') {
        const hlElements = createHorizontalLaunchLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...hlElements]);
        setActiveTool('select');
        addToast('🚀 Laboratorio de Lanzamiento Horizontal montado en el lienzo');
      } else if (assemblyType === 'movimiento_proyectiles') {
        const projElements = createProjectileMotionLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...projElements]);
        setActiveTool('select');
        addToast('🎯 Laboratorio de Movimiento de Proyectiles montado en el lienzo');
      } else if (assemblyType === 'mcu') {
        const mcuElements = createMcuLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...mcuElements]);
        setActiveTool('select');
        addToast('🔄 Laboratorio MCU montado en el lienzo');
      } else if (assemblyType === 'mcuv_assembly' || assemblyType === 'mcuv') {
        const mcuvElements = createMcuvLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...mcuvElements]);
        setActiveTool('select');
        addToast('🔄 Laboratorio MCUV montado en el lienzo');
      } else if (assemblyType === 'poleas_mcu_assembly' || assemblyType === 'poleas_mcu') {
        const poleasElements = createPoleasMcuLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...poleasElements]);
        setActiveTool('select');
        addToast('⚙️ Laboratorio de Poleas MCU montado en el lienzo');
      } else if (assemblyType === 'dcl_assembly' || assemblyType === 'dcl') {
        const dclElements = createDclLabAssembly(cx, cy);
        setElements((prev) => [...prev, ...dclElements]);
        setActiveTool('select');
        addToast('⚖️ Laboratorio Vectorial D.C.L. montado en el lienzo');
      } else if (assemblyType === 'equilibrio_assembly' || assemblyType === 'equilibrio') {
        const eqElements = createTranslationalEquilibriumLabAssembly(cx, cy, 1);
        setElements((prev) => [...prev, ...eqElements]);
        setActiveTool('select');
        addToast('⚖️ Laboratorio de Equilibrio Traslacional (HT03) montado en el lienzo');
      } else if (assemblyType === 'newton_assembly' || assemblyType === 'segunda_ley_newton') {
        const newtonElements = createNewtonSecondLawAssembly(cx, cy, 7);
        setElements((prev) => [...prev, ...newtonElements]);
        setActiveTool('select');
        addToast('⚖️ Laboratorio de Segunda Ley de Newton (HT01 U4) montado en el lienzo');
      }
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  // Insert Formula Card onto Canvas (MRU formulas & system variables)
  const handleInsertFormulaCard = useCallback(
    (cardData = null) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const title = cardData?.title || 'Fórmula Fundamental MRU';
      const formula = cardData?.formula || 'd = v · t';

      let textContent = `📐 ${title}\n\nEcuación:\n${formula}\n`;
      if (cardData?.variables && cardData.variables.length > 0) {
        textContent += '\nVariables del Sistema:\n';
        cardData.variables.forEach((v) => {
          textContent += `• ${v.symbol} = ${v.value}\n`;
        });
      } else {
        textContent += '\nDespejes Fundamentales:\n• v = d / t\n• t = d / v\n• x(t) = x₀ + v · t';
      }

      const newCard = {
        id: `sticky-formula-${Date.now()}`,
        type: 'sticky',
        x: cx - 120,
        y: cy - 90,
        width: 250,
        height: 210,
        text: textContent,
        color: '#d5f0ff', // light cyan scientific sticky
      };

      setElements((prev) => [...prev, newCard]);
      setActiveTool('select');
      addToast('📌 Tarjeta de fórmulas insertada en la pizarra');
    },
    [pushHistory, transform, setActiveTool, addToast]
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
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountMruvExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildMruvExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`📐 Ejercicio MRUV montado en el lienzo: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountFreefallExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildFreefallExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🌍 Ejercicio de Caída Libre montado: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountTiroVerticalExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildVerticalLaunchExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🚀 Ejercicio de Tiro Vertical montado: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountHorizontalLaunchExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildHorizontalLaunchExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🚀 Ejercicio de Lanzamiento Horizontal montado: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountProjectileMotionExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildProjectileMotionExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🎯 Ejercicio de Movimiento de Proyectiles montado: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountMcuExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildMcuExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🔄 Ejercicio MCU montado en el lienzo: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountMcuvExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildMcuvExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`🔄 Ejercicio MCUV montado en el lienzo: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountPoleasMcuExercise = useCallback(
    (exercise) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = buildPoleasMcuExerciseBoardElements(exercise, cx, cy);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(`⚙️ Ejercicio Poleas MCU montado en el lienzo: ${exercise.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountDclExercise = useCallback(
    (exerciseNumber, options = {}) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = generateDclCanvasElements(exerciseNumber, cx, cy, options);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(
        options.cleanPractice
          ? `📐 Mesa limpia lista para dibujar DCL (Problema #${exerciseNumber})`
          : `⚖️ Ejercicio #${exerciseNumber} de D.C.L. montado en el lienzo`
      );
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountEquilibrioExercise = useCallback(
    (exerciseNumber, options = {}) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = generateEquilibrioCanvasElements(exerciseNumber, cx, cy, options);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(
        options.cleanPractice
          ? `🎯 Aparato limpio para práctica montado (Problema #${exerciseNumber})`
          : `✨ Problema #${exerciseNumber} de Equilibrio Traslacional montado con solución`
      );
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountNewtonExercise = useCallback(
    (exerciseNumber, options = {}) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const exerciseElements = generateNewtonCanvasElements(exerciseNumber, cx, cy, options);
      setElements((prev) => [...prev, ...exerciseElements]);
      setActiveTool('select');
      addToast(
        options.cleanPractice
          ? `🎯 Aparato limpio para práctica montado (Problema #${exerciseNumber})`
          : `✨ Problema #${exerciseNumber} de Segunda Ley de Newton montado con solución`
      );
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  const handleMountCustomExample = useCallback(
    (customExample) => {
      pushHistory();
      const cx = (window.innerWidth / 2 - transform.x) / transform.scale;
      const cy = (window.innerHeight / 2 - transform.y) / transform.scale;

      const customEls = buildCustomExampleBoardElements(customExample, cx, cy);
      setElements((prev) => [...prev, ...customEls]);
      setActiveTool('select');
      addToast(`✨ Ejemplo del profesor montado en la pizarra: ${customExample.title}`);
    },
    [pushHistory, transform, setActiveTool, addToast]
  );

  return (
    <div className="webwhiteboard-app">
      {/* Top Bar with PhyBoard / Physics branding & Nav tabs */}
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
        onClearBoard={handleClearBoard}
        boardTemplate={boardTemplate}
        setBoardTemplate={handleSelectTemplate}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
      />

      {/* Full-view Simulation Module */}
      {activeNav === 'simulation' && (
        <SimulationView
          onBackToBoard={() => setActiveNav('board')}
        />
      )}

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
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        eraserShape={eraserShape}
        setEraserShape={setEraserShape}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onInsertSymbol={handleInsertSymbol}
        onInsertFlowchart={handleInsertFlowchart}
        onAddPhysicsObject={handleAddPhysicsObject}
        onAddAssembly={handleAddAssembly}
        onInsertFormulaCard={handleInsertFormulaCard}
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
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        eraserShape={eraserShape}
        setEraserShape={setEraserShape}
        boardTemplate={boardTemplate}
        transform={transform}
        setTransform={setTransform}
        viewportSize={viewportSize}
        setViewportSize={setViewportSize}
        pushHistory={pushHistory}
        canvasRef={canvasRef}
        onNotify={addToast}
        onInsertFormulaCard={handleInsertFormulaCard}
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

      {/* Save Session Modal */}
      <SaveBoardModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onNotify={addToast}
      />



      {/* Studio Bottom Status Bar & Zoom Controls */}
      <CanvasStatusBar
        activeTool={activeTool}
        scale={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        minimapOpen={isMinimapOpen}
        onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
      />

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
