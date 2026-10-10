import { ReactNode, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HERO_NODES } from '../data/content';

// 3D vascular core for the hero. Built from the ui-ux-pro-max threejs guidelines:
// explicit disposal, Points for particles, capped pixel ratio, pointer + touch input,
// pause when off-screen, and a static final frame under prefers-reduced-motion.
// Falls back to the 2D diagram passed in `fallback` when WebGL is unavailable.

type Palette = {
  core: number;
  coreEmissive: number;
  wire: number;
  tube: number;
  particle: number;
  node: number;
  ring: number;
  stars: number;
};

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: { core: 0x2563eb, coreEmissive: 0x1d4ed8, wire: 0x60a5fa, tube: 0x2dd4bf, particle: 0xa5f3fc, node: 0x2dd4bf, ring: 0x475569, stars: 0x94a3b8 },
  light: { core: 0x2563eb, coreEmissive: 0x1d4ed8, wire: 0x1d4ed8, tube: 0x0d9488, particle: 0x0f766e, node: 0x0d9488, ring: 0x94a3b8, stars: 0x64748b },
};

// Terminal node positions in scene units; the core sits at the origin.
const LAYOUT: Record<string, { pos: [number, number, number]; target: string; kind: string }> = {
  content: { pos: [-2.3, 1.15, 0.5], target: '#pillars', kind: 'CONTENT' },
  commerce: { pos: [2.3, 1.05, -0.3], target: '#pillars', kind: 'COMMERCE' },
  support: { pos: [-2.1, -1.25, -0.6], target: '#chat', kind: 'SUPPORT' },
  telegram: { pos: [2.2, -1.15, 0.8], target: '#workspaces', kind: 'TELEGRAM' },
};

const NODES = HERO_NODES.map((n) => ({ id: n.id, label: n.label, ...LAYOUT[n.id] }));
const PARTICLES_PER_CURVE = 14;

