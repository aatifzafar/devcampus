import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Box, ChevronLeft, ChevronRight, CircleAlert, MousePointerClick, Pause, Play, Plug, RotateCcw, Trash2, WandSparkles } from 'lucide-react';
import { MODELS, findModel } from '../../data/featuresData';
import { Button, Card, Pill, inputClass, useStoredState } from '../pages/ui';

/* ================================================================== */
/* Scene renderer: draws any { objects, links } description in 3D       */
/* ================================================================== */

function geometryFor(shape, size) {
  switch (shape) {
    case 'box':
      return new THREE.BoxGeometry(size * 2, size * 0.9, size * 0.9);
    case 'cylinder':
      return new THREE.CylinderGeometry(size * 0.5, size * 0.5, size * 1.2, 32);
    case 'cone':
      return new THREE.ConeGeometry(size * 0.5, size, 32);
    case 'torus':
      return new THREE.TorusGeometry(size * 0.55, size * 0.16, 16, 48);
    default:
      return new THREE.SphereGeometry(size * 0.6, 32, 24);
  }
}
const radiusOf = (o) => (o.shape === 'box' ? o.size * 0.5 : o.size * 0.6);

function SceneView({ scene, focus, autoRotate, resetKey, onPick }) {
  const mount = useRef(null);
  const state = useRef({});

  // Build the scene whenever the model changes.
  useEffect(() => {
    const el = mount.current;
    const width = el.clientWidth;
    const height = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const labels = new CSS2DRenderer();
    labels.setSize(width, height);
    labels.domElement.style.position = 'absolute';
    labels.domElement.style.inset = '0';
    labels.domElement.style.pointerEvents = 'none';
    el.appendChild(labels.domElement);

    const three = new THREE.Scene();
    three.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(6, 10, 8);
    three.add(sun);
    const fill = new THREE.DirectionalLight(0xc4b5fd, 0.6);
    fill.position.set(-8, -4, -6);
    three.add(fill);

    const group = new THREE.Group();
    three.add(group);
    const meshes = {};
    const labelEls = {};
    scene.objects.forEach((o) => {
      const material = new THREE.MeshStandardMaterial({ color: o.color, roughness: 0.35, metalness: 0.1, transparent: true });
      const mesh = new THREE.Mesh(geometryFor(o.shape, o.size), material);
      mesh.position.set(...o.position);
      mesh.userData.id = o.id;
      group.add(mesh);
      meshes[o.id] = mesh;
      if (o.label) {
        const div = document.createElement('div');
        div.textContent = o.label;
        div.style.cssText = 'font: 600 12px Inter, system-ui, sans-serif; color:#18181B; background:rgba(255,255,255,.92); padding:2px 8px; border-radius:999px; border:1px solid #E4E4E7; white-space:nowrap; transition:opacity .25s';
        const label = new CSS2DObject(div);
        label.position.set(0, radiusOf(o) + 0.45, 0);
        mesh.add(label);
        labelEls[o.id] = div;
      }
    });

    const byId = Object.fromEntries(scene.objects.map((o) => [o.id, o]));
    const arrows = [];
    scene.links.forEach((l) => {
      const a = byId[l.from];
      const b = byId[l.to];
      const from = new THREE.Vector3(...a.position);
      const to = new THREE.Vector3(...b.position);
      const dir = to.clone().sub(from);
      const dist = dir.length();
      dir.normalize();
      const start = from.clone().add(dir.clone().multiplyScalar(radiusOf(a)));
      const length = Math.max(0.3, dist - radiusOf(a) - radiusOf(b));
      const arrow = new THREE.ArrowHelper(dir, start, length, 0x9ca3af, Math.min(0.45, length * 0.3), 0.22);
      arrow.userData = { from: l.from, to: l.to };
      group.add(arrow);
      arrows.push(arrow);
    });

    // Centre and frame the model.
    const box = new THREE.Box3().setFromObject(group);
    const centre = box.getCenter(new THREE.Vector3());
    group.position.sub(centre);
    const radius = Math.max(4, box.getSize(new THREE.Vector3()).length() / 2);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    const home = new THREE.Vector3(radius * 0.3, radius * 0.25, radius * 2.9);
    camera.position.copy(home);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotateSpeed = 1.2;
    controls.minDistance = radius * 0.6;
    controls.maxDistance = radius * 5;

    // Clicking an object shows what it is.
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt = null;
    const onDown = (e) => { downAt = [e.clientX, e.clientY]; };
    const onUp = (e) => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(Object.values(meshes))[0];
      state.current.onPick?.(hit ? hit.object.userData.id : null);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);

    let frame;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      Object.values(meshes).forEach((m) => {
        const target = m.userData.targetScale || 1;
        m.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      });
      renderer.render(three, camera);
      labels.render(three, camera);
    };
    loop();

    const resize = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labels.setSize(w, h);
    });
    resize.observe(el);

    state.current = { ...state.current, meshes, labelEls, arrows, controls, camera, home };

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      three.traverse((obj) => {
        obj.geometry?.dispose?.();
        obj.material?.dispose?.();
      });
      renderer.dispose();
      el.innerHTML = '';
    };
  }, [scene]);

  useEffect(() => {
    state.current.onPick = onPick;
  }, [onPick]);

  // Highlight the parts this step is about.
  useEffect(() => {
    const { meshes = {}, labelEls = {}, arrows = [] } = state.current;
    const set = new Set(focus || []);
    const any = set.size > 0;
    Object.entries(meshes).forEach(([id, m]) => {
      const on = !any || set.has(id);
      m.material.opacity = on ? 1 : 0.18;
      m.material.emissive = new THREE.Color(on && any ? m.material.color : 0x000000);
      m.material.emissiveIntensity = on && any ? 0.35 : 0;
      m.userData.targetScale = on && any ? 1.12 : 1;
      if (labelEls[id]) labelEls[id].style.opacity = on ? '1' : '0.25';
    });
    arrows.forEach((a) => {
      const on = !any || (set.has(a.userData.from) && set.has(a.userData.to));
      a.line.material.transparent = true;
      a.cone.material.transparent = true;
      a.line.material.opacity = on ? 1 : 0.15;
      a.cone.material.opacity = on ? 1 : 0.15;
    });
  }, [focus, scene]);

  useEffect(() => {
    if (state.current.controls) state.current.controls.autoRotate = autoRotate;
  }, [autoRotate, scene]);

  useEffect(() => {
    const { camera, controls, home } = state.current;
    if (!camera || !resetKey) return;
    camera.position.copy(home);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetKey]);

  return <div ref={mount} className="absolute inset-0 cursor-grab active:cursor-grabbing" />;
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export function ThreeDLearning() {
  const [mine, setMine] = useStoredState('alliance-3d-models', []);
  const [current, setCurrent] = useState(MODELS[0]);
  const [step, setStep] = useState(-1);
  const [picked, setPicked] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null); // { tone, text }
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/ai/status').then((r) => r.json()).then(setStatus).catch(() => setStatus({ connected: false, offline: true }));
  }, []);

  const open = (m) => {
    setCurrent(m);
    setStep(-1);
    setPicked(null);
    setAutoRotate(true);
  };

  const create = async (e) => {
    e.preventDefault();
    const t = topic.trim();
    if (!t || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch('/api/ai/scene', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: t }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not build the model. Try again.');
      if (data.scene) {
        const m = { ...data.scene, id: `ai-${Date.now()}`, subject: 'Made with AI', ai: true };
        setMine((l) => [m, ...l].slice(0, 12));
        open(m);
        setTopic('');
        setNote({ tone: 'green', text: `Built “${m.title}” with Claude.` });
      } else {
        const match = findModel(t);
        if (match) open(match);
        setNote({ tone: 'amber', text: match ? `Demo mode: showing the closest built-in model, “${match.title}”. Add an Anthropic API key to build a model of any topic.` : 'Demo mode: AI models need an Anthropic API key on the backend. Pick a built-in model meanwhile.' });
      }
    } catch (err) {
      const match = findModel(t);
      if (match) open(match);
      setNote({ tone: 'red', text: err instanceof TypeError ? 'Can’t reach the server. Start the backend to use AI models.' : err.message });
    } finally {
      setBusy(false);
    }
  };

  const steps = current.steps || [];
  const focus = picked ? [picked] : step >= 0 ? steps[step]?.focus : [];
  const pickedObj = current.objects.find((o) => o.id === picked);
  const go = (n) => {
    setPicked(null);
    setAutoRotate(false);
    setStep(n);
  };

  const Library = ({ title, list, removable }) => (
    <div>
      <p className="text-xs font-medium text-zinc-500 mb-2">{title}</p>
      <div className="space-y-1.5">
        {list.map((m) => (
          <div key={m.id} className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer ${current.id === m.id ? 'bg-[#F1EEFB]' : 'hover:bg-zinc-50'}`} onClick={() => open(m)}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.ai ? 'bg-[#6D3FC0] text-white' : 'bg-zinc-100 text-zinc-600'}`}>{m.ai ? <WandSparkles className="w-4 h-4" /> : <Box className="w-4 h-4" />}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm truncate ${current.id === m.id ? 'font-semibold text-[#4C2E8A]' : 'font-medium text-zinc-900'}`}>{m.title}</p>
              <p className="text-xs text-zinc-500 truncate">{m.subject}</p>
            </div>
            {removable && (
              <button onClick={(e) => { e.stopPropagation(); setMine((l) => l.filter((x) => x.id !== m.id)); if (current.id === m.id) open(MODELS[0]); }} className="text-zinc-300 hover:text-red-500 sm:opacity-0 group-hover:opacity-100" aria-label="Remove model">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid xl:grid-cols-[300px_1fr] gap-5">
      <div className="space-y-5 order-2 xl:order-1">
        <Card className="!p-4">
          <form onSubmit={create}>
            <p className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-2"><WandSparkles className="w-4 h-4 text-[#6D3FC0]" />Create with AI</p>
            <p className="text-xs text-zinc-500 mb-3">Describe any concept and Claude builds a 3D model with a guided walkthrough.</p>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} className={inputClass} placeholder="Heap insertion, paging in memory, a 4-bit adder…" />
            <Button variant="primary" type="submit" className="w-full mt-2" disabled={!topic.trim() || busy}>{busy ? 'Building your model…' : 'Build 3D model'}</Button>
            {status && !status.connected && (
              <p className="text-[11px] text-amber-800 mt-2 flex items-start gap-1"><Plug className="w-3 h-3 mt-0.5 shrink-0" />{status.offline ? 'Backend offline.' : 'No API key yet: demo mode uses built-in models.'}</p>
            )}
          </form>
        </Card>
        <Card className="!p-4 space-y-5">
          {mine.length > 0 && <Library title="Your models" list={mine} removable />}
          <Library title="Built-in models" list={MODELS} />
        </Card>
      </div>

      <div className="space-y-4 order-1 xl:order-2 min-w-0">
        {note && (
          <p className={`text-sm rounded-2xl px-4 py-3 flex items-start gap-2 ${note.tone === 'green' ? 'bg-emerald-50 text-emerald-800' : note.tone === 'amber' ? 'bg-amber-50 text-amber-900' : 'bg-red-50 text-red-700'}`}>
            <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />{note.text}
          </p>
        )}
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-start gap-3 px-5 pt-4 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-semibold text-zinc-900">{current.title}</h2>
                {current.ai && <Pill tone="violet"><WandSparkles className="w-3 h-3" />AI</Pill>}
              </div>
              <p className="text-sm text-zinc-500">{current.summary}</p>
            </div>
            <div className="ml-auto flex gap-1.5 shrink-0">
              <button onClick={() => setAutoRotate((r) => !r)} className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50" aria-label={autoRotate ? 'Stop rotating' : 'Rotate'} title={autoRotate ? 'Stop rotating' : 'Rotate'}>
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => { setResetKey((k) => k + 1); setStep(-1); setPicked(null); }} className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50" aria-label="Reset view" title="Reset view">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative h-[420px] sm:h-[480px] bg-gradient-to-b from-[#FAFAF9] to-[#F1EEFB]">
            <SceneView scene={current} focus={focus} autoRotate={autoRotate} resetKey={resetKey} onPick={setPicked} />
            <p className="absolute bottom-3 left-4 text-xs text-zinc-500 flex items-center gap-1.5 pointer-events-none"><MousePointerClick className="w-3.5 h-3.5" />Drag to rotate · scroll to zoom · click a part</p>
            {pickedObj && (
              <div className="absolute top-3 right-3 max-w-xs bg-white/95 rounded-2xl border border-zinc-200 shadow-sm p-4">
                <p className="font-semibold text-zinc-900 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: pickedObj.color }} />{pickedObj.label}</p>
                {pickedObj.info && <p className="text-sm text-zinc-600 mt-1">{pickedObj.info}</p>}
              </div>
            )}
          </div>
        </Card>

        {steps.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm font-semibold text-zinc-900">{step < 0 ? 'Guided walkthrough' : `Step ${step + 1} of ${steps.length}: ${steps[step].title}`}</p>
              <div className="ml-auto flex gap-1.5">
                {steps.map((s, i) => <button key={i} onClick={() => go(i)} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-[#6D3FC0]' : 'w-2 bg-zinc-200 hover:bg-zinc-300'}`} aria-label={`Step ${i + 1}`} />)}
              </div>
            </div>
            <p className="text-[15px] text-zinc-700 mb-4 min-h-[3rem]">{step < 0 ? 'Walk through the model one idea at a time. Each step highlights the parts it talks about.' : steps[step].text}</p>
            <div className="flex justify-between">
              <Button disabled={step <= 0} onClick={() => go(step - 1)}><ChevronLeft className="w-4 h-4" />Back</Button>
              {step < steps.length - 1 ? (
                <Button variant="primary" onClick={() => go(step + 1)}>{step < 0 ? 'Start walkthrough' : 'Next'}<ChevronRight className="w-4 h-4" /></Button>
              ) : (
                <Button onClick={() => { setStep(-1); setAutoRotate(true); }}>Show whole model</Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
