import React, { useRef, useEffect, useState, useCallback } from 'react';
import ContextualToolbar from './ContextualToolbar';
import { Sparkles } from 'lucide-react';
import {
  distToSegment,
  getElementBounds,
  getClusterBounds,
  isElementInBox,
  isElementInLasso,
  classifyCharacterCluster,
  recognizeSmartShape,
} from '../../services/strokeRecognition';
import { solveMathEquation } from '../../services/mathSolver';
import {
  drawMiroSquareGrid,
  drawEraserBrush,
  drawStroke,
  drawLasso,
  drawShape,
  drawText,
  drawPhysicsObject,
  drawPhysicsConnection,
} from '../../services/canvasRenderers';
import {
  createPhysicsElement,
  createPhysicsConnection,
  getAnchorAbsolutePosition,
} from '../../physics/physicsRegistry';
import {
  createHeadlessSimulation,
  stepHeadlessSimulation,
  resetHeadlessSimulation,
  isSimStateCompatible,
} from '../../physics/physicsSimulation';
import PhysicsSimulationBar from './PhysicsSimulationBar';
import PhysicsObjectInspector from '../modals/PhysicsObjectInspector';


export default function CanvasBoard({
  elements,
  setElements,
  activeTool,
  setActiveTool,
  activeShape,
  stickyColor,
  penColor,
  penWidth,
  transform,
  setTransform,
  viewportSize,
  setViewportSize,
  pushHistory,
  onUndo,
  onRedo,
  canvasRef,
  onNotify,
}) {
  const containerRef = useRef(null);

  // Interaction States
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Live drawing preview (pen, highlighter, smart_pen, pencil_eraser, lasso, shapes)
  const [currentDraft, setCurrentDraft] = useState(null);

  // Selection Marquee Box (Click and drag with select tool)
  const [selectionMarquee, setSelectionMarquee] = useState(null);
  const [isSelectingMarquee, setIsSelectingMarquee] = useState(false);

  // Cursor world coordinates for live eraser preview
  const [cursorWorldPos, setCursorWorldPos] = useState(null);

  // MULTI-SELECTION STATE (Array of element IDs)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [lastDragPos, setLastDragPos] = useState(null);

  // Physical Connection (Rope / Wire) Drafting States
  const [hoveredAnchor, setHoveredAnchor] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectionDraft, setConnectionDraft] = useState(null);

  // Headless Matter.js Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [gravityPreset, setGravityPreset] = useState('earth');
  const [simMetrics, setSimMetrics] = useState({
    accel: 0,
    tension: 0,
    velA: 0,
    time: '0.0',
  });
  const simStateRef = useRef(null);
  const lastInitialSnapshotRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isSimulatingRef = useRef(false);
  isSimulatingRef.current = isSimulating;

  // Physics Object Inspector Modal state
  const [inspectorElement, setInspectorElement] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const handleOpenPhysicsInspector = useCallback((targetEl) => {
    const el = targetEl || (selectedIds.length > 0 ? elementsRef.current.find((e) => e.id === selectedIds[0]) : null);
    if (el && el.type === 'physics_object') {
      setInspectorElement(el);
      setIsInspectorOpen(true);
    }
  }, [selectedIds]);

  const handleUpdatePhysicsElement = useCallback((updatedEl) => {
    pushHistory();
    setElements((prev) =>
      prev.map((el) => (el.id === updatedEl.id ? updatedEl : el))
    );
    if (simStateRef.current) {
      simStateRef.current = null;
    }
    lastInitialSnapshotRef.current = null;
  }, [pushHistory, setElements]);

  // Toggle Simulation Play / Pause
  const handleToggleSimulate = useCallback(() => {
    if (isSimulatingRef.current) {
      // Pause
      setIsSimulating(false);
      isSimulatingRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    } else {
      // Validate existing simulation against current whiteboard elements
      if (simStateRef.current && !isSimStateCompatible(simStateRef.current, elementsRef.current)) {
        simStateRef.current = null;
        lastInitialSnapshotRef.current = null;
      }

      // If simulation finished previously (auto-stopped), reset back to start line
      if (simStateRef.current?.isSimulationComplete) {
        const resetEls = resetHeadlessSimulation(simStateRef.current, elementsRef.current);
        elementsRef.current = resetEls;
        setElements(resetEls);
        if (simStateRef.current.telemetry) {
          setSimMetrics(simStateRef.current.telemetry);
        }
      }

      // Start or Resume
      if (!simStateRef.current) {
        let gScale = 1.0;
        let realG = 9.8;
        if (gravityPreset === 'moon') { gScale = 0.165; realG = 1.62; }
        else if (gravityPreset === 'jupiter') { gScale = 2.53; realG = 24.8; }
        else if (gravityPreset === 'zero') { gScale = 0; realG = 0; }

        simStateRef.current = createHeadlessSimulation(elementsRef.current, {
          gravityScale: gScale,
          realG,
        });
        lastInitialSnapshotRef.current = simStateRef.current.initialSnapshot;

        // If any cart position was auto-reset by createHeadlessSimulation (e.g. from bumper), sync elements immediately
        const hasPosMismatch = simStateRef.current.mruSystems.some((s) => {
          const el = elementsRef.current.find((e) => e.id === s.cartId);
          return el && Math.abs(el.x - s.currentX) > 1;
        });
        if (hasPosMismatch) {
          const synced = elementsRef.current.map((el) => {
            const mruSys = simStateRef.current.mruSystems.find((s) => s.cartId === el.id);
            if (mruSys) {
              return { ...el, x: mruSys.currentX };
            }
            return el;
          });
          elementsRef.current = synced;
          setElements(synced);
        }

        if (simStateRef.current.telemetry) {
          setSimMetrics(simStateRef.current.telemetry);
        }
      }

      setIsSimulating(true);
      isSimulatingRef.current = true;
    }
  }, [gravityPreset, setElements]);

  // Reset Simulation to Initial Positions
  const handleResetSimulation = useCallback(() => {
    if (isSimulatingRef.current) {
      setIsSimulating(false);
      isSimulatingRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }

    if (simStateRef.current && !isSimStateCompatible(simStateRef.current, elementsRef.current)) {
      simStateRef.current = null;
    }

    if (simStateRef.current) {
      const resetEls = resetHeadlessSimulation(simStateRef.current, elementsRef.current);
      elementsRef.current = resetEls;
      setElements(resetEls);
      if (simStateRef.current.telemetry) {
        setSimMetrics(simStateRef.current.telemetry);
      }
      if (onNotifyRef.current) {
        onNotifyRef.current('🔄 Posiciones iniciales restablecidas');
      }
    } else if (lastInitialSnapshotRef.current) {
      const snapshotMap = new Map(lastInitialSnapshotRef.current.map((s) => [s.id, s]));
      const restored = elementsRef.current.map((el) => {
        const snap = snapshotMap.get(el.id);
        if (snap) {
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...el.properties,
              ...snap.properties,
              distance: 0,
              triggered: false,
              recordedTime: null,
            },
          };
        }
        return el;
      });
      elementsRef.current = restored;
      setElements(restored);

      const cart = restored.find((el) => el.type === 'physics_object' && el.physicsType === 'mru_cart');
      if (cart) {
        const dispV = cart.properties?.displayVelocity !== undefined ? cart.properties.displayVelocity : (cart.properties?.velocity ?? 2.0);
        const vUnit = cart.properties?.unit || 'm/s';
        const cartLabel = cart.properties?.label || 'Móvil MRU';
        setSimMetrics({
          type: 'mru',
          vel: dispV,
          unit: vUnit,
          label: cartLabel,
          accel: 0.0,
          dist: '0.00',
          time: '0.0',
          isFinished: false,
        });
      } else {
        setSimMetrics({
          accel: 0,
          tension: 0,
          velA: 0,
          time: '0.0',
        });
      }
      if (onNotifyRef.current) {
        onNotifyRef.current('🔄 Posiciones iniciales restablecidas');
      }
    }
  }, [setElements]);

  // Advance simulation by 1 single step (Step-by-step)
  const handleStepSimulation = useCallback(() => {
    if (simStateRef.current && !isSimStateCompatible(simStateRef.current, elementsRef.current)) {
      simStateRef.current = null;
    }

    if (simStateRef.current?.isSimulationComplete) {
      const resetEls = resetHeadlessSimulation(simStateRef.current, elementsRef.current);
      elementsRef.current = resetEls;
      setElements(resetEls);
      if (simStateRef.current.telemetry) {
        setSimMetrics(simStateRef.current.telemetry);
      }
    }

    if (!simStateRef.current) {
      let gScale = 1.0;
      let realG = 9.8;
      if (gravityPreset === 'moon') { gScale = 0.165; realG = 1.62; }
      else if (gravityPreset === 'jupiter') { gScale = 2.53; realG = 24.8; }
      else if (gravityPreset === 'zero') { gScale = 0; realG = 0; }

      simStateRef.current = createHeadlessSimulation(elementsRef.current, {
        gravityScale: gScale,
        realG,
      });
      lastInitialSnapshotRef.current = simStateRef.current.initialSnapshot;
      if (simStateRef.current.telemetry) {
        setSimMetrics(simStateRef.current.telemetry);
      }
    }

    if (simStateRef.current) {
      const updated = stepHeadlessSimulation(simStateRef.current, elementsRef.current, 1000 / 60);
      elementsRef.current = updated;
      setElements(updated);

      if (simStateRef.current.telemetry) {
        setSimMetrics(simStateRef.current.telemetry);
      } else if (simStateRef.current.atwoodSystems.length > 0) {
        const sys = simStateRef.current.atwoodSystems[0];
        setSimMetrics({
          type: 'atwood',
          accel: sys.isStopped ? 0 : sys.theoAccel,
          tension: sys.isStopped ? 0 : sys.theoTension,
          velA: sys.isStopped ? '0.00' : (sys.currentVel / 45).toFixed(2),
          time: simStateRef.current.elapsedTime.toFixed(1),
          isStopped: sys.isStopped,
        });
      }
    }
  }, [gravityPreset, setElements]);

  // Change Gravity Preset (Earth, Moon, Jupiter, Zero)
  const handleChangeGravity = useCallback((preset) => {
    setGravityPreset(preset);
    const wasRunning = isSimulatingRef.current;
    if (simStateRef.current) {
      simStateRef.current = null;
    }
    if (wasRunning) {
      let gScale = 1.0;
      let realG = 9.8;
      if (preset === 'moon') { gScale = 0.165; realG = 1.62; }
      else if (preset === 'jupiter') { gScale = 2.53; realG = 24.8; }
      else if (preset === 'zero') { gScale = 0; realG = 0; }

      simStateRef.current = createHeadlessSimulation(elementsRef.current, {
        gravityScale: gScale,
        realG,
      });
      lastInitialSnapshotRef.current = simStateRef.current.initialSnapshot;
    }
  }, []);

  // Real-time HUD telemetry & simulation state synchronization with whiteboard elements
  useEffect(() => {
    if (isSimulating) return;

    if (simStateRef.current && !isSimStateCompatible(simStateRef.current, elements)) {
      simStateRef.current = null;
      lastInitialSnapshotRef.current = null;
    }

    const physicsObjs = elements.filter((el) => el.type === 'physics_object');
    const conns = elements.filter((el) => el.type === 'physics_connection');

    // Always ensure a fallback snapshot exists for baseline Reset
    if (!lastInitialSnapshotRef.current && physicsObjs.length > 0) {
      lastInitialSnapshotRef.current = elements.map((el) => {
        if (el.type === 'physics_object') {
          return {
            id: el.id,
            x: el.x,
            y: el.y,
            properties: { ...el.properties },
          };
        }
        if (el.type === 'physics_connection') {
          return {
            id: el.id,
            properties: { ...el.properties },
          };
        }
        return null;
      }).filter(Boolean);
    }

    // If active simulation state already holds valid telemetry, preserve it
    if (simStateRef.current?.telemetry) {
      setSimMetrics(simStateRef.current.telemetry);
      return;
    }

    const hasMru = physicsObjs.some((el) => el.physicsType === 'mru_cart');
    const pulleys = physicsObjs.filter((el) => el.physicsType === 'pulley');
    const hasAtwood = pulleys.some((p) => {
      const pConns = conns.filter((c) => c.from?.elementId === p.id || c.to?.elementId === p.id);
      return pConns.length >= 2;
    });

    let realG = 9.8;
    if (gravityPreset === 'moon') realG = 1.62;
    else if (gravityPreset === 'jupiter') realG = 24.8;
    else if (gravityPreset === 'zero') realG = 0;

    if (hasAtwood && !hasMru) {
      const masses = physicsObjs.filter((el) => el.physicsType === 'mass');
      const sortedMasses = [...masses].sort((a, b) => a.x - b.x);
      const mA = sortedMasses[0]?.properties?.mass || 100;
      const mB = sortedMasses[1]?.properties?.mass || 60;
      const totalM = mA + mB;
      const theoA = totalM > 0 ? Math.abs((mA - mB) / totalM) * realG : 0;
      const theoT = totalM > 0 ? ((2 * mA * mB) / totalM) * realG : 0;

      setSimMetrics({
        type: 'atwood',
        accel: theoA,
        tension: theoT,
        velA: '0.00',
        time: '0.0',
        isStopped: false,
      });
    } else if (hasMru) {
      const cart = physicsObjs.find((el) => el.physicsType === 'mru_cart');
      const dispV = cart?.properties?.displayVelocity !== undefined ? cart.properties.displayVelocity : (cart?.properties?.velocity ?? 2.0);
      const vUnit = cart?.properties?.unit || 'm/s';
      const cartLabel = cart?.properties?.label || 'Móvil MRU';
      setSimMetrics({
        type: 'mru',
        vel: dispV,
        unit: vUnit,
        label: cartLabel,
        accel: 0.0,
        dist: (cart?.properties?.distance || 0).toFixed(2),
        time: '0.0',
        isFinished: false,
      });
    } else if (physicsObjs.length > 0) {
      setSimMetrics({
        accel: 0,
        tension: 0,
        velA: '0.00',
        time: '0.0',
      });
    }
  }, [elements, isSimulating, gravityPreset]);

  // Keep onNotify ref to prevent teardown of the 60FPS animation loop
  const onNotifyRef = useRef(onNotify);
  onNotifyRef.current = onNotify;

  // RequestAnimationFrame loop for real-time 60FPS simulation updates
  useEffect(() => {
    if (!isSimulating) return;

    let lastTimestamp = null;
    let lastMetricsUpdate = 0;

    const simLoop = (timestamp) => {
      if (!isSimulatingRef.current) return;

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const rawDelta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Stable physics time step clamped between 1ms and 40ms
      const deltaMs = Math.max(1, Math.min(rawDelta, 40));

      if (simStateRef.current) {
        const updated = stepHeadlessSimulation(simStateRef.current, elementsRef.current, deltaMs);
        elementsRef.current = updated;
        setElements(updated);

        // Throttle telemetry HUD updates slightly (every ~50ms) or on completion for buttery smooth performance
        const now = performance.now();
        const shouldUpdateMetrics =
          now - lastMetricsUpdate > 50 || simStateRef.current.isSimulationComplete;

        if (shouldUpdateMetrics) {
          lastMetricsUpdate = now;
          if (simStateRef.current.telemetry) {
            setSimMetrics(simStateRef.current.telemetry);
          } else if (simStateRef.current.atwoodSystems.length > 0) {
            const sys = simStateRef.current.atwoodSystems[0];
            setSimMetrics({
              type: 'atwood',
              accel: sys.isStopped ? 0 : sys.theoAccel,
              tension: sys.isStopped ? 0 : sys.theoTension,
              velA: sys.isStopped ? '0.00' : (sys.currentVel / 45).toFixed(2),
              time: simStateRef.current.elapsedTime.toFixed(1),
              isStopped: sys.isStopped,
            });
          }
        }

        // AUTOMATIC STOP: When carts reach track bumpers or Atwood hits physical travel bounds
        if (simStateRef.current.isSimulationComplete) {
          setIsSimulating(false);
          isSimulatingRef.current = false;
          if (animFrameIdRef.current) {
            cancelAnimationFrame(animFrameIdRef.current);
            animFrameIdRef.current = null;
          }
          if (onNotifyRef.current) {
            onNotifyRef.current('🏁 Recorrido finalizado — Simulación completada automáticamente');
          }
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(simLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(simLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isSimulating, setElements]);

  // Undo / History Snapshot tracking refs
  const dragStartSnapshotRef = useRef(null);
  const hasPushedEraserHistoryRef = useRef(false);
  const stickyTextSnapshotRef = useRef(null);

  // Synchronized state refs to avoid stale closures in debounced auto-transform
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  // Real-time automatic handwriting & math transformation (exclusively for Dibujo Mágico / smart_pen)
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);
  const autoFormatTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoFormatTimerRef.current) {
        clearTimeout(autoFormatTimerRef.current);
      }
    };
  }, []);

  // Cancel any pending auto-digitalize timer if the user switches tools away from smart_pen
  useEffect(() => {
    if (activeTool !== 'smart_pen' && autoFormatTimerRef.current) {
      clearTimeout(autoFormatTimerRef.current);
      autoFormatTimerRef.current = null;
    }
  }, [activeTool]);

  // Automatically prune selectedIds if elements are removed/undone without triggering redundant re-renders
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((id) => elements.some((el) => el.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [elements]);

  // Inline text editing state
  const [editingText, setEditingText] = useState(null);
  const inlineInputRef = useRef(null);

  // Coordinate Conversion Helpers
  const screenToWorld = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = (sx - transform.x) / transform.scale;
      const wy = (sy - transform.y) / transform.scale;
      return { x: wx, y: wy };
    },
    [transform]
  );

  const worldToScreen = useCallback(
    (wx, wy) => {
      const sx = wx * transform.scale + transform.x;
      const sy = wy * transform.scale + transform.y;
      return { x: sx, y: sy };
    },
    [transform]
  );

  // Resize and HiDPI listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);

        setViewportSize({ width: w, height: h });

        const targetW = Math.round(w * dpr);
        const targetH = Math.round(h * dpr);

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Dynamic resolution listener (handles browser zoom or moving between monitors)
    let mq = null;
    const handleDprChange = () => {
      handleResize();
      setupDprListener();
    };
    const setupDprListener = () => {
      if (mq) {
        try {
          mq.removeEventListener('change', handleDprChange);
        } catch {
          // ignore
        }
      }
      try {
        mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        mq.addEventListener('change', handleDprChange, { once: true });
      } catch {
        // matchMedia resolution might not be supported in older runtimes
      }
    };
    setupDprListener();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mq) {
        try {
          mq.removeEventListener('change', handleDprChange);
        } catch {
          // ignore
        }
      }
    };
  }, [canvasRef, setViewportSize]);

  // Spacebar pan, Delete & Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        !spacePressed &&
        e.target.tagName !== 'TEXTAREA' &&
        e.target.tagName !== 'INPUT'
      ) {
        setSpacePressed(true);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0 && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          pushHistory();
          setElements((prev) => {
            const remaining = prev.filter((el) => !selectedIds.includes(el.id));
            const remainingIds = new Set(remaining.map((el) => el.id));
            return remaining.filter((el) => {
              if (el.type === 'physics_connection') {
                return remainingIds.has(el.from?.elementId) && remainingIds.has(el.to?.elementId);
              }
              return true;
            });
          });
          setSelectedIds([]);
        }
      }
      // Undo hotkey (Ctrl+Z or Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          if (autoFormatTimerRef.current) {
            clearTimeout(autoFormatTimerRef.current);
            autoFormatTimerRef.current = null;
          }
          if (onUndo) onUndo();
        }
      }
      // Redo hotkey (Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z)
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          if (autoFormatTimerRef.current) {
            clearTimeout(autoFormatTimerRef.current);
            autoFormatTimerRef.current = null;
          }
          if (onRedo) onRedo();
        }
      }
      // Duplicate hotkey (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedIds.length > 0 && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          handleDuplicateSelected();
        }
      }

      // Keyboard Zoom Hotkeys: Ctrl + '+' / '=', Ctrl + '-' / '_', Ctrl + '0'
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd')) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          setTransform((prev) => {
            const newScale = Math.min(10.0, +(prev.scale * 1.15).toFixed(2));
            return {
              x: cx - (cx - prev.x) * (newScale / prev.scale),
              y: cy - (cy - prev.y) * (newScale / prev.scale),
              scale: newScale,
            };
          });
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract')) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          setTransform((prev) => {
            const newScale = Math.max(0.1, +(prev.scale / 1.15).toFixed(2));
            return {
              x: cx - (cx - prev.x) * (newScale / prev.scale),
              y: cy - (cy - prev.y) * (newScale / prev.scale),
              scale: newScale,
            };
          });
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '0' || e.code === 'Numpad0')) {
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          setTransform({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 1.0,
          });
        }
      }

      // Escape key: return to normal cursor ('select') without any tool in use
      if (e.key === 'Escape') {
        if (autoFormatTimerRef.current) {
          clearTimeout(autoFormatTimerRef.current);
          autoFormatTimerRef.current = null;
        }
        if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) {
          document.activeElement.blur();
        }
        setEditingText(null);
        if (selectedIds.length > 0) {
          setSelectedIds([]);
        }
        setIsDrawing(false);
        setCurrentDraft(null);
        setSelectionMarquee(null);
        setIsSelectingMarquee(false);
        setIsDraggingSelection(false);
        setActiveTool('select');
      }

      // Tool Hotkeys
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && !e.ctrlKey && !e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === 'v') setActiveTool('select');
        else if (k === 'p') setActiveTool('pen');
        else if (k === 'm') setActiveTool('highlighter');
        else if (k === 'w') setActiveTool('smart_pen');
        else if (k === 'e') setActiveTool('stroke_eraser');
        else if (k === 't') setActiveTool('text');
        else if (k === 'n') setActiveTool('sticky');
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed, selectedIds, pushHistory, onUndo, onRedo, setElements, setActiveTool, setTransform]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const w = container ? (container.offsetWidth || window.innerWidth) : window.innerWidth;
    const h = container ? (container.offsetHeight || window.innerHeight) : window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    // 1. Clear Canvas with Transparent pixels
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Setup HiDPI scaling for CSS pixel coordinate space
    ctx.save();
    ctx.scale(dpr, dpr);

    // 3. Save for world transform
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // 2. Draw Elements in order
    elements.forEach((el) => {
      const isSelected = selectedIds.includes(el.id);
      if (el.type === 'eraser_brush') {
        drawEraserBrush(ctx, el);
      } else if (el.type === 'pen' || el.type === 'highlighter' || el.type === 'smart_pen') {
        drawStroke(ctx, el);
        if (isSelected) {
          const b = getElementBounds(el);
          if (b) {
            ctx.save();
            ctx.strokeStyle = '#4262ff';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(b.minX - 4, b.minY - 4, b.maxX - b.minX + 8, b.maxY - b.minY + 8);
            ctx.restore();
          }
        }
      } else if (
        el.type === 'rectangle' ||
        el.type === 'circle' ||
        el.type === 'triangle' ||
        el.type === 'diamond' ||
        el.type === 'line' ||
        el.type === 'arrow' ||
        el.type === 'elbow_arrow' ||
        el.type === 'block_arrow' ||
        el.type === 'divider'
      ) {
        drawShape(ctx, el, isSelected);
      } else if (el.type === 'text') {
        drawText(ctx, el, isSelected, editingText && editingText.id === el.id);
      } else if (el.type === 'physics_object') {
        drawPhysicsObject(ctx, el, isSelected);
      } else if (el.type === 'physics_connection') {
        drawPhysicsConnection(ctx, el, elements, isSelected);
      }
    });

    // 3. Multi-Selection Collective Bounding Box
    if (selectedIds.length > 1) {
      let groupMinX = Infinity, groupMaxX = -Infinity, groupMinY = Infinity, groupMaxY = -Infinity;
      elements.forEach((el) => {
        if (selectedIds.includes(el.id)) {
          const b = getElementBounds(el);
          if (b) {
            if (b.minX < groupMinX) groupMinX = b.minX;
            if (b.maxX > groupMaxX) groupMaxX = b.maxX;
            if (b.minY < groupMinY) groupMinY = b.minY;
            if (b.maxY > groupMaxY) groupMaxY = b.maxY;
          }
        }
      });

      if (groupMinX !== Infinity) {
        const gw = groupMaxX - groupMinX;
        const gh = groupMaxY - groupMinY;
        ctx.save();
        ctx.strokeStyle = '#4262ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(groupMinX - 6, groupMinY - 6, gw + 12, gh + 12);

        const cornerDots = [
          { x: groupMinX - 6, y: groupMinY - 6 },
          { x: groupMaxX + 6, y: groupMinY - 6 },
          { x: groupMinX - 6, y: groupMaxY + 6 },
          { x: groupMaxX + 6, y: groupMaxY + 6 },
        ];
        ctx.fillStyle = '#ffffff';
        cornerDots.forEach((d) => {
          ctx.beginPath();
          ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }
    }

    // 4. Draw Draft Preview (Pen, Lasso, Eraser, Shapes)
    if (currentDraft) {
      if (currentDraft.type === 'eraser_brush') {
        drawEraserBrush(ctx, currentDraft);
      } else if (
        currentDraft.type === 'pen' ||
        currentDraft.type === 'highlighter' ||
        currentDraft.type === 'smart_pen'
      ) {
        drawStroke(ctx, currentDraft);
      } else if (currentDraft.type === 'lasso') {
        drawLasso(ctx, currentDraft);
      } else {
        drawShape(ctx, currentDraft, false);
      }
    }

    // 5. Draw Marquee Selection Box
    if (selectionMarquee) {
      const minX = Math.min(selectionMarquee.startX, selectionMarquee.currentX);
      const maxX = Math.max(selectionMarquee.startX, selectionMarquee.currentX);
      const minY = Math.min(selectionMarquee.startY, selectionMarquee.currentY);
      const maxY = Math.max(selectionMarquee.startY, selectionMarquee.currentY);
      const w = maxX - minX;
      const h = maxY - minY;

      ctx.save();
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(66, 98, 255, 0.08)';
      ctx.fillRect(minX, minY, w, h);
      ctx.strokeRect(minX, minY, w, h);
      ctx.restore();
    }

    // 6. Visual Cursor Ring for Pencil Eraser
    if (activeTool === 'pencil_eraser' && cursorWorldPos) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#4262ff';
      ctx.fillStyle = 'rgba(66, 98, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cursorWorldPos.x, cursorWorldPos.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Visual Cursor Ring for Stroke Eraser
    if (activeTool === 'stroke_eraser' && cursorWorldPos) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#5f5c80';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cursorWorldPos.x, cursorWorldPos.y, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Physical Connection Draft (Drawing a rope between anchors)
    if (connectionDraft) {
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(connectionDraft.fromX, connectionDraft.fromY);
      ctx.lineTo(connectionDraft.currentX, connectionDraft.currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Magnetic snap feedback indicator
      if (connectionDraft.snappedAnchor) {
        ctx.beginPath();
        ctx.arc(connectionDraft.snappedAnchor.x, connectionDraft.snappedAnchor.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Hovered Anchor Glow Ring
    if (hoveredAnchor && !connectionDraft) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(hoveredAnchor.x, hoveredAnchor.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 9. If Rope Tool is active, highlight all available connection anchors
    if (activeTool === 'rope') {
      ctx.save();
      elements.forEach((el) => {
        if (el.type === 'physics_object' && Array.isArray(el.anchors)) {
          el.anchors.forEach((a) => {
            const pos = getAnchorAbsolutePosition(el, a.id);
            if (pos) {
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          });
        }
      });
      ctx.restore();
    }

    ctx.restore(); // Restore world transform

    // 10. Draw Graph Paper Grid UNDERNEATH using destination-over (in CSS coordinates)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    drawMiroSquareGrid(ctx, w, h, transform);
    ctx.restore();

    ctx.restore(); // Restore HiDPI scale
  }, [elements, currentDraft, selectionMarquee, transform, selectedIds, canvasRef, activeTool, cursorWorldPos, editingText, connectionDraft, hoveredAnchor]);

  // Native non-passive Wheel listener attached to whiteboard container
  // Prevents native browser page zoom completely, and enables smooth vector infinite canvas zooming & panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // Smooth exponential zoom centered at mouse pointer (Ctrl + scroll or trackpad pinch)
        const zoomDelta = -e.deltaY;
        const zoomSpeed = 0.003;
        const factor = Math.min(Math.max(Math.exp(zoomDelta * zoomSpeed), 0.65), 1.5);

        setTransform((prev) => {
          const newScale = Math.min(10.0, Math.max(0.1, +(prev.scale * factor).toFixed(4)));
          const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
          const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
          return {
            x: newX,
            y: newY,
            scale: newScale,
          };
        });
      } else {
        // Normal wheel (without Ctrl):
        if (e.shiftKey) {
          // Horizontal pan
          setTransform((prev) => ({
            ...prev,
            x: prev.x - e.deltaY,
          }));
        } else {
          // Canvas pan
          setTransform((prev) => ({
            ...prev,
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY,
          }));
        }
      }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, [setTransform]);

  // Global pointerup safeguard to ensure right-click/middle-click panning ends reliably
  useEffect(() => {
    const handleGlobalPointerUp = (e) => {
      if (e.button === 2 || e.button === 1) {
        setIsPanning(false);
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  // Hit test helper
  const findElementAt = (wx, wy) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.startX !== undefined && el.endX !== undefined) {
        if (el.type === 'line' || el.type === 'arrow' || el.type === 'divider' || el.type === 'elbow_arrow') {
          if (distToSegment(wx, wy, el.startX, el.startY, el.endX, el.endY) < 14) {
            return el;
          }
        }
        const minX = Math.min(el.startX, el.endX) - 10;
        const maxX = Math.max(el.startX, el.endX) + 10;
        const minY = Math.min(el.startY, el.endY) - 10;
        const maxY = Math.max(el.startY, el.endY) + 10;
        if (wx >= minX && wx <= maxX && wy >= minY && wy <= maxY) {
          return el;
        }
      } else if (el.x !== undefined && el.width !== undefined) {
        if (wx >= el.x && wx <= el.x + el.width && wy >= el.y && wy <= el.y + el.height) {
          return el;
        }
      } else if (el.type === 'text') {
        const lines = el.text ? el.text.split('\n') : [''];
        const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
        const fontSize = el.fontSize || 18;
        const w = Math.max(50, maxLineLen * fontSize * 0.65);
        const h = lines.length * fontSize * 1.35;
        if (wx >= el.x - 8 && wx <= el.x + w + 8 && wy >= el.y - 8 && wy <= el.y + h + 8) {
          return el;
        }
      } else if (el.points && (el.type === 'pen' || el.type === 'highlighter' || el.type === 'smart_pen')) {
        for (let j = 0; j < el.points.length - 1; j++) {
          if (distToSegment(wx, wy, el.points[j].x, el.points[j].y, el.points[j + 1].x, el.points[j + 1].y) < 16) {
            return el;
          }
        }
        if (el.points.length === 1 && Math.hypot(wx - el.points[0].x, wy - el.points[0].y) < 16) {
          return el;
        }
      } else if (el.type === 'physics_connection') {
        const fromEl = elements.find((e) => e.id === el.from?.elementId);
        const toEl = elements.find((e) => e.id === el.to?.elementId);
        if (fromEl && toEl) {
          const p1 = getAnchorAbsolutePosition(fromEl, el.from?.anchorId);
          const p2 = getAnchorAbsolutePosition(toEl, el.to?.anchorId);
          if (p1 && p2 && distToSegment(wx, wy, p1.x, p1.y, p2.x, p2.y) < 14) {
            return el;
          }
        }
      }
    }
    return null;
  };

  // Find interactive connection anchor at given world position
  const findAnchorAt = (wx, wy, maxDist = 16) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'physics_object' && Array.isArray(el.anchors)) {
        for (const a of el.anchors) {
          const pos = getAnchorAbsolutePosition(el, a.id);
          if (pos && Math.hypot(wx - pos.x, wy - pos.y) <= maxDist) {
            return {
              elementId: el.id,
              anchorId: a.id,
              label: a.label,
              x: pos.x,
              y: pos.y,
            };
          }
        }
      }
    }
    return null;
  };

  // Erase whole strokes intersecting coordinate (wx, wy) - for Tool 4 (Stroke Eraser)
  const eraseStrokesAt = (wx, wy) => {
    let hitFound = false;
    const remaining = elements.filter((el) => {
      if (el.points && (el.type === 'pen' || el.type === 'highlighter' || el.type === 'smart_pen')) {
        for (let i = 0; i < el.points.length - 1; i++) {
          if (distToSegment(wx, wy, el.points[i].x, el.points[i].y, el.points[i + 1].x, el.points[i + 1].y) < 16) {
            hitFound = true;
            return false;
          }
        }
        if (el.points.length === 1 && Math.hypot(wx - el.points[0].x, wy - el.points[0].y) < 16) {
          hitFound = true;
          return false;
        }
      } else if (
        el.type === 'line' ||
        el.type === 'arrow' ||
        el.type === 'divider' ||
        el.type === 'elbow_arrow'
      ) {
        if (distToSegment(wx, wy, el.startX, el.startY, el.endX, el.endY) < 14) {
          hitFound = true;
          return false;
        }
      }
      return true;
    });

    if (hitFound) {
      if (!hasPushedEraserHistoryRef.current) {
        pushHistory();
        hasPushedEraserHistoryRef.current = true;
      }
      setElements(remaining);
    }
  };

  // =========================================================================
  // MAGICAL HANDWRITING & NUMBER FORMATTING FUNCTION
  // Transforms messy mouse-drawn digits and equations (e.g. 2x + 3 = 5) into
  // clean, aligned, legible typography and solves the equation!
  // =========================================================================
  const handleFormatHandwriting = (explicitStrokes = null, isAuto = false) => {
    const currentElements = elementsRef.current;
    const currentSelectedIds = selectedIdsRef.current;

    let targetStrokes = explicitStrokes;
    if (!targetStrokes) {
      if (!isAuto && currentSelectedIds.length > 0) {
        targetStrokes = currentElements.filter(
          (el) => currentSelectedIds.includes(el.id) && el.points && el.points.length > 0
        );
      }
      if (!targetStrokes || targetStrokes.length === 0) {
        if (isAuto) {
          // Automatic mode: ONLY transform smart_pen strokes. Normal pen and highlighter are 100% normal and never modified!
          targetStrokes = currentElements.filter(
            (el) => el.points && el.type === 'smart_pen'
          );
        } else {
          // Manual conversion: prioritize smart_pen strokes
          const smartStrokes = currentElements.filter(
            (el) => el.points && el.type === 'smart_pen'
          );
          if (smartStrokes.length > 0) {
            targetStrokes = smartStrokes;
          } else if (currentSelectedIds.length > 0) {
            targetStrokes = currentElements.filter(
              (el) => currentSelectedIds.includes(el.id) && el.points && el.points.length > 0
            );
          } else {
            return;
          }
        }
      }
    }

    if (!targetStrokes || targetStrokes.length === 0) return;

    // Filter out accidental micro-clicks or stray noise strokes (points <= 2, w < 12, h < 12)
    const validStrokes = targetStrokes.filter((s) => {
      const b = getElementBounds(s);
      if (!b) return false;
      const pts = s.points || [];
      if (pts.length <= 2 && b.w < 12 && b.h < 12) return false;
      return true;
    });

    if (validStrokes.length === 0) return;

    pushHistory();

    const strokesWithBounds = validStrokes.map((s) => ({
      ...s,
      bounds: getElementBounds(s),
    }));

    // Cluster into horizontal lines
    strokesWithBounds.sort((a, b) => a.bounds.minY - b.bounds.minY);
    const lines = [];
    strokesWithBounds.forEach((s) => {
      let placed = false;
      for (const line of lines) {
        if (Math.abs(s.bounds.cy - line.avgCy) < Math.max(s.bounds.h, line.avgH) * 0.75) {
          line.strokes.push(s);
          line.minX = Math.min(line.minX, s.bounds.minX);
          line.maxX = Math.max(line.maxX, s.bounds.maxX);
          line.minY = Math.min(line.minY, s.bounds.minY);
          line.maxY = Math.max(line.maxY, s.bounds.maxY);
          line.avgCy = (line.minY + line.maxY) / 2;
          line.avgH = line.maxY - line.minY;
          placed = true;
          break;
        }
      }
      if (!placed) {
        lines.push({
          strokes: [s],
          minX: s.bounds.minX,
          maxX: s.bounds.maxX,
          minY: s.bounds.minY,
          maxY: s.bounds.maxY,
          avgCy: s.bounds.cy,
          avgH: s.bounds.h,
        });
      }
    });

    const newTransformedElements = [];
    const allTargetStrokeIds = targetStrokes.map((s) => s.id);

    lines.forEach((line, lineIdx) => {
      const strokeColor = line.strokes[0]?.color || '#050038';

      // 1. SMART DRAWING SHAPE RECOGNITION (Only if a single closed smart_pen stroke is a large shape)
      if (line.strokes.length === 1 && line.strokes[0].type === 'smart_pen') {
        const singleStroke = line.strokes[0];
        const pts = singleStroke.points || [];
        if (pts.length >= 6) {
          const b = line.strokes[0].bounds;
          const startPt = pts[0];
          const endPt = pts[pts.length - 1];
          const startEndDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
          const diag = Math.hypot(b.w, b.h);
          const isClosed = startEndDist < Math.max(35, diag * 0.25);

          // If it's a large closed shape (> 42px) and not a character, recognize shape
          if (isClosed && b.w > 42 && b.h > 42) {
            let signedArea = 0;
            for (let i = 0; i < pts.length - 1; i++) {
              signedArea += pts[i].x * pts[i + 1].y - pts[i + 1].x * pts[i].y;
            }
            signedArea += endPt.x * startPt.y - startPt.x * endPt.y;
            const area = Math.abs(signedArea) / 2;
            const boxArea = b.w * b.h;
            const fillRatio = area / (boxArea || 1);

            if (fillRatio >= 0.78) {
              newTransformedElements.push({
                id: `smart-rect-${Date.now()}-${lineIdx}`,
                type: 'rectangle',
                startX: b.minX,
                startY: b.minY,
                endX: b.maxX,
                endY: b.maxY,
                color: strokeColor,
                fill: 'none',
                size: 2,
              });
              return;
            } else if (fillRatio < 0.62) {
              newTransformedElements.push({
                id: `smart-tri-${Date.now()}-${lineIdx}`,
                type: 'triangle',
                startX: b.minX,
                startY: b.minY,
                endX: b.maxX,
                endY: b.maxY,
                color: strokeColor,
                fill: 'none',
                size: 2,
              });
              return;
            } else if (fillRatio >= 0.64 && fillRatio < 0.82) {
              newTransformedElements.push({
                id: `smart-circle-${Date.now()}-${lineIdx}`,
                type: 'circle',
                startX: b.minX,
                startY: b.minY,
                endX: b.maxX,
                endY: b.maxY,
                color: strokeColor,
                fill: 'none',
                size: 2,
              });
              return;
            }
          }
        }
      }

      // 2. HANDWRITING & MATH DIGITALIZATION
      line.strokes.sort((a, b) => a.bounds.minX - b.bounds.minX);

      // Group into character clusters
      const clusters = [];
      line.strokes.forEach((s) => {
        if (clusters.length > 0) {
          const lastCluster = clusters[clusters.length - 1];
          const lastBounds = getClusterBounds(lastCluster);
          const sBounds = s.bounds;
          const overlapX = Math.max(
            0,
            Math.min(lastBounds.maxX, sBounds.maxX) - Math.max(lastBounds.minX, sBounds.minX)
          );
          const minW = Math.min(lastBounds.w, sBounds.w);
          const maxW = Math.max(lastBounds.w, sBounds.w);
          const centerDiffX = Math.abs(sBounds.cx - lastBounds.cx);

          // Check if strokes are two arms or stem of the same character (like 'y', 'x', '4', '+')
          const gapX = Math.max(0, sBounds.minX - lastBounds.maxX);
          const combinedW = Math.max(lastBounds.maxX, sBounds.maxX) - Math.min(lastBounds.minX, sBounds.minX);
          const overlapY = Math.max(
            0,
            Math.min(lastBounds.maxY, sBounds.maxY) - Math.max(lastBounds.minY, sBounds.minY)
          );
          const minH = Math.min(lastBounds.h, sBounds.h);

          // Strokes meet or touch within normal character width:
          const isMultiStrokeMeeting =
            gapX < 14 &&
            combinedW < Math.max(line.avgH * 1.05, 55) &&
            overlapY > minH * 0.35;

          const isSameChar =
            (overlapX > minW * 0.45 && centerDiffX < maxW * 0.55) ||
            (centerDiffX < maxW * 0.4 && sBounds.minX >= lastBounds.minX - 4 && sBounds.maxX <= lastBounds.maxX + 4) ||
            isMultiStrokeMeeting;

          if (isSameChar && lastCluster.length < 3) {
            lastCluster.push(s);
            return;
          }
        }
        clusters.push([s]);
      });

      const chars = clusters.map((c) => classifyCharacterCluster(c));

      const isOp = (c) => c === '+' || c === '-' || c === '=' || c === '/' || c === '×' || c === '*';
      let formulaStr = '';
      chars.forEach((ch, idx) => {
        if (!ch) return;
        if (formulaStr.length === 0) {
          formulaStr += ch;
        } else {
          const prev = chars[idx - 1];
          if (isOp(ch)) {
            formulaStr += ` ${ch} `;
          } else if (isOp(prev)) {
            formulaStr += ch;
          } else {
            formulaStr += ch;
          }
        }
      });
      formulaStr = formulaStr.replace(/\s+/g, ' ').trim();

      const sol = solveMathEquation(formulaStr);
      let fullDisplay = formulaStr;
      if (sol && sol.solved) {
        if (sol.varName) {
          fullDisplay = `${formulaStr}\n(${sol.varName} = ${sol.solution})`;
        } else {
          fullDisplay = `${formulaStr} ${sol.solution}`;
        }
      }

      const fontSize = Math.max(28, Math.min(52, Math.round(line.avgH * 0.9)));

      newTransformedElements.push({
        id: `math-text-${Date.now()}-${lineIdx}`,
        type: 'text',
        x: line.minX,
        y: line.minY,
        text: fullDisplay,
        fontSize,
        color: strokeColor,
        isMath: true,
      });
    });

    setElements((prev) => [
      ...prev.filter((el) => !allTargetStrokeIds.includes(el.id)),
      ...newTransformedElements,
    ]);

    if (!isAuto) {
      setSelectedIds(newTransformedElements.map((el) => el.id));
      setActiveTool('select');
    }
  };

  // Commit inline text editor changes
  const commitText = () => {
    if (!editingText) return;
    const trimmed = editingText.text.trim();
    if (trimmed) {
      pushHistory();
      if (editingText.isNew) {
        const newEl = {
          id: editingText.id,
          type: 'text',
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          color: '#050038',
          fontSize: 18,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedIds([newEl.id]);
      } else {
        setElements((prev) =>
          prev.map((el) => (el.id === editingText.id ? { ...el, text: trimmed } : el))
        );
      }
    }
    setEditingText(null);
    setActiveTool('select');
  };

  // Pointer Down
  const handlePointerDown = (e) => {
    if (autoFormatTimerRef.current) {
      clearTimeout(autoFormatTimerRef.current);
      autoFormatTimerRef.current = null;
    }

    if (editingText) {
      commitText();
    }

    // Free camera navigation / panning:
    // Right Click (e.button === 2), Middle Mouse Button (e.button === 1), Spacebar + Drag, or Hand Tool (activeTool === 'hand')
    if (e.button === 2 || e.button === 1 || spacePressed || activeTool === 'hand') {
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      return;
    }

    if (e.button !== 0) return;

    const world = screenToWorld(e.clientX, e.clientY);

    // 1. TOOL 5: PENCIL ERASER
    if (activeTool === 'pencil_eraser') {
      setIsDrawing(true);
      setCurrentDraft({
        id: `eraser-${Date.now()}`,
        type: 'eraser_brush',
        size: 24,
        points: [{ x: world.x, y: world.y }],
      });
      return;
    }

    // 2. TOOL 4: STROKE ERASER
    if (activeTool === 'stroke_eraser' || activeTool === 'eraser') {
      hasPushedEraserHistoryRef.current = false;
      eraseStrokesAt(world.x, world.y);
      setIsDrawing(true);
      return;
    }

    // 3. OBJECT ERASER
    if (activeTool === 'object_eraser') {
      const hit = findElementAt(world.x, world.y);
      if (hit) {
        pushHistory();
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        setSelectedIds((prev) => prev.filter((id) => id !== hit.id));
      }
      setIsDrawing(true);
      return;
    }

    // 4. LASSO SELECTION
    if (activeTool === 'lasso') {
      setIsDrawing(true);
      setCurrentDraft({
        id: 'lasso-draft',
        type: 'lasso',
        points: [{ x: world.x, y: world.y }],
      });
      return;
    }

    // 5. STICKY NOTE PLACEMENT
    if (activeTool === 'sticky') {
      pushHistory();
      const newSticky = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        x: world.x - 85,
        y: world.y - 80,
        width: 170,
        height: 160,
        text: 'Sticky note',
        color: stickyColor,
      };
      setElements((prev) => [...prev, newSticky]);
      setActiveTool('select');
      setSelectedIds([newSticky.id]);
      return;
    }

    // 6. TEXT TOOL
    if (activeTool === 'text') {
      setEditingText({
        id: `text-${Date.now()}`,
        x: world.x,
        y: world.y,
        text: '',
        isNew: true,
      });
      return;
    }

    // Connection Anchor Click / Drag (Rope Tool or Select Tool clicking on an anchor)
    if (activeTool === 'rope' || activeTool === 'select') {
      const anchorHit = findAnchorAt(world.x, world.y, 16);
      if (anchorHit) {
        setConnectingFrom(anchorHit);
        setConnectionDraft({
          fromX: anchorHit.x,
          fromY: anchorHit.y,
          currentX: world.x,
          currentY: world.y,
          snappedAnchor: null,
        });
        return;
      }
      if (activeTool === 'rope') {
        return;
      }
    }

    // 7. SELECT TOOL
    if (activeTool === 'select') {
      const hit = findElementAt(world.x, world.y);
      if (hit) {
        dragStartSnapshotRef.current = elements;
        if (e.shiftKey) {
          if (selectedIds.includes(hit.id)) {
            setSelectedIds((prev) => prev.filter((id) => id !== hit.id));
          } else {
            setSelectedIds((prev) => [...prev, hit.id]);
          }
        } else {
          if (!selectedIds.includes(hit.id)) {
            setSelectedIds([hit.id]);
          }
        }
        setIsDraggingSelection(true);
        setLastDragPos({ x: world.x, y: world.y });
      } else {
        if (!e.shiftKey) {
          setSelectedIds([]);
        }
        setIsSelectingMarquee(true);
        setSelectionMarquee({
          startX: world.x,
          startY: world.y,
          currentX: world.x,
          currentY: world.y,
        });
      }
      return;
    }

    // 8. TOOL 1 (PEN), TOOL 2 (HIGHLIGHTER), TOOL 3 (SMART PEN)
    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'smart_pen') {
      setIsDrawing(true);
      setCurrentDraft({
        id: `stroke-${Date.now()}`,
        type: activeTool,
        color: penColor,
        size: penWidth,
        points: [{ x: world.x, y: world.y }],
      });
      return;
    }

    // 9. SHAPES
    if (activeTool === 'shape' || activeTool === 'arrow') {
      setIsDrawing(true);
      const shapeType = activeTool === 'arrow' ? 'arrow' : activeShape || 'rectangle';
      setCurrentDraft({
        id: `shape-${Date.now()}`,
        type: shapeType,
        startX: world.x,
        startY: world.y,
        endX: world.x,
        endY: world.y,
        color: penColor,
        size: 2,
        fill: ['rectangle', 'circle', 'triangle', 'diamond', 'block_arrow'].includes(shapeType)
          ? 'solid'
          : 'none',
      });
      return;
    }
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
      return;
    }

    const world = screenToWorld(e.clientX, e.clientY);
    setCursorWorldPos(world);

    // 0. Active Physical Connection Drafting (Rope)
    if (connectingFrom) {
      let snapped = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el.type === 'physics_object' && el.id !== connectingFrom.elementId && Array.isArray(el.anchors)) {
          for (const a of el.anchors) {
            const pos = getAnchorAbsolutePosition(el, a.id);
            if (pos && Math.hypot(world.x - pos.x, world.y - pos.y) <= 24) {
              snapped = {
                elementId: el.id,
                anchorId: a.id,
                label: a.label,
                x: pos.x,
                y: pos.y,
              };
              break;
            }
          }
        }
        if (snapped) break;
      }
      setConnectionDraft({
        fromX: connectingFrom.x,
        fromY: connectingFrom.y,
        currentX: snapped ? snapped.x : world.x,
        currentY: snapped ? snapped.y : world.y,
        snappedAnchor: snapped,
      });
      return;
    }

    // Anchor Hover Tracking
    if (activeTool === 'select' || activeTool === 'rope') {
      const anchorHit = findAnchorAt(world.x, world.y, 14);
      setHoveredAnchor(anchorHit);
    } else if (hoveredAnchor) {
      setHoveredAnchor(null);
    }

    // Dragging ALL Selected Elements together
    if (isDraggingSelection && lastDragPos) {
      const dx = world.x - lastDragPos.x;
      const dy = world.y - lastDragPos.y;
      setLastDragPos({ x: world.x, y: world.y });

      setElements((prev) =>
        prev.map((el) => {
          if (selectedIds.includes(el.id)) {
            if (el.startX !== undefined && el.endX !== undefined) {
              return {
                ...el,
                startX: el.startX + dx,
                startY: el.startY + dy,
                endX: el.endX + dx,
                endY: el.endY + dy,
              };
            } else if (el.x !== undefined) {
              return {
                ...el,
                x: el.x + dx,
                y: el.y + dy,
              };
            } else if (el.points) {
              return {
                ...el,
                points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
              };
            }
          }
          return el;
        })
      );
      return;
    }

    // Marquee Box Selection dragging
    if (isSelectingMarquee && selectionMarquee) {
      setSelectionMarquee((prev) => ({
        ...prev,
        currentX: world.x,
        currentY: world.y,
      }));

      const minX = Math.min(selectionMarquee.startX, world.x);
      const maxX = Math.max(selectionMarquee.startX, world.x);
      const minY = Math.min(selectionMarquee.startY, world.y);
      const maxY = Math.max(selectionMarquee.startY, world.y);
      const box = { minX, maxX, minY, maxY };

      const matched = elements.filter((el) => isElementInBox(el, box));
      setSelectedIds(matched.map((m) => m.id));
      return;
    }

    if (!isDrawing) return;

    // Tool 5: Pencil eraser dragging
    if (currentDraft && currentDraft.type === 'eraser_brush') {
      setCurrentDraft((prev) => ({
        ...prev,
        points: [...prev.points, { x: world.x, y: world.y }],
      }));
      return;
    }

    // Tool 4: Stroke eraser dragging
    if (activeTool === 'stroke_eraser' || activeTool === 'eraser') {
      eraseStrokesAt(world.x, world.y);
      return;
    }

    // Object eraser dragging
    if (activeTool === 'object_eraser') {
      const hit = findElementAt(world.x, world.y);
      if (hit) {
        pushHistory();
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        setSelectedIds((prev) => prev.filter((id) => id !== hit.id));
      }
      return;
    }

    // Lasso path recording
    if (currentDraft && currentDraft.type === 'lasso') {
      setCurrentDraft((prev) => ({
        ...prev,
        points: [...prev.points, { x: world.x, y: world.y }],
      }));
      return;
    }

    // Pen / Highlighter / Smart Pen stroke
    if (
      currentDraft &&
      (currentDraft.type === 'pen' ||
        currentDraft.type === 'highlighter' ||
        currentDraft.type === 'smart_pen')
    ) {
      setCurrentDraft((prev) => ({
        ...prev,
        points: [...prev.points, { x: world.x, y: world.y }],
      }));
      return;
    }

    // Shape resizing
    if (currentDraft && currentDraft.startX !== undefined) {
      setCurrentDraft((prev) => ({
        ...prev,
        endX: world.x,
        endY: world.y,
      }));
      return;
    }
  };

  // Pointer Up
  const handlePointerUp = (e) => {
    try {
      if (e?.currentTarget && e.pointerId !== undefined && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    if (isPanning) {
      setIsPanning(false);
    }

    // Finalize Physical Connection (Rope)
    if (connectingFrom) {
      if (connectionDraft?.snappedAnchor) {
        pushHistory();
        const newConn = createPhysicsConnection(
          connectingFrom.elementId,
          connectingFrom.anchorId,
          connectionDraft.snappedAnchor.elementId,
          connectionDraft.snappedAnchor.anchorId
        );
        setElements((prev) => [...prev, newConn]);
        setSelectedIds([newConn.id]);
        setActiveTool('select');
      }
      setConnectingFrom(null);
      setConnectionDraft(null);
      return;
    }

    if (isDraggingSelection) {
      if (dragStartSnapshotRef.current) {
        const didMove = JSON.stringify(dragStartSnapshotRef.current) !== JSON.stringify(elements);
        if (didMove) {
          pushHistory(dragStartSnapshotRef.current);
          if (simStateRef.current) {
            simStateRef.current = null;
          }
          lastInitialSnapshotRef.current = null;
        }
        dragStartSnapshotRef.current = null;
      }
      setIsDraggingSelection(false);
      setLastDragPos(null);
    }

    hasPushedEraserHistoryRef.current = false;

    if (isSelectingMarquee && selectionMarquee) {
      const minX = Math.min(selectionMarquee.startX, selectionMarquee.currentX);
      const maxX = Math.max(selectionMarquee.startX, selectionMarquee.currentX);
      const minY = Math.min(selectionMarquee.startY, selectionMarquee.currentY);
      const maxY = Math.max(selectionMarquee.startY, selectionMarquee.currentY);

      if (maxX - minX > 4 || maxY - minY > 4) {
        const box = { minX, maxX, minY, maxY };
        const matched = elements.filter((el) => isElementInBox(el, box));
        setSelectedIds(matched.map((m) => m.id));
      }
      setSelectionMarquee(null);
      setIsSelectingMarquee(false);
    }

    if (isDrawing && currentDraft) {
      if (currentDraft.type === 'eraser_brush') {
        pushHistory();
        setElements((prev) => [...prev, currentDraft]);
      } else if (currentDraft.type === 'lasso') {
        if (currentDraft.points.length > 2) {
          const captured = elements.filter((el) => isElementInLasso(el, currentDraft.points));
          if (captured.length > 0) {
            setSelectedIds(captured.map((el) => el.id));
            setActiveTool('select');
          } else {
            setSelectedIds([]);
          }
        }
      } else if (currentDraft.type === 'smart_pen' && !autoFormatEnabled) {
        const recognized = recognizeSmartShape(currentDraft.points, penColor, penWidth);
        pushHistory();
        setElements((prev) => [...prev, recognized]);
        setSelectedIds([recognized.id]);
      } else {
        pushHistory();
        setElements((prev) => [...prev, currentDraft]);
      }

      // Schedule real-time automatic handwriting & shape recognition ONLY for Dibujo Mágico (smart_pen)
      if (
        autoFormatEnabled &&
        (activeTool === 'smart_pen' || currentDraft.type === 'smart_pen') &&
        currentDraft &&
        currentDraft.points &&
        currentDraft.points.length > 1
      ) {
        if (autoFormatTimerRef.current) {
          clearTimeout(autoFormatTimerRef.current);
        }
        autoFormatTimerRef.current = setTimeout(() => {
          handleFormatHandwriting(null, true);
        }, 750);
      }

      setCurrentDraft(null);
      setIsDrawing(false);
    }
  };

  // Double click listener
  const handleDoubleClick = (e) => {
    const world = screenToWorld(e.clientX, e.clientY);
    const hit = findElementAt(world.x, world.y);
    if (hit && hit.type === 'physics_object') {
      handleOpenPhysicsInspector(hit);
      return;
    }
    if (hit && hit.type === 'text') {
      setEditingText({
        id: hit.id,
        x: hit.x,
        y: hit.y,
        text: hit.text,
        isNew: false,
      });
    } else if (!hit && activeTool === 'select') {
      setEditingText({
        id: `text-${Date.now()}`,
        x: world.x,
        y: world.y,
        text: '',
        isNew: true,
      });
    }
  };

  // Duplicate Selected Items (Ctrl+D)
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    pushHistory();
    const cloned = [];
    const newIds = [];
    elements.forEach((target) => {
      if (selectedIds.includes(target.id)) {
        const newId = `${target.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        newIds.push(newId);
        cloned.push({
          ...target,
          id: newId,
          x: target.x !== undefined ? target.x + 30 : undefined,
          y: target.y !== undefined ? target.y + 30 : undefined,
          startX: target.startX !== undefined ? target.startX + 30 : undefined,
          startY: target.startY !== undefined ? target.startY + 30 : undefined,
          endX: target.endX !== undefined ? target.endX + 30 : undefined,
          endY: target.endY !== undefined ? target.endY + 30 : undefined,
          points: target.points
            ? target.points.map((p) => ({ x: p.x + 30, y: p.y + 30 }))
            : undefined,
        });
      }
    });
    setElements((prev) => [...prev, ...cloned]);
    setSelectedIds(newIds);
  };

  // Change color for all selected elements
  const handleChangeColor = (color) => {
    if (selectedIds.length === 0) return;
    pushHistory();
    setElements((prev) =>
      prev.map((el) => {
        if (selectedIds.includes(el.id)) {
          if (el.type === 'sticky') return { ...el, color };
          return { ...el, color, fill: el.fill && el.fill !== 'none' ? 'solid' : 'none' };
        }
        return el;
      })
    );
  };

  // Check if selection or canvas has handwritten strokes
  const selectedHasStrokes = elements.some(
    (el) => selectedIds.includes(el.id) && el.points && el.points.length > 0
  );
  const canvasHasSmartStrokes = elements.some(
    (el) => el.points && el.type === 'smart_pen'
  );

  // Position calculation for Contextual Toolbar above selection
  let contextPos = null;
  let primarySelectedElement = null;
  if (selectedIds.length > 0) {
    let groupMinX = Infinity, groupMaxX = -Infinity, groupMinY = Infinity, groupMaxY = -Infinity;
    elements.forEach((el) => {
      if (selectedIds.includes(el.id)) {
        const b = getElementBounds(el);
        if (b) {
          if (b.minX < groupMinX) groupMinX = b.minX;
          if (b.maxX > groupMaxX) groupMaxX = b.maxX;
          if (b.minY < groupMinY) groupMinY = b.minY;
          if (b.maxY > groupMaxY) groupMaxY = b.maxY;
        }
      }
    });

    if (groupMinX !== Infinity) {
      contextPos = worldToScreen((groupMinX + groupMaxX) / 2, groupMinY);
      primarySelectedElement = elements.find((el) => el.id === selectedIds[0]) || { type: 'multi', color: '#4262ff' };
    }
  }

  // Dynamic cursor style calculation
  let cursorClass = 'crosshair';
  if (spacePressed || isPanning || activeTool === 'hand') {
    cursorClass = isPanning ? 'grabbing' : 'grab';
  } else if (activeTool === 'select') {
    cursorClass = isDraggingSelection ? 'grabbing' : 'default';
  } else if (activeTool === 'text') {
    cursorClass = 'text';
  } else if (activeTool === 'stroke_eraser' || activeTool === 'eraser') {
    cursorClass = 'cell';
  } else if (activeTool === 'pencil_eraser') {
    cursorClass = 'crosshair';
  }

  return (
    <div
      ref={containerRef}
      className={`webwb-canvas-container cursor-${cursorClass}`}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/physics-object')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(e) => {
        const rawData = e.dataTransfer.getData('application/physics-object');
        if (rawData) {
          e.preventDefault();
          try {
            const data = JSON.parse(rawData);
            const world = screenToWorld(e.clientX, e.clientY);
            let dropX = world.x;
            let dropY = world.y;

            if (data.physicsType === 'mru_cart') {
              const tracks = elementsRef.current.filter((el) => el.physicsType === 'mru_track');
              const nearbyTrack = tracks.find(
                (t) => Math.abs(world.y - (t.y + 19)) < 70 &&
                       world.x >= t.x - 40 &&
                       world.x <= t.x + t.width + 40
              );
              if (nearbyTrack) {
                // Snap cart cleanly on top of track surface
                dropY = nearbyTrack.y - 12;
              }
            }

            pushHistory();
            const newObj = createPhysicsElement(data.physicsType || 'mass', dropX, dropY, data.preset);
            setElements((prev) => [...prev, newObj]);
            setSelectedIds([newObj.id]);
            setActiveTool('select');
          } catch (err) {
            console.error('Error al colocar objeto físico:', err);
          }
        }
      }}
    >
      {/* HTML5 Canvas */}
      <canvas ref={canvasRef} className="webwb-canvas" />

      {/* Floating Pill: Auto-digitalización de Dibujo Mágico */}
      {(activeTool === 'smart_pen' || canvasHasSmartStrokes) && (
        <div className="math-format-floating-pill miro-island">
          <button
            className={`math-format-action-btn ${autoFormatEnabled ? 'active-auto' : 'inactive-auto'}`}
            onClick={() => setAutoFormatEnabled((prev) => !prev)}
            title={
              autoFormatEnabled
                ? 'Dibujo mágico automático activo para letras, figuras y ecuaciones (Clic para pausar)'
                : 'Dibujo mágico automático pausado (Clic para activar)'
            }
          >
            <Sparkles size={16} className="sparkle-gold-icon" />
            <span className="pill-bold-text">
              {autoFormatEnabled ? '✨ Dibujo mágico: Auto-digitalizar' : '✨ Dibujo mágico: Pausado'}
            </span>
            <span className={`pill-status-dot ${autoFormatEnabled ? 'dot-active' : 'dot-paused'}`} />
          </button>
          {canvasHasSmartStrokes && (
            <button
              className="math-format-manual-btn"
              onClick={() => handleFormatHandwriting(null, false)}
              title="Digitalizar trazos mágicos pendientes inmediatamente"
            >
              Digitalizar ya
            </button>
          )}
        </div>
      )}

      {/* Headless Matter.js Physics Simulation Floating Controller */}
      <PhysicsSimulationBar
        isSimulating={isSimulating}
        onToggleSimulate={handleToggleSimulate}
        onResetSimulation={handleResetSimulation}
        onStepSimulation={handleStepSimulation}
        gravityPreset={gravityPreset}
        onChangeGravity={handleChangeGravity}
        metrics={simMetrics}
        hasPhysicsObjects={elements.some(
          (el) => el.type === 'physics_object' || el.type === 'physics_connection'
        )}
      />

      {/* Floating Contextual Toolbar above selected elements */}
      {primarySelectedElement && contextPos && (
        <ContextualToolbar
          selectedElement={primarySelectedElement}
          position={contextPos}
          onChangeColor={handleChangeColor}
          onDuplicate={handleDuplicateSelected}
          onDelete={() => {
            pushHistory();
            setElements((prev) => {
              const remaining = prev.filter((el) => !selectedIds.includes(el.id));
              const remainingIds = new Set(remaining.map((el) => el.id));
              return remaining.filter((el) => {
                if (el.type === 'physics_connection') {
                  return remainingIds.has(el.from?.elementId) && remainingIds.has(el.to?.elementId);
                }
                return true;
              });
            });
            setSelectedIds([]);
          }}
          onFormatMath={handleFormatHandwriting}
          onEditPhysicsObject={() => handleOpenPhysicsInspector()}
          hasStrokes={selectedHasStrokes}
        />
      )}

      {/* Physics Object Property Inspector Modal */}
      <PhysicsObjectInspector
        element={inspectorElement}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onUpdateElement={handleUpdatePhysicsElement}
      />

      {/* Inline Text Editor Overlay */}
      {editingText && (
        <div
          className="miro-inline-text-wrapper"
          style={{
            left: `${worldToScreen(editingText.x, editingText.y).x}px`,
            top: `${worldToScreen(editingText.x, editingText.y).y}px`,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <textarea
            ref={inlineInputRef}
            autoFocus
            value={editingText.text}
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitText();
              } else if (e.key === 'Escape') {
                setEditingText(null);
              }
            }}
            onBlur={commitText}
            placeholder="Type something..."
            className="miro-inline-textarea"
            style={{
              fontSize: `${Math.max(14, 18 * transform.scale)}px`,
            }}
          />
        </div>
      )}

      {/* Sticky Notes HTML Overlay */}
      {elements
        .filter((el) => el.type === 'sticky')
        .map((sticky) => {
          const isSelected = selectedIds.includes(sticky.id);
          const screenPos = worldToScreen(sticky.x, sticky.y);
          const scaledW = sticky.width * transform.scale;
          const scaledH = sticky.height * transform.scale;

          return (
            <div
              key={sticky.id}
              className={`miro-sticky-note ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`,
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                backgroundColor: sticky.color || '#fff9b1',
              }}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                if (e.button === 2) {
                  // Right click pans the board freely! Allow event to bubble to container
                  return;
                }
                e.stopPropagation();
                dragStartSnapshotRef.current = elements;
                const world = screenToWorld(e.clientX, e.clientY);
                if (e.shiftKey) {
                  if (selectedIds.includes(sticky.id)) {
                    setSelectedIds((prev) => prev.filter((id) => id !== sticky.id));
                  } else {
                    setSelectedIds((prev) => [...prev, sticky.id]);
                  }
                } else {
                  if (!selectedIds.includes(sticky.id)) {
                    setSelectedIds([sticky.id]);
                  }
                }
                setIsDraggingSelection(true);
                setLastDragPos({ x: world.x, y: world.y });
              }}
            >
              <textarea
                value={sticky.text}
                onFocus={() => {
                  stickyTextSnapshotRef.current = sticky.text;
                }}
                onBlur={() => {
                  if (stickyTextSnapshotRef.current !== null && stickyTextSnapshotRef.current !== sticky.text) {
                    const prevSnapshot = elements.map((el) =>
                      el.id === sticky.id ? { ...el, text: stickyTextSnapshotRef.current } : el
                    );
                    pushHistory(prevSnapshot);
                    stickyTextSnapshotRef.current = null;
                  }
                }}
                onChange={(e) => {
                  const newText = e.target.value;
                  setElements((prev) =>
                    prev.map((el) => (el.id === sticky.id ? { ...el, text: newText } : el))
                  );
                }}
                className="miro-sticky-textarea"
                style={{
                  fontSize: `${Math.max(12, 15 * transform.scale)}px`,
                }}
                placeholder="Type something..."
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          );
        })}

      <style>{`
        .webwb-canvas-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #ffffff;
          touch-action: none;
        }

        .cursor-default { cursor: default; }
        .cursor-crosshair { cursor: crosshair; }
        .cursor-grab { cursor: grab; }
        .cursor-grabbing { cursor: grabbing; }
        .cursor-text { cursor: text; }
        .cursor-cell { cursor: cell; }

        .webwb-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .miro-inline-text-wrapper {
          position: absolute;
          z-index: 60;
          transform: translateY(-4px);
        }

        .miro-inline-textarea {
          font-family: var(--font-sans);
          font-weight: 600;
          color: #050038;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #4262ff;
          border-radius: 4px;
          outline: none;
          padding: 4px 8px;
          min-width: 180px;
          min-height: 38px;
          resize: both;
          box-shadow: 0 4px 16px rgba(66, 98, 255, 0.15);
        }

        /* Top Floating Pill for Math and Numbers Formatting */
        .math-format-floating-pill {
          position: absolute;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 45;
          background: #ffffff;
          border-radius: 30px;
          padding: 4px 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 20px rgba(5, 0, 56, 0.12);
          border: 1.5px solid #4262ff;
          animation: contextFadeIn 0.2s ease-out;
        }

        .math-format-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #edf2fe;
          border: none;
          border-radius: 24px;
          padding: 7px 14px;
          color: #4262ff;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .math-format-action-btn.active-auto {
          background: #eef2ff;
          color: #3730a3;
        }

        .math-format-action-btn.inactive-auto {
          background: #f3f4f6;
          color: #6b7280;
        }

        .math-format-action-btn:hover {
          background: #4262ff;
          color: #ffffff;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(66, 98, 255, 0.25);
        }

        .pill-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-left: 2px;
        }

        .pill-status-dot.dot-active {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .pill-status-dot.dot-paused {
          background: #9ca3af;
        }

        .math-format-manual-btn {
          background: #4262ff;
          color: #ffffff;
          border: none;
          border-radius: 20px;
          padding: 6px 12px;
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .math-format-manual-btn:hover {
          background: #314bd9;
          transform: scale(1.02);
        }

        .sparkle-gold-icon {
          color: #f59e0b;
        }

        .math-format-action-btn:hover .sparkle-gold-icon {
          color: #ffd02f;
        }
      `}</style>
    </div>
  );
}