function currentTheme(): 'dark' | 'light' {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

type Props = { fallback: ReactNode };

export function Vascular3D({ fallback }: Props) {
  const [mode, setMode] = useState<'init' | '3d' | 'fallback'>('init');
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    setMode(supportsWebGL() ? '3d' : 'fallback');
  }, []);

  useEffect(() => {
    if (mode !== '3d') return;
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = host.clientWidth || 480;
    let height = host.clientHeight || 480;

    // Renderer and canvas
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    renderer.domElement.className = 'v3d__canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.insertBefore(renderer.domElement, host.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 0, 8.6);
    const root = new THREE.Group();
    scene.add(root);

    let pal = PALETTES[currentTheme()];

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.PointLight(0x60a5fa, 1.4, 20);
    key.position.set(3, 3, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x2dd4bf, 1.0, 20);
    rim.position.set(-4, -2, 3);
    scene.add(rim);

    // Core: glowing sphere + rotating wireframe + hexagonal ring (matches the logo hexagon)
    const coreMat = new THREE.MeshStandardMaterial({
      color: pal.core,
      emissive: pal.coreEmissive,
      emissiveIntensity: 0.55,
      metalness: 0.35,
      roughness: 0.25,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 40), coreMat);
    root.add(core);

    const wireMat = new THREE.MeshBasicMaterial({ color: pal.wire, wireframe: true, transparent: true, opacity: 0.32 });
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), wireMat);
    root.add(wire);

    const hexMat = new THREE.MeshBasicMaterial({ color: pal.ring, transparent: true, opacity: 0.85 });
    const hex = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.012, 8, 6), hexMat);
    hex.rotation.z = Math.PI / 6;
    root.add(hex);

    // Terminal nodes with glow halos
    const glowTex = makeGlowTexture();
    const haloMats: THREE.SpriteMaterial[] = [];
    const nodeMats: THREE.MeshStandardMaterial[] = [];
    const nodes: THREE.Mesh[] = NODES.map((n) => {
      const mat = new THREE.MeshStandardMaterial({
        color: pal.node,
        emissive: pal.node,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.2,
      });
      nodeMats.push(mat);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), mat);
      mesh.position.set(...n.pos);
      mesh.userData.id = n.id;
      const haloMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: pal.node,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      haloMats.push(haloMat);
      const halo = new THREE.Sprite(haloMat);
      halo.scale.set(0.9, 0.9, 1);
      mesh.add(halo);
      root.add(mesh);
      return mesh;
    });

    // Vascular tubes from the core to each node, plus flowing particles along them
    const curves = NODES.map((n, i) => {
      const end = new THREE.Vector3(...n.pos);
      const start = end.clone().normalize().multiplyScalar(0.55);
      const mid = end
        .clone()
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(Math.sin(i * 2.1) * 0.5, Math.cos(i * 1.7) * 0.5, Math.sin(i * 0.9) * 0.4));
      return new THREE.CatmullRomCurve3([start, mid, end]);
    });

    const tubeMats: THREE.MeshBasicMaterial[] = [];
    curves.forEach((c) => {
      const mat = new THREE.MeshBasicMaterial({ color: pal.tube, transparent: true, opacity: 0.35 });
      tubeMats.push(mat);
      root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, 0.025, 8, false), mat));
    });

    const particleCount = curves.length * PARTICLES_PER_CURVE;
    const particlePositions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) phases[i] = (i % PARTICLES_PER_CURVE) / PARTICLES_PER_CURVE;
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: pal.particle,
      size: 0.085,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    root.add(new THREE.Points(particleGeo, particleMat));

    // Background starfield (instanced as Points, one draw call)
    const starCount = 260;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPositions[i] = (Math.random() - 0.5) * 16;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: pal.stars, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false });
    scene.add(new THREE.Points(starGeo, starMat));

    // Picking (mouse and touch via pointer events)
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pointer = { x: 0, y: 0 };
    let hovered: THREE.Object3D | null = null;

    const setNdc = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      pointer.x = ndc.x;
      pointer.y = ndc.y;
    };
    const pick = (): number => {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(nodes, false)[0];
      return hit ? nodes.indexOf(hit.object as THREE.Mesh) : -1;
    };

    const renderOnce = () => {
      renderer.render(scene, camera);
      placeLabels();
    };

    const onMove = (e: PointerEvent) => {
      setNdc(e);
      const idx = pick();
      hovered = idx >= 0 ? nodes[idx] : null;
      host.style.cursor = hovered ? 'pointer' : '';
      if (reduceMotion) renderOnce();
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      hovered = null;
      host.style.cursor = '';
      if (reduceMotion) renderOnce();
    };
    const onDown = (e: PointerEvent) => {
      setNdc(e);
      const idx = pick();
      if (idx >= 0) {
        const target = LAYOUT[NODES[idx].id].target;
        document.querySelector(target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);

    // Labels follow projected node positions
    const v = new THREE.Vector3();
    const targets: THREE.Object3D[] = [...nodes, core];
    function placeLabels() {
      targets.forEach((obj, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        v.setFromMatrixPosition(obj.matrixWorld).project(camera);
        // Keep labels inside the frame: clamp the projected centre by half the label size.
        const hw = el.offsetWidth / 2 + 6;
        const hh = el.offsetHeight / 2 + 6;
        const x = Math.min(width - hw, Math.max(hw, (v.x * 0.5 + 0.5) * width));
        const y = Math.min(height - hh, Math.max(hh, (-v.y * 0.5 + 0.5) * height));
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        el.style.opacity = v.z < 1 ? '1' : '0';
      });
    }

    // Animation loop (skipped entirely under reduced motion)
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const scaleTarget = new THREE.Vector3();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();

      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.05;
      camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      root.rotation.y = t * 0.12;
      core.rotation.y = t * 0.4;
      wire.rotation.x = t * 0.25;
      wire.rotation.y = -t * 0.35;
      hex.rotation.z = Math.PI / 6 + t * 0.05;

      nodes.forEach((m) => {
        const s = m === hovered ? 1.5 : 1;
        scaleTarget.set(s, s, s);
        m.scale.lerp(scaleTarget, 0.15);
      });

      for (let i = 0; i < particleCount; i++) {
        const ci = Math.floor(i / PARTICLES_PER_CURVE);
        const u = (phases[i] + t * (0.12 + (ci % 2) * 0.05)) % 1;
        const p = curves[ci].getPointAt(u);
        particlePositions[i * 3] = p.x;
        particlePositions[i * 3 + 1] = p.y;
        particlePositions[i * 3 + 2] = p.z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      placeLabels();
    };

    if (reduceMotion) {
      // Static final frame: particles placed at their resting positions, no loop.
      for (let i = 0; i < particleCount; i++) {
        const ci = Math.floor(i / PARTICLES_PER_CURVE);
        const p = curves[ci].getPointAt((phases[i] + 0.3) % 1);
        particlePositions[i * 3] = p.x;
        particlePositions[i * 3 + 1] = p.y;
        particlePositions[i * 3 + 2] = p.z;
      }
      particleGeo.attributes.position.needsUpdate = true;
      renderOnce();
    } else {
      tick();
    }

    // Lifecycle observers
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      width = host.clientWidth || width;
      height = host.clientHeight || height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reduceMotion) renderOnce();
    });
    ro.observe(host);

    const mo = new MutationObserver(() => {
      pal = PALETTES[currentTheme()];
      coreMat.color.setHex(pal.core);
      coreMat.emissive.setHex(pal.coreEmissive);
      wireMat.color.setHex(pal.wire);
      hexMat.color.setHex(pal.ring);
      tubeMats.forEach((m) => m.color.setHex(pal.tube));
      particleMat.color.setHex(pal.particle);
      nodeMats.forEach((m) => {
        m.color.setHex(pal.node);
        m.emissive.setHex(pal.node);
      });
      haloMats.forEach((m) => m.color.setHex(pal.node));
      starMat.color.setHex(pal.stars);
      if (reduceMotion) renderOnce();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
      scene.traverse((obj) => {
        const holder = obj as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        holder.geometry?.dispose();
        const mats = Array.isArray(holder.material) ? holder.material : holder.material ? [holder.material] : [];
        mats.forEach((m) => {
          const withMap = m as THREE.Material & { map?: THREE.Texture | null };
          withMap.map?.dispose();
          m.dispose();
        });
      });
      glowTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.style.cursor = '';
    };
  }, [mode]);

  const scrollTo = (selector: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector(selector)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  if (mode === 'fallback') return <>{fallback}</>;

  return (
    <figure className="vascular vascular--3d" aria-labelledby="v3d-caption">
      <div className="v3d" ref={hostRef} style={{ position: 'relative' }}>
        {NODES.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className="v3d__label"
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            onClick={() => scrollTo(LAYOUT[n.id].target)}
            aria-label={`${n.label}: رفتن به بخش مربوط`}
          >
            {n.label}
            <small>{n.kind}</small>
          </button>
        ))}
        <div
          className="v3d__label v3d__label--core"
          ref={(el) => {
            labelRefs.current[NODES.length] = el;
          }}
          aria-hidden="true"
        >
          AvandWP Core
        </div>
      </div>
      <figcaption id="v3d-caption" className="vascular__caption">
        هسته‌ی سه‌بعدی AvandWP؛ روی هر گره کلیک کنید تا به بخش مربوط بروید. در صورت نبود WebGL، نمای دوبعدی نمایش داده می‌شود.
      </figcaption>
    </figure>
  );
}
