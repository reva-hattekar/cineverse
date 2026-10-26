import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicHeroCanvas
 * Procedurally animated 3D hero scene rendering an organic liquid-chrome & black-glass
 * morphing sculpture, glowing dimensional portal, floating space shards, and crimson atmospheric lighting.
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
    let height = container.clientHeight || 750;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.045);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(1.5, 0.2, 5.8);

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Procedural Reflection Environment Texture ---
    // Generate a high-contrast studio environment map with crimson and dark tones
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    const gradient = envCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#100206');
    gradient.addColorStop(0.3, '#3b0714');
    gradient.addColorStop(0.5, '#050508');
    gradient.addColorStop(0.7, '#e11d48');
    gradient.addColorStop(0.85, '#ffffff');
    gradient.addColorStop(1, '#050508');
    envCtx.fillStyle = gradient;
    envCtx.fillRect(0, 0, 512, 256);

    // Add bright horizontal reflection strips for chrome gleam
    envCtx.fillStyle = '#ffffff';
    envCtx.fillRect(100, 80, 140, 15);
    envCtx.fillRect(320, 140, 90, 8);
    envCtx.fillStyle = '#fb7185';
    envCtx.fillRect(0, 40, 512, 10);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x18040a, 1.2);
    scene.add(ambientLight);

    // Key sharp chrome specular light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Intense Crimson / Burgundy Rim Light
    const crimsonPointLight = new THREE.PointLight(0xe11d48, 8.5, 12, 1.6);
    crimsonPointLight.position.set(-1.8, 1.2, 1.5);
    scene.add(crimsonPointLight);

    // Deep Magenta / Rose Fill Light
    const magentaLight = new THREE.PointLight(0xbe123c, 6.0, 10, 1.5);
    magentaLight.position.set(3.2, -1.8, 0.8);
    scene.add(magentaLight);

    // Monolith Portal Emitter Light
    const portalLight = new THREE.PointLight(0xf43f5e, 5.0, 8, 1.4);
    portalLight.position.set(3.4, 0.8, -0.2);
    scene.add(portalLight);

    // --- Organic Morphing Sculpture Shader Material ---
    // Custom vertex & fragment shader creating liquid chrome + obsidian glass refraction
    const customSculptureMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uNoiseScale: { value: 1.15 },
        uDisplacement: { value: 0.35 },
        uEnvMap: { value: envTexture },
        uCrimsonColor: { value: new THREE.Color(0xe11d48) },
        uDeepBurgundy: { value: new THREE.Color(0x380612) },
        uObsidianColor: { value: new THREE.Color(0x060609) },
        uChromeHighlight: { value: new THREE.Color(0xffffff) },
        uRoughness: { value: 0.12 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uDisplacement;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        // Simplex-style 3D periodic noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 transformed = position;

          // Multi-octave organic fluid deformation
          float noiseA = snoise(position * uNoiseScale + vec3(uTime * 0.25, uTime * 0.18, 0.0));
          float noiseB = snoise(position * (uNoiseScale * 2.2) - vec3(0.0, uTime * 0.35, uTime * 0.2));
          float displacement = (noiseA * 0.7 + noiseB * 0.3) * uDisplacement;

          transformed += normal * displacement;

          vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
          vWorldPosition = worldPosition.xyz;
          vec4 mvPosition = viewMatrix * worldPosition;
          vViewPosition = -mvPosition.xyz;

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uEnvMap;
        uniform vec3 uCrimsonColor;
        uniform vec3 uDeepBurgundy;
        uniform vec3 uObsidianColor;
        uniform vec3 uChromeHighlight;
        uniform float uRoughness;

        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // Fresnel reflectance term
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.2);

          // Reflection vector for environment sampling
          vec3 reflectDir = reflect(-viewDir, normal);
          float u = atan(reflectDir.z, reflectDir.x) / (2.0 * 3.14159265) + 0.5;
          float v = reflectDir.y * 0.5 + 0.5;
          vec3 envColor = texture2D(uEnvMap, vec2(u, v)).rgb;

          // Blend obsidian glass core with fluid chrome reflections & crimson specular rims
          vec3 baseObsidian = mix(uObsidianColor, uDeepBurgundy, fresnel * 0.7);
          vec3 chromeReflect = envColor * 1.8;

          // Rich hybrid chrome + obsidian glass look
          vec3 finalColor = mix(baseObsidian, chromeReflect, 0.65 + fresnel * 0.35);

          // Add deep crimson edge scattering
          finalColor += uCrimsonColor * (pow(fresnel, 2.0) * 1.6);

          // High specular gleam
          float specular = pow(max(dot(reflectDir, vec3(0.5, 0.8, 0.3)), 0.0), 32.0);
          finalColor += uChromeHighlight * specular * 1.2;

          gl_FragColor = vec4(finalColor, 0.98);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Main Fluid Sculpture: Torus Knot Geometry
    const sculptureGeo = new THREE.TorusKnotGeometry(1.2, 0.42, 220, 48, 2, 3);
    const sculptureMesh = new THREE.Mesh(sculptureGeo, customSculptureMaterial);
    sculptureMesh.position.set(1.1, 0.1, 0);
    sculptureMesh.rotation.set(0.4, 0.6, 0.2);
    sculptureMesh.scale.set(1.05, 1.05, 1.05);
    scene.add(sculptureMesh);

    // Inner organic core (secondary obsidian ribbon)
    const innerGeo = new THREE.TorusGeometry(0.85, 0.15, 32, 100);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      emissive: 0x450a14,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.set(1.1, 0.1, 0);
    innerMesh.rotation.set(1.2, 0.4, 0.8);
    scene.add(innerMesh);

    // --- Floating Asteroids / Obsidian Shards ---
    const shardGroup = new THREE.Group();
    const shardCount = 22;
    const shardGeos = [
      new THREE.DodecahedronGeometry(0.12, 0),
      new THREE.IcosahedronGeometry(0.09, 0),
      new THREE.TetrahedronGeometry(0.14, 0)
    ];

    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x121216,
      metalness: 0.85,
      roughness: 0.3,
      emissive: 0x22040b,
      emissiveIntensity: 0.4
    });

    const shardData = [];
    for (let i = 0; i < shardCount; i++) {
      const geo = shardGeos[i % shardGeos.length];
      const mesh = new THREE.Mesh(geo, shardMat);
      const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 1.8 + Math.random() * 1.5;
      const height = (Math.random() - 0.5) * 2.6;

      mesh.position.set(
        1.1 + Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius * 0.8 - 0.5
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.6 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      shardGroup.add(mesh);
      shardData.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.025,
          z: (Math.random() - 0.5) * 0.015
        },
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: 0.002 + Math.random() * 0.003,
        baseY: height
      });
    }
    scene.add(shardGroup);

    // --- Glowing Dimensional Monolith / Portal on Far Right ---
    const portalGroup = new THREE.Group();
    portalGroup.position.set(3.4, 0.4, -0.6);
    portalGroup.rotation.y = -0.32;

    // Outer Monolith Frame
    const frameGeo = new THREE.BoxGeometry(1.6, 2.7, 0.22);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x07070b,
      roughness: 0.4,
      metalness: 0.8
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    portalGroup.add(frameMesh);

    // Glowing Inner Portal Aperture
    const apertureGeo = new THREE.PlaneGeometry(1.3, 2.4);
    const apertureMat = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      side: THREE.DoubleSide
    });
    const apertureMesh = new THREE.Mesh(apertureGeo, apertureMat);
    apertureMesh.position.z = 0.12;
    portalGroup.add(apertureMesh);

    // Neon Rim border around portal
    const rimGeo = new THREE.RingGeometry(0.85, 0.9, 32);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xff1e56,
      side: THREE.DoubleSide
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(-0.2, 0.5, 0.13);
    portalGroup.add(rimMesh);

    scene.add(portalGroup);

    // --- Atmospheric Crimson Dust Specks / Embers ---
    const dustCount = 80;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.3) * 8;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // --- Mouse Parallax Tracking ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / width - 0.5) * 2;
      mouse.targetY = -(clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 750;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    };
    window.addEventListener('resize', handleResize);

    // --- Visibility and Intersection Observer to Throttle Offscreen Rendering ---
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

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Update shader time for organic morphing
      const speedMultiplier = isReducedMotion ? 0.05 : 1.0;
      customSculptureMaterial.uniforms.uTime.value = elapsed * 1.1 * speedMultiplier;

      // Subtle dynamic sculpture rotation
      if (!isReducedMotion) {
        sculptureMesh.rotation.y = 0.5 + Math.sin(elapsed * 0.3) * 0.15 + mouse.x * 0.12;
        sculptureMesh.rotation.x = 0.35 + Math.cos(elapsed * 0.25) * 0.1 + mouse.y * 0.1;

        innerMesh.rotation.y = -elapsed * 0.2;
        innerMesh.rotation.z = elapsed * 0.15;

        // Floating debris orbit & spin
        for (let i = 0; i < shardData.length; i++) {
          const shard = shardData[i];
          shard.mesh.rotation.x += shard.rotSpeed.x;
          shard.mesh.rotation.y += shard.rotSpeed.y;
          shard.mesh.rotation.z += shard.rotSpeed.z;

          shard.orbitAngle += shard.orbitSpeed;
          shard.mesh.position.x = 1.1 + Math.cos(shard.orbitAngle) * shard.orbitRadius;
          shard.mesh.position.z = Math.sin(shard.orbitAngle) * shard.orbitRadius * 0.8 - 0.5;
          shard.mesh.position.y = shard.baseY + Math.sin(elapsed * 0.8 + i) * 0.1;
        }

        // Slow drift for dust specks
        dustParticles.rotation.y = elapsed * 0.02;
        dustParticles.rotation.x = Math.sin(elapsed * 0.015) * 0.05;

        // Portal gentle pulse
        apertureMesh.scale.x = 1.0 + Math.sin(elapsed * 2.0) * 0.02;
        portalLight.intensity = 4.5 + Math.sin(elapsed * 3.0) * 1.2;
      }

      // Parallax camera tilt
      camera.position.x = 1.5 + mouse.x * 0.3;
      camera.position.y = 0.2 + mouse.y * 0.2;
      camera.lookAt(1.1, 0.1, 0);

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
      customSculptureMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      shardGeos.forEach(g => g.dispose());
      shardMat.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      apertureGeo.dispose();
      apertureMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      envTexture.dispose();

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
