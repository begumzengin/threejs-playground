'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MedievalCity = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    scene.fog = new THREE.Fog(0x87CEEB, 50, 150); // Add fog for atmosphere

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 70, 70); // Position camera higher for better view
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20;
    controls.maxDistance = 100;

    // Island base
    const islandGeometry = new THREE.CircleGeometry(40, 32);
    const islandMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.2
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.rotation.x = -Math.PI / 2;
    island.receiveShadow = true;
    scene.add(island);

    // Water with custom shader
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const waterVertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      uniform float uTime;
      uniform float uWaveHeight;
      uniform float uWaveFrequency;
      uniform float uWaveSpeed;
      
      void main() {
          vUv = uv;
          vPosition = position;
          
          // Complex wave pattern
          float wave1 = sin(position.x * uWaveFrequency + uTime * uWaveSpeed) * 
                       cos(position.z * uWaveFrequency * 1.2 + uTime * uWaveSpeed * 0.8) * uWaveHeight;
          float wave2 = sin(position.x * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.5) * 
                       sin(position.z * uWaveFrequency * 1.8 + uTime * uWaveSpeed * 1.2) * uWaveHeight * 0.5;
          float wave3 = cos(position.x * uWaveFrequency * 1.5 + uTime * uWaveSpeed * 0.7) * 
                       sin(position.z * uWaveFrequency * 2.2 + uTime * uWaveSpeed) * uWaveHeight * 0.3;
          
          vec3 newPosition = position;
          newPosition.y += wave1 + wave2 + wave3;
          
          // Calculate normals based on wave gradients
          vec3 tangent = normalize(vec3(
              1.0,
              (wave1 + wave2 + wave3) * uWaveFrequency,
              0.0
          ));
          vec3 bitangent = normalize(vec3(
              0.0,
              (wave1 + wave2 + wave3) * uWaveFrequency,
              1.0
          ));
          vNormal = normalize(cross(tangent, bitangent));
          
          vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const waterFragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      uniform float uTime;
      uniform vec3 uWaterColor;
      uniform vec3 uFoamColor;
      uniform float uFoamThreshold;
      
      void main() {
          vec3 color = uWaterColor;
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          // Fresnel effect for water edge glow
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
          color = mix(color, vec3(1.0), fresnel * 0.3);
          
          // Dynamic foam pattern
          float foam = smoothstep(uFoamThreshold - 0.1, uFoamThreshold + 0.1, vPosition.y);
          foam *= (sin(vUv.x * 40.0 + uTime * 2.0) * 0.5 + 0.5) * 
                 (cos(vUv.y * 40.0 + uTime * 1.5) * 0.5 + 0.5);
          color = mix(color, uFoamColor, foam * 0.7);
          
          // Enhanced water sparkle
          float sparkle = pow(max(dot(normal, normalize(vec3(1.0, 1.0, 1.0))), 0.0), 64.0);
          sparkle *= (sin(vUv.x * 100.0 + uTime * 3.0) * 0.5 + 0.5) * 
                    (cos(vUv.y * 100.0 + uTime * 2.5) * 0.5 + 0.5);
          color += vec3(1.0) * sparkle * 0.3;
          
          // Subtle color variation
          float colorVar = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.8) * 0.1;
          color += uWaterColor * colorVar;
          
          gl_FragColor = vec4(color, 0.9);
      }
    `;

    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 0.8 },
        uWaveFrequency: { value: 0.15 },
        uWaveSpeed: { value: 0.6 },
        uWaterColor: { value: new THREE.Color(0x004080) },
        uFoamColor: { value: new THREE.Color(0xffffff) },
        uFoamThreshold: { value: 0.6 }
      }
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.2;
    scene.add(water);

    // Create city walls
    const createWallSection = (x: number, z: number, rotation: number) => {
      const wallGeometry = new THREE.BoxGeometry(8, 12, 20);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.9,
        metalness: 0.2,
        bumpScale: 0.5
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, 6, z);
      wall.rotation.y = rotation;
      wall.castShadow = true;
      wall.receiveShadow = true;

      // Add tower
      const towerGeometry = new THREE.CylinderGeometry(4, 5, 16, 8);
      const tower = new THREE.Mesh(towerGeometry, wallMaterial);
      tower.position.set(0, 2, 10);
      tower.castShadow = true;
      wall.add(tower);

      // Add battlements
      const battlementCount = 5;
      for (let i = 0; i < battlementCount; i++) {
        const merlon = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 2, 2),
          wallMaterial
        );
        merlon.position.set(
          (i - battlementCount / 2) * 2,
          7,
          -9
        );
        wall.add(merlon);
      }

      return wall;
    };

    // Add walls around the city
    const wallRadius = 35;
    const wallSections = 12;
    for (let i = 0; i < wallSections; i++) {
      const angle = (i / wallSections) * Math.PI * 2;
      const x = Math.cos(angle) * wallRadius;
      const z = Math.sin(angle) * wallRadius;
      const wall = createWallSection(x, z, angle);
      scene.add(wall);
    }

    // Create buildings
    const createBuilding = (x: number, z: number, height: number) => {
      const buildingGeometry = new THREE.BoxGeometry(3, height, 3);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0xD2B48C,
        roughness: 0.7,
        metalness: 0.2
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;

      // Add roof
      const roofGeometry = new THREE.ConeGeometry(2.5, 2, 4);
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height / 2 + 1;
      roof.rotation.y = Math.random() * Math.PI / 2;
      roof.castShadow = true;
      building.add(roof);

      return building;
    };

    // Add buildings in a more organic pattern
    const buildings = [];
    const buildingRadius = 30;
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * buildingRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Higher buildings towards the center
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const heightFactor = 1 - (distanceFromCenter / buildingRadius);
      const height = 4 + heightFactor * 12;
      
      const building = createBuilding(x, z, height);
      building.rotation.y = Math.random() * Math.PI * 2;
      buildings.push(building);
      scene.add(building);
    }

    // Create winding roads
    const createWindingRoad = (startAngle: number, endAngle: number, radius: number) => {
      const points = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / steps);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0.01, z));
      }

      const roadCurve = new THREE.CatmullRomCurve3(points);
      const roadGeometry = new THREE.TubeGeometry(roadCurve, 20, 1, 8, false);
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x696969,
        roughness: 0.9
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.receiveShadow = true;
      return road;
    };

    // Add winding roads and harbor entrance
    for (let i = 0; i < 4; i++) {
      const startAngle = (i / 4) * Math.PI * 2;
      const endAngle = startAngle + Math.PI / 2;
      const road = createWindingRoad(startAngle, endAngle, 15);
      scene.add(road);
    }

    // Create wooden pier
    const createPier = (x: number, z: number, rotation: number) => {
      const pierGroup = new THREE.Group();
      
      // Main pier platform
      const platformGeometry = new THREE.BoxGeometry(20, 0.5, 6);
      const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
      });
      const platform = new THREE.Mesh(platformGeometry, woodMaterial);
      platform.position.set(x, 0, z);
      platform.rotation.y = rotation;
      platform.castShadow = true;
      platform.receiveShadow = true;
      pierGroup.add(platform);

      // Add support pillars
      for (let i = -2; i <= 2; i++) {
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 6);
        const pillar = new THREE.Mesh(pillarGeometry, woodMaterial);
        pillar.position.set(i * 4, -1, 0);
        pillar.castShadow = true;
        platform.add(pillar);
      }

      // Add warehouse
      const warehouseGeometry = new THREE.BoxGeometry(6, 4, 4);
      const warehouse = new THREE.Mesh(warehouseGeometry, woodMaterial);
      warehouse.position.set(-5, 2.5, 0);
      warehouse.castShadow = true;
      platform.add(warehouse);

      // Add warehouse roof
      const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
      const roof = new THREE.Mesh(roofGeometry, woodMaterial);
      roof.position.set(0, 2.5, 0);
      roof.rotation.y = Math.PI / 4;
      warehouse.add(roof);

      return pierGroup;
    };

    // Create sailing ship
    const createShip = (x: number, z: number, rotation: number) => {
      const shipGroup = new THREE.Group();
      
      // Hull
      const hullGeometry = new THREE.BoxGeometry(8, 3, 3);
      const hullMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
      });
      const hull = new THREE.Mesh(hullGeometry, hullMaterial);
      hull.position.set(0, 1, 0);
      shipGroup.add(hull);

      // Mast
      const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
      const mast = new THREE.Mesh(mastGeometry, hullMaterial);
      mast.position.set(0, 5, 0);
      shipGroup.add(mast);

      // Sail
      const sailGeometry = new THREE.PlaneGeometry(4, 6);
      const sailMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        roughness: 0.5
      });
      const sail = new THREE.Mesh(sailGeometry, sailMaterial);
      sail.position.set(0, 0, 0);
      sail.rotation.y = Math.PI / 2;
      mast.add(sail);

      shipGroup.position.set(x, 0, z);
      shipGroup.rotation.y = rotation;
      return shipGroup;
    };

    // Add pier and ships
    const pier = createPier(38, 0, Math.PI / 2);
    scene.add(pier);

    // Add multiple ships
    const ships: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 45 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const ship = createShip(x, z, angle + Math.PI);
      ships.push(ship);
      scene.add(ship);
    }

    // Add trees and rocks
    const createTree = (x: number, z: number) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A2B0F,
        roughness: 0.9
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 1, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;

      const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x2D5A27,
        roughness: 0.8
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 3;
      leaves.castShadow = true;
      trunk.add(leaves);

      return trunk;
    };

    const createRock = (x: number, z: number, scale: number) => {
      const rockGeometry = new THREE.DodecahedronGeometry(1);
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        metalness: 0.1
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, scale / 2, z);
      rock.scale.set(scale, scale, scale);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      return rock;
    };

    // Add trees around the city
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = wallRadius + 5 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const tree = createTree(x, z);
      scene.add(tree);
    }

    // Add rocks
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = wallRadius + Math.random() * 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rock = createRock(x, z, 1 + Math.random() * 2);
      scene.add(rock);
    }

    // Lighting for sunset effect
    const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xff7f50, 1);
    sunLight.position.set(-50, 30, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // Add fog for atmosphere
    scene.fog = new THREE.FogExp2(0xffd4a3, 0.002);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update water shader uniforms
      const waterTime = Date.now() * 0.001;
      waterMaterial.uniforms.uTime.value = waterTime;
      waterMaterial.uniforms.uWaveHeight.value = 0.3 + Math.sin(waterTime * 0.5) * 0.1;
      waterMaterial.uniforms.uWaveFrequency.value = 0.05 + Math.sin(waterTime * 0.2) * 0.02;
      waterMaterial.uniforms.uWaveSpeed.value = 0.8 + Math.sin(waterTime * 0.3) * 0.2;
      
      // Animate ships with random waypoints
      const time = Date.now() * 0.001;
      ships.forEach((ship: THREE.Group & { waypoints?: THREE.Vector3[], currentWaypoint?: number }, index) => {
        // Initialize waypoints if not exists
        if (!ship.waypoints) {
          ship.waypoints = Array(5).fill(0).map(() => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 45 + Math.random() * 15;
            return new THREE.Vector3(
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            );
          });
          ship.currentWaypoint = 0;
        }

        const target = ship.waypoints[ship.currentWaypoint!];
        const direction = target.clone().sub(ship.position);
        const distance = direction.length();

        // Calculate distance to island center
        const distanceToCenter = Math.sqrt(
          ship.position.x * ship.position.x + 
          ship.position.z * ship.position.z
        );

        // Check if ship is too close to island (40 is island radius)
        if (distanceToCenter < 42) {
          // Move away from island
          const awayFromIsland = ship.position.clone().normalize();
          ship.position.add(awayFromIsland.multiplyScalar(0.2));
          // Generate new waypoint away from island
          const newAngle = Math.random() * Math.PI * 2;
          const newRadius = 45 + Math.random() * 15;
          ship.waypoints[ship.currentWaypoint!].set(
            Math.cos(newAngle) * newRadius,
            0,
            Math.sin(newAngle) * newRadius
          );
        } else if (distance < 0.5) {
          ship.currentWaypoint = (ship.currentWaypoint! + 1) % ship.waypoints.length;
        } else {
          direction.normalize();
          ship.position.add(direction.multiplyScalar(0.1));
          ship.rotation.y = Math.atan2(direction.x, direction.z);
        }

        // Add wave motion
        ship.position.y = Math.sin(time + index) * 0.2;

        // Animate sails
        const sail = ship.children[1].children[0];
        sail.position.x = Math.sin(time * 2 + index) * 0.2;
      });

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
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default MedievalCity;