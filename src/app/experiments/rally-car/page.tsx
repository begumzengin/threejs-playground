'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RallyCar = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enabled = false; // Disable orbit controls

    // Create ground (terrain)
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x355E3B,
      side: THREE.DoubleSide,
      wireframe: false
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create mountains
    const mountainGeometry = new THREE.ConeGeometry(10, 20, 4);
    const mountainMaterial = new THREE.MeshPhongMaterial({ color: 0x4B5320 });
    
    for (let i = 0; i < 5; i++) {
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(
        Math.random() * 80 - 40,
        10,
        Math.random() * 80 - 40
      );
      mountain.rotation.y = Math.random() * Math.PI;
      mountain.castShadow = true;
      scene.add(mountain);
    }

    // Create car
    const car = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 1;
    carBody.castShadow = true;
    car.add(carBody);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.9;
    roof.position.z = -0.5;
    roof.castShadow = true;
    car.add(roof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

    const wheelPositions = [
      { x: -1, y: 0.4, z: -1.2 },
      { x: 1, y: 0.4, z: -1.2 },
      { x: -1, y: 0.4, z: 1.2 },
      { x: 1, y: 0.4, z: 1.2 },
    ];

    wheelPositions.forEach(position => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(position.x, position.y, position.z);
      wheel.castShadow = true;
      car.add(wheel);
    });

    scene.add(car);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Car movement
    const speed = 0.1;
    const rotationSpeed = 0.05;
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          moveForward = true;
          break;
        case 'ArrowDown':
          moveBackward = true;
          break;
        case 'ArrowLeft':
          moveLeft = true;
          break;
        case 'ArrowRight':
          moveRight = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          moveForward = false;
          break;
        case 'ArrowDown':
          moveBackward = false;
          break;
        case 'ArrowLeft':
          moveLeft = false;
          break;
        case 'ArrowRight':
          moveRight = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update car position and rotation based on its current rotation
      if (moveForward) {
        car.position.x -= speed * Math.sin(car.rotation.y);
        car.position.z -= speed * Math.cos(car.rotation.y);
      }
      if (moveBackward) {
        car.position.x += speed * Math.sin(car.rotation.y);
        car.position.z += speed * Math.cos(car.rotation.y);
      }
      if (moveLeft) car.rotation.y += rotationSpeed;
      if (moveRight) car.rotation.y -= rotationSpeed;

      // Update camera position to follow car
      camera.position.x = car.position.x + 10 * Math.sin(car.rotation.y);
      camera.position.z = car.position.z + 10 * Math.cos(car.rotation.y);
      camera.lookAt(car.position);

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default RallyCar;