"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeDestination } from "@/lib/globe/data";
import { readGlobeQuery, writeGlobeQuery } from "@/lib/globe/query";

/**
 * The hiking globe: every destination as a light on a dotted earth, coloured by
 * how its selected month scores, with a month slider and a play button that
 * sends the hiking season round the world.
 *
 * three.js and the land dots load with a dynamic import, so they cost nothing on
 * any other page. Every string arrives prepared from the server (dict.ts stays
 * out of the bundle), and every colour comes from GlobeDestination's level codes,
 * which the server derives from the published recommendation gate.
 */
export interface GlobeLabels {
  months: string[];
  play: string;
  pause: string;
  month: string;
  /** "{n}" is replaced with the count. */
  recommended: string;
  legend: Array<{code: string; label: string}>;
  notRecommended: string;
  /** "{n}" is replaced with the score. */
  score: string;
  close: string;
  open: string;
  hint: string;
  noWebgl: string;
  canvasLabel: string;
  random: string;
  randomTitle: string;
  share: string;
  copied: string;
  /** "{name}" and "{month}" are replaced. */
  shareText: string;
  /** Used when no destination is selected; "{month}" is replaced. */
  shareGlobeText: string;
}

const COLOR: Record<string, number> = {E: 0x7ee2a2, V: 0x5cc98a, G: 0xf2b84b, F: 0xee7f55, P: 0xee7f55, "-": 0x56635b};
const RADIUS = 1;
/** Camera distance from the centre when a destination is in focus (the globe has radius 1). */
const FOCUS_DISTANCE = 1.7;
const FLIGHT_MS = 1400;

function toVector(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
}

