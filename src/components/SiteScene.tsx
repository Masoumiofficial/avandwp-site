import { useEffect } from 'react';
import * as THREE from 'three';

// Site-wide 3D backdrop. Fixed behind all content (z-index -1), non-interactive, and decorative.
// Scroll moves the camera through a perspective grid and a field of wireframe shapes; the pointer
// adds slight parallax. Under prefers-reduced-motion it renders one static frame and does not animate.
// Disposes every geometry, material, and the renderer on unmount. Without WebGL it renders nothing,
// and the CSS background still provides the page colour.

type Theme = 'dark' | 'light';

const PALETTES: Record<
  Theme,
  { bg: number; grid: number; shapes: number[]; particle: number; gridOpacity: number; shapeOpacity: number; particleOpacity: number }
> = {
  dark: {
    bg: 0x0b1120,
    grid: 0x1e40af,
    shapes: [0x2563eb, 0x2dd4bf, 0x60a5fa, 0x0d9488, 0x3b82f6, 0x14b8a6],
    particle: 0x93c5fd,
    gridOpacity: 0.32,
    shapeOpacity: 0.38,
    particleOpacity: 0.7,
  },
  light: {
    bg: 0xeef4fb,
    grid: 0x64748b,
    shapes: [0x2563eb, 0x0d9488, 0x3b82f6, 0x0f766e, 0x1d4ed8, 0x14b8a6],
    particle: 0x2563eb,
    gridOpacity: 0.22,
    shapeOpacity: 0.3,
    particleOpacity: 0.55,
  },
};

const SHAPES: { geo: () => THREE.BufferGeometry; pos: [number, number, number]; scale: number }[] = [
  { geo: () => new THREE.IcosahedronGeometry(1, 0), pos: [-5.4, 1.8, -6], scale: 1.1 },
  { geo: () => new THREE.OctahedronGeometry(1, 0), pos: [5.6, -0.6, -9], scale: 1.4 },
  { geo: () => new THREE.TorusKnotGeometry(0.7, 0.2, 90, 12), pos: [4.4, 3.4, -14], scale: 1.0 },
  { geo: () => new THREE.TetrahedronGeometry(1, 0), pos: [-6.4, -2.6, -11], scale: 1.3 },
  { geo: () => new THREE.IcosahedronGeometry(1, 1), pos: [0.4, 4.0, -19], scale: 2.2 },
  { geo: () => new THREE.OctahedronGeometry(1, 0), pos: [-1.8, -3.6, -5], scale: 0.8 },
];

function currentTheme(): Theme {
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

// Line-segment grid on the XZ plane, centred on the origin.
function buildGrid(size: number, divisions: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const half = size / 2;
  const step = size / divisions;
  for (let i = 0; i <= divisions; i++) {
    const p = -half + i * step;
    pts.push(-half, 0, p, half, 0, p);
    pts.push(p, 0, -half, p, 0, half);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

export function SiteScene() {
  useEffect(() => {
    if (!supportsWebGL()) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth < 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const canvas = renderer.domElement;
    canvas.className = 'site-scene';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let pal = PALETTES[currentTheme()];
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(pal.bg, 0.045);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 7);

    // Perspective floor grid
    const gridMat = new THREE.LineBasicMaterial({ color: pal.grid, transparent: true, opacity: pal.gridOpacity });
    const grid = new THREE.LineSegments(buildGrid(60, 30), gridMat);
    grid.position.y = -3.4;
    scene.add(grid);

    // Wireframe shapes
    const shapeMats: THREE.MeshBasicMaterial[] = [];
    const shapes = SHAPES.map((spec, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: pal.shapes[i % pal.shapes.length],
        wireframe: true,
        transparent: true,
        opacity: pal.shapeOpacity,
        depthWrite: false,
      });
      shapeMats.push(mat);
      const mesh = new THREE.Mesh(spec.geo(), mat);
      mesh.position.set(...spec.pos);
      mesh.scale.setScalar(spec.scale);
      mesh.userData.phase = i * 1.3;
      scene.add(mesh);
      return mesh;
    });

    // Drifting particle field
    const count = mobile ? 160 : 380;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = -22 + Math.random() * 26;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: pal.particle,
      size: 0.05,
      transparent: true,
      opacity: pal.particleOpacity,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Scroll and pointer state
    let progress = 0;
    let px = 0;
    let py = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const applyFrame = (t: number) => {
      const p = reduceMotion ? 0 : progress;
      // Scroll flies the camera forward; the pointer nudges it sideways.
      camera.position.z = 7 - p * 5;
      camera.position.x += ((reduceMotion ? 0 : px * 0.6) - camera.position.x) * 0.04;
      camera.position.y += ((reduceMotion ? 0.6 : 0.6 - py * 0.3) - camera.position.y) * 0.04;
      camera.lookAt(0, 0, -4);

      shapes.forEach((m, i) => {
        const ph = m.userData.phase as number;
        m.rotation.x = t * 0.12 + ph;
        m.rotation.y = t * 0.18 + ph * 0.5;
        if (!reduceMotion) m.position.y = SHAPES[i].pos[1] + Math.sin(t * 0.4 + ph) * 0.25;
      });
      particles.rotation.y = reduceMotion ? 0 : t * 0.015;
      particles.position.z = reduceMotion ? 0 : p * 2;
      renderer.render(scene, camera);
    };

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      applyFrame(clock.getElapsedTime());
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      onScroll();
      if (reduceMotion) applyFrame(0);
    };

    const mo = new MutationObserver(() => {
      pal = PALETTES[currentTheme()];
      scene.fog = new THREE.FogExp2(pal.bg, 0.045);
      gridMat.color.setHex(pal.grid);
      gridMat.opacity = pal.gridOpacity;
      shapeMats.forEach((m, i) => {
        m.color.setHex(pal.shapes[i % pal.shapes.length]);
        m.opacity = pal.shapeOpacity;
      });
      particleMat.color.setHex(pal.particle);
      particleMat.opacity = pal.particleOpacity;
      if (reduceMotion) applyFrame(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    onScroll();
    if (reduceMotion) {
      applyFrame(0);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointer, { passive: true });
      loop();
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        const holder = obj as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        holder.geometry?.dispose();
        const mats = Array.isArray(holder.material) ? holder.material : holder.material ? [holder.material] : [];
        mats.forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return null;
}
