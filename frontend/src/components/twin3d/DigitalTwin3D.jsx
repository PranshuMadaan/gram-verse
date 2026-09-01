import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Maximize2,
  Compass,
  Play,
  Pause,
  Layers,
  Sun,
  Eye,
  EyeOff,
  Camera,
} from 'lucide-react';

export function DigitalTwin3D({
  village,
  activeMetrics = null,
  baselineMetrics = null,
  selectedInterventions = [],
  elevationProfile = null,
  height = '480px',
}) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('iso'); // 'iso' | 'top' | 'horizon'
  const [showWaterRadius, setShowWaterRadius] = useState(true);
  const [showElevationGrid, setShowElevationGrid] = useState(true);

  const isRotatingRef = useRef(true);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    isRotatingRef.current = autoRotate;
  }, [autoRotate]);

  // Set camera angle preset
  const applyCameraPreset = (preset) => {
    setCameraPreset(preset);
    const camera = cameraRef.current;
    if (!camera) return;

    if (preset === 'top') {
      camera.position.set(0, 30, 0.01);
      camera.lookAt(0, 0, 0);
    } else if (preset === 'horizon') {
      camera.position.set(0, 4, 16);
      camera.lookAt(0, 1.5, 0);
    } else {
      // Isometric 45
      camera.position.set(16, 18, 22);
      camera.lookAt(0, 0, 0);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !village) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.02);
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 700;
    const heightPx = parseInt(height, 10) || 480;
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(16, 18, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight.position.set(12, 24, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const warmLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    warmLight.position.set(-10, 15, -10);
    scene.add(warmLight);

    // 5. 3D Elevation Terrain Plane
    const terrainGeo = new THREE.PlaneGeometry(45, 45, 30, 30);
    const posAttr = terrainGeo.attributes.position;
    // Apply gentle elevation slope: North-East slightly higher (Zone A) -> South-West lower (Zone B)
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const slope = (vx + vy) * 0.03;
      posAttr.setZ(i, slope);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0c1420,
      roughness: 0.85,
      metalness: 0.15,
      wireframe: false,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Optional Elevation Wireframe Grid
    if (showElevationGrid) {
      const gridWireMat = new THREE.MeshBasicMaterial({
        color: 0x1e2d42,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const gridMesh = new THREE.Mesh(terrainGeo, gridWireMat);
      gridMesh.rotation.x = -Math.PI / 2;
      gridMesh.position.y = 0.01;
      scene.add(gridMesh);
    }

    // 6. Coordinate Projection Helper
    const lat0 = 30.3695;
    const lon0 = 76.3775;
    const project = (lat, lon) => {
      const x = (lon - lon0) * (90000 / 22);
      const z = -(lat - lat0) * (111000 / 22);
      const elev = (x - z) * 0.03; // matches terrain elevation slope
      return { x, y: elev, z };
    };

    const selectedKeys = new Set(
      selectedInterventions.map((iv) => `${iv.type}:${iv.target}`)
    );

    // 7. Render 3D Water Pond / Reservoir
    const pondPos = project(30.3682, 76.3765);
    const pondGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
    });
    const pondMesh = new THREE.Mesh(pondGeo, pondMat);
    pondMesh.position.set(pondPos.x, pondPos.y + 0.1, pondPos.z);
    scene.add(pondMesh);

    // 8. Render Roads with Solid Meshes & Status Coloring
    village.edges.forEach((e) => {
      const a = village.nodes[e.a];
      const b = village.nodes[e.b];
      if (!a || !b) return;

      const pA = project(a.lat, a.lon);
      const pB = project(b.lat, b.lon);

      const isUpgraded = selectedKeys.has(`road_upgrade:${e.id}`);
      const color = isUpgraded ? 0x00e5ff : e.condition === 'good' ? 0x10b981 : 0xf59e0b;

      // Road Line
      const points = [
        new THREE.Vector3(pA.x, pA.y + 0.08, pA.z),
        new THREE.Vector3(pB.x, pB.y + 0.08, pB.z),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        linewidth: isUpgraded ? 4 : 3,
      });
      const roadLine = new THREE.Line(lineGeo, lineMat);
      scene.add(roadLine);
    });

    // Proposed Road E6
    if (village.proposed_edge) {
      const pe = village.proposed_edge;
      const pa = village.nodes[pe.a];
      const pb = village.nodes[pe.b];
      if (pa && pb) {
        const pA = project(pa.lat, pa.lon);
        const pB = project(pb.lat, pb.lon);
        const isBuilt = selectedKeys.has(`road_new:${pe.id}`);

        const points = [
          new THREE.Vector3(pA.x, pA.y + 0.08, pA.z),
          new THREE.Vector3(pB.x, pB.y + 0.08, pB.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({
          color: isBuilt ? 0x00e5ff : 0x64748b,
          dashSize: 0.6,
          gapSize: 0.3,
        });
        const roadLine = new THREE.Line(lineGeo, lineMat);
        roadLine.computeLineDistances();
        scene.add(roadLine);
      }
    }

    // 9. Render School Facility Beacon & Pulsing Radar
    if (village.facilities?.SCHOOL) {
      const sNode = village.nodes[village.facilities.SCHOOL.node];
      if (sNode) {
        const pos = project(sNode.lat, sNode.lon);

        // Tower
        const beaconGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.2, 16);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          emissive: 0x00e5ff,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(pos.x, pos.y + 1.6, pos.z);
        beaconMesh.castShadow = true;
        scene.add(beaconMesh);

        // Pulsing Ring at Top
        const ringGeo = new THREE.RingGeometry(0.6, 0.9, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x00e5ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(pos.x, pos.y + 3.2, pos.z);
        scene.add(ringMesh);
      }
    }

    // 10. Render Active Water Points & Coverage Buffer Rings
    const activeWaterPoints = new Set(village.water_points || []);
    selectedInterventions.forEach((iv) => {
      if (iv.type === 'water_point') activeWaterPoints.add(iv.target);
    });

    activeWaterPoints.forEach((nodeId) => {
      const node = village.nodes[nodeId];
      if (node) {
        const pos = project(node.lat, node.lon);

        // Water Post
        const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.4, 12);
        const postMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
        });
        const postMesh = new THREE.Mesh(postGeo, postMat);
        postMesh.position.set(pos.x, pos.y + 0.7, pos.z);
        scene.add(postMesh);

        // 150m Service Buffer Ring on Ground
        if (showWaterRadius) {
          const bufferRadius3D = (150 / 22) * 0.9;
          const bufferGeo = new THREE.RingGeometry(bufferRadius3D - 0.1, bufferRadius3D + 0.1, 48);
          const bufferMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
          });
          const bufferRing = new THREE.Mesh(bufferGeo, bufferMat);
          bufferRing.rotation.x = Math.PI / 2;
          bufferRing.position.set(pos.x, pos.y + 0.05, pos.z);
          scene.add(bufferRing);
        }
      }
    });

    // 11. Render Extruded Buildings with Roof Geometry & Live Status Glow
    const metricsToUse = activeMetrics || baselineMetrics;
    const accessibleSet = new Set();
    if (metricsToUse && metricsToUse.buildings) {
      metricsToUse.buildings.forEach((b) => {
        if (b.school_accessible) accessibleSet.add(b.id);
      });
    }

    village.buildings.forEach((b) => {
      const pos = project(b.lat, b.lon);
      const isOk = accessibleSet.has(b.id);
      const bNum = parseInt(b.id.replace(/\D/g, ''), 10) || 1;
      const heightVal = 1.0 + (bNum % 3) * 0.4;

      // House Body
      const boxGeo = new THREE.BoxGeometry(0.9, heightVal, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: isOk ? 0x10b981 : 0xf43f5e,
        emissive: isOk ? 0x059669 : 0xbe123c,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.1,
      });

      const buildingMesh = new THREE.Mesh(boxGeo, boxMat);
      buildingMesh.position.set(pos.x, pos.y + heightVal / 2, pos.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      scene.add(buildingMesh);

      // Pitched Roof
      const roofGeo = new THREE.ConeGeometry(0.75, 0.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({
        color: isOk ? 0x064e3b : 0x881337,
        roughness: 0.5,
      });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(pos.x, pos.y + heightVal + 0.25, pos.z);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      scene.add(roofMesh);
    });

    // 12. Mouse Drag Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      scene.rotation.y += deltaX * 0.007;
      camera.position.y = Math.max(3, Math.min(35, camera.position.y + deltaY * 0.05));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 13. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotatingRef.current && !isDragging) {
        scene.rotation.y += 0.0025;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 14. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 700;
      const newHeight = parseInt(height, 10) || 480;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [
    village,
    activeMetrics,
    baselineMetrics,
    selectedInterventions,
    showWaterRadius,
    showElevationGrid,
    height,
  ]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#080c14] shadow-command">
      {/* Top Controls Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-[#0e1624]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400 flex items-center space-x-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold">3D Digital Twin Engine</span>
        </div>

        {/* Camera Angle Presets */}
        <div className="flex items-center space-x-1 bg-[#0e1624]/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md text-xs">
          <button
            onClick={() => applyCameraPreset('iso')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              cameraPreset === 'iso'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric 45°
          </button>

          <button
            onClick={() => applyCameraPreset('top')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              cameraPreset === 'top'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top-Down 2D
          </button>

          <button
            onClick={() => applyCameraPreset('horizon')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              cameraPreset === 'horizon'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Street Horizon
          </button>
        </div>

        {/* Rotation Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-md transition-colors flex items-center space-x-1.5 shadow-md ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-[#0e1624]/90 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title={autoRotate ? 'Pause Auto Rotation' : 'Resume Auto Rotation'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>

        {/* Toggle Buffers */}
        <button
          onClick={() => setShowWaterRadius(!showWaterRadius)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-md transition-colors flex items-center space-x-1.5 shadow-md ${
            showWaterRadius
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-[#0e1624]/90 text-slate-400 border-slate-800'
          }`}
          title="Toggle 150m Water Service Buffers"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Water Rings</span>
        </button>
      </div>

      {/* Helper Legend in Bottom Right */}
      <div className="absolute bottom-3 right-3 z-10 bg-[#0e1624]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
          <span>Extruded Building (School Accessible)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />
          <span>Extruded Building (Needs Access)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
          <span>Village Pond / Water Point</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
          <span>School Beacon / Active Corridor</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          Click and drag to rotate · Scroll to zoom
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ height, width: '100%' }} />
    </div>
  );
}
