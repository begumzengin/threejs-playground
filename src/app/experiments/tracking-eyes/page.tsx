'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const TrackingEyes = () => {
  const mountRef = useRef<HTMLDivElement>(null);

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

    // Create eye group
    const createEye = (position: THREE.Vector3) => {
      const eyeGroup = new THREE.Group();

      // Eye white (sclera)
      const eyeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x333333,
        shininess: 100,
      });
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eyeGroup.add(eye);

      // Iris
      const irisGeometry = new THREE.CircleGeometry(0.25, 32);
      const irisMaterial = new THREE.MeshPhongMaterial({
        color: 0x4444ff,
        specular: 0x333333,
        shininess: 100,
      });
      const iris = new THREE.Mesh(irisGeometry, irisMaterial);
      iris.position.z = 0.45;
      eyeGroup.add(iris);

      // Pupil
      const pupilGeometry = new THREE.CircleGeometry(0.1, 32);
      const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.z = 0.46;
      eyeGroup.add(pupil);

      eyeGroup.position.copy(position);
      return eyeGroup;
    };

    // Create two eyes
    const leftEye = createEye(new THREE.Vector3(-1, 0, 0));
    const rightEye = createEye(new THREE.Vector3(1, 0, 0));
    scene.add(leftEye);
    scene.add(rightEye);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Mouse tracking
    const mouse = new THREE.Vector2();
    const target = new THREE.Vector3();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Calculate target point
      target.set(mouse.x * 3, mouse.y * 2, 2);

      // Update eye rotations
      [leftEye, rightEye].forEach((eye) => {
        eye.lookAt(target);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
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
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default TrackingEyes;