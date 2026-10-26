import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Redesigned 3D hero scene matching the CINEVERSE visual identity:
 * 1. Recognisable 16:9 widescreen cinematic projection screen with dark beveled frame and ambient glow
 * 2. Fluid, glossy obsidian-black & liquid-chrome sculpture wrapping around and framing the cinema screen
 * 3. Restrained burgundy & silver edge illumination (no flat pink panel, no bright pink glare)
 * 4. Master composition shifted firmly right (~8-12% farther right), leaving ample negative space for text
 * 5. Throttles / pauses WebGL rendering loop when not active, cleans up all WebGL resources on unmount
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
    // Camera positioned at center (x: 0), framing the right-shifted installation
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(0.0, 0.06, 5.2);

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
    gradient.addColorStop(0.35, '#140308');
    gradient.addColorStop(0.55, '#050508');
    gradient.addColorStop(0.75, '#35060f');
    gradient.addColorStop(0.9, '#c0c5ce');
    gradient.addColorStop(1.0, '#050508');
    envCtx.fillStyle = gradient;
    envCtx.fillRect(0, 0, 512, 256);

    // Soft restrained silver specular strip
    envCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    envCtx.fillRect(160, 90, 110, 8);
    envCtx.fillStyle = 'rgba(225, 29, 72, 0.3)';
    envCtx.fillRect(0, 50, 512, 4);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // --- Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0x080406, 1.4);
    scene.add(ambientLight);

    // Key directional light for soft silver reflections on the liquid curves
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    keyLight.position.set(4.8, 3.8, 3.4);
    scene.add(keyLight);

    // Soft warm silver rim fill
    const rimFillLight = new THREE.DirectionalLight(0x94a3b8, 1.0);
    rimFillLight.position.set(-3.0, 2.0, -1.0);
    scene.add(rimFillLight);

    // =========================================================
    // MASTER CINEMA INSTALLATION GROUP
    // (Houses the 16:9 Cinema Screen, Bezel, Sculpture, Ribbon, & Local Lights)
    // Shifted firmly to the right side of the hero viewport (~8-12% farther right)
    // =========================================================
    const cinemaInstallation = new THREE.Group();
    cinemaInstallation.position.set(2.85, 0.05, -0.2);
    cinemaInstallation.rotation.y = -0.24; // Subtle cinematic perspective angle
    scene.add(cinemaInstallation);

    // Local restrained burgundy backlight behind the cinema screen frame
    const screenBacklight = new THREE.PointLight(0x4c0519, 2.8, 6.0, 1.8);
    screenBacklight.position.set(0.0, 0.0, -0.3);
    cinemaInstallation.add(screenBacklight);

    // Subtle edge specular light
    const edgeGlow = new THREE.PointLight(0x9f1239, 1.8, 4.0, 2.0);
    edgeGlow.position.set(1.5, 0.8, 0.3);
    cinemaInstallation.add(edgeGlow);

    // =========================================================
    // 1. WIDESCREEN CINEMA SCREEN (16:9 PROPORTIONS)
    // =========================================================
    const cinemaScreenGroup = new THREE.Group();
    cinemaInstallation.add(cinemaScreenGroup);

    // A. Outer Architectural Cinema Bezel / Dark Metallic Housing
    const screenWidth = 3.24;
    const screenHeight = 1.82; // 16:9 ratio (3.24 / 1.82 ≈ 1.78)
    const frameGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      roughness: 0.28,
      metalness: 0.88
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    cinemaScreenGroup.add(frameMesh);

    // B. Inner Matte Masking Border (true cinema acoustic masking)
    const innerMatteGeo = new THREE.PlaneGeometry(screenWidth - 0.08, screenHeight - 0.08);
    const innerMatteMat = new THREE.MeshBasicMaterial({ color: 0x030406 });
    const innerMatteMesh = new THREE.Mesh(innerMatteGeo, innerMatteMat);
    innerMatteMesh.position.z = 0.062;
    cinemaScreenGroup.add(innerMatteMesh);

    // C. Dark, Subtly Reflective Screen Surface (Believable cinema projection screen)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 576; // 16:9
    const sCtx = screenCanvas.getContext('2d');

    // 1. Base Dark Cinema Projection Field
    const sGrad = sCtx.createRadialGradient(512, 288, 20, 512, 288, 520);
    sGrad.addColorStop(0, '#10141e');
    sGrad.addColorStop(0.4, '#0c0e15');
    sGrad.addColorStop(0.75, '#07080d');
    sGrad.addColorStop(1, '#030406');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 1024, 576);

    // 2. Scope Aspect Guide Lines (2.39:1 Cinema Markers)
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    sCtx.lineWidth = 1;
    sCtx.beginPath();
    sCtx.moveTo(0, 72);
    sCtx.lineTo(1024, 72);
    sCtx.moveTo(0, 504);
    sCtx.lineTo(1024, 504);
    sCtx.stroke();

    // 3. Faint Optical Projection Bloom (Center pearlescent sheen)
    const centerBloom = sCtx.createRadialGradient(512, 288, 5, 512, 288, 260);
    centerBloom.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    centerBloom.addColorStop(0.4, 'rgba(225, 29, 72, 0.07)');
    centerBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = centerBloom;
    sCtx.fillRect(0, 0, 1024, 576);

    // 4. Anamorphic Horizontal Lens Streak Across Screen Center
    const streakGrad = sCtx.createLinearGradient(0, 288, 1024, 288);
    streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.35, 'rgba(159, 18, 57, 0.18)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.42)');
    streakGrad.addColorStop(0.65, 'rgba(159, 18, 57, 0.18)');
    streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = streakGrad;
    sCtx.fillRect(0, 286, 1024, 5);

    // 5. Subtle "C I N E V E R S E" Screen Watermark
    sCtx.font = '600 24px Georgia, serif';
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.letterSpacing = '8px';
    sCtx.fillText('C I N E V E R S E', 512, 288);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screenApertureGeo = new THREE.PlaneGeometry(screenWidth - 0.14, screenHeight - 0.14);
    const screenApertureMat = new THREE.MeshPhysicalMaterial({
      map: screenTexture,
      color: 0x12141a,
      roughness: 0.32,
      metalness: 0.15,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      reflectivity: 0.65,
      emissive: 0x070204, // Very restrained deep dark wine, NO flat pink
      emissiveIntensity: 0.15
    });
    const screenApertureMesh = new THREE.Mesh(screenApertureGeo, screenApertureMat);
    screenApertureMesh.position.z = 0.065;
    cinemaScreenGroup.add(screenApertureMesh);

    // D. Fine Restrained Silver / Burgundy Screen Rim Edge Glow
    const halfW = screenWidth / 2;
    const halfH = screenHeight / 2;
    const rimPoints = [
      new THREE.Vector3(-halfW, -halfH, 0.068),
      new THREE.Vector3(halfW, -halfH, 0.068),
      new THREE.Vector3(halfW, halfH, 0.068),
      new THREE.Vector3(-halfW, halfH, 0.068),
      new THREE.Vector3(-halfW, -halfH, 0.068)
    ];
    const rimLineGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimLineMat = new THREE.LineBasicMaterial({
      color: 0x9f1239,
      transparent: true,
      opacity: 0.55
    });
    const rimLine = new THREE.Line(rimLineGeo, rimLineMat);
    cinemaScreenGroup.add(rimLine);

    // =========================================================
    // 2. THE ORGANIC BLACK-GLASS & LIQUID-CHROME SCULPTURE
    // (Flowing and cradling the bottom-left corner of the cinema screen)
    // =========================================================
    const sculptureGeo = new THREE.TorusKnotGeometry(0.76, 0.2, 192, 48, 2, 3);
    const posAttr = sculptureGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08090d,
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.92,
      emissive: 0x1f0308,
      emissiveIntensity: 0.3,
      envMap: envTexture,
      envMapIntensity: 1.6
    });

    const sculptureMesh = new THREE.Mesh(sculptureGeo, sculptureMaterial);
    // Cradles and frames the lower-left border of the cinema screen
    sculptureMesh.position.set(-1.18, -0.62, 0.24);
    sculptureMesh.rotation.set(0.35, 0.45, -0.12);
    sculptureMesh.scale.set(0.78, 0.78, 0.78);
    cinemaInstallation.add(sculptureMesh);

    // Secondary subtle liquid-chrome ribbon weaving beneath the bottom bezel
    const ribbonGeo = new THREE.TorusGeometry(0.68, 0.05, 32, 96);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x06070a,
      roughness: 0.18,
      metalness: 0.92,
      emissive: 0x22040a,
      emissiveIntensity: 0.35
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(-0.25, -0.82, 0.16);
    ribbonMesh.rotation.set(1.2, 0.2, 0.5);
    cinemaInstallation.add(ribbonMesh);

    // =========================================================
    // 3. RESTRAINED PERIPHERAL FLOATING SHARDS
    // =========================================================
    const shardGroup = new THREE.Group();
    const shardGeo = new THREE.DodecahedronGeometry(0.055, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c12,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x100205,
      emissiveIntensity: 0.25
    });

    const shardData = [];
    const shardPositions = [
      [-1.6, 0.5, 0.3],
      [-1.4, -0.9, 0.4],
      [1.7, 0.8, -0.2],
      [-0.8, -1.1, 0.3],
      [1.9, -0.6, -0.1]
    ];

    shardPositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.set(idx, idx * 0.5, idx * 0.2);
      const s = 0.55 + (idx % 3) * 0.2;
      mesh.scale.set(s, s, s);
      shardGroup.add(mesh);

      shardData.push({
        mesh,
        basePos: [...pos],
        rotSpeed: {
          x: 0.003 + (idx % 3) * 0.002,
          y: 0.004 + (idx % 2) * 0.003
        },
        phase: idx * 1.1
      });
    });
    cinemaInstallation.add(shardGroup);

    // Gentle floating embers
    const emberCount = 30;
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 3.6;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xe11d48,
      size: 0.03,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    cinemaInstallation.add(embers);

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
        // Low-frequency sine wave organic deformation on sculpture
        const posArray = posAttr.array;
        const speed = elapsed * 0.75;
        const waveAmp = 0.032;

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
        sculptureMesh.rotation.y = 0.45 + Math.sin(elapsed * 0.2) * 0.06 + mouse.x * 0.06;
        sculptureMesh.rotation.x = 0.35 + Math.cos(elapsed * 0.16) * 0.04 + mouse.y * 0.05;

        ribbonMesh.rotation.y = -elapsed * 0.1;
        ribbonMesh.rotation.z = 0.5 + Math.sin(elapsed * 0.14) * 0.08;

        // Subtle shard drift
        shardData.forEach((s) => {
          s.mesh.rotation.x += s.rotSpeed.x;
          s.mesh.rotation.y += s.rotSpeed.y;
          s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.5 + s.phase) * 0.04;
        });

        embers.rotation.y = elapsed * 0.012;
      }

      // Parallax camera framing looking slightly right of center towards installation
      camera.position.x = 0.0 + mouse.x * 0.15;
      camera.position.y = 0.06 + mouse.y * 0.12;
      camera.lookAt(0.7, 0.06, 0);

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
      innerMatteGeo.dispose();
      innerMatteMat.dispose();
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
