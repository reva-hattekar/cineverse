import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Redesigned 3D Cinema Installation matching the CINEVERSE visual identity:
 * 1. Visual Anchor: Real 16:9 widescreen cinema projection screen with slim dark bezel,
 *    deep charcoal projection surface, soft silver-white edge glow, and restrained burgundy backlight.
 * 2. Sculpture: Organic black-glass & liquid-chrome sculpture emerging from behind and wrapping
 *    gracefully along the lower and right outer edge of the screen.
 * 3. Studio Lighting: Soft silver rim lighting, low-intensity burgundy bounce, dark ambient surroundings.
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
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(0.0, 0.05, 5.2);

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- Studio Reflection Environment Texture ---
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    const gradient = envCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0.0, '#020204');
    gradient.addColorStop(0.35, '#120307');
    gradient.addColorStop(0.55, '#050508');
    gradient.addColorStop(0.75, '#2e050e');
    gradient.addColorStop(0.9, '#bcc1ca');
    gradient.addColorStop(1.0, '#050508');
    envCtx.fillStyle = gradient;
    envCtx.fillRect(0, 0, 512, 256);

    // Soft restrained silver specular strip
    envCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    envCtx.fillRect(160, 90, 110, 6);
    envCtx.fillStyle = 'rgba(225, 29, 72, 0.25)';
    envCtx.fillRect(0, 50, 512, 4);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // --- Soft Studio-Style Illumination ---
    const ambientLight = new THREE.AmbientLight(0x070406, 1.3);
    scene.add(ambientLight);

    // Subtle silver key light for specular highlights on metallic curves
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 1.8);
    keyLight.position.set(4.5, 3.6, 3.2);
    scene.add(keyLight);

    // Low-intensity silver rim fill light from the left
    const rimFillLight = new THREE.DirectionalLight(0x94a3b8, 0.7);
    rimFillLight.position.set(-3.5, 2.0, -1.0);
    scene.add(rimFillLight);

    // =========================================================
    // MASTER CINEMA INSTALLATION GROUP
    // Positioned in the right half of the hero (x: 2.7) with negative space on left
    // =========================================================
    const cinemaInstallation = new THREE.Group();
    cinemaInstallation.position.set(2.7, 0.04, -0.1);
    cinemaInstallation.rotation.y = -0.22; // Subtle cinematic perspective angle
    scene.add(cinemaInstallation);

    // Very faint, restrained burgundy backlight behind screen frame
    const screenBacklight = new THREE.PointLight(0x5c0919, 1.5, 6.5, 2.0);
    screenBacklight.position.set(0.0, 0.0, -0.28);
    cinemaInstallation.add(screenBacklight);

    // =========================================================
    // 1. CINEMA PROJECTION SCREEN (THE VISUAL ANCHOR)
    // =========================================================
    const cinemaScreenGroup = new THREE.Group();
    cinemaInstallation.add(cinemaScreenGroup);

    const screenWidth = 3.38;
    const screenHeight = 1.9; // Exact 16:9 widescreen ratio (3.38 / 1.9 ≈ 1.78)

    // A. Soft Silver-White Ambient Projection Glow & Spill Plane (Behind Frame)
    const spillCanvas = document.createElement('canvas');
    spillCanvas.width = 512;
    spillCanvas.height = 288;
    const spCtx = spillCanvas.getContext('2d');
    const spillGrad = spCtx.createRadialGradient(256, 144, 60, 256, 144, 250);
    spillGrad.addColorStop(0, 'rgba(235, 242, 255, 0.22)');
    spillGrad.addColorStop(0.4, 'rgba(200, 215, 240, 0.1)');
    spillGrad.addColorStop(0.7, 'rgba(159, 18, 57, 0.05)');
    spillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    spCtx.fillStyle = spillGrad;
    spCtx.fillRect(0, 0, 512, 288);

    const spillTexture = new THREE.CanvasTexture(spillCanvas);
    const spillGeo = new THREE.PlaneGeometry(screenWidth + 0.6, screenHeight + 0.55);
    const spillMat = new THREE.MeshBasicMaterial({
      map: spillTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const spillMesh = new THREE.Mesh(spillGeo, spillMat);
    spillMesh.position.z = -0.04;
    cinemaScreenGroup.add(spillMesh);

    // B. Slim, Dark, Realistic Outer Bezel
    const frameGeo = new THREE.BoxGeometry(screenWidth + 0.06, screenHeight + 0.06, 0.07);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x090a0e,
      roughness: 0.32,
      metalness: 0.86
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    cinemaScreenGroup.add(frameMesh);

    // C. Inner Black Masking Acoustic Border
    const innerBorderGeo = new THREE.PlaneGeometry(screenWidth + 0.01, screenHeight + 0.01);
    const innerBorderMat = new THREE.MeshBasicMaterial({ color: 0x020305 });
    const innerBorderMesh = new THREE.Mesh(innerBorderGeo, innerBorderMat);
    innerBorderMesh.position.z = 0.038;
    cinemaScreenGroup.add(innerBorderMesh);

    // D. Deep Charcoal Projection Surface (Unmistakable Cinema Screen)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 576; // 16:9
    const sCtx = screenCanvas.getContext('2d');

    // 1. Deep charcoal projection surface gradient
    const sGrad = sCtx.createRadialGradient(512, 288, 30, 512, 288, 540);
    sGrad.addColorStop(0, '#131622');
    sGrad.addColorStop(0.45, '#0e1017');
    sGrad.addColorStop(0.85, '#090b10');
    sGrad.addColorStop(1, '#050609');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 1024, 576);

    // 2. Soft silver ambient perimeter vignette (cinema optical spill)
    const periGrad = sCtx.createRadialGradient(512, 288, 380, 512, 288, 560);
    periGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    periGrad.addColorStop(0.8, 'rgba(235, 240, 255, 0.04)');
    periGrad.addColorStop(1, 'rgba(235, 240, 255, 0.08)');
    sCtx.fillStyle = periGrad;
    sCtx.fillRect(0, 0, 1024, 576);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      color: 0x141722,
      roughness: 0.42,
      metalness: 0.08,
      emissive: 0x05070c, // Deep dark blue-black, NOT pink
      emissiveIntensity: 0.08
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = 0.042;
    cinemaScreenGroup.add(screenMesh);

    // E. Subtle Silver-White Perimeter Edge Light
    const halfW = screenWidth / 2;
    const halfH = screenHeight / 2;
    const edgePoints = [
      new THREE.Vector3(-halfW, -halfH, 0.046),
      new THREE.Vector3(halfW, -halfH, 0.046),
      new THREE.Vector3(halfW, halfH, 0.046),
      new THREE.Vector3(-halfW, halfH, 0.046),
      new THREE.Vector3(-halfW, -halfH, 0.046)
    ];
    const edgeLineGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.35
    });
    const edgeLine = new THREE.Line(edgeLineGeo, edgeLineMat);
    cinemaScreenGroup.add(edgeLine);

    // =========================================================
    // 2. ORGANIC BLACK-GLASS & LIQUID-CHROME SCULPTURE
    // Architecturally interacting with the screen by wrapping along
    // the lower border and curling up the outer right edge.
    // =========================================================
    const sculptureGeo = new THREE.TorusKnotGeometry(0.72, 0.15, 240, 48, 2, 3);
    const posAttr = sculptureGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08090d,
      roughness: 0.12,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.96,
      emissive: 0x180307,
      emissiveIntensity: 0.22,
      envMap: envTexture,
      envMapIntensity: 1.5
    });

    const sculptureMesh = new THREE.Mesh(sculptureGeo, sculptureMaterial);
    // Positioned along the lower and right outer corner of the screen
    sculptureMesh.position.set(1.35, -0.68, 0.18);
    sculptureMesh.rotation.set(0.32, 0.52, -0.1);
    sculptureMesh.scale.set(0.72, 0.72, 0.72);
    cinemaInstallation.add(sculptureMesh);

    // Secondary subtle liquid-chrome flow ribbon along the bottom bezel
    const ribbonGeo = new THREE.TorusGeometry(0.65, 0.045, 32, 100);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x06070a,
      roughness: 0.16,
      metalness: 0.94,
      emissive: 0x1d0309,
      emissiveIntensity: 0.28
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0.35, -0.9, 0.12);
    ribbonMesh.rotation.set(1.25, 0.15, 0.45);
    cinemaInstallation.add(ribbonMesh);

    // --- Mouse Parallax Tracking ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / width - 0.5) * 0.9;
      mouse.targetY = -(clientY / height - 0.5) * 0.9;
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
        // Low-frequency organic wave deformation on sculpture
        const posArray = posAttr.array;
        const speed = elapsed * 0.7;
        const waveAmp = 0.026;

        for (let i = 0; i < posArray.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          const wave = Math.sin(ox * 1.6 + speed) * Math.cos(oy * 1.4 + speed * 0.7) * waveAmp;

          posArray[i] = ox + ox * wave;
          posArray[i + 1] = oy + oy * wave;
          posArray[i + 2] = oz + oz * wave;
        }
        posAttr.needsUpdate = true;
        sculptureGeo.computeVertexNormals();

        // Subtle gentle sculpture motion framing the screen
        sculptureMesh.rotation.y = 0.52 + Math.sin(elapsed * 0.18) * 0.05 + mouse.x * 0.05;
        sculptureMesh.rotation.x = 0.32 + Math.cos(elapsed * 0.15) * 0.03 + mouse.y * 0.04;

        ribbonMesh.rotation.y = -elapsed * 0.08;
        ribbonMesh.rotation.z = 0.45 + Math.sin(elapsed * 0.12) * 0.06;

        // Faint ambient light breathing
        spillMesh.material.opacity = 0.46 + Math.sin(elapsed * 1.2) * 0.06;
      }

      // Parallax camera framing
      camera.position.x = 0.0 + mouse.x * 0.12;
      camera.position.y = 0.05 + mouse.y * 0.1;
      camera.lookAt(0.65, 0.05, 0);

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
      innerBorderGeo.dispose();
      innerBorderMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      spillGeo.dispose();
      spillMat.dispose();
      edgeLineGeo.dispose();
      edgeLineMat.dispose();
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
