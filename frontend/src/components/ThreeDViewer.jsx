import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Layers,
  Eye,
  Maximize2,
  Sparkles,
  Info,
  Sliders,
  Cpu,
  BrainCircuit,
  Dna,
  Play,
  Pause
} from 'lucide-react';

export default function ThreeDViewer() {
  const mountRef = useRef(null);
  const [activeModel, setActiveModel] = useState('cpu'); // 'cpu' | 'neural' | 'dna'
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [explodedView, setExplodedView] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  // References for Three.js state
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelGroupRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Subsystem annotations details
  const modelAnnotations = {
    cpu: {
      title: "Octa-Core Heterogeneous Processor Architecture",
      course: "CSE208: Computer Organization & Architecture",
      subsystems: [
        {
          id: "cores",
          name: "High-Performance Cores (ALU & FPU)",
          desc: "4 Out-of-Order superscalar execution cores with dedicated 64KB L1 instruction and data caches.",
          specs: "3.8 GHz Clock • 4-wide dispatch • SIMD AVX-512 vector units"
        },
        {
          id: "l3_cache",
          name: "Shared 32MB L3 Smart Cache",
          desc: "Low-latency ring-bus interconnected cache accessible with coherent MESI protocol by all cores.",
          specs: "16-way set associative • 32MB SRAM • 1.2 TB/s bandwidth"
        },
        {
          id: "interconnect",
          name: "Coherent Crossbar & PCIe Controller",
          desc: "High-speed unified interconnect linking CPU cores to DDR5 multichannel memory controllers and NVMe buses.",
          specs: "PCIe Gen 5.0 x16 • 64 GB/s bidirectional throughput"
        }
      ]
    },
    neural: {
      title: "Deep Multilayer Perceptron & Activation Synapses",
      course: "CSE401: Artificial Intelligence & Deep Learning",
      subsystems: [
        {
          id: "input_layer",
          name: "Input Sensory Layer (d = 128)",
          desc: "Normalizes incoming feature vectors with Z-score standardization before propagating through affine weight transforms.",
          specs: "Dimension: 128 • Dense representation"
        },
        {
          id: "hidden_layers",
          name: "Deep Latent Hidden Layers with GELU",
          desc: "Extracts hierarchical nonlinear representations. Neurons fire forward activation pulses during inference.",
          specs: "3 Hidden Layers (256x128x64) • Residual skip connections"
        },
        {
          id: "output_layer",
          name: "Softmax Classification Layer",
          desc: "Normalizes unnormalized logits into categorical probability distributions summing to 1.0.",
          specs: "Logits -> Softmax probabilities • Cross-entropy loss target"
        }
      ]
    },
    dna: {
      title: "DNA Double Helix & Molecular Hydrogen Bonds",
      course: "BIO102: Molecular Engineering & Bioinformatics",
      subsystems: [
        {
          id: "backbone",
          name: "Sugar-Phosphate Antiparallel Backbone",
          desc: "Alternating deoxyribose sugar and phosphate ester bonds forming the 5' to 3' structural scaffold.",
          specs: "Right-handed B-form helix • 0.34 nm pitch per base pair"
        },
        {
          id: "base_pairs",
          name: "Purine & Pyrimidine Nitrogenous Bases",
          desc: "Watson-Crick base pairing: Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds; Guanine (G) with Cytosine (C) via 3 bonds.",
          specs: "A=T (2 H-bonds) • G≡C (3 H-bonds)"
        }
      ]
    }
  };

  useEffect(() => {
    setSelectedSubsystem(modelAnnotations[activeModel].subsystems[0]);
  }, [activeModel]);

  // Three.js Scene Setup & Re-rendering
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x121217); // Dark aesthetic canvas

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0); // Indigo accent light
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf97316, 1.2); // Coral accent light
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Model Root Group
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Build Selected 3D Model
    buildModelGeometry(modelGroup, activeModel, isWireframe, explodedView);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isAutoRotating && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.008 * rotationSpeed;
      }

      // Dynamic animation pulses for Neural Network or CPU signals
      if (activeModel === 'neural' && modelGroupRef.current) {
        modelGroupRef.current.children.forEach((child, idx) => {
          if (child.name === 'pulse') {
            child.position.z += 0.05;
            if (child.position.z > 4) child.position.z = -4;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Drag Rotation Handler
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.008;
      modelGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(5, Math.min(22, cameraRef.current.position.z + e.deltaY * 0.01));
    };

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeModel, isWireframe, isAutoRotating, rotationSpeed, explodedView]);

  // Geometry generator function
  const buildModelGeometry = (group, modelType, wireframe, exploded) => {
    // Clear previous
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (modelType === 'cpu') {
      // Substrate base
      const substrateGeo = new THREE.BoxGeometry(7, 0.4, 7);
      const substrateMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.3,
        wireframe
      });
      const substrate = new THREE.Mesh(substrateGeo, substrateMat);
      substrate.position.y = exploded ? -1.5 : -0.2;
      group.add(substrate);

      // Gold pins / ball grid array
      const gridGeo = new THREE.BufferGeometry();
      const pinPoints = [];
      for (let x = -3; x <= 3; x += 0.5) {
        for (let z = -3; z <= 3; z += 0.5) {
          pinPoints.push(x, exploded ? -2.2 : -0.5, z);
        }
      }
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(pinPoints, 3));
      const pinMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.08 });
      const pinGrid = new THREE.Points(gridGeo, pinMat);
      group.add(pinGrid);

      // 8 CPU Cores
      const coreOffsets = [
        [-1.8, -1.8], [-0.6, -1.8], [0.6, -1.8], [1.8, -1.8],
        [-1.8, 1.8], [-0.6, 1.8], [0.6, 1.8], [1.8, 1.8]
      ];

      coreOffsets.forEach(([cx, cz], i) => {
        const coreGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);
        const coreMat = new THREE.MeshStandardMaterial({
          color: i < 4 ? 0x6366f1 : 0x06b6d4, // P-Cores vs E-Cores
          metalness: 0.6,
          roughness: 0.2,
          wireframe
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(cx, exploded ? 1.2 : 0.2, cz);
        group.add(coreMesh);
      });

      // L3 Shared Cache Bar in center
      const l3Geo = new THREE.BoxGeometry(5, 0.25, 1.5);
      const l3Mat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.5,
        wireframe
      });
      const l3Mesh = new THREE.Mesh(l3Geo, l3Mat);
      l3Mesh.position.set(0, exploded ? 0.6 : 0.18, 0);
      group.add(l3Mesh);

      // Integrated Heat Spreader (IHS) wireframe cap if exploded
      if (exploded) {
        const ihsGeo = new THREE.BoxGeometry(7.2, 0.3, 7.2);
        const ihsMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          wireframe: true
        });
        const ihsMesh = new THREE.Mesh(ihsGeo, ihsMat);
        ihsMesh.position.y = 2.4;
        group.add(ihsMesh);
      }
    } else if (modelType === 'neural') {
      // 3D Neural Network MLP Architecture
      const layers = [
        { count: 5, z: -3.5, color: 0x06b6d4, label: "Input Layer" },
        { count: 7, z: -1.2, color: 0x6366f1, label: "Hidden 1" },
        { count: 7, z: 1.2, color: 0xa855f7, label: "Hidden 2" },
        { count: 3, z: 3.5, color: 0xf43f5e, label: "Output Softmax" }
      ];

      const nodePositions = [];

      layers.forEach((layer) => {
        const currentLayerNodes = [];
        const spacing = 1.0;
        const startY = -((layer.count - 1) * spacing) / 2;

        for (let i = 0; i < layer.count; i++) {
          const y = startY + i * spacing;
          const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const nodeMat = new THREE.MeshStandardMaterial({
            color: layer.color,
            emissive: layer.color,
            emissiveIntensity: 0.4,
            wireframe
          });
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(0, y, layer.z);
          group.add(node);
          currentLayerNodes.push(new THREE.Vector3(0, y, layer.z));
        }
        nodePositions.push(currentLayerNodes);
      });

      // Synapse connection lines between layers
      for (let l = 0; l < nodePositions.length - 1; l++) {
        const layerA = nodePositions[l];
        const layerB = nodePositions[l + 1];

        layerA.forEach((posA) => {
          layerB.forEach((posB) => {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([posA, posB]);
            const lineMat = new THREE.LineBasicMaterial({
              color: 0x475569,
              transparent: true,
              opacity: 0.35
            });
            const line = new THREE.Line(lineGeo, lineMat);
            group.add(line);
          });
        });
      }

      // Animated signal pulse traveling forward
      for (let p = 0; p < 4; p++) {
        const pulseGeo = new THREE.SphereGeometry(0.09, 8, 8);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.name = 'pulse';
        pulse.position.set(0, (p - 1.5) * 0.8, -3.5 + p * 1.8);
        group.add(pulse);
      }
    } else if (modelType === 'dna') {
      // DNA Double Helix
      const numPairs = 28;
      const radius = 2.0;
      const heightStep = 0.3;

      for (let i = 0; i < numPairs; i++) {
        const angle = i * 0.45;
        const y = (i - numPairs / 2) * heightStep;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;

        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Backbone sphere 1 (Sugar-Phosphate)
        const s1Geo = new THREE.SphereGeometry(0.18, 12, 12);
        const s1Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe });
        const s1 = new THREE.Mesh(s1Geo, s1Mat);
        s1.position.set(x1, y, z1);
        group.add(s1);

        // Backbone sphere 2
        const s2Geo = new THREE.SphereGeometry(0.18, 12, 12);
        const s2Mat = new THREE.MeshStandardMaterial({ color: 0x6366f1, wireframe });
        const s2 = new THREE.Mesh(s2Geo, s2Mat);
        s2.position.set(x2, y, z2);
        group.add(s2);

        // Rung connecting the pair (Base Pair Hydrogen bond)
        const rungPoints = [new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2)];
        const rungGeo = new THREE.BufferGeometry().setFromPoints(rungPoints);
        const rungMat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? 0xf59e0b : 0x10b981,
          linewidth: 2
        });
        const rung = new THREE.Line(rungGeo, rungMat);
        group.add(rung);
      }
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && modelGroupRef.current) {
      cameraRef.current.position.set(0, 5, 12);
      cameraRef.current.lookAt(0, 0, 0);
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const currentInfo = modelAnnotations[activeModel];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              3D Learning & Simulation Lab
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-code font-semibold">
              Interactive WebGL
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Explore complex engineering architectures and biological systems with real-time interactive 3D inspection.
          </p>
        </div>

        {/* Model Switcher Buttons */}
        <div className="flex items-center bg-zinc-200/60 p-1 rounded-full text-xs font-code font-semibold">
          <button
            onClick={() => setActiveModel('cpu')}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              activeModel === 'cpu'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Core CPU</span>
          </button>
          <button
            onClick={() => setActiveModel('neural')}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              activeModel === 'neural'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Neural Network</span>
          </button>
          <button
            onClick={() => setActiveModel('dna')}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              activeModel === 'dna'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>DNA Helix</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + HUD Annotation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D WebGL Canvas */}
        <div className="lg:col-span-8 bg-[#121217] rounded-3xl border border-zinc-800 shadow-xl overflow-hidden relative flex flex-col h-[580px]">
          {/* Top Canvas Controls HUD Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700/60 text-white text-xs font-code">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentInfo.title}</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              {/* Auto-rotate Toggle */}
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-all ${
                  isAutoRotating
                    ? 'bg-indigo-600/90 text-white border-indigo-500'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
                }`}
                title="Toggle Auto-Rotation"
              >
                {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Wireframe Toggle */}
              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-code transition-all ${
                  isWireframe
                    ? 'bg-amber-500 text-black font-bold border-amber-400'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:text-white'
                }`}
                title="Toggle Wireframe Mesh"
              >
                Wireframe
              </button>

              {/* Exploded View Toggle (for CPU) */}
              {activeModel === 'cpu' && (
                <button
                  onClick={() => setExplodedView(!explodedView)}
                  className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-code transition-all ${
                    explodedView
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:text-white'
                  }`}
                  title="Explode Architectural Layers"
                >
                  {explodedView ? 'Compact' : 'Explode View'}
                </button>
              )}

              {/* Reset Camera */}
              <button
                onClick={handleResetCamera}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all"
                title="Reset Camera View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Three.js Canvas Mount */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Bottom Canvas Controls Help */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-code text-zinc-400 pointer-events-none">
            <span className="bg-zinc-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
              Drag to Rotate • Scroll to Zoom
            </span>
            <span className="bg-zinc-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
              60 FPS WebGL 2.0
            </span>
          </div>
        </div>

        {/* Right Column: Architectural Subsystems HUD */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-zinc-100">
              <span className="text-[10px] font-code text-indigo-600 uppercase font-bold tracking-wider">
                {currentInfo.course}
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                Subsystem Architecture
              </h3>
            </div>

            {/* Subsystem Selectable Cards */}
            <div className="space-y-2.5 mt-4">
              {currentInfo.subsystems.map((sub) => {
                const isSelected = selectedSubsystem?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400/80 shadow-xs ring-1 ring-indigo-400/20'
                        : 'bg-[#FAF9F6] border-zinc-200/80 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-zinc-800'}`}>
                        {sub.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      {sub.desc}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/90 border border-zinc-200/60 text-[10px] font-code text-zinc-700">
                      {sub.specs}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alliance University Exam Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 font-code">
            <strong>Core Concept & Architecture:</strong>
            <p className="mt-1 text-[11px] leading-relaxed">
              Questions frequently test cache coherence (MESI) and pipeline hazard stalls for this subsystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

