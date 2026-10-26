import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Redesigned 3D hero scene matching the CINEVERSE visual identity:
 * - Recognisable 16:9 widescreen cinematic projection screen with dark beveled frame and ambient glow
 * - Fluid, glossy obsidian-black & liquid-chrome sculpture wrapping around, emerging beside, and partially framing the screen
 * - Restrained burgundy & silver edge illumination
 * - Composition positioned firmly on the right side, preserving clear negative space for the CINEVERSE heading
 * - Throttles / pauses WebGL rendering loop when not active
 * - Cleans up all WebGL resources on unmount
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
    // Framed so the widescreen cinema screen and sculpture occupy the right half (x > 0.4)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(0.85, 0.1, 5.2);

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
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

    // --- Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0a0507, 1.5);
    scene.add(ambientLight);

    // Key directional light for soft silver highlights on the curves
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 2.4);
    keyLight.position.set(4.5, 4.0, 3.2);
    scene.add(keyLight);

    // Burgundy screen backlight
    const screenBacklight = new THREE.PointLight(0xbe123c, 4.5, 9.0, 1.8);
    screenBacklight.position.set(2.4, 0.1, -0.4);
    scene.add(screenBacklight);

    // Crimson accent light from right
    const crimsonAccent = new THREE.PointLight(0x881337, 3.8, 8.0, 1.6);
    crimsonAccent.position.set(4.2, 1.2, 0.6);
    scene.add(crimsonAccent);

    // Screen surface projection glow
    const projectionGlow = new THREE.PointLight(0xff3366, 2.5, 5.0, 2.0);
    projectionGlow.position.set(2.6, 0.15, 0.2);
    scene.add(projectionGlow);

    // =========================================================
    // 1. WIDESCREEN CINEMA SCREEN (16:9 Aspect Ratio)
    // =========================================================
    const cinemaScreenGroup = new THREE.Group();
    // Positioned in the right half of the scene with a subtle cinematic angle
    cinemaScreenGroup.position.set(2.55, 0.15, -0.6);
    cinemaScreenGroup.rotation.y = -0.22;
    cinemaScreenGroup.rotation.x = 0.02;

    // A. Outer Architectural Cinema Screen Bezel / Frame
    const screenWidth = 3.2;
    const screenHeight = 1.8; // 16:9 ratio (3.2 / 1.8 ≈ 1.78)
    const frameGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.14);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x080a0f,
      roughness: 0.35,
      metalness: 0.85
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    cinemaScreenGroup.add(frameMesh);

    // B. Illuminated Cinema Screen Canvas Surface (Projecting subtle cosmic cinema scene)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 288; // 16:9
    const sCtx = screenCanvas.getContext('2d');

    // Base cinematic projection gradient
    const sGrad = sCtx.createRadialGradient(256, 144, 10, 256, 144, 260);
    sGrad.addColorStop(0, '#2d0612');
    sGrad.addColorStop(0.35, '#18040a');
    sGrad.addColorStop(0.7, '#080509');
    sGrad.addColorStop(1, '#020204');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 512, 288);

    // Anamorphic horizontal lens flare / light streak across screen center
    const streakGrad = sCtx.createLinearGradient(0, 144, 512, 144);
    streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.3, 'rgba(251, 113, 133, 0.25)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
    streakGrad.addColorStop(0.7, 'rgba(251, 113, 133, 0.25)');
    streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = streakGrad;
    sCtx.fillRect(0, 138, 512, 12);

    // Soft celestial mountain silhouette in the projection
    sCtx.fillStyle = 'rgba(10, 2, 5, 0.85)';
    sCtx.beginPath();
    sCtx.moveTo(0, 288);
    sCtx.lineTo(90, 190);
    sCtx.lineTo(180, 215);
    sCtx.lineTo(256, 165);
    sCtx.lineTo(340, 225);
    sCtx.lineTo(440, 180);
    sCtx.lineTo(512, 230);
    sCtx.lineTo(512, 288);
    sCtx.closePath();
    sCtx.fill();

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screenApertureGeo = new THREE.PlaneGeometry(screenWidth - 0.12, screenHeight - 0.12);
    const screenApertureMat = new THREE.MeshPhysicalMaterial({
      map: screenTexture,
      emissive: 0x350814,
      emissiveIntensity: 0.75,
      roughness: 0.45,
      metalness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    });
    const screenApertureMesh = new THREE.Mesh(screenApertureGeo, screenApertureMat);
    screenApertureMesh.position.z = 0.075;
    cinemaScreenGroup.add(screenApertureMesh);

    // C. Fine Restrained Burgundy / Silver Screen Rim Edge Glow
    const rimPoints = [
      new THREE.Vector3(-(screenWidth / 2), -(screenHeight / 2), 0.08),
      new THREE.Vector3((screenWidth / 2), -(screenHeight / 2), 0.08),
      new THREE.Vector3((screenWidth / 2), (screenHeight / 2), 0.08),
      new THREE.Vector3(-(screenWidth / 2), (screenHeight / 2), 0.08),
      new THREE.Vector3(-(screenWidth / 2), -(screenHeight / 2), 0.08)
    ];
    const rimLineGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimLineMat = new THREE.LineBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.65
    });
    const rimLine = new THREE.Line(rimLineGeo, rimLineMat);
    cinemaScreenGroup.add(rimLine);

    scene.add(cinemaScreenGroup);

    // =========================================================
    // 2. THE ORGANIC BLACK-GLASS & LIQUID-CHROME SCULPTURE
    // (Framing and wrapping around the left edge of the cinema screen)
    // =========================================================
    const sculptureGeo = new THREE.TorusKnotGeometry(0.74, 0.21, 192, 48, 2, 3);
    const posAttr = sculptureGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08090d,
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
      emissive: 0x220409,
      emissiveIntensity: 0.35,
      envMap: envTexture,
      envMapIntensity: 1.6
    });

    const sculptureMesh = new THREE.Mesh(sculptureGeo, sculptureMaterial);
    // Positioned so it emerges beside and wraps the left corner of the screen
    sculptureMesh.position.set(1.95, -0.05, 0.2);
    sculptureMesh.rotation.set(0.35, 0.45, -0.12);
    sculptureMesh.scale.set(0.86, 0.86, 0.86);
    scene.add(sculptureMesh);

    // Secondary subtle obsidian flow ribbon weaving around the screen edge
    const ribbonGeo = new THREE.TorusGeometry(0.56, 0.07, 32, 96);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.18,
      metalness: 0.9,
      emissive: 0x30050e,
      emissiveIntensity: 0.4
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(1.95, -0.05, 0.2);
    ribbonMesh.rotation.set(1.1, 0.2, 0.6);
    scene.add(ribbonMesh);

    // =========================================================
    // 3. SUBTLE FLOATING OBSIDIAN SHARDS & EMBERS
    // =========================================================
    const shardGroup = new THREE.Group();
    const shardGeo = new THREE.DodecahedronGeometry(0.065, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x150306,
      emissiveIntensity: 0.3
    });

    const shardData = [];
    const shardPositions = [
      [1.4, 0.8, 0.4],
      [2.8, -0.7, 0.2],
      [3.3, 0.7, -0.2],
      [1.3, -0.6, 0.5],
      [3.6, -0.3, -0.3],
      [2.2, 1.0, -0.2],
      [3.8, 0.5, -0.4]
    ];

    shardPositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.set(idx, idx * 0.5, idx * 0.2);
      const s = 0.6 + (idx % 3) * 0.25;
      mesh.scale.set(s, s, s);
      shardGroup.add(mesh);

      shardData.push({
        mesh,
        basePos: [...pos],
        rotSpeed: {
          x: 0.004 + (idx % 3) * 0.002,
          y: 0.005 + (idx % 2) * 0.003
        },
        phase: idx * 1.1
      });
    });
    scene.add(shardGroup);

    // Gentle embers
    const emberCount = 35;
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = 1.2 + Math.random() * 3.2;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
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
      mouse.targetX = (clientX / width - 0.5) * 1.2;
      mouse.targetY = -(clientY / height - 0.5) * 1.2;
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
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting && !document.hidden;
    }, { threshold: 0.05 });
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
        // Low-frequency sine wave organic deformation on sculpture
        const posArray = posAttr.array;
        const speed = elapsed * 0.8;
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

        // Subtle sculpture rotation wrapping the cinema screen
        sculptureMesh.rotation.y = 0.45 + Math.sin(elapsed * 0.22) * 0.07 + mouse.x * 0.08;
        sculptureMesh.rotation.x = 0.35 + Math.cos(elapsed * 0.18) * 0.05 + mouse.y * 0.06;

        ribbonMesh.rotation.y = -elapsed * 0.12;
        ribbonMesh.rotation.z = 0.6 + Math.sin(elapsed * 0.15) * 0.1;

        // Cinema screen gentle atmospheric projection pulse
        screenApertureMesh.material.emissiveIntensity = 0.75 + Math.sin(elapsed * 1.8) * 0.12;
        rimLine.material.opacity = 0.55 + Math.sin(elapsed * 2.2) * 0.15;

        // Subtle shard drift
        shardData.forEach((s) => {
          s.mesh.rotation.x += s.rotSpeed.x;
          s.mesh.rotation.y += s.rotSpeed.y;
          s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.6 + s.phase) * 0.05;
        });

        embers.rotation.y = elapsed * 0.015;
      }

      // Parallax camera framing looking at the unified cinema screen + sculpture composition
      camera.position.x = 0.85 + mouse.x * 0.18;
      camera.position.y = 0.1 + mouse.y * 0.14;
      camera.lookAt(2.0, 0.1, 0);

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
      screenApertureGeo.dispose();
      screenApertureMat.dispose();
      rimLineGeo.dispose();
      rimLineMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      envTexture.dispose();
      screenTexture.dispose();

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
