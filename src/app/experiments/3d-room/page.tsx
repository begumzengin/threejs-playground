'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Room = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe698a8);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Room dimensions
    const roomWidth = 6;
    const roomHeight = 4;
    const roomDepth = 6;

    // Create room walls and floor
    const createWalls = () => {
      const cornerRadius = 0.5;
      const segments = 32;

      // Floor
      const floorShape = new THREE.Shape();
      floorShape.moveTo(-roomWidth/2, -roomDepth/2);
      floorShape.lineTo(roomWidth/2, -roomDepth/2);
      floorShape.lineTo(roomWidth/2, roomDepth/2);
      floorShape.lineTo(-roomWidth/2, roomDepth/2);
      floorShape.lineTo(-roomWidth/2, -roomDepth/2);

      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 3
      };

      const floorGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeSettings);
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9199c5,
        roughness: 0.8,
        metalness: 0.2
      });
      floorMaterial.side = THREE.DoubleSide;
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Back wall
      const backWallShape = new THREE.Shape();
      backWallShape.moveTo(-roomWidth/2, 0);
      backWallShape.lineTo(roomWidth/2, 0);
      backWallShape.lineTo(roomWidth/2, roomHeight);
      backWallShape.lineTo(-roomWidth/2, roomHeight);
      backWallShape.lineTo(-roomWidth/2, 0);

      const backWallGeometry = new THREE.ExtrudeGeometry(backWallShape, extrudeSettings);
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9199c5,
        roughness: 0.9,
        metalness: 0.1
      });
      wallMaterial.side = THREE.DoubleSide;
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -roomDepth/2;
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Side wall with window
      const sideWallGroup = new THREE.Group();
      
      // Window frame
      const windowWidth = 2;
      const windowHeight = 2;
      const windowX = -1;
      const windowY = 1.5;
      
      const sideWallShape = new THREE.Shape();
      sideWallShape.moveTo(-roomDepth/2, 0);
      sideWallShape.lineTo(roomDepth/2, 0);
      sideWallShape.lineTo(roomDepth/2, roomHeight);
      sideWallShape.lineTo(-roomDepth/2, roomHeight);
      sideWallShape.lineTo(-roomDepth/2, 0);
      
      // Create window hole
      const windowShape = new THREE.Path();
      windowShape.moveTo(windowX, windowY);
      windowShape.lineTo(windowX + windowWidth, windowY);
      windowShape.lineTo(windowX + windowWidth, windowY + windowHeight);
      windowShape.lineTo(windowX, windowY + windowHeight);
      windowShape.lineTo(windowX, windowY);
      sideWallShape.holes.push(windowShape);
      
      const sideWallGeometry = new THREE.ExtrudeGeometry(sideWallShape, extrudeSettings);
      const sideWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      sideWall.receiveShadow = true;
      sideWallGroup.add(sideWall);
      
      // Window frame
      const frameGeometry = new THREE.BoxGeometry(windowWidth + 0.1, 0.2, 0.2);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.2
      });
      
      const topFrame = new THREE.Mesh(frameGeometry, frameMaterial);
      topFrame.position.set(windowX + windowWidth/2, windowY + windowHeight, 0);
      topFrame.castShadow = true;
      sideWallGroup.add(topFrame);
      
      const bottomFrame = new THREE.Mesh(frameGeometry, frameMaterial);
      bottomFrame.position.set(windowX + windowWidth/2, windowY, 0);
      bottomFrame.castShadow = true;
      sideWallGroup.add(bottomFrame);
      
      const sideFrameGeometry = new THREE.BoxGeometry(0.2, windowHeight + 0.1, 0.2);
      
      const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
      leftFrame.position.set(windowX, windowY + windowHeight/2, 0);
      leftFrame.castShadow = true;
      sideWallGroup.add(leftFrame);
      
      const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
      rightFrame.position.set(windowX + windowWidth, windowY + windowHeight/2, 0);
      rightFrame.castShadow = true;
      sideWallGroup.add(rightFrame);
      
      // Window glass
      const glassGeometry = new THREE.PlaneGeometry(windowWidth - 0.2, windowHeight - 0.2);
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff9ecd,
        transparent: true,
        opacity: 0.4,
        roughness: 0.05,
        metalness: 0.2,
        transmission: 0.8,
        clearcoat: 0.5
      });
      
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(windowX + windowWidth/2, windowY + windowHeight/2, 0.05);
      sideWallGroup.add(glass);
      
      sideWallGroup.position.x = -roomWidth/2;
      sideWallGroup.position.z = 0;
      sideWallGroup.rotation.y = Math.PI / 2;
      scene.add(sideWallGroup);

      // Add edge lines
      const edgeGeometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        // Back wall edges
        -roomWidth/2, 0, -roomDepth/2,
        -roomWidth/2, roomHeight, -roomDepth/2,
        -roomWidth/2, roomHeight, -roomDepth/2,
        roomWidth/2, roomHeight, -roomDepth/2,
        roomWidth/2, roomHeight, -roomDepth/2,
        roomWidth/2, 0, -roomDepth/2,
        // Side wall edges
        -roomWidth/2, 0, -roomDepth/2,
        -roomWidth/2, 0, roomDepth/2,
        -roomWidth/2, roomHeight, -roomDepth/2,
        -roomWidth/2, roomHeight, roomDepth/2
      ]);
      edgeGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff80b3, linewidth: 1.5 });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      scene.add(edges);
    };

    // Create shelf
    const createShelf = () => {
      const shelfGroup = new THREE.Group();

      // Shelf base
      const shelfGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
      const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      shelfGroup.add(shelf);

      // Decorative items on shelf
      const itemGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const itemMaterial = new THREE.MeshStandardMaterial({ color: 0x66d91e });
      const item1 = new THREE.Mesh(itemGeometry, itemMaterial);
      item1.position.set(-0.7, 0.15, 0);
      item1.castShadow = true;
      shelfGroup.add(item1);

      const item2 = new THREE.Mesh(itemGeometry, itemMaterial);
      item2.position.set(0, 0.15, 0);
      item2.castShadow = true;
      shelfGroup.add(item2);

      shelfGroup.position.set(0, 2, -2.5);
      scene.add(shelfGroup);
    };

    // Create desk
    const createDesk = () => {
      const deskGroup = new THREE.Group();

      // Desk top
      const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
      const deskMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.castShadow = true;
      desk.receiveShadow = true;
      deskGroup.add(desk);

      // Desk legs
      const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
      const leg1 = new THREE.Mesh(legGeometry, deskMaterial);
      leg1.position.set(-0.9, -0.5, 0.4);
      leg1.castShadow = true;
      deskGroup.add(leg1);

      const leg2 = new THREE.Mesh(legGeometry, deskMaterial);
      leg2.position.set(0.9, -0.5, 0.4);
      leg2.castShadow = true;
      deskGroup.add(leg2);

      const leg3 = new THREE.Mesh(legGeometry, deskMaterial);
      leg3.position.set(-0.9, -0.5, -0.4);
      leg3.castShadow = true;
      deskGroup.add(leg3);

      const leg4 = new THREE.Mesh(legGeometry, deskMaterial);
      leg4.position.set(0.9, -0.5, -0.4);
      leg4.castShadow = true;
      deskGroup.add(leg4);

      deskGroup.position.set(0, 1, -1);
      scene.add(deskGroup);
    };

    // Add lights
    const addLights = () => {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 5, 5);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const pointLight = new THREE.PointLight(0xff9ecd, 0.5);
      pointLight.position.set(0, 3, 0);
      scene.add(pointLight);
      
      // Window light
      const windowLight = new THREE.SpotLight(0xfff6f6, 1.2);
      windowLight.position.set(-roomWidth/2 - 2, 2.5, 0);
      windowLight.target.position.set(-roomWidth/2 + 2, 2.5, 0);
      windowLight.angle = Math.PI / 5;
      windowLight.penumbra = 0.7;
      windowLight.decay = 1.5;
      windowLight.distance = 12;
      windowLight.castShadow = true;
      windowLight.shadow.bias = -0.001;
      windowLight.shadow.mapSize.width = 1024;
      windowLight.shadow.mapSize.height = 1024;
      scene.add(windowLight);
      scene.add(windowLight.target);
    };

    // Create carpet
    const createCarpet = () => {
        const carpetGroup = new THREE.Group();
      
        // Halı tabanı
        const carpetRadius = 1.5;
        const carpetGeometry = new THREE.CircleGeometry(carpetRadius, 32);
        const carpetMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.2,
          side: THREE.DoubleSide,
        });
        const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.y = 0.26;
        carpet.receiveShadow = true;
        carpetGroup.add(carpet);
      
        // Shaggy, tüylü efekt için saç/tüy parçacıkları
        const hairCount = 20000; // Tüy sayısını performans ve görünüme göre ayarlayabilirsiniz
        // Temel tüy geometrisi: İnce bir silindir
        const hairGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 8);
        const hairMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8,
          metalness: 0.1,
        });
        const hairInstancedMesh = new THREE.InstancedMesh(hairGeometry, hairMaterial, hairCount);
        const dummy = new THREE.Object3D();
      
        for (let i = 0; i < hairCount; i++) {
          // Halı dairesi içinde rastgele bir nokta (uniform dağılım)
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.sqrt(Math.random()) * carpetRadius;
          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);
          // Tüy yüksekliğinde biraz varyasyon
          const scaleY = 0.8 + Math.random() * 0.4; // 0.8 ile 1.2 arasında değişiyor
          // Tüyün alt kısmı halı yüzeyine temas edecek şekilde yerleştiriyoruz
          dummy.position.set(x, 0.26 + (0.1 * scaleY) / 2, z);
          dummy.scale.set(1, scaleY, 1);
          // Ufak bir rastgele rotasyon
          dummy.rotation.y = Math.random() * Math.PI * 2;
          dummy.updateMatrix();
          hairInstancedMesh.setMatrixAt(i, dummy.matrix);
        }
        hairInstancedMesh.castShadow = true;
        hairInstancedMesh.receiveShadow = true;
        carpetGroup.add(hairInstancedMesh);
      
        scene.add(carpetGroup);
      };

    // Create MacBook
    const createMacBook = () => {
      const macBookGroup = new THREE.Group();

      // Base (bottom part)
      const baseGeometry = new THREE.BoxGeometry(0.6, 0.015, 0.4);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.2,
        metalness: 0.8
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.castShadow = true;
      macBookGroup.add(base);

      // Screen part
      const screenBaseGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.01);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.2,
        metalness: 0.8
      });
      const screen = new THREE.Mesh(screenBaseGeometry, screenMaterial);
      screen.position.y = 0.2;
      screen.position.z = -0.2;
      screen.rotation.x = -0.1;
      screen.castShadow = true;
      macBookGroup.add(screen);

      // Screen display
      const displayGeometry = new THREE.PlaneGeometry(0.55, 0.37);
      const displayMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.5,
        emissive: 0x111111,
        emissiveIntensity: 0.1
      });
      const display = new THREE.Mesh(displayGeometry, displayMaterial);
      display.position.z = 0.001;
      screen.add(display);

      // Keyboard area
      const keyboardGroup = new THREE.Group();
      const keySize = 0.035;
      const keySpacing = 0.003;
      const keyHeight = 0.008;
      const rows = 4;
      const keysPerRow = [14, 14, 13, 12];
      const keyMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.3
      });

      for (let row = 0; row < rows; row++) {
        const rowOffset = (row === 3 ? 0.04 : 0) + (row === 2 ? 0.02 : 0);
        for (let col = 0; col < keysPerRow[row]; col++) {
          const keyGeometry = new THREE.BoxGeometry(keySize, keyHeight, keySize);
          const key = new THREE.Mesh(keyGeometry, keyMaterial);
          
          // Position each key
          key.position.set(
            -0.22 + rowOffset + col * (keySize + keySpacing),
            0.004,
            -0.13 + row * (keySize + keySpacing)
          );

          // Add key edges
          const edgesGeometry = new THREE.EdgesGeometry(keyGeometry);
          const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x222222 });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          key.add(edges);

          keyboardGroup.add(key);
        }
      }

      // Add keyboard base
      const keyboardBaseGeometry = new THREE.PlaneGeometry(0.55, 0.35);
      const keyboardBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
      });
      const keyboardBase = new THREE.Mesh(keyboardBaseGeometry, keyboardBaseMaterial);
      keyboardBase.position.y = 0;
      keyboardBase.rotation.x = -Math.PI / 2;
      keyboardGroup.add(keyboardBase);

      // Add trackpad
      const trackpadWidth = 0.3;
      const trackpadHeight = 0.2;
      const trackpadGeometry = new THREE.PlaneGeometry(trackpadWidth, trackpadHeight);
      const trackpadMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 0.3
      });
      const trackpad = new THREE.Mesh(trackpadGeometry, trackpadMaterial);
      trackpad.position.set(0, 0.001, 0.08);
      trackpad.rotation.x = -Math.PI / 2;

      keyboardGroup.add(trackpad);

      keyboardGroup.position.y = 0.008;
      base.add(keyboardGroup);

      macBookGroup.position.set(0, 1.05, -1);
      scene.add(macBookGroup);
    };

    // Ergonomik ofis sandalyesi oluşturma fonksiyonu
    const createChair = () => {
        const chairGroup = new THREE.Group();
    
        // 1. Oturma Yeri (Seat)
        // Hafif yuvarlak hatlara sahip bir oturma yeri için silindir geometrisi kullanıyoruz.
        const seatGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.2,
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.castShadow = true;
        seat.receiveShadow = true;
        // Oturma yerinin merkezini (chairGroup içindeki) y = 0.5 olarak belirliyoruz.
        seat.position.y = 0.5;
        chairGroup.add(seat);
    
        // 2. Sırt Dayanağı (Backrest)
        // İnce bir kutu geometrisi ile sırt dayanağını oluşturuyoruz.
        const backrestShape = new THREE.Shape();
        // absellipse(centerX, centerY, xRadius, yRadius, startAngle, endAngle, clockwise, rotationOffset)
        backrestShape.absellipse(0, 0, 0.3, 0.45, 0, Math.PI * 2, false, 0);

        const extrudeSettings = {
            depth: 0.05,      // Sırtlığın kalınlığı
            bevelEnabled: false
        };

        const backrestGeometry = new THREE.ExtrudeGeometry(backrestShape, extrudeSettings);
        const backrestMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.2,
        });
        const backrest = new THREE.Mesh(backrestGeometry, backrestMaterial);
        backrest.castShadow = true;
        backrest.receiveShadow = true;

        backrest.position.set(0, 0.85, 0.3);
        chairGroup.add(backrest);

        // 3. Destek Kolonu (Central Column)
        // Oturma yerini zemine bağlayan ince bir silindir.
        const columnGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
        const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.5,
        metalness: 0.3,
        });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.castShadow = true;
        column.receiveShadow = true;
        // Oturma yerinin alt yüzü yaklaşık 0.5 - 0.025 = 0.475’ye denk gelir.
        // Column yüksekliği 0.4 olduğundan, üstü oturma yerinin hemen altında olmalı:
        // column.position.y + 0.2 = 0.475  ⇒ column.position.y = 0.275.
        column.position.y = 0.275;
        chairGroup.add(column);
    
        // 4. Tekerlekler (Wheels)
        // Ofis sandalyesi için 5 adet tekerlek ekliyoruz.
        const wheelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const wheelCount = 5;
        // Column’un alt kısmı: column.position.y - 0.2 (yarı yüksekliği) = 0.275 - 0.2 = 0.075.
        const wheelY = 0.075;
        const wheelRadiusFromCenter = 0.25;
        for (let i = 0; i < wheelCount; i++) {
        const theta = (i / wheelCount) * Math.PI * 2;
        const wx = wheelRadiusFromCenter * Math.cos(theta);
        const wz = wheelRadiusFromCenter * Math.sin(theta);
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        // Tekerleğin silindirik yüzünün zeminle temas etmesi için 90° döndürüyoruz.
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wheelY, wz);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        chairGroup.add(wheel);
        }
    
        chairGroup.position.set(0, 0.3, -0.3);
    
        scene.add(chairGroup);
    };
  

    // Create room and furniture
    createWalls();
    createShelf();
    createDesk();
    createCarpet();
    createMacBook();
    createChair();
    addLights();

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
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default Room;