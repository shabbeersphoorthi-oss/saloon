import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CinematicBackground3DProps {
  glowIntensity?: number;
  particlesEnabled?: boolean;
}

export const CinematicBackground3D: React.FC<CinematicBackground3DProps> = ({
  glowIntensity = 1.0,
  particlesEnabled = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a090d, 0.05);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Volumetric Lights
    const ambient = new THREE.AmbientLight(0x282012, 1.2 * glowIntensity);
    scene.add(ambient);

    const mouseSpot = new THREE.PointLight(0xffdf88, 35 * glowIntensity, 25);
    mouseSpot.position.set(0, 0, 5);
    scene.add(mouseSpot);

    const cornerLight = new THREE.PointLight(0xb88728, 20 * glowIntensity, 30);
    cornerLight.position.set(-8, 6, -2);
    scene.add(cornerLight);

    const accentLight = new THREE.PointLight(0xd4af37, 25 * glowIntensity, 25);
    accentLight.position.set(8, -6, -3);
    scene.add(accentLight);

    // 4. Subtle 3D Geometric Sculptures floating in the far depth
    const group3D = new THREE.Group();
    group3D.position.z = -4;

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc89d38,
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });

    // Elegant Floating Golden Torus Rings
    const ringGeo1 = new THREE.TorusGeometry(3.5, 0.04, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo1, goldMat);
    ring1.position.set(-6, 2, -2);
    group3D.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(4.8, 0.05, 16, 72);
    const ring2 = new THREE.Mesh(ringGeo2, goldMat);
    ring2.position.set(6, -2, -3);
    group3D.add(ring2);

    // Floating Scissor-Blade Silhouette in deep perspective
    const bladeGeo = new THREE.BoxGeometry(0.08, 3.2, 0.02);
    const blade1 = new THREE.Mesh(bladeGeo, goldMat);
    blade1.position.set(7, 3, -1);
    blade1.rotation.z = 0.6;
    group3D.add(blade1);

    const blade2 = new THREE.Mesh(bladeGeo, goldMat);
    blade2.position.set(7, 3, -1);
    blade2.rotation.z = -0.6;
    group3D.add(blade2);

    scene.add(group3D);

    // 5. Floating Golden Dust / Bokeh Embers
    const particleCount = particlesEnabled ? 180 : 0;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      particleSpeeds[i] = 0.004 + Math.random() * 0.008;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd978,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Tracking & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollYOffset = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 8;
      targetY = (-(e.clientY / window.innerHeight) + 0.5) * 6;
    };

    const onScroll = () => {
      scrollYOffset = (window.scrollY || 0) * 0.003;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // 7. Render & Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      mouseSpot.position.x = mouseX;
      mouseSpot.position.y = mouseY;

      // Parallax camera movement based on mouse + scroll
      camera.position.x = mouseX * 0.15;
      camera.position.y = -scrollYOffset + mouseY * 0.15;

      // Subtle rotation of 3D background sculptures
      group3D.rotation.y = elapsed * 0.06;
      group3D.rotation.x = Math.sin(elapsed * 0.04) * 0.1;
      ring1.rotation.x = elapsed * 0.12;
      ring2.rotation.y = -elapsed * 0.09;

      // Slowly float particles upwards
      if (particlesEnabled) {
        const posArray = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 1] += particleSpeeds[i];
          if (posArray[i * 3 + 1] > 9) {
            posArray[i * 3 + 1] = -9;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [glowIntensity, particlesEnabled]);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80 overflow-hidden"
      aria-hidden="true"
    />
  );
};
