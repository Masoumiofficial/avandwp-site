import { useEffect } from 'react';
import * as THREE from 'three';

// Site-wide 3D backdrop. Fixed behind all content (z-index -1), non-interactive, decorative.
// Each section carries a data-scene tag. The scene keeps one group per topic and cross-fades
// the group of the section currently under the reading line, so the background changes
// smoothly as the visitor scrolls. Under prefers-reduced-motion the change is instant and
// nothing animates. Every geometry and material is disposed on unmount.

type Theme = 'dark' | 'light';
type Key = 'a' | 'b';
type Mat = THREE.LineBasicMaterial | THREE.MeshBasicMaterial;
type Slot = { mat: Mat; key: Key; base: number };
type BuildCtx = { mobile: boolean; col: (k: Key) => number };
type Built = { group: THREE.Group; slots: Slot[]; anim: (t: number) => void };
type Preset = { pal: Record<Theme, [number, number]>; build: (ctx: BuildCtx) => Built };

function geoFrom(pos: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function gridSegments(size: number, divisions: number): number[] {
  const pts: number[] = [];
  const half = size / 2;
  const step = size / divisions;
  for (let i = 0; i <= divisions; i++) {
    const p = -half + i * step;
    pts.push(-half, 0, p, half, 0, p, p, 0, -half, p, 0, half);
  }
  return pts;
}

// Small helper: tracks every material with its key colour and base opacity.
function makeBuilder(ctx: BuildCtx) {
  const group = new THREE.Group();
  const slots: Slot[] = [];
  const add = <M extends Mat>(m: M, key: Key, base: number): M => {
    m.color.setHex(ctx.col(key));
    m.opacity = base;
    m.transparent = true;
    m.depthWrite = false;
    slots.push({ mat: m, key, base });
    return m;
  };
  const line = (geo: THREE.BufferGeometry, key: Key, base: number) => {
    const l = new THREE.LineSegments(geo, add(new THREE.LineBasicMaterial(), key, base));
    group.add(l);
    return l;
  };
  const edges = (geo: THREE.BufferGeometry, key: Key, base: number) => {
    const eg = new THREE.EdgesGeometry(geo);
    geo.dispose();
    return line(eg, key, base);
  };
  const solid = (geo: THREE.BufferGeometry, key: Key, base: number, wire = false) => {
    const m = new THREE.Mesh(geo, add(new THREE.MeshBasicMaterial({ wireframe: wire }), key, base));
    group.add(m);
    return m;
  };
  return { group, slots, add, line, edges, solid };
}

// ---- Scene builders (one per topic) ----

// Energy burst: radiating rays and a ring. Used for the hero and the final call to action.
function buildBurst(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const pos: number[] = [];
  const n = ctx.mobile ? 22 : 36;
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const r1 = 1.1;
    const r2 = 1.6 + Math.random() * 2.6;
    pos.push(v.x * r1, v.y * r1, v.z * r1, v.x * r2, v.y * r2, v.z * r2);
  }
  const rays = b.line(geoFrom(pos), 'a', 0.55);
  const ring = b.solid(new THREE.TorusGeometry(1.1, 0.012, 6, 120), 'b', 0.5);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.z = t * 0.05;
      rays.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04);
      ring.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    },
  };
}

// Vascular network: a wireframe core with linked nodes. Used for the brand story and the footer.
function buildNetwork(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  b.solid(new THREE.IcosahedronGeometry(0.75, 1), 'a', 0.5, true);
  const N = ctx.mobile ? 6 : 9;
  const npos: THREE.Vector3[] = [];
  const nodes: THREE.Mesh[] = [];
  for (let i = 0; i < N; i++) {
    const a = i * 2.4;
    const y = -1.4 + 2.8 * (i / (N - 1));
    const r = Math.sqrt(Math.max(0, 2.4 * 2.4 - y * y));
    const p = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    npos.push(p);
    const m = b.solid(new THREE.SphereGeometry(0.09, 12, 10), 'b', 0.9);
    m.position.copy(p);
    nodes.push(m);
  }
  const seg: number[] = [];
  npos.forEach((p) => seg.push(0, 0, 0, p.x, p.y, p.z));
  npos.forEach((p, i) => {
    const q = npos[(i + 2) % N];
    seg.push(p.x, p.y, p.z, q.x, q.y, q.z);
  });
  b.line(geoFrom(seg), 'b', 0.35);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.y = t * 0.12;
      nodes.forEach((m, i) => m.scale.setScalar(1 + 0.25 * Math.sin(t * 2 + i) ** 2));
    },
  };
}

