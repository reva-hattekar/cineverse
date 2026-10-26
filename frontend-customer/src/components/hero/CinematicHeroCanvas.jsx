import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Elegantly sculpted 3D hero scene matching the CINEVERSE visual reference:
 * - Fluid, glossy obsidian-black sculpture with restrained silver reflections & subtle burgundy rim glow
 * - Smooth, low-frequency organic wave deformation (no jagged facets or harsh color bands)
 * - Positioned strictly on the right half of the hero space, leaving the left pristine for editorial typography
 * - Atmospheric gateway portal with dark translucent aperture and soft rim lighting
 * - Subtle floating obsidian shards & gentle dust embers
 * - Responds to reduced motion and cleans up all WebGL resources on unmount
 */
export default function CinematicHeroCanvas({ onSceneReady }) {
  const containerRef = useRef(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

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

    // --- Camera ---
    // Positioned so the left half (x < 0) has ample negative space for typography
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 80);
    camera.position.set(0.6, 0.05, 5.2);

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
    // Smooth gradient with dark obsidian tones, subtle burgundy horizon, and soft silver key highlight
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

    // --- Lighting (Restrained & Cinematic) ---
    const ambientLight = new THREE.AmbientLight(0x0a0507, 1.4);
    scene.add(ambientLight);

    // Key directional light for soft silver highlights on the curves
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 2.2);
    keyLight.position.set(3.5, 4.0, 3.0);
    scene.add(keyLight);

    // Subtle burgundy rim light from below/behind the sculpture
    const burgundyRimLight = new THREE.PointLight(0xbe123c, 4.0, 8.0, 1.8);
    burgundyRimLight.position.set(1.5, -1.0, 1.0);
    scene.add(burgundyRimLight);

    // Deep crimson accent light from right
    const crimsonAccent = new THREE.PointLight(0x881337, 3.5, 7.0, 1.6);
    crimsonAccent.position.set(3.0, 1.2, 0.5);
    scene.add(crimsonAccent);

    // --- The 3D Sculpture ---
    // Smooth, flowing organic form: Torus Knot with high subdivision for silk-smooth curvature
    const sculptureGeo = new THREE.TorusKnotGeometry(0.75, 0.22, 192, 48, 2, 3);
    
    // Store original vertex positions for clean, low-frequency procedural sine wave displacement
    const posAttr = sculptureGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    // Material: predominantly glossy obsidian-black with restrained silver reflections and subtle burgundy glow
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
    // Positioned strictly on the right half of the scene
    sculptureMesh.position.set(1.45, 0.1, 0.0);
    sculptureMesh.rotation.set(0.3, 0.4, -0.15);
    sculptureMesh.scale.set(0.85, 0.85, 0.85);
    scene.add(sculptureMesh);

    // Secondary subtle obsidian flow ring weaving through the core
    const ribbonGeo = new THREE.TorusGeometry(0.55, 0.07, 32, 96);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.18,
      metalness: 0.9,
      emissive: 0x30050e,
      emissiveIntensity: 0.4
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(1.45, 0.1, 0.0);
    ribbonMesh.rotation.set(1.1, 0.2, 0.6);
    scene.add(ribbonMesh);

    // --- Subtle Atmospheric Gateway Portal (Right Edge) ---
    const portalGroup = new THREE.Group();
    portalGroup.position.set(3.0, 0.25, -0.8);
    portalGroup.rotation.y = -0.28;

    // Dark architectural monolith frame
    const frameGeo = new THREE.BoxGeometry(1.25, 2.2, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x06070a,
      roughness: 0.55,
      metalness: 0.7
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    portalGroup.add(frameMesh);

    // Dark translucent portal interior (atmospheric haze with dark canyon mood)
    const portalCanvas = document.createElement('canvas');
    portalCanvas.width = 256;
    portalCanvas.height = 384;
    const pCtx = portalCanvas.getContext('2d');
    const pGrad = pCtx.createLinearGradient(0, 0, 0, 384);
    pGrad.addColorStop(0, '#050204');
    pGrad.addColorStop(0.35, '#20050c');
    pGrad.addColorStop(0.6, '#3a0814');
    pGrad.addColorStop(0.85, '#150307');
    pGrad.addColorStop(1, '#050508');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 256, 384);

    // Gentle misty mountain silhouette in portal
    pCtx.fillStyle = 'rgba(10, 2, 4, 0.75)';
    pCtx.beginPath();
    pCtx.moveTo(0, 384);
    pCtx.lineTo(60, 260);
    pCtx.lineTo(120, 290);
    pCtx.lineTo(180, 230);
    pCtx.lineTo(256, 300);
    pCtx.lineTo(256, 384);
    pCtx.closePath();
    pCtx.fill();

    const portalTexture = new THREE.CanvasTexture(portalCanvas);
    const apertureGeo = new THREE.PlaneGeometry(1.05, 1.95);
    const apertureMat = new THREE.MeshBasicMaterial({
      map: portalTexture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    const apertureMesh = new THREE.Mesh(apertureGeo, apertureMat);
    apertureMesh.position.z = 0.085;
    portalGroup.add(apertureMesh);

    // Soft, delicate burgundy rim around the portal (no harsh flat pink!)
    const portalRimGeo = new THREE.RingGeometry(0.55, 0.58, 48);
    const portalRimMat = new THREE.MeshBasicMaterial({
      color: 0xbe123c,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const portalRimMesh = new THREE.Mesh(portalRimGeo, portalRimMat);
    portalRimMesh.position.set(-0.15, 0.35, 0.09);
    portalGroup.add(portalRimMesh);

    scene.add(portalGroup);

    // --- Subtle Floating Obsidian Shards (Restrained, only 8 pieces) ---
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
      [1.1, 0.9, 0.4],
      [1.9, -0.6, 0.2],
      [2.3, 0.7, -0.3],
      [0.9, -0.7, 0.5],
      [2.6, -0.3, -0.4],
      [1.6, 1.1, -0.2],
      [2.8, 0.5, -0.5]
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

    // --- Gentle Dust Embers (Drifting faintly in background) ---
    const emberCount = 35;
    const emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = 0.5 + Math.random() * 3.5;
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

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      if (!isReducedMotion) {
        // Smooth, low-frequency organic wave deformation on the sculpture vertices
        const posArray = posAttr.array;
        const speed = elapsed * 0.8;
        const waveAmp = 0.04; // Very restrained amplitude to keep curves silky smooth

        for (let i = 0; i < posArray.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          // Gentle low-frequency harmonics
          const wave = Math.sin(ox * 1.8 + speed) * Math.cos(oy * 1.5 + speed * 0.7) * waveAmp;

          posArray[i] = ox + ox * wave;
          posArray[i + 1] = oy + oy * wave;
          posArray[i + 2] = oz + oz * wave;
        }
        posAttr.needsUpdate = true;
        sculptureGeo.computeVertexNormals(); // Recompute smooth normals

        // Subtle, elegant rotation
        sculptureMesh.rotation.y = 0.4 + Math.sin(elapsed * 0.22) * 0.08 + mouse.x * 0.1;
        sculptureMesh.rotation.x = 0.3 + Math.cos(elapsed * 0.18) * 0.06 + mouse.y * 0.08;

        ribbonMesh.rotation.y = -elapsed * 0.12;
        ribbonMesh.rotation.z = 0.6 + Math.sin(elapsed * 0.15) * 0.1;

        // Subtle shard drift
        shardData.forEach((s) => {
          s.mesh.rotation.x += s.rotSpeed.x;
          s.mesh.rotation.y += s.rotSpeed.y;
          s.mesh.position.y = s.basePos[1] + Math.sin(elapsed * 0.6 + s.phase) * 0.05;
        });

        // Slow ember drift
        embers.rotation.y = elapsed * 0.015;

        // Portal gentle atmospheric breath
        portalRimMesh.scale.setScalar(1.0 + Math.sin(elapsed * 1.5) * 0.03);
      }

      // Parallax camera tilt (subtle)
      camera.position.x = 0.6 + mouse.x * 0.2;
      camera.position.y = 0.05 + mouse.y * 0.15;
      camera.lookAt(0.9, 0.05, 0);

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

      // Dispose Geometries & Materials
      sculptureGeo.dispose();
      sculptureMaterial.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      apertureGeo.dispose();
      apertureMat.dispose();
      portalRimGeo.dispose();
      portalRimMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      envTexture.dispose();
      portalTexture.dispose();

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
      className="cinematic-hero-canvas-container"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    />
  );
}
