import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Restored & Refined 3D Hero Scene matching the CINEVERSE visual identity:
 * 1. Restored Original 3D Sculpture: Prominent visual scale (scale: 0.96), organic silhouette,
 *    smooth liquid-chrome/black-glass appearance with visible silver reflections and subtle crimson highlights.
 * 2. Visual Anchor Cinema Screen: Integrated 16:9 widescreen projection screen with slim dark bezel,
 *    dark projection surface, soft silver ambient glow, and restrained burgundy backlight.
 * 3. Spatial Cohesion: The sculpture frames the screen naturally on the right, keeping the headline on
 *    the left completely uncrowded, with zero clipping at the hero boundaries.
 * 4. Responsive & Resource-Safe: Pauses rendering when dormant, cleans up all WebGL resources on unmount.
 */
export default function CinematicHeroCanvas({ active = true, onSceneReady }) {
  const containerRef = useRef(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Detect WebGL availability
    const canvasTest = document.createElement('canvas');
    const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    }

    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 700;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.05);

    // --- Camera Framing ---
    // Framed looking at the prominent right-hand sculpture & cinema screen installation
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(0.82, 0.05, 5.2);

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Studio Reflection Environment Texture ---
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    const gradient = envCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0.0, '#020204');
    gradient.addColorStop(0.35, '#18040a');
    gradient.addColorStop(0.55, '#050508');
    gradient.addColorStop(0.75, '#450a14');
    gradient.addColorStop(0.9, '#c0c5ce');
    gradient.addColorStop(1.0, '#050508');
    envCtx.fillStyle = gradient;
    envCtx.fillRect(0, 0, 512, 256);

    // Soft restrained silver specular strip
    envCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    envCtx.fillRect(160, 90, 110, 10);
    envCtx.fillStyle = 'rgba(225, 29, 72, 0.4)';
    envCtx.fillRect(0, 50, 512, 6);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // --- Soft Studio-Style Illumination ---
    const ambientLight = new THREE.AmbientLight(0x0a0507, 1.4);
    scene.add(ambientLight);

    // Key directional light for crisp silver reflections on liquid-chrome curves
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.4);
    keyLight.position.set(4.6, 4.0, 3.2);
    scene.add(keyLight);

    // Rich burgundy rim light
    const burgundyRimLight = new THREE.PointLight(0xbe123c, 4.2, 9.0, 1.8);
    burgundyRimLight.position.set(2.2, -0.6, 1.2);
    scene.add(burgundyRimLight);

    // Crimson accent light from upper right
    const crimsonAccent = new THREE.PointLight(0x9f1239, 3.6, 8.0, 1.6);
    crimsonAccent.position.set(3.8, 1.2, 0.8);
    scene.add(crimsonAccent);

    // =========================================================
    // 1. CINEMA PROJECTION SCREEN (Integrated into the Installation)
    // Positioned behind and framed by the sculpture on the right.
    // Screen width enlarged so its left edge begins beneath 'R' in CINEVERSE
    // and extends right behind the suspended spider web at 16:9 widescreen ratio,
    // moved upward to sit higher within the hero.
    // =========================================================
    const cinemaScreenGroup = new THREE.Group();
    // Positioned higher (y: 0.46) and widened (center x: 1.80, z: -0.38)
    cinemaScreenGroup.position.set(1.80, 0.46, -0.38);
    cinemaScreenGroup.rotation.y = -0.16;
    scene.add(cinemaScreenGroup);

    const screenWidth = 4.2;
    const screenHeight = 2.36; // 16:9 widescreen ratio (4.2 / 2.36 ≈ 1.78)

    // A. Soft Ambient Projection Spill Plane (Behind Frame)
    const spillCanvas = document.createElement('canvas');
    spillCanvas.width = 512;
    spillCanvas.height = 288;
    const spCtx = spillCanvas.getContext('2d');
    const spillGrad = spCtx.createRadialGradient(256, 144, 40, 256, 144, 250);
    spillGrad.addColorStop(0, 'rgba(235, 242, 255, 0.2)');
    spillGrad.addColorStop(0.35, 'rgba(190, 210, 240, 0.09)');
    spillGrad.addColorStop(0.7, 'rgba(159, 18, 57, 0.05)');
    spillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    spCtx.fillStyle = spillGrad;
    spCtx.fillRect(0, 0, 512, 288);

    const spillTexture = new THREE.CanvasTexture(spillCanvas);
    const spillGeo = new THREE.PlaneGeometry(screenWidth + 0.65, screenHeight + 0.55);
    const spillMat = new THREE.MeshBasicMaterial({
      map: spillTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const spillMesh = new THREE.Mesh(spillGeo, spillMat);
    spillMesh.position.z = -0.04;
    cinemaScreenGroup.add(spillMesh);

    // B. Slim, Dark Metallic Bezel Frame
    const frameGeo = new THREE.BoxGeometry(screenWidth + 0.06, screenHeight + 0.06, 0.07);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x090a0e,
      roughness: 0.3,
      metalness: 0.88
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    cinemaScreenGroup.add(frameMesh);

    // C. Deep Charcoal Projection Surface
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 576;
    const sCtx = screenCanvas.getContext('2d');

    const sGrad = sCtx.createRadialGradient(512, 288, 30, 512, 288, 540);
    sGrad.addColorStop(0, '#131622');
    sGrad.addColorStop(0.45, '#0e1017');
    sGrad.addColorStop(0.85, '#090b10');
    sGrad.addColorStop(1, '#050609');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 1024, 576);

    // Soft silver perimeter optical sheen
    const periGrad = sCtx.createRadialGradient(512, 288, 380, 512, 288, 560);
    periGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    periGrad.addColorStop(0.85, 'rgba(235, 240, 255, 0.04)');
    periGrad.addColorStop(1, 'rgba(235, 240, 255, 0.08)');
    sCtx.fillStyle = periGrad;
    sCtx.fillRect(0, 0, 1024, 576);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      color: 0x141722,
      roughness: 0.4,
      metalness: 0.08,
      emissive: 0x05070c,
      emissiveIntensity: 0.08
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = 0.038;
    cinemaScreenGroup.add(screenMesh);

    // D. Subtle Silver-White Edge Light
    const halfW = screenWidth / 2;
    const halfH = screenHeight / 2;
    const edgePoints = [
      new THREE.Vector3(-halfW, -halfH, 0.042),
      new THREE.Vector3(halfW, -halfH, 0.042),
      new THREE.Vector3(halfW, halfH, 0.042),
      new THREE.Vector3(-halfW, halfH, 0.042),
      new THREE.Vector3(-halfW, -halfH, 0.042)
    ];
    const edgeLineGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.35
    });
    const edgeLine = new THREE.Line(edgeLineGeo, edgeLineMat);
    cinemaScreenGroup.add(edgeLine);

    // Faint backlight behind screen
    const screenBacklight = new THREE.PointLight(0x5c0919, 1.8, 6.0, 2.0);
    screenBacklight.position.set(0.0, 0.0, -0.25);
    cinemaScreenGroup.add(screenBacklight);

    // =========================================================
    // 2. RESTORED PROMINENT 3D SCULPTURE
    // Restored to its earlier prominent scale, organic silhouette,
    // smooth liquid-chrome reflections and subtle crimson highlights.
    // =========================================================
    const sculptureGeo = new THREE.TorusKnotGeometry(0.8, 0.23, 220, 48, 2, 3);
    const posAttr = sculptureGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090a0f,
      roughness: 0.11,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.07,
      reflectivity: 0.96,
      emissive: 0x26040a,
      emissiveIntensity: 0.38,
      envMap: envTexture,
      envMapIntensity: 1.75
    });

    const sculptureMesh = new THREE.Mesh(sculptureGeo, sculptureMaterial);
    // Positioned prominently at (2.15, 0.05, 0.2) framing the front-left and base of the cinema screen
    sculptureMesh.position.set(2.15, 0.05, 0.2);
    sculptureMesh.rotation.set(0.3, 0.42, -0.1);
    sculptureMesh.scale.set(0.96, 0.96, 0.96); // Restored prominent visual scale
    scene.add(sculptureMesh);

    // Flow ribbon weaving around the sculpture and base
    const ribbonGeo = new THREE.TorusGeometry(0.66, 0.08, 32, 96);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.16,
      metalness: 0.92,
      emissive: 0x30050e,
      emissiveIntensity: 0.4
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(2.15, 0.05, 0.2);
    ribbonMesh.rotation.set(1.1, 0.2, 0.6);
    scene.add(ribbonMesh);

    // Gentle embers around the right composition
    const emberCount = 28;
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = 1.3 + Math.random() * 2.8;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xe11d48,
      size: 0.032,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // --- Mouse Parallax Tracking ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / width - 0.5) * 1.0;
      mouse.targetY = -(clientY / height - 0.5) * 1.0;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 700;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };
    window.addEventListener('resize', handleResize);

    // --- Visibility and Intersection Observer ---
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- Animation Loop ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || !activeRef.current) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      if (!isReducedMotion) {
        // Smooth organic low-frequency sine wave deformation
        const posArray = posAttr.array;
        const speed = elapsed * 0.75;
        const waveAmp = 0.036;

        for (let i = 0; i < posArray.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          const wave = Math.sin(ox * 1.8 + speed) * Math.cos(oy * 1.5 + speed * 0.7) * waveAmp;

          posArray[i] = ox + ox * wave;
          posArray[i + 1] = oy + oy * wave;
          posArray[i + 2] = oz + oz * wave;
        }
        posAttr.needsUpdate = true;
        sculptureGeo.computeVertexNormals();

        // Natural graceful rotation and parallax response
        sculptureMesh.rotation.y = 0.42 + Math.sin(elapsed * 0.2) * 0.07 + mouse.x * 0.08;
        sculptureMesh.rotation.x = 0.3 + Math.cos(elapsed * 0.16) * 0.05 + mouse.y * 0.06;

        ribbonMesh.rotation.y = -elapsed * 0.1;
        ribbonMesh.rotation.z = 0.6 + Math.sin(elapsed * 0.14) * 0.08;

        spillMesh.material.opacity = 0.46 + Math.sin(elapsed * 1.4) * 0.05;
        embers.rotation.y = elapsed * 0.012;
      }

      // Parallax camera framing looking comfortably at the shifted installation
      camera.position.x = 0.82 + mouse.x * 0.18;
      camera.position.y = 0.05 + mouse.y * 0.12;
      camera.lookAt(1.65, 0.05, 0);

      renderer.render(scene, camera);
    };

    animate();

    if (onSceneReady) {
      onSceneReady();
    }

    // --- Cleanup WebGL Resources & Listeners ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();

      sculptureGeo.dispose();
      sculptureMaterial.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      spillGeo.dispose();
      spillMat.dispose();
      edgeLineGeo.dispose();
      edgeLineMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      envTexture.dispose();
      screenTexture.dispose();
      spillTexture.dispose();

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isReducedMotion, onSceneReady]);

  if (!webGLSupported) {
    return (
      <div className="hero-fallback-backdrop" aria-hidden="true">
        <div className="fallback-glow-orb" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`cinematic-hero-canvas-container ${!active ? 'scene-dormant' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.6s ease'
      }}
      aria-hidden={!active}
    />
  );
}