// Workflow pipeline: cubes travelling along a rail. Used for the simulator.
function buildPipeline(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  b.line(geoFrom([-7, -0.9, 0, 7, -0.9, 0, -7, -1.6, 0, 7, -1.6, 0]), 'b', 0.4);
  const N = ctx.mobile ? 6 : 10;
  const cubes: THREE.LineSegments[] = [];
  const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6));
  for (let i = 0; i < N; i++) {
    const c = new THREE.LineSegments(eg, b.add(new THREE.LineBasicMaterial(), 'a', 0.75));
    b.group.add(c);
    cubes.push(c);
  }
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      cubes.forEach((c, i) => {
        const x = ((i * (14 / N) + t * 0.9) % 14) - 7;
        c.position.set(x, -0.6, 0);
        c.rotation.y = t * 0.6 + i;
      });
    },
  };
}

// Conversation: floating message spheres with links. Used for the chat and the FAQ.
function buildBubbles(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const N = ctx.mobile ? 8 : 14;
  const pts: THREE.Vector3[] = [];
  const spheres: THREE.Mesh[] = [];
  for (let i = 0; i < N; i++) {
    const p = new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
    pts.push(p);
    const m = b.solid(new THREE.SphereGeometry(0.16, 12, 10), 'a', 0.35);
    m.position.copy(p);
    spheres.push(m);
  }
  const seg: number[] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      if (pts[i].distanceTo(pts[j]) < 3) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
  b.line(geoFrom(seg), 'b', 0.3);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.y = Math.sin(t * 0.2) * 0.4;
      b.group.position.y = Math.sin(t * 0.3) * 0.15;
      spheres.forEach((m, i) => m.scale.setScalar(1 + 0.2 * Math.sin(t * 1.5 + i)));
    },
  };
}

// Path: a winding route with waypoints and a travelling marker. Used for setup steps.
function buildPath(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const curve = new THREE.CatmullRomCurve3(
    [
      [-4.5, -1.4, 0.2],
      [-2.6, 0.9, -0.4],
      [-0.6, -0.8, 0.6],
      [1.2, 1.4, -0.2],
      [2.8, -0.6, 0.5],
      [4.6, 0.6, -0.3],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const pts = curve.getPoints(160);
  const seg: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
  b.line(geoFrom(seg), 'a', 0.6);
  const W = ctx.mobile ? 4 : 6;
  for (let i = 0; i < W; i++) {
    const m = b.solid(new THREE.SphereGeometry(0.08, 10, 8), 'b', 0.9);
    m.position.copy(curve.getPointAt(i / (W - 1)));
  }
  const marker = b.solid(new THREE.SphereGeometry(0.14, 12, 10), 'b', 1);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => marker.position.copy(curve.getPointAt((t * 0.06) % 1)),
  };
}

// Towers: columns of different heights above a floor grid. Used for the pillars.
function buildTowers(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  b.line(geoFrom(gridSegments(12, 12).map((v, i) => (i % 3 === 1 ? v - 1.2 : v))), 'b', 0.35);
  const heights = [2.2, 3.2, 2.6, 3.8];
  const cols = heights.map((h, i) => {
    const c = b.edges(new THREE.BoxGeometry(0.9, 1, 0.9), 'a', 0.7);
    c.position.set(-3 + i * 2, -1.2 + h / 2, 0);
    c.scale.y = h;
    return c;
  });
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.y = Math.sin(t * 0.3) * 0.25;
      cols.forEach((c, i) => {
        c.scale.y = heights[i] * (1 + 0.02 * Math.sin(t * 1.5 + i));
      });
    },
  };
}

// Panels: stacked workspace windows with a small bar chart. Used for the workspaces.
function buildPanels(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const specs: [number, number, number, number][] = [
    [-2.6, 0.8, 0.2, 0.35],
    [1.6, 1.3, -0.6, -0.3],
    [-0.4, -1.2, 0.8, 0.25],
    [3.2, -1.1, -0.3, -0.35],
  ];
  const panels: THREE.Group[] = [];
  const bars: THREE.LineSegments[] = [];
  specs.forEach(([x, y, z, ry], i) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    b.group.add(g);
    const plane = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.6, 1.6)),
      b.add(new THREE.LineBasicMaterial(), 'a', 0.6),
    );
    g.add(plane);
    if (i === 0) {
      for (let k = 0; k < 4; k++) {
        const bar = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.22, 1, 0.04)),
          b.add(new THREE.LineBasicMaterial(), 'b', 0.7),
        );
        bar.position.set(-0.8 + k * 0.5, -0.5, 0.05);
        g.add(bar);
        bars.push(bar);
      }
    }
    panels.push(g);
  });
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      panels.forEach((g, i) => {
        g.rotation.y = specs[i][3] + Math.sin(t * 0.4 + i) * 0.12;
      });
      bars.forEach((bar, k) => {
        const s = 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + k));
        bar.scale.y = s;
        bar.position.y = -0.5 + s / 2;
      });
    },
  };
}

