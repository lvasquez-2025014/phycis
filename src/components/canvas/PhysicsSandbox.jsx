import React, { useEffect, useRef, useState } from 'react';
import MatterLib from 'matter-js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Maximize2, 
  Minimize2, 
  Info, 
  Sliders,
  Move
} from 'lucide-react';

export default function PhysicsSandbox({ onClose }) {
  const Matter = MatterLib?.default || MatterLib;
  const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Constraint,
    Mouse,
    MouseConstraint,
    Events,
  } = Matter;

  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const atwoodObjectsRef = useRef(null);

  // Teacher Interactive State
  const [isRunning, setIsRunning] = useState(true);
  const [gravityPreset, setGravityPreset] = useState('earth'); // 'earth' | 'moon' | 'zero' | 'jupiter'
  const [massAValue, setMassAValue] = useState(100);
  const [massBValue, setMassBValue] = useState(60);
  const [liveMetrics, setLiveMetrics] = useState({
    velA: 0,
    velB: 0,
    theoAccel: '2.45 m/s²',
    theoTension: '735 N',
  });

  // Theoretical physics calculations
  useEffect(() => {
    const mA = massAValue;
    const mB = massBValue;
    let g = 9.8;
    if (gravityPreset === 'moon') g = 1.62;
    if (gravityPreset === 'zero') g = 0;
    if (gravityPreset === 'jupiter') g = 24.79;

    const totalM = mA + mB;
    const accel = totalM > 0 ? ((mA - mB) / totalM) * g : 0;
    const tension = totalM > 0 ? ((2 * mA * mB) / totalM) * g : 0;

    setLiveMetrics((prev) => ({
      ...prev,
      theoAccel: `${Math.abs(accel).toFixed(2)} m/s²`,
      theoTension: `${tension.toFixed(1)} N`,
    }));
  }, [massAValue, massBValue, gravityPreset]);

  // Main Matter.js Engine & Atwood Machine Lifecycle
  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;

    // 1. Create Engine with high iteration counts for stiff, physically accurate rope constraints
    const engine = Engine.create({
      positionIterations: 20,
      velocityIterations: 20,
      constraintIterations: 20,
    });
    engineRef.current = engine;
    engine.world.gravity.y = 1.0;

    // 2. Create Render (800x600, dark educational theme, wireframes: false)
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#0d1117',
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // 3. Create Runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // 4. Construct Atwood Machine
    const setupAtwoodMachine = (currentMA, currentMB) => {
      // Clear world if already populated
      World.clear(engine.world, false);

      const px = 400;
      const py = 140;
      const pr = 46;

      // Floor (Static, located at y=580)
      const floor = Bodies.rectangle(400, 580, 800, 40, {
        isStatic: true,
        friction: 0.8,
        render: {
          fillStyle: '#1e293b',
          strokeStyle: '#334155',
          lineWidth: 2,
        },
      });

      // Ceiling Support Beam
      const beam = Bodies.rectangle(400, 20, 260, 20, {
        isStatic: true,
        render: {
          fillStyle: '#334155',
          strokeStyle: '#475569',
          lineWidth: 1,
        },
      });

      // Pulley Support Arm (from ceiling beam to pulley center)
      const supportArm = Bodies.rectangle(px, (py + 20) / 2, 8, py - 20, {
        isStatic: true,
        render: {
          fillStyle: '#475569',
        },
      });

      // Pulley Wheel (Fixed, circular, located at 400, 140)
      const pulley = Bodies.circle(px, py, pr, {
        isStatic: true,
        friction: 0.005,
        restitution: 0,
        render: {
          fillStyle: '#2d3748',
          strokeStyle: '#6366f1',
          lineWidth: 4,
        },
      });

      // Pulley Axle Pin
      const axlePin = Bodies.circle(px, py, 9, {
        isStatic: true,
        render: {
          fillStyle: '#f8fafc',
          strokeStyle: '#4f46e5',
          lineWidth: 2,
        },
      });

      // Mass A (Left side: 100 kg equivalent, scaled physically and visually)
      const massA = Bodies.rectangle(px - pr, 320, 56, 68, {
        frictionAir: 0.004,
        friction: 0.4,
        restitution: 0.05,
        density: 0.01,
        render: {
          fillStyle: '#3b82f6',
          strokeStyle: '#93c5fd',
          lineWidth: 3,
        },
      });
      // Physical mass setting (scaled: 10.0 for 100 kg)
      Body.setMass(massA, (currentMA / 100) * 10);

      // Mass B (Right side: 60 kg equivalent)
      const massB = Bodies.rectangle(px + pr, 320, 44, 52, {
        frictionAir: 0.004,
        friction: 0.4,
        restitution: 0.05,
        density: 0.01,
        render: {
          fillStyle: '#ec4899',
          strokeStyle: '#fbcfe8',
          lineWidth: 3,
        },
      });
      // Physical mass setting (scaled: 6.0 for 60 kg)
      Body.setMass(massB, (currentMB / 100) * 10);

      // -------------------------------------------------------------
      // Segmented Rope (25 segments around the pulley)
      // -------------------------------------------------------------
      // Technical Solution:
      // A naive Composites.stack() placed horizontally will fall or catch on pulley edges.
      // Instead, we initialize the 25 rope segments along the exact physical arc & drops:
      // - 7 segments descending vertically along the left side
      // - 11 segments curved smoothly over the semicircular pulley crown
      // - 7 segments descending vertically along the right side
      // Connected by stiff distance constraints.
      const ropePoints = [];
      const leftCount = 7;
      const arcCount = 11;
      const rightCount = 7;

      // Left vertical drop
      for (let i = 0; i < leftCount; i++) {
        const t = i / leftCount;
        ropePoints.push({ x: px - pr, y: 285 - (285 - py) * t });
      }
      // Top semicircular arc over the pulley
      for (let i = 0; i <= arcCount; i++) {
        const angle = Math.PI - (i / arcCount) * Math.PI;
        ropePoints.push({
          x: px + (pr + 3) * Math.cos(angle),
          y: py - (pr + 3) * Math.sin(angle),
        });
      }
      // Right vertical drop
      for (let i = 1; i <= rightCount; i++) {
        const t = i / rightCount;
        ropePoints.push({ x: px + pr, y: py + (285 - py) * t });
      }

      // Create rope segment bodies
      const segments = ropePoints.map((p) =>
        Bodies.circle(p.x, p.y, 3.5, {
          friction: 0.01,
          frictionAir: 0.002,
          density: 0.004,
          collisionFilter: { group: -1 }, // Segments don't self-collide
          render: {
            fillStyle: '#cbd5e1',
            strokeStyle: '#94a3b8',
            lineWidth: 1,
          },
        })
      );

      // Connect rope segments in a chain
      const ropeConstraints = [];
      for (let i = 0; i < segments.length - 1; i++) {
        ropeConstraints.push(
          Constraint.create({
            bodyA: segments[i],
            bodyB: segments[i + 1],
            stiffness: 0.98,
            damping: 0.04,
            length: Math.hypot(
              ropePoints[i + 1].x - ropePoints[i].x,
              ropePoints[i + 1].y - ropePoints[i].y
            ),
            render: {
              visible: true,
              strokeStyle: '#e2e8f0',
              lineWidth: 3,
            },
          })
        );
      }

      // Connect Rope End 0 to Mass A top
      const constraintA = Constraint.create({
        bodyA: massA,
        bodyB: segments[0],
        pointA: { x: 0, y: -34 },
        pointB: { x: 0, y: 0 },
        stiffness: 0.98,
        length: 4,
        render: {
          strokeStyle: '#e2e8f0',
          lineWidth: 3,
        },
      });

      // Connect Rope End 24 to Mass B top
      const constraintB = Constraint.create({
        bodyA: massB,
        bodyB: segments[segments.length - 1],
        pointA: { x: 0, y: -26 },
        pointB: { x: 0, y: 0 },
        stiffness: 0.98,
        length: 4,
        render: {
          strokeStyle: '#e2e8f0',
          lineWidth: 3,
        },
      });

      World.add(engine.world, [
        beam,
        supportArm,
        pulley,
        axlePin,
        floor,
        massA,
        massB,
        ...segments,
        ...ropeConstraints,
        constraintA,
        constraintB,
      ]);

      atwoodObjectsRef.current = {
        massA,
        massB,
        pulley,
        floor,
        segments,
      };
    };

    setupAtwoodMachine(massAValue, massBValue);

    // 5. Mouse & MouseConstraint for Teacher Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
          strokeStyle: '#38bdf8',
          lineWidth: 2,
        },
      },
    });

    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // 6. AfterRender Overlay for Educational Diagrams & Real-time Labels
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      if (!ctx || !atwoodObjectsRef.current) return;
      const { massA, massB } = atwoodObjectsRef.current;

      ctx.save();
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';

      // Mass A Label & Weight Tag
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Masa A`, massA.position.x, massA.position.y - 6);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#bfdbfe';
      ctx.fillText(`${massAValue} kg`, massA.position.x, massA.position.y + 12);

      // Mass B Label & Weight Tag
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Masa B`, massB.position.x, massB.position.y - 4);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#fbcfe8';
      ctx.fillText(`${massBValue} kg`, massB.position.x, massB.position.y + 12);

      // Pulley Specification Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Polea fija (R = 46 px)`, 400, 140 - 58);

      // Floor Label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Suelo de referencia (y = 580 px)`, 400, 580 - 8);

      // Downward Gravity Vector Indicator at Center
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(400, 240);
      ctx.lineTo(400, 275);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(396, 270);
      ctx.lineTo(400, 278);
      ctx.lineTo(404, 270);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`g = ${engine.world.gravity.y.toFixed(1)}`, 400, 295);

      ctx.restore();
    });

    // 7. Start Simulation
    Render.run(render);
    Runner.run(runner, engine);

    // 8. Strict Cleanup Function
    return () => {
      if (runnerRef.current) {
        Runner.stop(runnerRef.current);
      }
      if (renderRef.current) {
        Render.stop(renderRef.current);
        if (renderRef.current.canvas && renderRef.current.canvas.parentNode) {
          renderRef.current.canvas.parentNode.removeChild(renderRef.current.canvas);
        }
      }
      if (engineRef.current) {
        World.clear(engineRef.current.world, false);
        Engine.clear(engineRef.current);
      }
      atwoodObjectsRef.current = null;
    };
  }, []); // Run once on mount

  // Handle Gravity Preset Change
  const handleGravityChange = (preset) => {
    setGravityPreset(preset);
    if (!engineRef.current) return;
    if (preset === 'earth') engineRef.current.world.gravity.y = 1.0;
    else if (preset === 'moon') engineRef.current.world.gravity.y = 0.165;
    else if (preset === 'zero') engineRef.current.world.gravity.y = 0.0;
    else if (preset === 'jupiter') engineRef.current.world.gravity.y = 2.5;
  };

  // Reset Atwood Experiment to Initial State
  const handleReset = () => {
    if (!engineRef.current || !atwoodObjectsRef.current) return;
    const { massA, massB, segments } = atwoodObjectsRef.current;

    const px = 400;
    const py = 140;
    const pr = 46;

    // Reset Mass A
    Body.setPosition(massA, { x: px - pr, y: 320 });
    Body.setVelocity(massA, { x: 0, y: 0 });
    Body.setAngularVelocity(massA, 0);

    // Reset Mass B
    Body.setPosition(massB, { x: px + pr, y: 320 });
    Body.setVelocity(massB, { x: 0, y: 0 });
    Body.setAngularVelocity(massB, 0);

    // Reset Segments
    const ropePoints = [];
    const leftCount = 7;
    const arcCount = 11;
    const rightCount = 7;

    for (let i = 0; i < leftCount; i++) {
      const t = i / leftCount;
      ropePoints.push({ x: px - pr, y: 285 - (285 - py) * t });
    }
    for (let i = 0; i <= arcCount; i++) {
      const angle = Math.PI - (i / arcCount) * Math.PI;
      ropePoints.push({
        x: px + (pr + 3) * Math.cos(angle),
        y: py - (pr + 3) * Math.sin(angle),
      });
    }
    for (let i = 1; i <= rightCount; i++) {
      const t = i / rightCount;
      ropePoints.push({ x: px + pr, y: py + (285 - py) * t });
    }

    segments.forEach((seg, idx) => {
      if (ropePoints[idx]) {
        Body.setPosition(seg, ropePoints[idx]);
        Body.setVelocity(seg, { x: 0, y: 0 });
        Body.setAngularVelocity(seg, 0);
      }
    });

    if (!isRunning && runnerRef.current && engineRef.current) {
      Runner.start(runnerRef.current, engineRef.current);
      setIsRunning(true);
    }
  };

  // Toggle Pause / Resume
  const handleTogglePlay = () => {
    if (!runnerRef.current || !engineRef.current) return;
    if (isRunning) {
      Runner.stop(runnerRef.current);
      setIsRunning(false);
    } else {
      Runner.start(runnerRef.current, engineRef.current);
      setIsRunning(true);
    }
  };

  return (
    <div className="physics-sandbox-overlay" onClick={onClose}>
      <div className="physics-sandbox-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="sandbox-header">
          <div className="sandbox-header-left">
            <span className="sandbox-badge">Matter.js Physics 2D</span>
            <h2 className="sandbox-title">Sandbox Físico: Máquina de Atwood</h2>
            <p className="sandbox-subtitle">
              Simulación newtoniana en tiempo real con polea física, cuerda segmentada y arrastre con mouse.
            </p>
          </div>
          <button className="sandbox-close-btn" onClick={onClose} title="Cerrar sandbox (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="sandbox-content-grid">
          {/* Left / Center: Matter.js 800x600 Canvas Container */}
          <div className="sandbox-canvas-wrapper">
            <div ref={sceneRef} className="sandbox-canvas-viewport" />

            {/* Mouse Instruction Toast */}
            <div className="sandbox-mouse-hint">
              <Move size={13} />
              <span>Haz clic y arrastra cualquier masa con el mouse para interactuar</span>
            </div>
          </div>

          {/* Right: Teacher Controls & Real-time Formulas */}
          <div className="sandbox-sidebar-panel">
            {/* Playback Controls */}
            <div className="sandbox-panel-section">
              <span className="section-label">Control de Simulación</span>
              <div className="panel-btn-row">
                <button
                  className={`panel-action-btn ${isRunning ? 'pause-style' : 'play-style'}`}
                  onClick={handleTogglePlay}
                >
                  {isRunning ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isRunning ? 'Pausar' : 'Reanudar'}</span>
                </button>

                <button className="panel-action-btn reset-style" onClick={handleReset}>
                  <RotateCcw size={15} />
                  <span>Reiniciar</span>
                </button>
              </div>
            </div>

            {/* Gravity Selector */}
            <div className="sandbox-panel-section">
              <span className="section-label">Aceleración Gravitatoria (g)</span>
              <div className="gravity-pills-grid">
                <button
                  className={`grav-pill ${gravityPreset === 'earth' ? 'active' : ''}`}
                  onClick={() => handleGravityChange('earth')}
                >
                  🌍 Tierra (1.0 g)
                </button>
                <button
                  className={`grav-pill ${gravityPreset === 'moon' ? 'active' : ''}`}
                  onClick={() => handleGravityChange('moon')}
                >
                  🌑 Luna (0.16 g)
                </button>
                <button
                  className={`grav-pill ${gravityPreset === 'zero' ? 'active' : ''}`}
                  onClick={() => handleGravityChange('zero')}
                >
                  🚀 Gravedad 0
                </button>
                <button
                  className={`grav-pill ${gravityPreset === 'jupiter' ? 'active' : ''}`}
                  onClick={() => handleGravityChange('jupiter')}
                >
                  🪐 Júpiter (2.5 g)
                </button>
              </div>
            </div>

            {/* Masses Specs */}
            <div className="sandbox-panel-section">
              <span className="section-label">Propiedades Físicas</span>
              <div className="mass-spec-card mass-a-card">
                <div className="mass-spec-header">
                  <span className="mass-dot dot-a" />
                  <span className="mass-name">Masa A (Azul)</span>
                  <span className="mass-val-pill">{massAValue} kg</span>
                </div>
                <p className="mass-role-text">Fuerza gravitatoria: W = {massAValue * 9.8} N</p>
              </div>

              <div className="mass-spec-card mass-b-card">
                <div className="mass-spec-header">
                  <span className="mass-dot dot-b" />
                  <span className="mass-name">Masa B (Rosa)</span>
                  <span className="mass-val-pill">{massBValue} kg</span>
                </div>
                <p className="mass-role-text">Fuerza gravitatoria: W = {massBValue * 9.8} N</p>
              </div>
            </div>

            {/* Theoretical Calculation Box */}
            <div className="sandbox-panel-section math-theory-box">
              <div className="theory-header">
                <Info size={14} className="info-icon" />
                <span className="theory-title">Modelo Físico Teórico</span>
              </div>
              <div className="theory-equation">
                {'a = (m_A − m_B) / (m_A + m_B) · g'}
              </div>
              <div className="theory-stat-row">
                <span className="stat-label">Aceleración teórica (a):</span>
                <span className="stat-val highlight-accel">{liveMetrics.theoAccel}</span>
              </div>
              <div className="theory-stat-row">
                <span className="stat-label">Tensión de la cuerda (T):</span>
                <span className="stat-val highlight-tension">{liveMetrics.theoTension}</span>
              </div>
              <p className="theory-explanation">
                Al ser <strong>{massAValue} kg &gt; {massBValue} kg</strong>, el sistema experimenta
                una fuerza resultante neta que acelera la Masa A hacia abajo y la Masa B hacia arriba.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          .physics-sandbox-overlay {
            position: fixed;
            inset: 0;
            background: rgba(3, 7, 18, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            animation: fadeInModal 0.2s ease-out;
          }

          @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .physics-sandbox-modal {
            background: #0f172a;
            border: 1px solid #334155;
            box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7);
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            width: 1140px;
            max-width: 96vw;
            max-height: 94vh;
            color: #f8fafc;
            font-family: var(--font-sans);
          }

          .sandbox-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 14px 20px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
          }

          .sandbox-badge {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 700;
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.25);
            padding: 2px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 4px;
          }

          .sandbox-title {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 700;
            color: #f8fafc;
          }

          .sandbox-subtitle {
            margin: 2px 0 0;
            font-size: 0.78rem;
            color: #94a3b8;
          }

          .sandbox-close-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: all 0.15s;
          }

          .sandbox-close-btn:hover {
            background: #334155;
            color: #ffffff;
          }

          .sandbox-content-grid {
            display: flex;
            overflow: hidden;
            flex: 1;
          }

          .sandbox-canvas-wrapper {
            position: relative;
            width: 800px;
            height: 600px;
            background: #0d1117;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .sandbox-canvas-viewport {
            width: 800px;
            height: 600px;
          }

          .sandbox-mouse-hint {
            position: absolute;
            bottom: 14px;
            left: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(51, 65, 85, 0.7);
            border-radius: 9999px;
            font-size: 0.72rem;
            color: #cbd5e1;
            pointer-events: none;
          }

          .sandbox-sidebar-panel {
            flex: 1;
            padding: 18px;
            background: #0f172a;
            border-left: 1px solid #334155;
            display: flex;
            flex-direction: column;
            gap: 16px;
            overflow-y: auto;
          }

          .sandbox-panel-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .section-label {
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .panel-btn-row {
            display: flex;
            gap: 8px;
          }

          .panel-action-btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.15s;
          }

          .panel-action-btn.pause-style {
            background: #f59e0b;
            color: #0f172a;
          }
          .panel-action-btn.pause-style:hover {
            background: #d97706;
          }

          .panel-action-btn.play-style {
            background: #10b981;
            color: #ffffff;
          }
          .panel-action-btn.play-style:hover {
            background: #059669;
          }

          .panel-action-btn.reset-style {
            background: #334155;
            color: #f8fafc;
          }
          .panel-action-btn.reset-style:hover {
            background: #475569;
          }

          .gravity-pills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }

          .grav-pill {
            background: #1e293b;
            border: 1px solid #334155;
            color: #94a3b8;
            padding: 6px 8px;
            border-radius: 6px;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s;
          }

          .grav-pill:hover {
            background: #334155;
            color: #f8fafc;
          }

          .grav-pill.active {
            background: rgba(56, 189, 248, 0.15);
            border-color: #38bdf8;
            color: #38bdf8;
          }

          .mass-spec-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mass-spec-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .mass-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
          }
          .mass-dot.dot-a { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
          .mass-dot.dot-b { background: #ec4899; box-shadow: 0 0 6px #ec4899; }

          .mass-name {
            font-size: 0.79rem;
            font-weight: 600;
            color: #f1f5f9;
            flex: 1;
          }

          .mass-val-pill {
            font-size: 0.72rem;
            font-weight: 700;
            padding: 2px 7px;
            background: #0f172a;
            border-radius: 4px;
            color: #38bdf8;
          }

          .mass-role-text {
            margin: 0;
            font-size: 0.7rem;
            color: #64748b;
          }

          .math-theory-box {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(51, 65, 85, 0.8);
            border-radius: 10px;
            padding: 12px;
          }

          .theory-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }

          .info-icon {
            color: #38bdf8;
          }

          .theory-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #e2e8f0;
          }

          .theory-equation {
            background: #0f172a;
            padding: 6px 10px;
            border-radius: 6px;
            font-family: 'Cambria Math', monospace;
            font-size: 0.82rem;
            color: #f59e0b;
            text-align: center;
            margin-bottom: 8px;
          }

          .theory-stat-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.74rem;
            padding: 2px 0;
          }

          .stat-label {
            color: #94a3b8;
          }

          .stat-val {
            font-weight: 700;
          }

          .stat-val.highlight-accel { color: #34d399; }
          .stat-val.highlight-tension { color: #60a5fa; }

          .theory-explanation {
            margin: 8px 0 0;
            font-size: 0.7rem;
            color: #64748b;
            line-height: 1.35;
          }

          @media (max-width: 1050px) {
            .sandbox-content-grid {
              flex-direction: column;
            }
            .sandbox-canvas-wrapper {
              width: 100%;
              height: auto;
            }
            .sandbox-canvas-viewport canvas {
              max-width: 100%;
              height: auto !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
