'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Mooncake = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000020);

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1000;
    const starsPositions = new Float32Array(starsCount * 3);
    
    for(let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 100;
      starsPositions[i + 1] = (Math.random() - 0.5) * 100;
      starsPositions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Add light beams
    const beamLight1 = new THREE.SpotLight(0x4444ff, 2);
    beamLight1.position.set(-10, 5, -5);
    beamLight1.angle = Math.PI / 6;
    beamLight1.penumbra = 0.5;
    scene.add(beamLight1);
    
    const beamLight2 = new THREE.SpotLight(0x4444ff, 2);
    beamLight2.position.set(10, -5, -5);
    beamLight2.angle = Math.PI / 6;
    beamLight2.penumbra = 0.5;
    scene.add(beamLight2);

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

    // Create face group
    const faceGroup = new THREE.Group();

    // Create legs
    const createLeg = (position: THREE.Vector3) => {
      const legGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x66d91e,
        specular: 0x444444,
        shininess: 200,
      });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.copy(position);
      return leg;
    };

    // Add two legs
    const leftLeg = createLeg(new THREE.Vector3(-0.9, -1.3, 0));
    const rightLeg = createLeg(new THREE.Vector3(0.9, -1.3, 0));
    faceGroup.add(leftLeg);
    faceGroup.add(rightLeg);

    // Head (main sphere)
    const headGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x66d91e,
      specular: 0x444444,
      shininess: 200,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.scale.set(1.3, 1, 1); // Kafayı yatay eksende genişlet
    faceGroup.add(head);

    // Create antennas
    const createAntenna = (position: THREE.Vector3, rotation: THREE.Euler) => {
      const antennaGroup = new THREE.Group();

      // Antenna stem
      const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 32);
      const stemMaterial = new THREE.MeshPhongMaterial({
        color: 0x66d91e,
        specular: 0x444444,
        shininess: 200,
      });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      antennaGroup.add(stem);

      // Antenna tip
      const tipGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const tipMaterial = new THREE.MeshPhongMaterial({
        color: 0x66d91e,
        specular: 0x444444,
        shininess: 200,
      });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = 0.65;
      antennaGroup.add(tip);

      antennaGroup.position.copy(position);
      antennaGroup.setRotationFromEuler(rotation);
      return antennaGroup;
    };

    // Add two antennas
    const leftAntenna = createAntenna(
      new THREE.Vector3(-0.8, 1.4, 0),
      new THREE.Euler(-Math.PI / 5, 0, Math.PI / 8)
    );
    const rightAntenna = createAntenna(
      new THREE.Vector3(0.8, 1.4, 0),
      new THREE.Euler(-Math.PI / 5, 0, -Math.PI / 8)
    );
    faceGroup.add(leftAntenna);
    faceGroup.add(rightAntenna);

    // Create eye function
    const createEye = (position: THREE.Vector3) => {
      const eyeGroup = new THREE.Group();

      // Eye white (sclera)
      const eyeGeometry = new THREE.SphereGeometry(0.4, 32, 32);
      const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 150,
      });
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eyeGroup.add(eye);

    

      // Pupil
      const pupilGeometry = new THREE.SphereGeometry(0.05, 32, 32);
      const pupilMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000
      });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.z = 0.38;
      eyeGroup.add(pupil);

      eyeGroup.position.copy(position);
      return eyeGroup;
    };

    // Create two eyes
    const leftEye = createEye(new THREE.Vector3(-0.65, 0.2, 1.3));
    const rightEye = createEye(new THREE.Vector3(0.65, 0.2, 1.3));
    faceGroup.add(leftEye);
    faceGroup.add(rightEye);

    // Mouth
    const mouthCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.1, -0.1, 1.5),
      new THREE.Vector3(-0.1, -0.15, 1.5),
      new THREE.Vector3(0.1, -0.15, 1.5),
      new THREE.Vector3(0.1, -0.1, 1.5),
    );

    const mouthGeometry = new THREE.TubeGeometry(mouthCurve, 32, 0.01, 8, false);
    const mouthMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      specular: 0x444444,
      shininess: 50,
      emissive: 0x330000,
      emissiveIntensity: 0.2
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    faceGroup.add(mouth);

    scene.add(faceGroup);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add three point lights for balanced lighting
    const leftLight = new THREE.PointLight(0xffffff, 100);
    leftLight.position.set(-15, 0, 10);
    leftLight.decay = 2;
    leftLight.distance = 50;
    scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffffff, 100);
    rightLight.position.set(15, 0, 10);
    rightLight.decay = 2;
    rightLight.distance = 50;
    scene.add(rightLight);

    const topLight = new THREE.PointLight(0xffffff, 100);
    topLight.position.set(0, 15, 10);
    topLight.decay = 2;
    topLight.distance = 50;
    scene.add(topLight);

    // Add soft spotlights for eye highlights
    const eyeSpotLight1 = new THREE.SpotLight(0xffffff, 0.5);
    eyeSpotLight1.position.set(-1, 1, 3);
    eyeSpotLight1.angle = Math.PI / 8;
    eyeSpotLight1.penumbra = 0.9;
    scene.add(eyeSpotLight1);

    const eyeSpotLight2 = new THREE.SpotLight(0xffffff, 0.5);
    eyeSpotLight2.position.set(1, 1, 3);
    eyeSpotLight2.angle = Math.PI / 8;
    eyeSpotLight2.penumbra = 0.9;
    scene.add(eyeSpotLight2);

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

export default Mooncake;