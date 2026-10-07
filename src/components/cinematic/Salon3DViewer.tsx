import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  RotateCw,
  Sun,
  Moon,
  Sparkles,
  Camera,
  Info,
  Calendar,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface Salon3DViewerProps {
  onBookService?: (serviceName?: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export type CameraPreset = 'cinematic' | 'chair' | 'baby' | 'tools' | 'mirror';
export type LightingMode = 'golden' | 'midnight' | 'studio';

export const Salon3DViewer: React.FC<Salon3DViewerProps> = ({
  onBookService,
  isModal = false,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>('cinematic');
  const [lightingMode, setLightingMode] = useState<LightingMode>('golden');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('baby');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Audio synthesis ref (Web Audio API - self-contained ambient luxury tone)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // References for Three.js control
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    spotChair: THREE.SpotLight;
    spotBaby: THREE.SpotLight;
    pointMirror: THREE.PointLight;
    dirLight: THREE.DirectionalLight;
  } | null>(null);

  // Target camera coordinates for smooth interpolation
  const targetCamPos = useRef(new THREE.Vector3(0, 3.8, 8.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.6, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.6, 0));

  // Mouse orbit state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const orbitAngles = useRef({ theta: 0, phi: 0.35, radius: 8.5 });

  // Camera presets coordinates
  const presets: Record<CameraPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3; label: string; icon: string }> = {
    cinematic: {
      pos: new THREE.Vector3(0, 4.2, 9),
      lookAt: new THREE.Vector3(0, 1.5, 0),
      label: 'Cinematic Overview',
      icon: '🎬',
    },
    chair: {
      pos: new THREE.Vector3(-1.8, 2.5, 3.5),
      lookAt: new THREE.Vector3(-1.2, 1.6, 0),
      label: 'Master Chair (R & S Srinivas)',
      icon: '🪑',
    },
    baby: {
      pos: new THREE.Vector3(2.6, 2.3, 3.8),
      lookAt: new THREE.Vector3(1.8, 1.3, 0),
      label: 'Baby Station (Wednesdays • ₹1000)',
      icon: '👶',
    },
    tools: {
      pos: new THREE.Vector3(0.5, 2.2, 1.8),
      lookAt: new THREE.Vector3(0.2, 1.2, -0.6),
      label: 'Golden Shears & Tools',
      icon: '✂️',
    },
    mirror: {
      pos: new THREE.Vector3(0, 2.8, 4.5),
      lookAt: new THREE.Vector3(0, 2.5, -2.5),
      label: 'Vanity Mirror Station',
      icon: '🪞',
    },
  };

  const setPreset = useCallback((preset: CameraPreset) => {
    setActivePreset(preset);
    const target = presets[preset];
    targetCamPos.current.copy(target.pos);
    targetLookAt.current.copy(target.lookAt);
    orbitAngles.current.radius = target.pos.length();

    // Map to hotspot
    if (preset === 'baby') setSelectedHotspot('baby');
    else if (preset === 'chair') setSelectedHotspot('chair');
    else if (preset === 'tools') setSelectedHotspot('tools');
    else if (preset === 'mirror') setSelectedHotspot('mirror');
    else setSelectedHotspot(null);
  }, []);

  // Web Audio ambient tone generator
  const toggleAmbientAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Soft harmonic salon drone (Chords in C Major / Pentatonic for calm ambiance)
      const freqs = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // subtle LFO vibrato
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.05, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(2.0, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.04 / (idx + 1), ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setIsAudioPlaying(true);
    } else {
      if (audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
        setIsAudioPlaying(false);
      } else {
        audioCtxRef.current.resume();
        setIsAudioPlaying(true);
      }
    }
  };

  // Adjust lights on mode change
  useEffect(() => {
    if (!lightsRef.current) return;
    const { ambient, spotChair, spotBaby, pointMirror, dirLight } = lightsRef.current;

    if (lightingMode === 'golden') {
      ambient.color.setHex(0x5a3e1b);
      ambient.intensity = 1.2;
      spotChair.color.setHex(0xffe8ba);
      spotChair.intensity = 55;
      spotBaby.color.setHex(0xffd573);
      spotBaby.intensity = 50;
      pointMirror.color.setHex(0xffc55a);
      pointMirror.intensity = 35;
      dirLight.color.setHex(0xffdf96);
      dirLight.intensity = 1.5;
    } else if (lightingMode === 'midnight') {
      ambient.color.setHex(0x111625);
      ambient.intensity = 0.8;
      spotChair.color.setHex(0x56a4ff);
      spotChair.intensity = 45;
      spotBaby.color.setHex(0xffb733);
      spotBaby.intensity = 60;
      pointMirror.color.setHex(0x38bdf8);
      pointMirror.intensity = 40;
      dirLight.color.setHex(0x818cf8);
      dirLight.intensity = 0.8;
    } else {
      // Studio High-Key
      ambient.color.setHex(0x444444);
      ambient.intensity = 1.8;
      spotChair.color.setHex(0xffffff);
      spotChair.intensity = 70;
      spotBaby.color.setHex(0xfffae6);
      spotBaby.intensity = 65;
      pointMirror.color.setHex(0xffffff);
      pointMirror.intensity = 45;
      dirLight.color.setHex(0xffffff);
      dirLight.intensity = 2.2;
    }
  }, [lightingMode]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0d11);
    scene.fog = new THREE.FogExp2(0x0e0d11, 0.045);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 9);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. LIGHTING
    const ambient = new THREE.AmbientLight(0x5a3e1b, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffdf96, 1.5);
    dirLight.position.set(5, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Spotlight on Master Barber Chair
    const spotChair = new THREE.SpotLight(0xffe8ba, 55, 18, Math.PI / 4, 0.45, 1.2);
    spotChair.position.set(-1.2, 7, 1);
    spotChair.target.position.set(-1.2, 0, 0);
    spotChair.castShadow = true;
    scene.add(spotChair);
    scene.add(spotChair.target);

    // Spotlight on Wednesday Baby Station (Golden Amber Glow)
    const spotBaby = new THREE.SpotLight(0xffd573, 50, 16, Math.PI / 4.5, 0.4, 1.2);
    spotBaby.position.set(1.8, 6.5, 1);
    spotBaby.target.position.set(1.8, 0, 0);
    spotBaby.castShadow = true;
    scene.add(spotBaby);
    scene.add(spotBaby.target);

    // Mirror Vanity backlight
    const pointMirror = new THREE.PointLight(0xffc55a, 35, 8);
    pointMirror.position.set(0, 3.2, -2.4);
    scene.add(pointMirror);

    lightsRef.current = { ambient, spotChair, spotBaby, pointMirror, dirLight };

    // 4. MATERIALS
    const leatherBlack = new THREE.MeshStandardMaterial({
      color: 0x1f1d24,
      roughness: 0.35,
      metalness: 0.1,
    });
    const goldChrome = new THREE.MeshStandardMaterial({
      color: 0xe2b755,
      roughness: 0.18,
      metalness: 0.9,
    });
    const silverChrome = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.12,
      metalness: 0.95,
    });
    const babyCushionMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.15,
    });
    const woodFloorMat = new THREE.MeshStandardMaterial({
      color: 0x1c1713,
      roughness: 0.25,
      metalness: 0.1,
    });
    const darkWallMat = new THREE.MeshStandardMaterial({
      color: 0x131217,
      roughness: 0.7,
      metalness: 0.2,
    });
    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.05,
      metalness: 0.95,
    });

    // 5. SALON ARCHITECTURE (Floor & Walls)
    // Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floor = new THREE.Mesh(floorGeo, woodFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const backWallGeo = new THREE.PlaneGeometry(24, 10);
    const backWall = new THREE.Mesh(backWallGeo, darkWallMat);
    backWall.position.set(0, 5, -2.8);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Salon Accent Wooden Slats on Back Wall
    for (let i = -10; i <= 10; i += 0.8) {
      const slatGeo = new THREE.BoxGeometry(0.12, 10, 0.05);
      const slatMat = new THREE.MeshStandardMaterial({ color: 0x2a211a, roughness: 0.5 });
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(i, 5, -2.75);
      scene.add(slat);
    }

    // 6. VANITY MIRROR & COUNTER
    // Mirror Frame (Gold)
    const mirrorFrameGeo = new THREE.BoxGeometry(6.4, 3.6, 0.1);
    const mirrorFrame = new THREE.Mesh(mirrorFrameGeo, goldChrome);
    mirrorFrame.position.set(0, 3.2, -2.6);
    scene.add(mirrorFrame);

    // Mirror Glass
    const mirrorGlassGeo = new THREE.PlaneGeometry(6.1, 3.3);
    const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    mirrorGlass.position.set(0, 3.2, -2.54);
    scene.add(mirrorGlass);

    // Counter Table
    const counterGeo = new THREE.BoxGeometry(7.2, 0.2, 1.4);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x1f1915, roughness: 0.3, metalness: 0.2 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 1.2, -2.0);
    counter.castShadow = true;
    counter.receiveShadow = true;
    scene.add(counter);

    // 7. MASTER BARBER CHAIR (Hydraulic Classic)
    const masterChairGroup = new THREE.Group();
    masterChairGroup.position.set(-1.2, 0, 0);

    // Base plate
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.08, 32);
    const baseMesh = new THREE.Mesh(baseGeo, silverChrome);
    baseMesh.position.y = 0.04;
    baseMesh.castShadow = true;
    masterChairGroup.add(baseMesh);

    // Hydraulic Stem
    const stemGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.85, 24);
    const stemMesh = new THREE.Mesh(stemGeo, silverChrome);
    stemMesh.position.y = 0.48;
    stemMesh.castShadow = true;
    masterChairGroup.add(stemMesh);

    // Hydraulic pump foot pedal
    const pedalGeo = new THREE.BoxGeometry(0.1, 0.05, 0.5);
    const pedalMesh = new THREE.Mesh(pedalGeo, silverChrome);
    pedalMesh.position.set(0, 0.25, 0.4);
    masterChairGroup.add(pedalMesh);

    // Seat Cushion
    const seatGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.2, 32);
    const seatMesh = new THREE.Mesh(seatGeo, leatherBlack);
    seatMesh.position.y = 0.95;
    seatMesh.castShadow = true;
    masterChairGroup.add(seatMesh);

    // Backrest
    const backGeo = new THREE.BoxGeometry(0.85, 0.9, 0.18);
    const backMesh = new THREE.Mesh(backGeo, leatherBlack);
    backMesh.position.set(0, 1.5, -0.35);
    backMesh.rotation.x = 0.12;
    backMesh.castShadow = true;
    masterChairGroup.add(backMesh);

    // Headrest
    const headGeo = new THREE.BoxGeometry(0.42, 0.22, 0.14);
    const headMesh = new THREE.Mesh(headGeo, leatherBlack);
    headMesh.position.set(0, 2.05, -0.42);
    masterChairGroup.add(headMesh);

    // Gold Trim Ring around chair
    const goldRingGeo = new THREE.TorusGeometry(0.56, 0.03, 16, 32);
    const goldRing = new THREE.Mesh(goldRingGeo, goldChrome);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.95;
    masterChairGroup.add(goldRing);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.12, 0.08, 0.6);
    const leftArm = new THREE.Mesh(armGeo, goldChrome);
    leftArm.position.set(-0.48, 1.3, -0.05);
    masterChairGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, goldChrome);
    rightArm.position.set(0.48, 1.3, -0.05);
    masterChairGroup.add(rightArm);

    // Footrest Plate
    const footrestGeo = new THREE.BoxGeometry(0.65, 0.05, 0.45);
    const footrestMesh = new THREE.Mesh(footrestGeo, silverChrome);
    footrestMesh.position.set(0, 0.35, 0.65);
    masterChairGroup.add(footrestMesh);

    scene.add(masterChairGroup);

    // 8. WEDNESDAY BABY HAIR CUTTING STATION (₹1000 Premium Child Seat)
    const babyStationGroup = new THREE.Group();
    babyStationGroup.position.set(1.8, 0, 0);

    // Custom Baby Pedestal Base
    const babyBaseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.1, 32);
    const babyBase = new THREE.Mesh(babyBaseGeo, goldChrome);
    babyBase.position.y = 0.05;
    babyBase.castShadow = true;
    babyStationGroup.add(babyBase);

    // Gold Pedestal Stem
    const babyStemGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.7, 24);
    const babyStem = new THREE.Mesh(babyStemGeo, goldChrome);
    babyStem.position.y = 0.45;
    babyStationGroup.add(babyStem);

    // Ergonomic Child Booster Cushion (Amber/Gold Leather)
    const babySeatGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.22, 32);
    const babySeat = new THREE.Mesh(babySeatGeo, babyCushionMat);
    babySeat.position.y = 0.85;
    babySeat.castShadow = true;
    babyStationGroup.add(babySeat);

    // Gentle Curved Backrest for Kids
    const babyBackGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.5, 32, 1, false, 0, Math.PI);
    const babyBack = new THREE.Mesh(babyBackGeo, babyCushionMat);
    babyBack.position.set(0, 1.15, 0);
    babyBack.rotation.y = -Math.PI / 2;
    babyStationGroup.add(babyBack);

    // Safety Safety Bar (Chrome & Gold)
    const safetyBarGeo = new THREE.TorusGeometry(0.46, 0.035, 16, 24, Math.PI);
    const safetyBar = new THREE.Mesh(safetyBarGeo, goldChrome);
    safetyBar.rotation.x = Math.PI / 2;
    safetyBar.position.set(0, 1.15, 0.05);
    babyStationGroup.add(safetyBar);

    // Wednesday Floating Badge Disc above Baby Station
    const badgeDiscGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
    const badgeDisc = new THREE.Mesh(badgeDiscGeo, goldChrome);
    badgeDisc.position.set(0, 2.3, 0);
    badgeDisc.rotation.x = Math.PI / 2;
    babyStationGroup.add(badgeDisc);

    scene.add(babyStationGroup);

    // 9. BARBER TOOLS (Countertop)
    const toolsGroup = new THREE.Group();
    toolsGroup.position.set(0.1, 1.32, -1.9);

    // Golden Scissors (Extruded Cross Blades)
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.015, 0.42);
    const blade1 = new THREE.Mesh(bladeGeo, goldChrome);
    blade1.rotation.y = 0.25;
    toolsGroup.add(blade1);
    const blade2 = new THREE.Mesh(bladeGeo, goldChrome);
    blade2.rotation.y = -0.25;
    toolsGroup.add(blade2);

    // Golden Finger Loops
    const loopGeo = new THREE.TorusGeometry(0.06, 0.015, 12, 24);
    const loop1 = new THREE.Mesh(loopGeo, goldChrome);
    loop1.position.set(-0.06, 0, -0.23);
    loop1.rotation.x = Math.PI / 2;
    toolsGroup.add(loop1);
    const loop2 = new THREE.Mesh(loopGeo, goldChrome);
    loop2.position.set(0.06, 0, -0.23);
    loop2.rotation.x = Math.PI / 2;
    toolsGroup.add(loop2);

    // Classic Straight Razor
    const razorHandleGeo = new THREE.BoxGeometry(0.05, 0.02, 0.3);
    const razorHandle = new THREE.Mesh(razorHandleGeo, leatherBlack);
    razorHandle.position.set(0.4, 0, 0);
    toolsGroup.add(razorHandle);
    const razorBladeGeo = new THREE.BoxGeometry(0.03, 0.01, 0.25);
    const razorBlade = new THREE.Mesh(razorBladeGeo, silverChrome);
    razorBlade.position.set(0.4, 0, 0.22);
    razorBlade.rotation.y = 0.3;
    toolsGroup.add(razorBlade);

    // Salon Pomade Glass Jars
    const jarGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.16, 24);
    const jarMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
    const jar1 = new THREE.Mesh(jarGeo, jarMat);
    jar1.position.set(-0.55, 0.08, 0);
    toolsGroup.add(jar1);

    const jarCapGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.04, 24);
    const jarCap = new THREE.Mesh(jarCapGeo, goldChrome);
    jarCap.position.set(-0.55, 0.17, 0);
    toolsGroup.add(jarCap);

    scene.add(toolsGroup);

    // 10. FLOATING GOLDEN AMBIENT DUST / BOKEH PARTICLES (160 motes)
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = Math.random() * 6.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      particleVelocities[i] = 0.003 + Math.random() * 0.006;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd37a,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 11. INTERACTIVE MOUSE ORBIT & DRAG
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      setIsAutoRotating(false);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      orbitAngles.current.theta -= deltaX * 0.006;
      orbitAngles.current.phi = Math.max(0.1, Math.min(1.4, orbitAngles.current.phi + deltaY * 0.006));

      // Calculate camera position around current lookAt
      const r = orbitAngles.current.radius;
      targetCamPos.current.x = currentLookAt.current.x + r * Math.sin(orbitAngles.current.phi) * Math.sin(orbitAngles.current.theta);
      targetCamPos.current.y = currentLookAt.current.y + r * Math.cos(orbitAngles.current.phi);
      targetCamPos.current.z = currentLookAt.current.z + r * Math.sin(orbitAngles.current.phi) * Math.cos(orbitAngles.current.theta);

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAngles.current.radius = Math.max(3.2, Math.min(14, orbitAngles.current.radius + e.deltaY * 0.008));
      const r = orbitAngles.current.radius;
      targetCamPos.current.x = currentLookAt.current.x + r * Math.sin(orbitAngles.current.phi) * Math.sin(orbitAngles.current.theta);
      targetCamPos.current.y = currentLookAt.current.y + r * Math.cos(orbitAngles.current.phi);
      targetCamPos.current.z = currentLookAt.current.z + r * Math.sin(orbitAngles.current.phi) * Math.cos(orbitAngles.current.theta);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        setIsAutoRotating(false);
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      orbitAngles.current.theta -= deltaX * 0.008;
      orbitAngles.current.phi = Math.max(0.1, Math.min(1.4, orbitAngles.current.phi + deltaY * 0.008));

      const r = orbitAngles.current.radius;
      targetCamPos.current.x = currentLookAt.current.x + r * Math.sin(orbitAngles.current.phi) * Math.sin(orbitAngles.current.theta);
      targetCamPos.current.y = currentLookAt.current.y + r * Math.cos(orbitAngles.current.phi);
      targetCamPos.current.z = currentLookAt.current.z + r * Math.sin(orbitAngles.current.phi) * Math.cos(orbitAngles.current.theta);

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 12. ANIMATION & RENDER LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera LERP towards target
      camera.position.lerp(targetCamPos.current, 0.045);
      currentLookAt.current.lerp(targetLookAt.current, 0.045);
      camera.lookAt(currentLookAt.current);

      // Auto-Orbit in cinematic overview
      if (isAutoRotating && !isDragging.current) {
        orbitAngles.current.theta += 0.0035;
        const r = orbitAngles.current.radius;
        targetCamPos.current.x = currentLookAt.current.x + r * Math.sin(orbitAngles.current.phi) * Math.sin(orbitAngles.current.theta);
        targetCamPos.current.z = currentLookAt.current.z + r * Math.sin(orbitAngles.current.phi) * Math.cos(orbitAngles.current.theta);
      }

      // Gentle floating animation on Wednesday badge disc
      badgeDisc.rotation.z = elapsedTime * 0.8;
      badgeDisc.position.y = 2.3 + Math.sin(elapsedTime * 2.5) * 0.08;

      // Gentle scissor blade breathing motion
      blade1.rotation.y = 0.25 + Math.sin(elapsedTime * 1.8) * 0.08;
      blade2.rotation.y = -0.25 - Math.sin(elapsedTime * 1.8) * 0.08;

      // Dust motes drifting upwards
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i];
        if (positions[i * 3 + 1] > 6.5) {
          positions[i * 3 + 1] = 0.1;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 540;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [isAutoRotating]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#0C0B0E] border border-amber-900/30 rounded-3xl shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen border-none' : 'h-[580px] sm:h-[640px]'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

      {/* Top Cinematic Overlay Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 gap-3">
        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E2B755] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E2B755] font-luxury">
                3D Cinematic Salon Experience
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF2DC] text-[#8F6C1E]">
                WebGL 60FPS
              </span>
            </div>
            <span className="text-[11px] text-stone-400 block font-medium">
              107/P, 3-13-94/11/A, Ramanthapur, Hyderabad
            </span>
          </div>
        </div>

        {/* Top Controls: Audio, Lighting, Fullscreen, Close */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Ambient Salon Audio Toggle */}
          <button
            type="button"
            onClick={toggleAmbientAudio}
            title={isAudioPlaying ? 'Mute Ambient Audio' : 'Play Cinematic Salon Lounge Audio'}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              isAudioPlaying
                ? 'bg-[#E2B755] text-stone-950 border-[#E2B755] shadow-md shadow-amber-500/20'
                : 'bg-black/60 text-stone-300 border-white/10 hover:text-white hover:bg-black/80'
            }`}
          >
            {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Lighting Mode Selector */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setLightingMode('golden')}
              title="Warm Golden Hour"
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                lightingMode === 'golden' ? 'bg-[#E2B755] text-stone-950 font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sun size={13} />
              <span>Golden</span>
            </button>
            <button
              type="button"
              onClick={() => setLightingMode('midnight')}
              title="Midnight Luxury"
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                lightingMode === 'midnight' ? 'bg-[#E2B755] text-stone-950 font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Moon size={13} />
              <span>Midnight</span>
            </button>
            <button
              type="button"
              onClick={() => setLightingMode('studio')}
              title="Studio High-Key"
              className={`p-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                lightingMode === 'studio' ? 'bg-[#E2B755] text-stone-950 font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Studio</span>
            </button>
          </div>

          {/* Auto-Orbit Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Auto-Orbit' : 'Resume Auto-Orbit'}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              isAutoRotating
                ? 'bg-amber-500/20 text-[#E2B755] border-[#E2B755]/40'
                : 'bg-black/60 text-stone-400 border-white/10 hover:text-white'
            }`}
          >
            {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Cinema'}
            className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-stone-300 border border-white/10 hover:text-white hover:bg-black/80 transition-all"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Modal Close Button */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Hotspot Details Card */}
      {selectedHotspot && (
        <div className="absolute top-20 left-4 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-black/85 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-amber-500/30 text-white shadow-2xl z-20 animate-in fade-in slide-in-from-left-4">
          {selectedHotspot === 'baby' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-stone-950">
                  🗓️ Wednesdays Only
                </span>
                <span className="text-xs text-amber-300 font-bold">₹1,000</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-luxury flex items-center gap-1.5">
                  <span>👶 Baby Hair Cutting Station</span>
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Specialized ergonomic child salon station. Ultra-patient, tear-free haircutting by R & S Srinivas using child-safe sanitized scissors and soothing entertainment.
                </p>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookService?.('Baby Hair Cutting')}
                  className="px-4 py-2 rounded-xl bg-[#E2B755] hover:bg-[#fad57d] text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>Book Wednesday Chair (₹1000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {selectedHotspot === 'chair' && (
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-stone-800 text-amber-300 border border-amber-400/30">
                🪑 Master Chair
              </span>
              <div>
                <h4 className="text-base font-bold text-white font-luxury">
                  Bloom Saloon Master Barber Chair
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Premium hydraulic grooming chair with full recline for hot foam shaving, facial treatments, and signature haircuts. Operating 7 days a week (7:00 AM – 9:30 PM).
                </p>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookService?.('Hair Cutting Only')}
                  className="px-4 py-2 rounded-xl bg-[#E2B755] hover:bg-[#fad57d] text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>Book Grooming Chair</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {selectedHotspot === 'tools' && (
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ✂️ Professional Tools
              </span>
              <h4 className="text-base font-bold text-white font-luxury">
                Sanitized Styling Instrument Bar
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Telangana Nayee Brahmana Seva Sangam standardized razor blades, Japanese steel shears, scalp care tonics, and autoclaved tool sterilizers.
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {selectedHotspot === 'mirror' && (
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🪞 Vanity Counter
              </span>
              <h4 className="text-base font-bold text-white font-luxury">
                Backlit LED Mirror Station
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Studio CRI 98+ illumination designed for precision beard sculpting, facial contouring, and razor-sharp fades.
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Cinematic Camera Presets Dock */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none z-10">
        {/* Interaction Hint */}
        <div className="hidden md:flex items-center gap-2 bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-stone-300">
          <Info size={14} className="text-[#E2B755]" />
          <span>Drag to orbit in 3D • Scroll to zoom • Click presets to fly camera</span>
        </div>

        {/* Camera Preset Buttons */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 pointer-events-auto shadow-2xl overflow-x-auto max-w-full">
          {(Object.keys(presets) as CameraPreset[]).map(key => {
            const p = presets[key];
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#E2B755] text-stone-950 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{key.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