// Lattice: a grid of rotating crystal cells. Used for the security section.
function buildLattice(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const nx = ctx.mobile ? 3 : 4;
  const ny = ctx.mobile ? 2 : 3;
  const cells: { m: THREE.LineSegments; x: number; y: number }[] = [];
  const gap = 1.5;
  const ox = ((nx - 1) * gap) / 2;
  const oy = ((ny - 1) * gap) / 2;
  for (let iy = 0; iy < ny; iy++)
    for (let ix = 0; ix < nx; ix++) {
      const x = ix * gap - ox;
      const y = iy * gap - oy;
      const m = b.edges(new THREE.OctahedronGeometry(0.42), 'a', 0.6);
      m.position.set(x, y, 0);
      cells.push({ m, x, y });
    }
  const seg: number[] = [];
  cells.forEach((c) => {
    cells.forEach((d) => {
      const dx = Math.abs(c.x - d.x);
      const dy = Math.abs(c.y - d.y);
      if ((dx < gap + 0.01 && dy < 0.01) || (dy < gap + 0.01 && dx < 0.01)) seg.push(c.x, c.y, 0, d.x, d.y, 0);
    });
  });
  b.line(geoFrom(seg), 'b', 0.3);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      cells.forEach((c, i) => {
        c.m.rotation.y = t * 0.4 + i * 0.3;
        c.m.rotation.x = t * 0.2;
      });
    },
  };
}

// Growth: a helix of nodes rising upward with a base ring. Used for the ROI calculator.
function buildGrowth(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const N = ctx.mobile ? 16 : 26;
  const pts: THREE.Vector3[] = [];
  const spheres: THREE.Mesh[] = [];
  for (let i = 0; i < N; i++) {
    const p = new THREE.Vector3(Math.cos(i * 0.45) * 2.3, -2.4 + i * 0.2, Math.sin(i * 0.45) * 2.3);
    pts.push(p);
    const m = b.solid(new THREE.SphereGeometry(0.07, 8, 8), 'b', 0.85);
    m.position.copy(p);
    spheres.push(m);
  }
  const seg: number[] = [];
  for (let i = 0; i < N - 1; i++) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
  b.line(geoFrom(seg), 'a', 0.5);
  const base = b.solid(new THREE.TorusGeometry(2.3, 0.01, 6, 96), 'a', 0.35);
  base.rotation.x = Math.PI / 2;
  base.position.y = -2.6;
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.y = t * 0.18;
      spheres.forEach((m, i) => m.scale.setScalar(1 + 0.4 * Math.sin(t * 2 + i * 0.3) ** 2));
    },
  };
}

// Tiers: stacked rings, one per pricing tier. Used for the pricing and the comparison sections.
function buildTiers(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const specs: [number, number][] = [
    [-1.1, 1.4],
    [0, 2.1],
    [1.1, 2.8],
  ];
  const rings = specs.map(([y, r], i) => {
    const m = b.solid(new THREE.TorusGeometry(r, 0.014, 6, 140), i === 1 ? 'b' : 'a', 0.6);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    return m;
  });
  b.line(geoFrom([0, -1.1, 0, 0, 1.1, 0]), 'b', 0.3);
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      b.group.rotation.y = t * 0.1;
      rings.forEach((r, i) => {
        r.position.y = specs[i][0] + Math.sin(t * 0.6 + i) * 0.08;
      });
    },
  };
}

// Orbit: tilted rings with a node travelling on each. Used for the roadmap and the footer.
function buildOrbit(ctx: BuildCtx): Built {
  const b = makeBuilder(ctx);
  const spinners: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const tilt = new THREE.Group();
    tilt.rotation.set(0.9 * i * 0.6, 0.4 * i, 0.3 * i);
    const spin = new THREE.Group();
    const r = 2.2 + 0.5 * i;
    spin.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 120), b.add(new THREE.MeshBasicMaterial(), 'a', 0.5)));
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), b.add(new THREE.MeshBasicMaterial(), 'b', 0.9));
    node.position.set(r, 0, 0);
    spin.add(node);
    tilt.add(spin);
    b.group.add(tilt);
    spinners.push(spin);
  }
  return {
    group: b.group,
    slots: b.slots,
    anim: (t) => {
      spinners.forEach((s, i) => {
        s.rotation.z = t * (0.15 + 0.07 * i);
      });
    },
  };
}

