import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Sun, Moon, Sunrise, Sunset,
  Maximize2, Minimize2, X,
  GraduationCap, Droplets, Navigation,
  Play, Pause, Zap, Sparkles,
} from 'lucide-react';
import { useVillage } from '../../context/VillageContext';
import {
  createHouse,
  createSchool,
  createWaterTower,
  createTree,
  createRoadSegment,
  createPond,
  createSkyDome,
  createSolarFarm,
  createSolarTable,
  createBESSUnit,
  createDieselGenShed,
  createPalmTree,
  createBanyanTree,
  makeGeoConverter,
  makeGroundTex,
  makeWallMat,
  makeRoofMat,
  makeGroundMat,
  makeFarmlandMat,
  makeRoadMat,
  makeWaterMat,
  applyHighlight,
  disposeGroup,
  PALETTE,
} from './villageKit.js';

// ============================================================================
// 1. INTERNAL CANVAS HELPER (sky gradients only — textures come from villageKit)
// ============================================================================

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function _unused() {
  // (All texture + geometry factories moved to villageKit.js)
}

// ============================================================================
// 2. TIME OF DAY LIGHTING & ATMOSPHERE PROFILES
// ============================================================================

const TIME_OF_DAY = {
  dawn: {
    label: 'Dawn',
    sky: ['#281845', '#f89a68'],
    sunColor: 0xffb870,
    sunIntensity: 1.8,
    sunPos: [32, 22, 28],
    hemiSky: 0xf5b088,
    hemiGround: 0x304020,
    hemiIntensity: 0.65,
    fogColor: 0xd89c74,
    fogDensity: 0.005,
    exposure: 1.05,
    nightLights: false,
    particlesColor: 0xffe8b0,
  },
  day: {
    label: 'Day',
    sky: ['#1952a8', '#bde0fe'],
    sunColor: 0xfffaed,
    sunIntensity: 2.8,
    sunPos: [45, 95, 38],
    hemiSky: 0xbfe0ff,
    hemiGround: 0x486432,
    hemiIntensity: 0.85,
    fogColor: 0xc4dcfa,
    fogDensity: 0.004,
    exposure: 1.15,
    nightLights: false,
    particlesColor: 0xffffff,
  },
  dusk: {
    label: 'Dusk',
    sky: ['#210936', '#f26222'],
    sunColor: 0xff7728,
    sunIntensity: 2.0,
    sunPos: [-42, 24, 32],
    hemiSky: 0xff8c55,
    hemiGround: 0x332014,
    hemiIntensity: 0.6,
    fogColor: 0xdc7c4c,
    fogDensity: 0.005,
    exposure: 1.05,
    nightLights: true,
    particlesColor: 0xffd080,
  },
  night: {
    label: 'Night',
    sky: ['#030712', '#0d1b33'],
    sunColor: 0x4870b0, // Moonlight
    sunIntensity: 0.45,
    sunPos: [28, 55, -28],
    hemiSky: 0x1a2e54,
    hemiGround: 0x0a1018,
    hemiIntensity: 0.35,
    fogColor: 0x091424,
    fogDensity: 0.006,
    exposure: 0.8,
    nightLights: true,
    particlesColor: 0x44ffaa, // Bioluminescent fireflies
  },
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

export function DigitalTwin3D({
  village,
  activeMetrics = null,
  baselineMetrics = null,
  selectedInterventions = [],
  elevationProfile = null,
  height = '520px',
  onObjectClick = null,
}) {
  const { appMode } = useVillage();
  const mountRef = useRef(null);
  const onObjectClickRef = useRef(onObjectClick);
  useEffect(() => {
    onObjectClickRef.current = onObjectClick;
  }, [onObjectClick]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('iso'); // 'iso' | 'top' | 'horizon'
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showWaterRadius, setShowWaterRadius] = useState(true);
  const [showFoliage, setShowFoliage] = useState(true);
  const [inspectedEntity, setInspectedEntity] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // WASD / Arrow Keys Navigation State
  const keysPressedRef = useRef({});
  const [pressedKeys, setPressedKeys] = useState({});
  const [isNavWidgetCollapsed, setIsNavWidgetCollapsed] = useState(false);

  const setNavKey = useCallback((code, isDown) => {
    keysPressedRef.current[code] = isDown;
    setPressedKeys(prev => {
      if (isDown) return { ...prev, [code]: true };
      const next = { ...prev };
      delete next[code];
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      const code = e.code;
      const navCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE', 'Space', 'ShiftLeft', 'ShiftRight'];
      if (navCodes.includes(code)) {
        keysPressedRef.current[code] = true;
        setPressedKeys(prev => ({ ...prev, [code]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (keysPressedRef.current[code]) {
        keysPressedRef.current[code] = false;
        setPressedKeys(prev => {
          const next = { ...prev };
          delete next[code];
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Scene references
  const isRotatingRef = useRef(true);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const dirLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const waterMeshRef = useRef(null);
  const flagMeshRef = useRef(null);
  const nightLightsGroupRef = useRef(null);
  const windowEmissivesRef = useRef([]);
  const skyDomeRef = useRef(null);

  useEffect(() => {
    isRotatingRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Smooth camera tween helper
  const tweenCamera = useCallback((targetPos, targetLookAt, duration = 1.2) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function step(now) {
      const elapsed = (now - startTime) / (duration * 1000);
      const t = Math.min(elapsed, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLookAt, ease);
      controls.update();

      if (t < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, []);

  const handleApplyPreset = (preset) => {
    setCameraPreset(preset);
    if (preset === 'top') {
      tweenCamera(new THREE.Vector3(0.01, 56, 0.01), new THREE.Vector3(0, 0, 0), 1.3);
    } else if (preset === 'horizon') {
      tweenCamera(new THREE.Vector3(0, 3.2, 16), new THREE.Vector3(0, 1.8, -4), 1.3);
    } else {
      // Isometric 45
      tweenCamera(new THREE.Vector3(18, 22, 26), new THREE.Vector3(0, 0, 0), 1.3);
    }
  };

  const handleFocusEntity = (pos) => {
    tweenCamera(
      new THREE.Vector3(pos.x + 4, pos.y + 4.5, pos.z + 5.5),
      new THREE.Vector3(pos.x, pos.y + 1, pos.z),
      1.0
    );
  };

  // Switch Time of Day Environment
  const applyTimeOfDay = useCallback((todKey) => {
    setTimeOfDay(todKey);
    const tod = TIME_OF_DAY[todKey];
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;

    if (!scene || !renderer || !dirLight || !hemiLight) return;

    // 1. Sky Gradient — update sky dome texture
    const [sc, sctx] = makeCanvas(2, 512);
    const grad = sctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, tod.sky[0]);
    grad.addColorStop(1, tod.sky[1]);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 2, 512);
    const skyTex = new THREE.CanvasTexture(sc);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    if (skyDomeRef.current) {
      skyDomeRef.current.material.map = skyTex;
      skyDomeRef.current.material.needsUpdate = true;
    }
    // Fallback: also set scene.background for when sky dome isn't ready
    scene.background = skyTex;

    // 2. Fog
    scene.fog.color.set(tod.fogColor);
    scene.fog.density = tod.fogDensity;

    // 3. Sun / Directional Light
    dirLight.color.set(tod.sunColor);
    dirLight.intensity = tod.sunIntensity;
    dirLight.position.set(...tod.sunPos);

    // 4. Hemisphere Light
    hemiLight.color.set(tod.hemiSky);
    hemiLight.groundColor.set(tod.hemiGround);
    hemiLight.intensity = tod.hemiIntensity;

    // 5. Exposure
    renderer.toneMappingExposure = tod.exposure;

    // 6. Night Window & Street Light Glow
    if (nightLightsGroupRef.current) {
      nightLightsGroupRef.current.visible = tod.nightLights;
    }
    windowEmissivesRef.current.forEach((mat) => {
      mat.emissive.set(tod.nightLights ? 0xf59e0b : 0x0284c7);
      mat.emissiveIntensity = tod.nightLights ? 0.9 : 0.15;
    });
  }, []);

  // Main 3D Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !village) return;

    // (Textures come from villageKit.js — no pre-caching needed)

    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x9dc8e8, 0.003);
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(52, width / heightPx, 0.1, 1200);
    // Bird's eye view showing the whole village
    camera.position.set(0, 55, 60);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 600;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(0, 2, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.45;
    controlsRef.current = controls;

    // Sky dome (gradient sphere, visible from inside)
    const skyDome = createSkyDome('#1a3562', '#b2d4f2');
    scene.add(skyDome);
    skyDomeRef.current = skyDome;

    // 2. Lighting  — hemisphere + soft directional + fill
    const hemiLight = new THREE.HemisphereLight(0xb0d0ff, 0x587840, 0.75);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff5e8, 2.6);
    dirLight.position.set(55, 110, 45);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(4096, 4096);
    dirLight.shadow.camera.left   = -180;
    dirLight.shadow.camera.right  =  180;
    dirLight.shadow.camera.top    =  180;
    dirLight.shadow.camera.bottom = -180;
    dirLight.shadow.camera.near   = 1;
    dirLight.shadow.camera.far    = 450;
    dirLight.shadow.bias          = -0.0006;
    dirLight.shadow.normalBias    = 0.02;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Cool-blue fill from opposite side
    const fillLight = new THREE.DirectionalLight(0x8ab0d8, 0.4);
    fillLight.position.set(-40, 30, -40);
    scene.add(fillLight);

    // Group for lights active only at dusk/night
    const nightLightsGroup = new THREE.Group();
    nightLightsGroup.visible = false;
    scene.add(nightLightsGroup);
    nightLightsGroupRef.current = nightLightsGroup;

    windowEmissivesRef.current = [];

    // 3. Coordinate Projection Helper — real metres (1 unit = 1 m)
    const firstNode = village?.nodes ? Object.values(village.nodes)[0] : null;
    const centerLat = village?.meta?.center?.[0] || village?.center?.[0] || (firstNode ? firstNode.lat : 30.3695);
    const centerLon = village?.meta?.center?.[1] || village?.center?.[1] || (firstNode ? firstNode.lon : 76.3775);
    const geo = makeGeoConverter(centerLat, centerLon);
    const toSceneCoords = (lat, lon) => geo.toXZ(lat, lon);

    // Elevation: gentle undulation across wide 800m terrain
    const getElevation = (x, z) => (
      Math.sin(x * 0.04) * 0.35 +
      Math.cos(z * 0.035) * 0.3 +
      (x - z) * 0.005
    );

    // 4. Terrain — expansive 800m x 800m lush monsoon grass meadow
    const terrainGeo = new THREE.PlaneGeometry(800, 800, 160, 160);
    const tPos = terrainGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      const px = tPos.getX(i);
      const pz = tPos.getY(i);
      tPos.setZ(i, getElevation(px, -pz));
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeo, makeGroundMat());
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Surrounding Farmland Cadastral Parcels across the expansive 800m canvas
    const fieldPatches = [
      { x: -26, z: -20, w: 22, d: 16, rot: 0.08 },
      { x: 26, z: -18, w: 20, d: 18, rot: -0.05 },
      { x: -24, z: 24, w: 22, d: 20, rot: 0.1 },
      { x: 24, z: 26, w: 20, d: 18, rot: -0.08 },
      { x: 0, z: -32, w: 28, d: 14, rot: 0.02 },
      { x: -32, z: 2, w: 16, d: 24, rot: -0.04 },
      // Expansive 800m perimeter farmlands
      { x: -65, z: -55, w: 45, d: 38, rot: 0.04 },
      { x: 62, z: -60, w: 40, d: 42, rot: -0.06 },
      { x: -68, z: 52, w: 44, d: 36, rot: 0.07 },
      { x: 68, z: 58, w: 42, d: 38, rot: -0.05 },
      { x: 0, z: 85, w: 55, d: 32, rot: 0.02 },
      { x: 0, z: -90, w: 52, d: 34, rot: -0.03 },
      { x: -105, z: -10, w: 40, d: 55, rot: 0.05 },
      { x: 105, z: 12, w: 42, d: 52, rot: -0.04 },
    ];
    fieldPatches.forEach((fp) => {
      const fGeo = new THREE.PlaneGeometry(fp.w, fp.d, 12, 12);
      const fPos = fGeo.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const lx = fPos.getX(i) + fp.x;
        const lz = -(fPos.getY(i) + fp.z);
        fPos.setZ(i, getElevation(lx, lz) + 0.03);
      }
      fGeo.computeVertexNormals();
      const fMesh = new THREE.Mesh(
        fGeo,
        makeFarmlandMat()
      );
      fMesh.rotation.x = -Math.PI / 2;
      fMesh.rotation.z = fp.rot;
      fMesh.receiveShadow = true;
      scene.add(fMesh);
    });

    // 5. Interactive Raycaster Registry
    const interactables = [];

    // 6. Selected Interventions Set
    const selectedKeys = new Set(
      selectedInterventions.map((iv) => `${iv.type}:${iv.target}`)
    );

    // 7. Roads using villageKit createRoadSegment
    const roadW = 4.5;  // metres
    village.edges.forEach((e) => {
      const aNode = village.nodes[e.a];
      const bNode = village.nodes[e.b];
      if (!aNode || !bNode) return;
      const [ax, az] = toSceneCoords(aNode.lat, aNode.lon);
      const [bx, bz] = toSceneCoords(bNode.lat, bNode.lon);
      const seg = createRoadSegment(ax, az, bx, bz, roadW, 0.06);
      scene.add(seg);
    });

    // Proposed Road E6 (N4 to N5)
    if (village.proposed_edge) {
      const pe = village.proposed_edge;
      const aNode = village.nodes[pe.a];
      const bNode = village.nodes[pe.b];
      if (aNode && bNode) {
        const [ax, az] = toSceneCoords(aNode.lat, aNode.lon);
        const [bx, bz] = toSceneCoords(bNode.lat, bNode.lon);
        if (selectedKeys.has(`road_new:${pe.id}`)) {
          scene.add(createRoadSegment(ax, az, bx, bz, roadW, 0.06));
        } else {
          // Dashed proposed alignment
          const pts = [
            new THREE.Vector3(ax, 0.1, az),
            new THREE.Vector3(bx, 0.1, bz),
          ];
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineDashedMaterial({ color: 0x00e5ff, dashSize: 1.2, gapSize: 0.6 })
          );
          line.computeLineDistances();
          scene.add(line);
        }
      }
    }

    // Roadside Solar Streetlights at Junctions
    Object.entries(village.nodes).forEach(([nodeId, n]) => {
      const [nx, nz] = toSceneCoords(n.lat, n.lon);
      const ny = getElevation(nx, nz);

      const poleGrp = new THREE.Group();
      poleGrp.position.set(nx + 1.2, ny, nz + 1.2);

      // Steel pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 3.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 })
      );
      pole.position.y = 1.9;
      pole.castShadow = true;
      poleGrp.add(pole);

      // Solar panel on top
      const sp = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.04, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 })
      );
      sp.position.set(0, 3.85, 0);
      sp.rotation.x = -0.3;
      poleGrp.add(sp);

      // LED Luminaire fixture
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.2),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xfff4cc,
          emissiveIntensity: 0.8,
        })
      );
      led.position.set(-0.25, 3.65, 0);
      poleGrp.add(led);

      // Warm night spotlight
      const streetPointLight = new THREE.PointLight(0xffdd99, 1.6, 12, 1.8);
      streetPointLight.position.set(-0.25, 3.4, 0);
      poleGrp.add(streetPointLight);

      scene.add(poleGrp);
      nightLightsGroup.add(streetPointLight);
    });

    // 8. Pond — villageKit createPond (ellipse shapgeGeometry)
    const [pondX, pondZ] = toSceneCoords(30.3678, 76.3755);
    const pondY = getElevation(pondX, pondZ);
    const pondGroup = createPond(28, 22);
    pondGroup.position.set(pondX, pondY, pondZ);
    scene.add(pondGroup);
    // For water animation, grab the first mesh child (water plane)
    waterMeshRef.current = pondGroup.children[0];

    // 9. Active Water Points & Coverage Buffer Rings
    const activeWaterPoints = new Set(village.water_points || []);
    selectedInterventions.forEach((iv) => {
      if (iv.type === 'water_point') activeWaterPoints.add(iv.target);
    });

    activeWaterPoints.forEach((nodeId) => {
      const node = village.nodes[nodeId];
      if (!node) return;

      const [wx, wz] = toSceneCoords(node.lat, node.lon);
      const wy = getElevation(wx, wz);

      const wpGrp = new THREE.Group();
      wpGrp.position.set(wx, wy, wz);

      // Concrete apron platform
      const apron = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.3, 0.2, 16),
        new THREE.MeshLambertMaterial({ color: 0xd4c8b0, roughness: 0.9 })
      );
      apron.position.y = 0.1;
      apron.receiveShadow = true;
      wpGrp.add(apron);

      // Cast iron hand pump body
      const pump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x166534, metalness: 0.6, roughness: 0.4 })
      );
      pump.position.y = 0.7;
      pump.castShadow = true;
      wpGrp.add(pump);

      // Handle & spout
      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.7, roughness: 0.3 })
      );
      spout.rotation.z = Math.PI / 2;
      spout.position.set(0.2, 0.85, 0);
      wpGrp.add(spout);

      // 150m Service Radius Ring (real metres: 150m radius in scene units)
      if (showWaterRadius) {
        const ringRadius = 150;  // real metres in scene
        const ringGeo = new THREE.RingGeometry(ringRadius - 1.5, ringRadius + 1.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x00e5ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.28,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.08;
        wpGrp.add(ring);
      }

      wpGrp.userData = {
        name: `Deep Drinking Water Borewell (${node.label || nodeId})`,
        type: 'Water Infrastructure',
        zone: nodeId === 'N5' || nodeId === 'N6' ? 'Zone B' : 'Zone A',
        details: 'Govt. Mark II Deep Borewell Hand Pump providing clean potable drinking water within a 150m walking radius.',
        pos: { x: wx, y: wy, z: wz },
      };

      interactables.push(wpGrp);
      scene.add(wpGrp);
    });

    // 10. School — villageKit createSchool()
    const schoolNode = village.nodes.N3;
    if (schoolNode) {
      const [sx, sz] = toSceneCoords(schoolNode.lat + 0.0003, schoolNode.lon + 0.0004);
      const sy = getElevation(sx, sz);

      const schoolGrp = createSchool();
      schoolGrp.position.set(sx, sy, sz);

      // Tricolor flag (animated)
      const [fc, fctx] = makeCanvas(140, 85);
      fctx.fillStyle = '#ff671f'; fctx.fillRect(0, 0, 140, 28);
      fctx.fillStyle = '#ffffff'; fctx.fillRect(0, 28, 140, 29);
      fctx.fillStyle = '#046a38'; fctx.fillRect(0, 57, 140, 28);
      fctx.strokeStyle = '#06038d'; fctx.lineWidth = 1.5;
      fctx.beginPath(); fctx.arc(70, 42.5, 11, 0, Math.PI * 2); fctx.stroke();
      const flagTex = new THREE.CanvasTexture(fc);
      flagTex.colorSpace = THREE.SRGBColorSpace;
      const flagMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.1),
        new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide })
      );
      // Flag pole was added by createSchool at x=10, y=6.5, z=-2.5
      flagMesh.position.set(10.95, 6.5, -2.5);
      flagMeshRef.current = flagMesh;
      // Rooftop solar table on School flat roof
      const schoolSolar = createSolarTable(6, 15);
      schoolSolar.position.set(0, 4.8, 0);
      schoolGrp.add(schoolSolar);

      schoolGrp.userData = {
        name: 'Government Primary School',
        type: 'Civic Education Facility',
        zone: 'Zone A (Core)',
        details: 'Serving 128 rural students (Classes 1–5). Features midday meal kitchen and active community education programs.',
        pos: { x: sx, y: sy, z: sz },
      };
      interactables.push(schoolGrp);
      scene.add(schoolGrp);
    }


    // 11. Gram Panchayat Bhawan — createHouse() variant with dome accent
    let px = -10, pz = 10;
    const pNode = village.nodes.N2;
    if (pNode) {
      const pCoords = toSceneCoords(pNode.lat - 0.0004, pNode.lon - 0.0003);
      px = pCoords[0];
      pz = pCoords[1];
      const py = getElevation(px, pz);
      const pGrp = createHouse({ w: 12, d: 8, h: 4.0, roofH: 1.5, type: 'plaster' });
      pGrp.position.set(px, py, pz);
      // Add dome accent
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: 0x7c3aed })
      );
      dome.position.set(0, 4.0, 0);
      dome.castShadow = true;
      pGrp.add(dome);
      pGrp.userData = {
        name: 'Gram Panchayat Bhawan & CSC Hub',
        type: 'Civic Administration',
        zone: 'Zone A (Village Core)',
        details: 'Gram Sabha council chamber, citizen digital services kiosk, and land revenue cadastral records archive.',
        pos: { x: px, y: py, z: pz },
      };
      // Rooftop solar table on Panchayat
      const pSolar = createSolarTable(4, 15);
      pSolar.position.set(-3, 4.2, 0);
      pGrp.add(pSolar);

      interactables.push(pGrp);
      scene.add(pGrp);
    }

    // 11.5 VILLAGE COMMUNITY SOLAR MICROGRID & BESS FACILITY (SDG 7 Clean Energy Transition)
    const [solX, solZ] = toSceneCoords(30.3690, 76.3788);
    const solY = getElevation(solX, solZ);

    const solarMicrogridGrp = new THREE.Group();
    solarMicrogridGrp.position.set(solX, solY, solZ);

    // 1. 25-Panel Ground-Mounted Solar Array (10 kWp, produces 50 kWh/day)
    const solarArray = createSolarFarm(25);
    solarMicrogridGrp.add(solarArray);

    // 2. 25 kWh Battery Energy Storage System (BESS) container unit
    const bess = createBESSUnit();
    bess.position.set(-11, 0, -2);
    solarMicrogridGrp.add(bess);

    // 3. Decommissioned Diesel Generator Shed (replaced by clean solar)
    const oldDieselShed = createDieselGenShed();
    oldDieselShed.position.set(-11, 0, 5);
    solarMicrogridGrp.add(oldDieselShed);

    solarMicrogridGrp.userData = {
      id: 'SOLAR_MICROGRID_FACILITY',
      name: 'Village Community Solar Microgrid & BESS',
      type: 'SDG 7 Clean Energy Transition',
      zone: 'Zone A Renewable Energy Hub',
      isSolar: true,
      details: '25 high-efficiency 400W monocrystalline solar panels (10 kWp) + 25 kWh Battery Energy Storage System. Completely replaced the polluting diesel generator, eliminating 21.7 Metric Tons of CO₂e annually and redirecting ₹9.13 Lakhs/year toward education and healthcare.',
      pos: { x: solX, y: solY, z: solZ },
    };
    interactables.push(solarMicrogridGrp);
    scene.add(solarMicrogridGrp);

    // 12. Temple — createHouse() base + Shikhara cone (retained)
    const [templeX, templeZ] = toSceneCoords(30.3700, 76.3770);
    const templeY = getElevation(templeX, templeZ);
    const templeGrp = createHouse({ w: 6, d: 6, h: 3.5, roofH: 0, type: 'plaster' });
    templeGrp.position.set(templeX, templeY, templeZ);
    // Shikhara spire
    const shikhara = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 5.0, 4),
      new THREE.MeshLambertMaterial({ color: 0xd97706 })
    );
    shikhara.position.set(0, 3.5, 0);
    shikhara.rotation.y = Math.PI / 4;
    shikhara.castShadow = true;
    templeGrp.add(shikhara);
    const kalash = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 10),
      new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    kalash.position.set(0, 8.6, 0);
    templeGrp.add(kalash);
    templeGrp.userData = {
      name: 'Village Community Shrine & Gathering Chabutra',
      type: 'Cultural & Community Landmark',
      zone: 'Village Core Heritage',
      details: 'Traditional banyan courtyard gathering hub where elders and farmers convene for evening dialogue.',
      pos: { x: templeX, y: templeY, z: templeZ },
    };
    interactables.push(templeGrp);
    scene.add(templeGrp);

    // 13. Realistic Residential Homesteads (B1 to B10)
    const metricsToUse = activeMetrics || baselineMetrics;
    const buildingMetricsMap = {};
    if (metricsToUse?.buildings) {
      metricsToUse.buildings.forEach((bm) => {
        buildingMetricsMap[bm.id] = bm;
      });
    }

    const HOUSE_DETAILS = {
      B1: { name: "Harpreet Singh's Farmhouse", story: 'Farmer household, 6 members. Actively cultivates wheat and mustard.' },
      B2: { name: "Gurmeet's Pottery Workshop", story: 'Traditional artisan household with kiln workshop near market junction.' },
      B3: { name: "Headmaster Sharma's Residence", story: 'Senior educator household, resides adjacent to school lane.' },
      B4: { name: "Raman's Dairy Homestead", story: 'Dairy cooperative supplier with 8 cattle sheds on east corridor.' },
      B10: { name: 'Kirana General Merchant Store', story: 'Village convenience shop and flour mill supplier.' },
      B5: { name: "Balwinder's Extended Family House", story: 'Agricultural family, 8 members. Long walking distance to primary school.' },
      B6: { name: 'Kaur Family Homestead', story: 'Handicraft weaver household situated in outer hamlet.' },
      B7: { name: "Amrik's Orchard Cottage", story: 'Citrus and guava orchard grower living beside village pond.' },
      B8: { name: "Surjit's Homestead", story: 'Marginal farmer household near irrigation reservoir.' },
      B9: { name: "Dalbir's Weaver Cottage", story: 'Outer hamlet homestead seeking improved road connectivity.' },
    };

    village.buildings.forEach((b) => {
      const [bx, bz] = toSceneCoords(b.lat, b.lon);
      const by = getElevation(bx, bz);

      const bMetrics = buildingMetricsMap[b.id] || {};
      const isSchoolOk = bMetrics.school_accessible ?? false;
      const isWaterOk = (bMetrics.water_dist_m || 200) <= 150;

      const houseDetails = HOUSE_DETAILS[b.id] || {
        name: `Household ${b.id}`,
        story: 'Rural family residence.',
      };

      // 13. Houses — villageKit createHouse() with hip roof
      const wallType = b.zone === 'zoneA' ? 'brick' : 'plaster';
      const hGrp = createHouse({ w: 7, d: 6, h: 3.5, roofH: 2.0, type: wallType });
      hGrp.position.set(bx, by, bz);
      hGrp.rotation.y = Math.random() * Math.PI * 2;

      // Status LED beacon on ridge
      const statusColor = isSchoolOk && isWaterOk ? 0x10b981 : isSchoolOk || isWaterOk ? 0xf59e0b : 0xf43f5e;
      const statusLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 6),
        new THREE.MeshLambertMaterial({ color: statusColor, emissive: statusColor, emissiveIntensity: 0.9 })
      );
      statusLed.position.set(0, 6.0, 0);
      hGrp.add(statusLed);

      // Window glow material for night mode
      const winMat = new THREE.MeshLambertMaterial({
        color: 0xfff3c4,
        emissive: 0x0284c7,
        emissiveIntensity: 0.15,
      });
      windowEmissivesRef.current.push(winMat);

      hGrp.userData = {
        id: b.id,
        name: houseDetails.name,
        type: 'Residential Homestead',
        zone: b.zone === 'zoneA' ? 'Zone A (Village Core)' : 'Zone B (Outer Hamlet)',
        anchor: b.anchor,
        schoolTime: bMetrics.school_time_min != null ? `${bMetrics.school_time_min} min` : '4 min',
        isSchoolOk,
        waterDist: bMetrics.water_dist_m != null ? `${Math.round(bMetrics.water_dist_m)} m` : '120 m',
        isWaterOk,
        story: houseDetails.story,
        pos: { x: bx, y: by, z: bz },
      };
      interactables.push(hGrp);
      scene.add(hGrp);
    }); // end village.buildings.forEach

    // 14. Foliage & Rural Vegetation (Banyan trees, Coconut/Date Palms, & Deciduous trees)
    if (showFoliage) {
      // Majestic Banyan trees (Village courtyard & Temple chabutra)
      const banyanSpots = [
        [templeX + 6, templeZ - 4, 1.1],
        [pNode ? px - 8 : -8, pNode ? pz + 6 : 8, 1.0],
      ];
      banyanSpots.forEach(([bx, bz, bScale], bi) => {
        const by = getElevation(bx, bz);
        const banyan = createBanyanTree(bScale, bi * 1337 + 7);
        banyan.position.set(bx, by, bz);
        scene.add(banyan);
      });

      // Palm trees around the Pond banks & canal paths
      const palmSpots = [
        [pondX - 18, pondZ - 10, 1.15],
        [pondX + 18, pondZ - 8, 1.2],
        [pondX - 14, pondZ + 14, 0.95],
        [pondX + 16, pondZ + 12, 1.05],
        [pondX - 22, pondZ + 2, 1.1],
        [pondX + 22, pondZ + 1, 0.9],
        [pondX + 2, pondZ - 18, 1.25],
        [pondX - 4, pondZ + 18, 1.0],
        [solX + 12, solZ - 8, 1.1],
        [solX + 10, solZ + 8, 0.95],
      ];
      palmSpots.forEach(([px, pz, pScale], pi) => {
        const py = getElevation(px, pz);
        const palm = createPalmTree(pScale, pi * 2477 + 3);
        palm.position.set(px, py, pz);
        scene.add(palm);
      });

      // Natural rural canopy trees distributed across homesteads & fields
      const treeCoords = [
        [-10,-6],[7,-9],[-6,10],[12,7],[-4,-13],[9,-3],
        [-13,-10],[6,-14],[-9,13],[16,12],[-16,3],[10,-11],
        [-3,16],[13,-9],[-11,9],[5,17],[-17,-13],[18,4],
        [-18,9],[6,-17],[3,9],[-2,-5],[12,1],[-8,-2],
        [3,-18],[20,-12],[-17,17],[9,16],[-5,18],[16,16],
        [-9,14],[0,-16],[22,0],[-22,0],[0,22]
      ];
      treeCoords.forEach(([tx,tz], i) => {
        const ty = getElevation(tx, tz);
        const scale = 0.75 + Math.random() * 0.55;
        const tree = createTree(scale, i * 7919 + 1);
        tree.position.set(tx, ty, tz);
        scene.add(tree);
      });
    }

    // 15. Atmospheric Particles (Day Dust Motes / Night Fireflies)
    const particleCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 60;
      pPositions[i * 3 + 1] = Math.random() * 16 + 1;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 16. Raycaster Setup for User Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check hits against interactables
      const meshesToCheck = [];
      interactables.forEach((grp) => {
        grp.traverse((child) => {
          if (child.isMesh) {
            child._ownerGroup = grp;
            meshesToCheck.push(child);
          }
        });
      });

      const hits = raycaster.intersectObjects(meshesToCheck, false);
      if (hits.length > 0) {
        const owner = hits[0].object._ownerGroup;
        if (owner && owner.userData?.name) {
          setInspectedEntity({ ...owner.userData });
          if (onObjectClickRef.current) {
            onObjectClickRef.current(owner.userData);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 17. Animation & Render Loop
    let animationFrameId;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.015;

      // Gentle water ripple shimmer
      if (waterMeshRef.current) {
        waterMeshRef.current.rotation.z = Math.sin(clock * 0.4) * 0.05;
      }

      // Fluttering Indian Flag
      if (flagMeshRef.current) {
        flagMeshRef.current.rotation.y = Math.sin(clock * 2.5) * 0.2;
      }

      // Gentle particle drift
      const pArr = particles.geometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pArr[i] += Math.sin(clock + i) * 0.004;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // WASD / Keyboard Sandbox Camera Flight Navigation
      const keys = keysPressedRef.current;
      const isMoving =
        keys['KeyW'] || keys['ArrowUp'] ||
        keys['KeyS'] || keys['ArrowDown'] ||
        keys['KeyA'] || keys['ArrowLeft'] ||
        keys['KeyD'] || keys['ArrowRight'] ||
        keys['KeyQ'] || keys['KeyE'] || keys['Space'];

      if (isMoving) {
        if (controls.autoRotate) {
          controls.autoRotate = false;
        }

        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const isFast = keys['ShiftLeft'] || keys['ShiftRight'];
        const speed = isFast ? 1.2 : 0.45;
        const moveVector = new THREE.Vector3();

        if (keys['KeyW'] || keys['ArrowUp']) {
          moveVector.addScaledVector(forward, speed);
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
          moveVector.addScaledVector(forward, -speed);
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
          moveVector.addScaledVector(right, speed);
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
          moveVector.addScaledVector(right, -speed);
        }
        if (keys['KeyE'] || keys['Space']) {
          moveVector.y += speed * 0.6;
        }
        if (keys['KeyQ']) {
          moveVector.y -= speed * 0.6;
        }

        controls.target.add(moveVector);
        camera.position.add(moveVector);

        // Clamp camera altitude bounds to stay comfortably above ground and below sky
        if (camera.position.y < 2.0) {
          const diff = 2.0 - camera.position.y;
          camera.position.y = 2.0;
          controls.target.y += diff;
        } else if (camera.position.y > 180) {
          camera.position.y = 180;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 18. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 800;
      const newHeight = container.clientHeight || 520;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Apply active Time of Day
    applyTimeOfDay(timeOfDay);

    // 19. Clean-up Function
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
    };
  }, [
    village,
    activeMetrics,
    baselineMetrics,
    selectedInterventions,
    showWaterRadius,
    showFoliage,
    isExpanded,
  ]);

  return (
    <div
      className={`relative overflow-hidden bg-[#070b12] text-slate-100 transition-all duration-300 ${
        isExpanded
          ? 'fixed inset-0 z-[9999] w-screen h-screen'
          : 'w-full rounded-2xl border border-slate-800 shadow-command'
      }`}
      style={{ height: isExpanded ? '100vh' : height }}
    >
      {/* Top Left: Header & Branding Badge */}
      <div className={`absolute ${isExpanded ? 'top-3' : 'top-16 md:top-20'} left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto`}>
        <div className="bg-[#0b111c]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-xl flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-glow" />
          <span className="font-bold tracking-wider">Patiala / Kalyan 3D Twin</span>
          <span className="text-[10px] text-slate-400 font-sans">· Cadastral Sandbox</span>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="flex items-center space-x-1 bg-[#0b111c]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-md text-xs">
          <button
            onClick={() => handleApplyPreset('iso')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              cameraPreset === 'iso'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Isometric 45° angle view"
          >
            Isometric
          </button>

          <button
            onClick={() => handleApplyPreset('top')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              cameraPreset === 'top'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Top-Down 2D GIS Ortho view"
          >
            Top View
          </button>

          <button
            onClick={() => handleApplyPreset('horizon')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              cameraPreset === 'horizon'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Street Eye-Level perspective"
          >
            Street View
          </button>
        </div>

        {/* Auto-Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all flex items-center space-x-1.5 shadow-md ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-[#0b111c]/90 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title={autoRotate ? 'Pause Rotation' : 'Resume Auto Rotation'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
        </button>
      </div>

      {/* Top Right: Time of Day & Fullscreen Toggles */}
      <div className={`absolute ${isExpanded ? 'top-3' : 'top-16 md:top-20'} right-3 z-20 flex items-center space-x-2 pointer-events-auto`}>
        {/* Time of Day Switcher Pills */}
        <div className="flex items-center space-x-1 bg-[#0b111c]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-md">
          <button
            onClick={() => applyTimeOfDay('dawn')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              timeOfDay === 'dawn'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Dawn / Golden Sunrise"
          >
            <Sunrise className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dawn</span>
          </button>

          <button
            onClick={() => applyTimeOfDay('day')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              timeOfDay === 'day'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Day / High Sunlight"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Day</span>
          </button>

          <button
            onClick={() => applyTimeOfDay('dusk')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              timeOfDay === 'dusk'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Dusk / Sunset Glow"
          >
            <Sunset className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dusk</span>
          </button>

          <button
            onClick={() => applyTimeOfDay('night')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              timeOfDay === 'night'
                ? 'bg-indigo-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Night / Illuminated Village"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Night</span>
          </button>
        </div>

        {/* Toggle 150m Water Rings */}
        <button
          onClick={() => setShowWaterRadius(!showWaterRadius)}
          className={`p-2 rounded-xl border text-xs backdrop-blur-md transition-all shadow-md ${
            showWaterRadius
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-[#0b111c]/90 text-slate-400 border-slate-700/60'
          }`}
          title="Toggle 150m Safe Drinking Water Radius Rings"
        >
          <Droplets className="w-4 h-4" />
        </button>

        {/* Maximize / Restore Screen */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-[#0b111c]/90 hover:bg-[#131d2e] border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md"
          title={isExpanded ? 'Restore window size' : 'Expand Fullscreen 3D Twin'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Raycast Building / Entity Inspector Card */}
      {inspectedEntity && (
        <div className="absolute bottom-4 left-4 z-30 w-80 bg-[#0b111c]/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-700 shadow-2xl space-y-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                {inspectedEntity.type}
              </span>
              <h4 className="font-bold text-sm text-white leading-tight">
                {inspectedEntity.name}
              </h4>
            </div>
            <button
              onClick={() => setInspectedEntity(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-[#101826] p-2.5 rounded-xl border border-slate-800">
            {inspectedEntity.story || inspectedEntity.details}
          </div>

          {/* Resident Mode Action: Report Issue Directly for this Entity */}
          {appMode === 'simple' && (
            <button
              onClick={() => {
                if (onObjectClickRef.current) {
                  onObjectClickRef.current(inspectedEntity);
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-glow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Report Issue for {inspectedEntity.name} (+XP)</span>
            </button>
          )}

          {/* Action: Focus Camera */}
          {inspectedEntity.pos && (
            <button
              onClick={() => handleFocusEntity(inspectedEntity.pos)}
              className="w-full py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-glow"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Fly Camera to Building</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Right: Architectural & Infrastructure Legend */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:block bg-[#0b111c]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/60 text-[11px] font-mono text-slate-300 space-y-1.5 shadow-xl pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#b85a32] inline-block shadow-sm" />
          <span>Terracotta Brick Homesteads (B1–B10)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block shadow-sm" />
          <span>Govt. Primary School & Tricolor Flag</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block shadow-sm" />
          <span>Gram Panchayat Secretariat & Dome</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block shadow-sm" />
          <span>Village Mandir & Shikhara Spire</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block shadow-sm" />
          <span>Check Dam Reservoir & 150m Well Radius</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          WASD / Arrows to Fly · Click building to inspect · Drag to orbit · Scroll to zoom
        </div>
      </div>

      {/* Floating WASD Navigation Controls Widget */}
      <div className="absolute bottom-24 sm:bottom-6 left-3 z-20 pointer-events-auto select-none">
        {isNavWidgetCollapsed ? (
          <button
            onClick={() => setIsNavWidgetCollapsed(false)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0b111c]/90 backdrop-blur-md border border-slate-700/60 text-xs font-mono text-cyan-400 hover:text-cyan-300 shadow-xl transition-all"
            title="Expand WASD Navigation Controls"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="font-bold">WASD Controls</span>
          </button>
        ) : (
          <div className="bg-[#0a0f19]/92 backdrop-blur-xl p-3 rounded-2xl border border-slate-700/70 shadow-2xl flex flex-col items-center space-y-2">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Navigation className="w-3 h-3" />
                <span>Fly Navigation</span>
              </div>
              <button
                onClick={() => setIsNavWidgetCollapsed(true)}
                className="text-slate-500 hover:text-slate-300 ml-2"
                title="Minimize Controls"
              >
                ✕
              </button>
            </div>

            {/* D-Pad Keys */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onMouseDown={() => setNavKey('KeyW', true)}
                onMouseUp={() => setNavKey('KeyW', false)}
                onTouchStart={() => setNavKey('KeyW', true)}
                onTouchEnd={() => setNavKey('KeyW', false)}
                className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                  pressedKeys['KeyW'] || pressedKeys['ArrowUp']
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-95'
                    : 'bg-[#121a29] text-slate-300 border-slate-700 hover:border-cyan-500/50'
                }`}
                title="Move Forward (W / Up Arrow)"
              >
                W
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onMouseDown={() => setNavKey('KeyA', true)}
                  onMouseUp={() => setNavKey('KeyA', false)}
                  onTouchStart={() => setNavKey('KeyA', true)}
                  onTouchEnd={() => setNavKey('KeyA', false)}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                    pressedKeys['KeyA'] || pressedKeys['ArrowLeft']
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-95'
                      : 'bg-[#121a29] text-slate-300 border-slate-700 hover:border-cyan-500/50'
                  }`}
                  title="Strafe Left (A / Left Arrow)"
                >
                  A
                </button>

                <button
                  onMouseDown={() => setNavKey('KeyS', true)}
                  onMouseUp={() => setNavKey('KeyS', false)}
                  onTouchStart={() => setNavKey('KeyS', true)}
                  onTouchEnd={() => setNavKey('KeyS', false)}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                    pressedKeys['KeyS'] || pressedKeys['ArrowDown']
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-95'
                      : 'bg-[#121a29] text-slate-300 border-slate-700 hover:border-cyan-500/50'
                  }`}
                  title="Move Backward (S / Down Arrow)"
                >
                  S
                </button>

                <button
                  onMouseDown={() => setNavKey('KeyD', true)}
                  onMouseUp={() => setNavKey('KeyD', false)}
                  onTouchStart={() => setNavKey('KeyD', true)}
                  onTouchEnd={() => setNavKey('KeyD', false)}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                    pressedKeys['KeyD'] || pressedKeys['ArrowRight']
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-95'
                      : 'bg-[#121a29] text-slate-300 border-slate-700 hover:border-cyan-500/50'
                  }`}
                  title="Strafe Right (D / Right Arrow)"
                >
                  D
                </button>
              </div>
            </div>

            {/* Additional Altitude / Speed shortcuts */}
            <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span className={pressedKeys['KeyQ'] ? 'text-amber-300 font-bold' : ''}>Q: Down</span>
              <span>·</span>
              <span className={pressedKeys['KeyE'] ? 'text-amber-300 font-bold' : ''}>E: Up</span>
              <span>·</span>
              <span className={pressedKeys['ShiftLeft'] || pressedKeys['ShiftRight'] ? 'text-cyan-300 font-bold' : ''}>Shift: Sprint</span>
            </div>
          </div>
        )}
      </div>

      {/* WebGL Rendering Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
