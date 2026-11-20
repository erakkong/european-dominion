import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Province, Nation, Region, Strait, Army, MapMode } from '../types';
import { Compass } from 'lucide-react';

interface MapCanvasProps {
  provinces: Province[];
  nations: Record<string, Nation>;
  regions: Record<string, Region>;
  straits: Record<string, Strait>;
  armies: Army[];
  playerNation: string;
  mapMode: MapMode;
  selectedProvince: Province | null;
  onSelectProvince: (prov: Province | null) => void;
  onSelectStrait: (strait: Strait) => void;
  onSelectArmy: (army: Army) => void;
  onIssueMoveCommand?: (armyId: string, targetPid: number) => void;
}

// Point in polygon test
function pointInPoly(pt: [number, number], poly: [number, number][]): boolean {
  let inside = false;
  const x = pt[0], y = pt[1];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Colors for Terrain Mode
const TERRAIN_COLORS: Record<string, string> = {
  sea: '#0c1d2e',
  plains: '#455938',
  forest: '#1e3820',
  hills: '#5c5243',
  mountains: '#423d47',
  marsh: '#25444a',
  desert: '#786e40',
  drylands: '#6b663b',
  steppes: '#566336'
};

// Colors for Resource Mode
const RESOURCE_COLORS: Record<string, string> = {
  grain: '#d4af37',
  wheat: '#d4af37',
  fish: '#3b82f6',
  wood: '#854d0e',
  iron: '#64748b',
  coal: '#1e293b',
  cloth: '#6366f1',
  wine: '#831843',
  livestock: '#a16207',
  horses: '#ca8a04',
  salt: '#e2e8f0',
  silver: '#cbd5e1',
  gold: '#fbbf24',
  tobacco: '#78350f',
  spices: '#ea580c'
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  provinces,
  nations,
  regions,
  straits,
  armies,
  playerNation,
  mapMode,
  selectedProvince,
  onSelectProvince,
  onSelectStrait,
  onSelectArmy,
  onIssueMoveCommand
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera State (Pan & Zoom)
  const [camera, setCamera] = useState({ x: -450, y: -300, zoom: 0.55 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Touch & Gesture state for iPad / mobile touchscreens
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    initialCamX: number;
    initialCamY: number;
    moved: boolean;
    isPinch: boolean;
    initialPinchDist: number;
    initialPinchZoom: number;
    wMidX: number;
    wMidY: number;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    initialCamX: 0,
    initialCamY: 0,
    moved: false,
    isPinch: false,
    initialPinchDist: 0,
    initialPinchZoom: 1,
    wMidX: 0,
    wMidY: 0
  });

  // Selected Army for movement orders
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);

  // Fast O(1) Province Lookup Map
  const provinceMap = useMemo(() => {
    const map = new Map<number, Province>();
    for (let i = 0; i < provinces.length; i++) {
      map.set(provinces[i].id, provinces[i]);
    }
    return map;
  }, [provinces]);

  // Pre-calculate region label centers once (Eliminates 13.6 Million array iterations in render loop!)
  const regionLabels = useMemo(() => {
    const list: { id: string; name: string; rx: number; ry: number; controller: string | null }[] = [];
    for (const [rId, reg] of Object.entries(regions)) {
      if (reg.provinces && reg.provinces.length > 0) {
        let rx = 0, ry = 0, count = 0;
        for (let i = 0; i < reg.provinces.length; i++) {
          const p = provinceMap.get(reg.provinces[i]);
          if (p) {
            rx += p.cx;
            ry += p.cy;
            count++;
          }
        }
        if (count > 0) {
          list.push({
            id: rId,
            name: reg.name.toUpperCase(),
            rx: rx / count,
            ry: ry / count,
            controller: reg.controller
          });
        }
      }
    }
    return list;
  }, [regions, provinceMap]);

  // Pre-calculate capital positions
  const capitalMarkers = useMemo(() => {
    const list: { capName: string; cx: number; cy: number }[] = [];
    for (const n of Object.values(nations)) {
      const cap = provinceMap.get(n.capital);
      if (cap) {
        list.push({ capName: cap.name, cx: cap.cx, cy: cap.cy });
      }
    }
    return list;
  }, [nations, provinceMap]);

  // Pre-calculate National Outer Borders, Coastal Borders, Internal Borders, and Nation Paths
  const { nationRenderData, internalBordersPath, landBordersCrispPath, coastalBordersPath } = useMemo(() => {
    const edgeMap = new Map<bigint, { p1: [number, number]; p2: [number, number]; o1: string; o2: string | null }>();

    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (p.isSea || !p.points) continue;
      const pts = p.points;
      const n = pts.length;
      const owner = p.owner || 'neutral';

      for (let j = 0; j < n; j++) {
        const pt1 = pts[j];
        const pt2 = pts[(j + 1) % n];
        const id1 = pt1[0] * 65536 + pt1[1];
        const id2 = pt2[0] * 65536 + pt2[1];
        const k = id1 < id2
          ? BigInt(id1) * 4294967296n + BigInt(id2)
          : BigInt(id2) * 4294967296n + BigInt(id1);

        const existing = edgeMap.get(k);
        if (!existing) {
          edgeMap.set(k, { p1: pt1, p2: pt2, o1: owner, o2: null });
        } else {
          existing.o2 = owner;
        }
      }
    }

    const fillPaths = new Map<string, Path2D>();
    const landBorderPaths = new Map<string, Path2D>();
    const internalPath = new Path2D();
    const landCrispPath = new Path2D();
    const coastalPath = new Path2D();

    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (p.isSea || !p.points) continue;
      const owner = p.owner || 'neutral';
      let fPath = fillPaths.get(owner);
      if (!fPath) {
        fPath = new Path2D();
        fillPaths.set(owner, fPath);
      }
      fPath.moveTo(p.points[0][0], p.points[0][1]);
      for (let k = 1; k < p.points.length; k++) {
        fPath.lineTo(p.points[k][0], p.points[k][1]);
      }
      fPath.closePath();
    }

    for (const e of edgeMap.values()) {
      if (e.o2 === null) {
        // Coastline edge: strictly separating land from ocean (NO inner dark shadow!)
        coastalPath.moveTo(e.p1[0], e.p1[1]);
        coastalPath.lineTo(e.p2[0], e.p2[1]);
      } else if (e.o1 !== e.o2) {
        // Sovereign land border between two DIFFERENT nations (where Victoria 3 inner gradient goes!)
        let b1 = landBorderPaths.get(e.o1);
        if (!b1) {
          b1 = new Path2D();
          landBorderPaths.set(e.o1, b1);
        }
        b1.moveTo(e.p1[0], e.p1[1]);
        b1.lineTo(e.p2[0], e.p2[1]);

        let b2 = landBorderPaths.get(e.o2);
        if (!b2) {
          b2 = new Path2D();
          landBorderPaths.set(e.o2, b2);
        }
        b2.moveTo(e.p1[0], e.p1[1]);
        b2.lineTo(e.p2[0], e.p2[1]);

        landCrispPath.moveTo(e.p1[0], e.p1[1]);
        landCrispPath.lineTo(e.p2[0], e.p2[1]);
      } else {
        // Internal provincial border within the same sovereign nation
        internalPath.moveTo(e.p1[0], e.p1[1]);
        internalPath.lineTo(e.p2[0], e.p2[1]);
      }
    }

    // Precalculate bounding box per nation
    const nationProvsMap = new Map<string, Province[]>();
    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (p.isSea || !p.owner) continue;
      if (!nationProvsMap.has(p.owner)) nationProvsMap.set(p.owner, []);
      nationProvsMap.get(p.owner)!.push(p);
    }

    const dataList: {
      tag: string;
      fillPath: Path2D;
      landBorderPath: Path2D;
      bbox: [number, number, number, number];
    }[] = [];

    for (const [tag, fPath] of fillPaths.entries()) {
      const bPath = landBorderPaths.get(tag) || new Path2D();
      const pList = nationProvsMap.get(tag) || [];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let k = 0; k < pList.length; k++) {
        const p = pList[k];
        if (p.bbox[0] < minX) minX = p.bbox[0];
        if (p.bbox[2] > maxX) maxX = p.bbox[2];
        if (p.bbox[1] < minY) minY = p.bbox[1];
        if (p.bbox[3] > maxY) maxY = p.bbox[3];
      }
      dataList.push({
        tag,
        fillPath: fPath,
        landBorderPath: bPath,
        bbox: [minX, minY, maxX, maxY]
      });
    }

    return {
      nationRenderData: dataList,
      internalBordersPath: internalPath,
      landBordersCrispPath: landCrispPath,
      coastalBordersPath: coastalPath
    };
  }, [provinces]);

  // Pre-calculate Sovereign Nation Centroids and Bounding Box for Dynamic Map Labels
  const nationLabels = useMemo(() => {
    const nationProvs = new Map<string, Province[]>();
    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (p.isSea || !p.owner) continue;
      if (!nationProvs.has(p.owner)) nationProvs.set(p.owner, []);
      nationProvs.get(p.owner)!.push(p);
    }

    const labels: { tag: string; name: string; cx: number; cy: number; width: number; height: number }[] = [];
    for (const [tag, provList] of nationProvs.entries()) {
      const nat = nations[tag];
      if (!nat || provList.length === 0) continue;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let sumX = 0, sumY = 0;
      for (let k = 0; k < provList.length; k++) {
        const p = provList[k];
        if (p.bbox[0] < minX) minX = p.bbox[0];
        if (p.bbox[2] > maxX) maxX = p.bbox[2];
        if (p.bbox[1] < minY) minY = p.bbox[1];
        if (p.bbox[3] > maxY) maxY = p.bbox[3];
        sumX += p.cx;
        sumY += p.cy;
      }
      labels.push({
        tag,
        name: nat.name,
        cx: Math.round(sumX / provList.length),
        cy: Math.round(sumY / provList.length),
        width: maxX - minX,
        height: maxY - minY
      });
    }
    return labels;
  }, [provinces, nations]);

  // Transform screen to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): [number, number] => {
    return [
      (screenX - cameraRef.current.x) / cameraRef.current.zoom,
      (screenY - cameraRef.current.y) / cameraRef.current.zoom
    ];
  }, []);

  // Unified Interaction / Click / Tap Handler (Desktop Mouse & iPad Touch)
  const handleInteractionAt = useCallback((screenX: number, screenY: number, isRightClick = false) => {
    const [wx, wy] = screenToWorld(screenX, screenY);

    // 1. Check Strait Badges Click (Using exact geographic cx/cy)
    for (const strait of Object.values(straits)) {
      const p0 = strait.provinces && strait.provinces.length > 0 ? provinceMap.get(strait.provinces[0]) : null;
      const sx = strait.cx ?? (p0 ? p0.cx : null);
      const sy = strait.cy ?? (p0 ? p0.cy : null);
      if (sx !== null && sy !== null) {
        const dist = Math.hypot(wx - sx, wy - sy);
        if (dist < 35 / cameraRef.current.zoom) {
          onSelectStrait(strait);
          return;
        }
      }
    }

    // 2. Check Army Click
    for (const army of armies) {
      const p = provinceMap.get(army.pid);
      if (p) {
        const dist = Math.hypot(wx - p.cx, wy - p.cy);
        if (dist < 25 / cameraRef.current.zoom) {
          setSelectedArmyId(army.id);
          onSelectArmy(army);
          return;
        }
      }
    }

    // 3. Find Clicked Province (Land first, then Sea)
    let found: Province | null = null;
    for (let i = provinces.length - 1; i >= 0; i--) {
      const p = provinces[i];
      if (p.isSea) continue;
      const [bx1, by1, bx2, by2] = p.bbox;
      if (wx >= bx1 && wx <= bx2 && wy >= by1 && wy <= by2) {
        if (pointInPoly([wx, wy], p.points)) {
          found = p;
          break;
        }
      }
    }

    if (!found) {
      for (let i = provinces.length - 1; i >= 0; i--) {
        const p = provinces[i];
        if (!p.isSea) continue;
        const [bx1, by1, bx2, by2] = p.bbox;
        if (wx >= bx1 && wx <= bx2 && wy >= by1 && wy <= by2) {
          if (pointInPoly([wx, wy], p.points)) {
            found = p;
            break;
          }
        }
      }
    }

    // Move command if army selected and right click
    if (isRightClick && selectedArmyId && onIssueMoveCommand && found) {
      onIssueMoveCommand(selectedArmyId, found.id);
      setSelectedArmyId(null);
      return;
    }

    onSelectProvince(found);
  }, [screenToWorld, straits, provinces, armies, provinceMap, selectedArmyId, onIssueMoveCommand, onSelectProvince, onSelectStrait, onSelectArmy]);

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(0.25, Math.min(3.5, cameraRef.current.zoom * zoomFactor));

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const worldX = (mouseX - cameraRef.current.x) / cameraRef.current.zoom;
    const worldY = (mouseY - cameraRef.current.y) / cameraRef.current.zoom;

    setCamera({
      zoom: newZoom,
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom
    });
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cameraRef.current.x, y: e.clientY - cameraRef.current.y });
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      setCamera(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
      return;
    }

    // Hit Test for Province Hover
    const [wx, wy] = screenToWorld(e.clientX, e.clientY);
    let found: Province | null = null;

    for (let i = provinces.length - 1; i >= 0; i--) {
      const p = provinces[i];
      if (p.isSea) continue;
      const [bx1, by1, bx2, by2] = p.bbox;
      if (wx >= bx1 && wx <= bx2 && wy >= by1 && wy <= by2) {
        if (pointInPoly([wx, wy], p.points)) {
          found = p;
          break;
        }
      }
    }

    if (found?.id !== hoveredProvince?.id) {
      setHoveredProvince(found);
    }
  };

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      const dist = Math.hypot((e.clientX - dragStart.x) - cameraRef.current.x, (e.clientY - dragStart.y) - cameraRef.current.y);
      setIsDragging(false);

      if (dist < 6) {
        handleInteractionAt(e.clientX, e.clientY, e.button === 2);
      }
    }
  };

  // iPad & Tablet Native Touch Event Listeners (passive: false for full WebKit gesture prevention)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStateRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          startTime: Date.now(),
          initialCamX: cameraRef.current.x,
          initialCamY: cameraRef.current.y,
          moved: false,
          isPinch: false,
          initialPinchDist: 0,
          initialPinchZoom: cameraRef.current.zoom,
          wMidX: 0,
          wMidY: 0
        };
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const [wMidX, wMidY] = screenToWorld(midX, midY);

        touchStateRef.current = {
          startX: midX,
          startY: midY,
          startTime: Date.now(),
          initialCamX: cameraRef.current.x,
          initialCamY: cameraRef.current.y,
          moved: true,
          isPinch: true,
          initialPinchDist: Math.max(10, dist),
          initialPinchZoom: cameraRef.current.zoom,
          wMidX,
          wMidY
        };
        setHoveredProvince(null);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && !touchStateRef.current.isPinch) {
        const t = e.touches[0];
        const dx = t.clientX - touchStateRef.current.startX;
        const dy = t.clientY - touchStateRef.current.startY;

        if (Math.hypot(dx, dy) > 5) {
          touchStateRef.current.moved = true;
          setHoveredProvince(null);
          setCamera({
            zoom: cameraRef.current.zoom,
            x: touchStateRef.current.initialCamX + dx,
            y: touchStateRef.current.initialCamY + dy
          });
        }
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        const ts = touchStateRef.current;
        if (ts.initialPinchDist > 5) {
          const scale = dist / ts.initialPinchDist;
          const newZoom = Math.max(0.25, Math.min(3.5, ts.initialPinchZoom * scale));

          setCamera({
            zoom: newZoom,
            x: midX - ts.wMidX * newZoom,
            y: midY - ts.wMidY * newZoom
          });
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 0) {
        const ts = touchStateRef.current;
        if (!ts.moved && !ts.isPinch) {
          const duration = Date.now() - ts.startTime;
          if (duration < 500) {
            handleInteractionAt(ts.startX, ts.startY, false);
          }
        }
        ts.isPinch = false;
        ts.moved = false;
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStateRef.current.startX = t.clientX;
        touchStateRef.current.startY = t.clientY;
        touchStateRef.current.initialCamX = cameraRef.current.x;
        touchStateRef.current.initialCamY = cameraRef.current.y;
        touchStateRef.current.isPinch = false;
        touchStateRef.current.moved = true;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [screenToWorld, handleInteractionAt]);

  // Touch & UI Zoom Buttons
  const handleZoomBy = (factor: number) => {
    setCamera(prev => {
      const newZoom = Math.max(0.25, Math.min(3.5, prev.zoom * factor));
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const wx = (cx - prev.x) / prev.zoom;
      const wy = (cy - prev.y) / prev.zoom;
      return {
        zoom: newZoom,
        x: cx - wx * newZoom,
        y: cy - wy * newZoom
      };
    });
  };

  const handleResetCamera = () => {
    setCamera({
      x: window.innerWidth / 2 - 2400 * 0.55,
      y: window.innerHeight / 2 - 2400 * 0.55,
      zoom: 0.55
    });
  };

  // Main Canvas Render Loop (RAF synchronized)
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear background (Luminous Victoria 3 pastel parchment ocean)
    ctx.fillStyle = '#d4e1e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Viewport Culling Bounds in World Space
    const viewLeft = -camera.x / camera.zoom;
    const viewTop = -camera.y / camera.zoom;
    const viewRight = (canvas.width - camera.x) / camera.zoom;
    const viewBottom = (canvas.height - camera.y) / camera.zoom;

    // 1. DRAW SEA PROVINCES FIRST (Light, soft cartographic water)
    for (const p of provinces) {
      if (!p.isSea) continue;
      const [bx1, by1, bx2, by2] = p.bbox;
      if (bx2 < viewLeft || bx1 > viewRight || by2 < viewTop || by1 > viewBottom) continue;

      ctx.beginPath();
      ctx.moveTo(p.points[0][0], p.points[0][1]);
      for (let k = 1; k < p.points.length; k++) {
        ctx.lineTo(p.points[k][0], p.points[k][1]);
      }
      ctx.closePath();
      ctx.fillStyle = '#cbe0ea';
      ctx.fill();

      // Faint dashed cartographic nautical division lines
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(135, 168, 188, 0.40)';
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.restore();
    }

    // 1b. COASTAL SHALLOWS WATER GLOW (Victoria 3 soft luminous cyan/turquoise shelf along coasts & islands)
    ctx.save();
    ctx.strokeStyle = 'rgba(172, 212, 230, 0.40)';
    ctx.lineWidth = Math.max(12, 24 / camera.zoom);
    ctx.stroke(coastalBordersPath);
    ctx.strokeStyle = 'rgba(188, 226, 242, 0.65)';
    ctx.lineWidth = Math.max(5, 10 / camera.zoom);
    ctx.stroke(coastalBordersPath);
    ctx.restore();

    // 2. DRAW NATIONS & PROVINCES
    if (mapMode === 'political') {
      // Authentic Victoria 3 Political Map:
      // - Soft pastel watercolor interior
      // - Smooth continuous gradient darkening ONLY along sovereign land borders
      // - Coasts and islands remain 100% clean, crisp pastel with zero dark shadows
      for (let i = 0; i < nationRenderData.length; i++) {
        const item = nationRenderData[i];
        const [bx1, by1, bx2, by2] = item.bbox;
        if (bx2 < viewLeft || bx1 > viewRight || by2 < viewTop || by1 > viewBottom) continue;

        const nat = nations[item.tag];
        const rgb = nat?.rgb || [140, 150, 165];

        // Soft pastel interior: 50% nation color + 50% soft paper cream (248, 246, 240)
        const fillR = Math.round(rgb[0] * 0.50 + 124);
        const fillG = Math.round(rgb[1] * 0.50 + 123);
        const fillB = Math.round(rgb[2] * 0.50 + 120);

        ctx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
        ctx.fill(item.fillPath);

        // Darker shade of the nation's own color (KEIN Schatten, sondern einfach die Farbe der Nation in dunkler!)
        // Reduziert die Helligkeit um ~35% ohne jede Farbtonverschiebung (reine Eigenfarbe)
        const darkR = Math.max(0, Math.min(255, Math.round(rgb[0] * 0.65)));
        const darkG = Math.max(0, Math.min(255, Math.round(rgb[1] * 0.65)));
        const darkB = Math.max(0, Math.min(255, Math.round(rgb[2] * 0.65)));

        // Clip strictly inside nation polygon so darkening is contained within the country
        ctx.save();
        ctx.clip(item.fillPath);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Stufenloser Farbverlauf in der reinen Eigenfarbe des Landes (kein transparenter Schatten)
        // ONLY on sovereign land borders (item.landBorderPath)!
        // Coasts and islands are NEVER stroked with dark color!
        const maxGradWidth = Math.max(8, Math.min(16, 12 / Math.pow(camera.zoom, 0.35)));
        const numLayers = 10;
        for (let step = numLayers; step >= 1; step--) {
          const t = step / numLayers;
          const width = t * maxGradWidth;
          const darkFactor = Math.pow(1 - t, 1.4);

          // Direkte Farbmischung zwischen Pastell-Zentrum und dunkler Landesfarbe
          const rCur = Math.round(fillR + (darkR - fillR) * darkFactor);
          const gCur = Math.round(fillG + (darkG - fillG) * darkFactor);
          const bCur = Math.round(fillB + (darkB - fillB) * darkFactor);

          ctx.strokeStyle = `rgb(${rCur}, ${gCur}, ${bCur})`;
          ctx.lineWidth = width * 2;
          ctx.stroke(item.landBorderPath);
        }

        ctx.restore();
      }
    } else {
      // Other map modes (terrain, economy, military, etc.)
      for (const p of provinces) {
        if (p.isSea) continue;
        const [bx1, by1, bx2, by2] = p.bbox;
        if (bx2 < viewLeft || bx1 > viewRight || by2 < viewTop || by1 > viewBottom) continue;

        ctx.beginPath();
        ctx.moveTo(p.points[0][0], p.points[0][1]);
        for (let k = 1; k < p.points.length; k++) {
          ctx.lineTo(p.points[k][0], p.points[k][1]);
        }
        ctx.closePath();

        let fillColor = '#475569';
        if (mapMode === 'terrain') {
          fillColor = TERRAIN_COLORS[p.terrain] || '#455938';
        } else if (mapMode === 'economy') {
          fillColor = (p.resource && RESOURCE_COLORS[p.resource]) || '#475569';
        } else if (mapMode === 'diplomacy') {
          const pNation = nations[playerNation];
          const isRival = pNation?.rivals?.includes(p.owner);
          const isAlly = pNation?.allies?.includes(p.owner);
          if (p.owner === playerNation) fillColor = '#1d4ed8';
          else if (isAlly) fillColor = '#15803d';
          else if (isRival) fillColor = '#b91c1c';
          else fillColor = '#475569';
        } else if (mapMode === 'infrastructure') {
          fillColor = (p.buildings.railway || 0) > 0 ? '#15803d' : '#475569';
        } else if (mapMode === 'military') {
          fillColor = (p.buildings.fortress || 0) > 0 ? '#701a75' : '#334155';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
      }
    }

    // 2b. DRAW INTERNAL PROVINCE BORDERS (Inlandsgrenzen)
    // Only visible when zoomed in (> 0.85) in delicate muted slate-grey
    if (camera.zoom > 0.85) {
      const zoomT = Math.min(1, (camera.zoom - 0.85) / 0.45);
      const internalAlpha = zoomT * 0.35;
      ctx.save();
      ctx.strokeStyle = `rgba(110, 125, 145, ${internalAlpha})`;
      ctx.lineWidth = Math.max(0.5, 0.75 / camera.zoom);
      ctx.stroke(internalBordersPath);
      ctx.restore();
    }

    // 2c. CRISP DIVIDING BOUNDARY LINE (Dezente, feine Grenztrennlinie zwischen den Ländern)
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 50, 65, 0.45)';
    ctx.lineWidth = Math.max(0.5, 0.85 / camera.zoom);
    ctx.stroke(landBordersCrispPath);
    ctx.restore();

    // 2c-2. DELICATE COASTAL HAIRLINE (Crisp, clean meeting of land and sea with zero dark shadow)
    ctx.save();
    ctx.strokeStyle = 'rgba(65, 88, 105, 0.42)';
    ctx.lineWidth = Math.max(0.65, 1.0 / camera.zoom);
    ctx.stroke(coastalBordersPath);
    ctx.restore();

    // 2d. HIGHLIGHT HOVERED & SELECTED PROVINCE
    if (hoveredProvince && !hoveredProvince.isSea) {
      ctx.save();
      ctx.beginPath();
      const pts = hoveredProvince.points;
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(pts[k][0], pts[k][1]);
      }
      ctx.closePath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5 / camera.zoom;
      ctx.stroke();
      ctx.restore();
    }

    if (selectedProvince && !selectedProvince.isSea) {
      ctx.save();
      ctx.beginPath();
      const pts = selectedProvince.points;
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(pts[k][0], pts[k][1]);
      }
      ctx.closePath();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5 / camera.zoom;
      ctx.stroke();
      ctx.restore();
    }

    // 3. DRAW LARGE DYNAMIC NATION LABELS (When zoomed out <= 0.95, scaled dynamically to country size)
    if (camera.zoom <= 0.95) {
      const zoomFactor = Math.min(1, (0.95 - camera.zoom) / 0.35);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < nationLabels.length; i++) {
        const nLab = nationLabels[i];
        if (nLab.cx >= viewLeft && nLab.cx <= viewRight && nLab.cy >= viewTop && nLab.cy <= viewBottom) {
          const spanDim = Math.min(nLab.width * 0.12, nLab.height * 0.22);
          const fontSize = Math.min(48, Math.max(11, spanDim));
          if (fontSize < 10) continue;

          ctx.font = `bold ${fontSize}px 'Cinzel', serif`;
          const upperName = nLab.name.toUpperCase();

          // Soft white/cream specular halo for crisp contrast against pastel terrain:
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * zoomFactor})`;
          ctx.lineWidth = Math.max(2.5, fontSize * 0.12);
          ctx.strokeText(upperName, nLab.cx, nLab.cy);

          // Deep Victoria 3 charcoal/slate typography:
          ctx.fillStyle = `rgba(26, 38, 54, ${0.92 * zoomFactor})`;
          ctx.fillText(upperName, nLab.cx, nLab.cy);
        }
      }
      ctx.restore();
    }

    // 4. DRAW CAPITAL STARS & MAJOR CITY NAMES (Zoom >= 0.7) - FAST O(1)
    if (camera.zoom >= 0.7) {
      for (let i = 0; i < capitalMarkers.length; i++) {
        const cap = capitalMarkers[i];
        if (cap.cx >= viewLeft && cap.cx <= viewRight && cap.cy >= viewTop && cap.cy <= viewBottom) {
          // Draw Star Marker Circle
          ctx.beginPath();
          ctx.arc(cap.cx, cap.cy, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner white star core
          ctx.beginPath();
          ctx.arc(cap.cx, cap.cy, 2, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Label with dark background badge for crisp legibility on land
          ctx.font = `600 ${Math.max(9, Math.min(13, 11))}px 'Inter', sans-serif`;
          const text = cap.capName;
          const textWidth = ctx.measureText(text).width;
          const pad = 4;
          const labelY = cap.cy - 12;

          ctx.fillStyle = 'rgba(10, 15, 26, 0.75)';
          ctx.beginPath();
          ctx.roundRect(cap.cx - textWidth / 2 - pad, labelY - 11, textWidth + pad * 2, 14, 3);
          ctx.fill();

          ctx.fillStyle = '#fef3c7';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(text, cap.cx, labelY);
        }
      }
    }

    // 5. DRAW STRATEGIC CHOKEPOINTS & STRAITS BADGES (Exact Geographic Placement)
    for (const strait of Object.values(straits)) {
      const p0 = strait.provinces && strait.provinces.length > 0 ? provinceMap.get(strait.provinces[0]) : null;
      const sx = strait.cx ?? (p0 ? p0.cx : null);
      const sy = strait.cy ?? (p0 ? p0.cy : null);
      if (sx !== null && sy !== null && sx >= viewLeft && sx <= viewRight && sy >= viewTop && sy <= viewBottom) {
        // Badge circle
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, 2 * Math.PI);
        ctx.fillStyle = strait.isBlockaded ? '#dc2626' : '#d97706';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Anchor / River icon text
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(strait.type === 'strait' ? '⚓' : '🌊', sx, sy);

        // Name label with dark background badge
        ctx.font = 'bold 11px "Inter", sans-serif';
        const sName = strait.name;
        const sWidth = ctx.measureText(sName).width;
        ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
        ctx.beginPath();
        ctx.roundRect(sx - sWidth / 2 - 4, sy + 10, sWidth + 8, 15, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.fillText(sName, sx, sy + 21);
      }
    }

    // 6. DRAW ARMIES
    for (const army of armies) {
      const p = provinceMap.get(army.pid);
      if (p && p.cx >= viewLeft && p.cx <= viewRight && p.cy >= viewTop && p.cy <= viewBottom) {
        const totalTroops = (army.units.line_infantry || 0) + (army.units.cavalry || 0) + (army.units.artillery || 0) * 10;
        const isPlayer = (army.nation === playerNation);

        // Army marker
        ctx.beginPath();
        ctx.rect(p.cx - 16, p.cy - 10, 32, 20);
        ctx.fillStyle = isPlayer ? '#1d4ed8' : '#374151';
        ctx.fill();
        ctx.strokeStyle = isPlayer ? '#60a5fa' : '#9ca3af';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(totalTroops / 1000)}k`, p.cx, p.cy);

        if (army.isMoving) {
          ctx.fillText('➔', p.cx + 20, p.cy);
        }
      }
    }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [provinces, nations, regions, straits, armies, camera, mapMode, hoveredProvince, selectedProvince, playerNation, regionLabels, capitalMarkers, provinceMap, nationRenderData, internalBordersPath, landBordersCrispPath, coastalBordersPath, nationLabels]);

  return (
    <div className="relative w-full h-full overflow-hidden touch-none select-none" onContextMenu={e => e.preventDefault()}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setHoveredProvince(null)}
      />

      {/* Floating Cartographic Zoom & Pan Controls (Docked Safely on the Left) */}
      <div className="fixed bottom-14 left-4 z-30 flex flex-col gap-1.5 select-none pointer-events-auto">
        <button
          type="button"
          onClick={() => handleZoomBy(1.3)}
          className="w-9 h-9 rounded imperial-btn text-amber-300 hover:text-amber-100 flex items-center justify-center text-xl font-bold shadow-xl transition active:scale-95"
          title="Karte vergrößern (+)"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleZoomBy(0.77)}
          className="w-9 h-9 rounded imperial-btn text-amber-300 hover:text-amber-100 flex items-center justify-center text-xl font-bold shadow-xl transition active:scale-95"
          title="Karte verkleinern (−)"
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          className="w-9 h-9 rounded imperial-btn text-amber-300 hover:text-amber-100 flex items-center justify-center text-xs shadow-xl transition active:scale-95"
          title="Europa zentrieren"
          aria-label="Reset View"
        >
          <Compass size={14} />
        </button>
      </div>

      {/* Floating Hover Tooltip (Only for Land Provinces & Dismissed when Drawer is Open) */}
      {hoveredProvince && !isDragging && !selectedProvince && !hoveredProvince.isSea && (
        <div
          className="pointer-events-none fixed z-50 imperial-panel p-2.5 rounded shadow-2xl text-xs max-w-xs animate-in fade-in-50 duration-100"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y + 16}px`,
            borderColor: 'rgba(212, 175, 55, 0.6)'
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 border-b border-amber-500/30 pb-1">
            {hoveredProvince.owner && nations[hoveredProvince.owner] && (
              <img
                src={nations[hoveredProvince.owner].flag}
                alt="Flagge"
                className="w-5 h-3.5 object-cover rounded shadow"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <span className="font-bold text-amber-300 font-royal text-sm">{hoveredProvince.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 font-sans-ui text-[11px]">
            <div className="text-slate-400">Herrscherhaus:</div>
            <div className="font-semibold text-slate-100">
              {hoveredProvince.owner && nations[hoveredProvince.owner] ? nations[hoveredProvince.owner].name : 'Neutral'}
            </div>

            <div className="text-slate-400">Region:</div>
            <div className="text-amber-200">
              {hoveredProvince.region && regions[hoveredProvince.region] ? regions[hoveredProvince.region].name : 'Europäisches Territorium'}
            </div>

            <div className="text-slate-400">Bevölkerung:</div>
            <div className="text-slate-100 font-mono">{hoveredProvince.population.toLocaleString('de-DE')}</div>

            <div className="text-slate-400">Gelände:</div>
            <div className="capitalize text-emerald-300">{hoveredProvince.terrain}</div>

            <div className="text-slate-400">Handelsgut:</div>
            <div className="capitalize text-amber-300">{hoveredProvince.resource || 'Getreide'}</div>

            <div className="text-slate-400">Verteidigung:</div>
            <div className="text-rose-300 font-mono">+{hoveredProvince.defense}%</div>
          </div>
        </div>
      )}
    </div>
  );
};