const PRESETS: Record<string, Preset> = {
  burst: { pal: { dark: [0x60a5fa, 0x2dd4bf], light: [0x2563eb, 0x0d9488] }, build: buildBurst },
  network: { pal: { dark: [0x2dd4bf, 0x60a5fa], light: [0x0d9488, 0x2563eb] }, build: buildNetwork },
  pipeline: { pal: { dark: [0x38bdf8, 0x2dd4bf], light: [0x0284c7, 0x0d9488] }, build: buildPipeline },
  bubbles: { pal: { dark: [0xa78bfa, 0x60a5fa], light: [0x7c3aed, 0x2563eb] }, build: buildBubbles },
  path: { pal: { dark: [0x2dd4bf, 0xe0f2fe], light: [0x0d9488, 0x1e3a8a] }, build: buildPath },
  towers: { pal: { dark: [0x3b82f6, 0x64748b], light: [0x1d4ed8, 0x475569] }, build: buildTowers },
  panels: { pal: { dark: [0x2dd4bf, 0x3b82f6], light: [0x0f766e, 0x1d4ed8] }, build: buildPanels },
  lattice: { pal: { dark: [0x34d399, 0x0d9488], light: [0x047857, 0x0f766e] }, build: buildLattice },
  growth: { pal: { dark: [0xfbbf24, 0x2dd4bf], light: [0xb45309, 0x0f766e] }, build: buildGrowth },
  tiers: { pal: { dark: [0x818cf8, 0x60a5fa], light: [0x4338ca, 0x2563eb] }, build: buildTiers },
  orbit: { pal: { dark: [0x60a5fa, 0x94a3b8], light: [0x2563eb, 0x475569] }, build: buildOrbit },
};

const BG: Record<Theme, number> = { dark: 0x0b1120, light: 0xeef4fb };
const GRID: Record<Theme, number> = { dark: 0x1e40af, light: 0x64748b };
const GRID_OPACITY: Record<Theme, number> = { dark: 0.22, light: 0.18 };

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

type Entry = { id: string; preset: Preset; built: Built; weight: number };

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

    let theme = currentTheme();
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(BG[theme], 0.045);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 7);

    // Shared perspective floor
    const gridMat = new THREE.LineBasicMaterial({ color: GRID[theme], transparent: true, opacity: GRID_OPACITY[theme] });
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridSegments(60, 30), 3));
    const grid = new THREE.LineSegments(gridGeo, gridMat);
    grid.position.y = -3.4;
    scene.add(grid);

    // One group per topic. Only the active one (plus the one fading out) is visible.
    const entries: Entry[] = Object.entries(PRESETS).map(([id, preset]) => {
      const built = preset.build({ mobile, col: (k) => preset.pal[theme][k === 'a' ? 0 : 1] });
      built.group.position.set(0, 0.2, -7);
      built.group.visible = false;
      scene.add(built.group);
      return { id, preset, built, weight: 0 };
    });

    let activeId = 'burst';
    const computeActive = () => {
      const probe = window.innerHeight * 0.45;
      let found: string | null = null;
      document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe && el.dataset.scene && PRESETS[el.dataset.scene]) found = el.dataset.scene;
      });
      if (found) activeId = found;
    };

    let progress = 0;
    let px = 0;
    let py = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const before = activeId;
      computeActive();
      if (reduceMotion && activeId !== before) applyFrame(0, false);
    };
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const applyFrame = (t: number, animate: boolean) => {
      const p = reduceMotion ? 0 : progress;
      camera.position.z = 7 - p * 5;
      camera.position.x += ((reduceMotion ? 0 : px * 0.6) - camera.position.x) * 0.04;
      camera.position.y += ((reduceMotion ? 0.6 : 0.6 - py * 0.3) - camera.position.y) * 0.04;
      camera.lookAt(0, 0, -5);

      for (const e of entries) {
        const target = e.id === activeId ? 1 : 0;
        // Smooth cross-fade; under reduced motion the switch is immediate.
        e.weight = reduceMotion ? target : e.weight + (target - e.weight) * 0.07;
        e.built.group.visible = e.weight > 0.003;
        for (const s of e.built.slots) s.mat.opacity = s.base * e.weight;
        if (animate && e.built.group.visible) e.built.anim(t);
      }
      renderer.render(scene, camera);
    };

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      applyFrame(clock.getElapsedTime(), true);
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      onScroll();
      if (reduceMotion) applyFrame(0, false);
    };

    const mo = new MutationObserver(() => {
      theme = currentTheme();
      scene.fog = new THREE.FogExp2(BG[theme], 0.045);
      gridMat.color.setHex(GRID[theme]);
      gridMat.opacity = GRID_OPACITY[theme];
      for (const e of entries) {
        for (const s of e.built.slots) s.mat.color.setHex(e.preset.pal[theme][s.key === 'a' ? 0 : 1]);
      }
      if (reduceMotion) applyFrame(0, false);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    computeActive();
    onScroll();
    if (reduceMotion) {
      // Snap to the active topic and render one static frame.
      entries.forEach((e) => (e.weight = e.id === activeId ? 1 : 0));
      applyFrame(0, false);
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