export function HikingGlobe({destinations, labels, hrefs}: {destinations: GlobeDestination[]; labels: GlobeLabels; hrefs: Record<string, string>}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<GlobeDestination | null>(null);
  const [failed, setFailed] = useState(false);
  // The scene reads the month through a ref so a slider change recolours points without rebuilding.
  const monthRef = useRef(month);
  const recolourRef = useRef<(month: number) => void>(() => {});
  // Turns the camera to a destination and zooms in; set once the scene exists.
  const flyRef = useRef<(index: number) => void>(() => {});
  // A destination named in a shared link, waiting for the scene to load before the flight starts.
  const pendingFlightRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Start on ?month= and ?to= when shared, otherwise on the current month with nothing selected.
  useEffect(() => {
    const query = readGlobeQuery(window.location.search, destinations.map((destination) => destination.s));
    setMonth(query.month ?? new Date().getMonth() + 1);
    if (query.index !== null) {
      setSelected(destinations[query.index]);
      pendingFlightRef.current = query.index;
    }
  }, [destinations]);

  useEffect(() => {
    monthRef.current = month;
    recolourRef.current(month);
  }, [month]);

  // Keep the address in step with what is on screen, so copying it from the address bar shares the same view.
  useEffect(() => {
    window.history.replaceState(window.history.state, "", writeGlobeQuery(window.location.href, month, selected?.s ?? null));
    setCopied(false);
  }, [month, selected]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setMonth((current) => (current % 12) + 1), 1400);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const {OrbitControls} = await import("three/examples/jsm/controls/OrbitControls.js");
      const land = (await import("@/lib/globe/land-points.json")).default as {latLon: number[]};
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      } catch {
        setFailed(true);
        return;
      }
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", labels.canvasLabel);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      // Open over Europe and the Mediterranean, where most of the catalogue sits.
      const [cx, cy, cz] = toVector(32, 12, 3.1);
      camera.position.set(cx, cy, cz);

      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 64, 64),
        new THREE.MeshBasicMaterial({color: 0x0d1c15}),
      );
      scene.add(earth);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS * 1.06, 64, 64),
        new THREE.MeshBasicMaterial({color: 0x3f7a5c, transparent: true, opacity: 0.12, side: THREE.BackSide}),
      );
      scene.add(halo);

      // A soft round sprite so points read as lights rather than squares.
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 64;
      const context = sprite.getContext("2d")!;
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.35, "rgba(255,255,255,0.85)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      const dot = new THREE.CanvasTexture(sprite);

      const landPositions = new Float32Array((land.latLon.length / 2) * 3);
      for (let i = 0; i < land.latLon.length; i += 2) landPositions.set(toVector(land.latLon[i], land.latLon[i + 1], RADIUS * 1.001), (i / 2) * 3);
      const landGeometry = new THREE.BufferGeometry();
      landGeometry.setAttribute("position", new THREE.BufferAttribute(landPositions, 3));
      scene.add(new THREE.Points(landGeometry, new THREE.PointsMaterial({color: 0x7fae8f, size: 0.024, map: dot, transparent: true, opacity: 0.9, depthWrite: false})));

      const positions = new Float32Array(destinations.length * 3);
      const colors = new Float32Array(destinations.length * 3);
      destinations.forEach((destination, index) => positions.set(toVector(destination.la, destination.lo, RADIUS * 1.012), index * 3));
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      // Normal blending, not additive: overlapping grey lights in a dense cluster must stay grey,
      // never add up to a white that reads as a strong recommendation.
      const pointsMaterial = new THREE.PointsMaterial({size: 0.07, map: dot, vertexColors: true, transparent: true, depthWrite: false});
      const points = new THREE.Points(geometry, pointsMaterial);
      scene.add(points);

      // A ring that marks the destination in focus.
      const ringCanvas = document.createElement("canvas");
      ringCanvas.width = ringCanvas.height = 64;
      const ringContext = ringCanvas.getContext("2d")!;
      ringContext.strokeStyle = "rgba(255,255,255,0.95)";
      ringContext.lineWidth = 5;
      ringContext.beginPath();
      ringContext.arc(32, 32, 24, 0, Math.PI * 2);
      ringContext.stroke();
      const ringTexture = new THREE.CanvasTexture(ringCanvas);
      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
      const ringMaterial = new THREE.PointsMaterial({size: 0.11, map: ringTexture, transparent: true, depthWrite: false});
      const ring = new THREE.Points(ringGeometry, ringMaterial);
      ring.visible = false;
      scene.add(ring);

      const colour = new THREE.Color();
      recolourRef.current = (selectedMonth: number) => {
        destinations.forEach((destination, index) => {
          colour.setHex(COLOR[destination.l[selectedMonth - 1]] ?? COLOR["-"]);
          colors.set([colour.r, colour.g, colour.b], index * 3);
        });
        geometry.attributes.color.needsUpdate = true;
      };
      recolourRef.current(monthRef.current);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minDistance = 1.5;
      controls.maxDistance = 5;
      controls.rotateSpeed = 0.6;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.45;
      // Until the reader drags or zooms, the camera backs off on narrow screens so the whole globe fits.
      let touched = false;
      let flight: {from: InstanceType<typeof THREE.Vector3>; to: InstanceType<typeof THREE.Vector3>; fromLength: number; start: number} | null = null;
      controls.addEventListener("start", () => { controls.autoRotate = false; touched = true; flight = null; });

      flyRef.current = (index: number) => {
        const target = new THREE.Vector3(...toVector(destinations[index].la, destinations[index].lo, 1));
        ringGeometry.attributes.position.setXYZ(0, ...toVector(destinations[index].la, destinations[index].lo, RADIUS * 1.014));
        ringGeometry.attributes.position.needsUpdate = true;
        ring.visible = true;
        controls.autoRotate = false;
        touched = true;
        if (reducedMotion) {
          camera.position.copy(target.multiplyScalar(FOCUS_DISTANCE));
          return;
        }
        flight = {from: camera.position.clone().normalize(), to: target, fromLength: camera.position.length(), start: performance.now()};
      };
      if (pendingFlightRef.current !== null) {
        flyRef.current(pendingFlightRef.current);
        pendingFlightRef.current = null;
      }

      // Tap or click picks the nearest front-facing light within a few pixels (more for a finger); a drag does not.
      // Measured on screen rather than in world units, so a light is as easy to hit zoomed out as zoomed in.
      const projected = new THREE.Vector3();
      let downAt: [number, number] | null = null;
      const pick = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const reach = event.pointerType === "touch" ? 24 : 14;
        const eye = camera.position.clone().normalize();
        let best = -1;
        let bestDistance = reach;
        for (let index = 0; index < destinations.length; index += 1) {
          projected.fromArray(positions, index * 3);
          if (projected.clone().normalize().dot(eye) < 0.15) continue;
          projected.project(camera);
          const distance = Math.hypot((projected.x + 1) / 2 * rect.width - x, (1 - projected.y) / 2 * rect.height - y);
          if (distance < bestDistance) { best = index; bestDistance = distance; }
        }
        if (best < 0) { setSelected(null); return; }
        setSelected(destinations[best]);
        flyRef.current(best);
      };
      const onDown = (event: PointerEvent) => { downAt = [event.clientX, event.clientY]; };
      const onUp = (event: PointerEvent) => {
        if (downAt && Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) < 6) pick(event);
        downAt = null;
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointerup", onUp);

      const resize = () => {
        const {width, height} = mount.getBoundingClientRect();
        renderer.setSize(width, height, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        if (!touched) camera.position.setLength(3.1 / Math.min(1, Math.max(camera.aspect, 0.62)));
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();

      let frame = 0;
      const render = () => {
        frame = requestAnimationFrame(render);
        if (flight) {
          const progress = Math.min(1, (performance.now() - flight.start) / FLIGHT_MS);
          const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
          // Along the great circle (a lerp that is renormalised); a nudge keeps an exactly opposite target from collapsing to zero.
          const direction = flight.from.clone().lerp(flight.to, eased);
          if (direction.lengthSq() < 1e-6) direction.set(0, 1, 0);
          // Pull back a little mid-flight, then settle close in, so a long jump reads as a flight.
          const lift = Math.sin(Math.PI * eased) * 0.5;
          camera.position.copy(direction.normalize().multiplyScalar(flight.fromLength + (FOCUS_DISTANCE - flight.fromLength) * eased + lift));
          if (progress >= 1) flight = null;
        }
        controls.update();
        // Lights are sized in world units, so they grow as the camera closes in; shrink them back so a zoomed-in cluster stays readable.
        const scale = Math.min(1, Math.max(0.45, (camera.position.length() - RADIUS) / 2.1));
        pointsMaterial.size = 0.07 * scale;
        ringMaterial.size = 0.11 * scale;
        renderer.render(scene, camera);
      };
      render();

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        controls.dispose();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointerup", onUp);
        renderer.dispose();
        geometry.dispose();
        landGeometry.dispose();
        ringGeometry.dispose();
        ringTexture.dispose();
        dot.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => setFailed(true));

    return () => { disposed = true; cleanup(); };
  }, [destinations, labels.canvasLabel]);

  const surprise = () => {
    const candidates = destinations.map((destination, index) => ({destination, index})).filter(({destination}) => destination.l[month - 1] !== "-");
    const pool = candidates.length ? candidates : destinations.map((destination, index) => ({destination, index}));
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setPlaying(false);
    setSelected(choice.destination);
    flyRef.current(choice.index);
  };

  const share = async () => {
    const monthName = labels.months[month - 1];
    const text = selected ? labels.shareText.replace("{name}", selected.n).replace("{month}", monthName) : labels.shareGlobeText.replace("{month}", monthName);
    const url = writeGlobeQuery(window.location.href, month, selected?.s ?? null);
    if (navigator.share) {
      try {
        await navigator.share({title: document.title, text, url});
      } catch {
        // Closing the share sheet rejects too; there is nothing to report.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(labels.share, url);
    }
  };

  const recommended = useMemo(() => destinations.filter((destination) => destination.l[month - 1] !== "-").length, [destinations, month]);
  const selectedScore = selected?.m[month - 1] ?? null;

  return <div className="globe-explorer">
    <div className="globe-stage" ref={mountRef}>
      {failed ? <p className="globe-fallback">{labels.noWebgl}</p> : null}
      {selected ? <div className="globe-card" role="status">
        <span>{selected.c}</span>
        <strong>{selected.n}</strong>
        <p>{selectedScore === null ? labels.notRecommended : labels.score.replace("{n}", String(selectedScore))} · {labels.months[month - 1]}</p>
        <div className="globe-card-actions">
          <a href={hrefs[selected.s]}>{labels.open}</a>
          <button type="button" className="globe-share" onClick={share}>{copied ? labels.copied : labels.share}</button>
        </div>
        <button type="button" className="globe-card-close" aria-label={labels.close} onClick={() => setSelected(null)}>×</button>
      </div> : null}
    </div>
    <div className="globe-controls">
      <button type="button" className="button" onClick={() => setPlaying((value) => !value)} aria-pressed={playing}>{playing ? labels.pause : labels.play}</button>
      <button type="button" className="button secondary globe-random" onClick={surprise} title={labels.randomTitle}>{labels.random}</button>
      <button type="button" className="button secondary globe-random" onClick={share}>{copied && !selected ? labels.copied : labels.share}</button>
      <label className="globe-month">
        <span>{labels.month}: <strong>{labels.months[month - 1]}</strong></span>
        <input type="range" min={1} max={12} step={1} value={month} onChange={(event) => { setPlaying(false); setMonth(Number(event.target.value)); }} aria-valuetext={labels.months[month - 1]}/>
      </label>
      <p className="globe-count" aria-live="polite">{labels.recommended.replace("{n}", String(recommended))}</p>
    </div>
    <ul className="globe-legend">
      {labels.legend.map((item) => <li key={item.code}><i data-level={item.code}/>{item.label}</li>)}
    </ul>
    <p className="globe-hint">{labels.hint}</p>
  </div>;
}
