'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const InteractiveCube = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add cube
    const geometry = new THREE.BoxGeometry();
    materialRef.current = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const material = materialRef.current;
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const edges = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edgesLine = new THREE.LineSegments(edges, edgesMaterial);
    cube.add(edgesLine);

    // Add vertices
    const vertices = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ 
        color: 0x000000, 
        size: 0.001,
        sizeAttenuation: true
      })
    );
    cube.add(vertices);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);
  
      if (intersects.length > 0 && materialRef.current) {
        const currentColor = materialRef.current.color;
        const targetColor = new THREE.Color(currentColor.getHex() === 0x00ff00 ? 0xff0000 : 0x00ff00);
        let progress = 0;
        
        const animateColor = () => {
          progress += 0.02;
          if (progress <= 1) {
            const lerpedColor = currentColor.clone().lerp(targetColor, progress);
            materialRef.current!.color.copy(lerpedColor);
            requestAnimationFrame(animateColor);
          }
        };
        
        animateColor();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default InteractiveCube;