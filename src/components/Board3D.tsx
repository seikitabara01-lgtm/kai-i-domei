import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BoardTile, PlayerState, DeviceMode } from '../types';

interface Board3DProps {
  board: BoardTile[];
  players: PlayerState[];
  activePlayerIndex: number;
  selectedTileIndex: number | null;
  onTileClick: (index: number) => void;
  deviceMode: DeviceMode;
  cameraView: 'dynamic' | 'overview' | 'topdown';
}

// Convert board index (0..35, 10 tiles per side) to 3D coordinates on board
// Left turn / Counter-clockwise motion:
// Bottom edge: moves from Right to Left (X: +size/2 to -size/2, Z: +size/2)
// Left edge: moves from Bottom to Top (X: -size/2, Z: +size/2 to -size/2)
// Top edge: moves from Left to Right (X: -size/2 to +size/2, Z: -size/2)
// Right edge: moves from Top to Bottom (X: +size/2, Z: -size/2 to +size/2)
export function getTile3DPosition(index: number): { x: number; z: number } {
  const size = 11.2;
  const step = size / 9; // 9 intervals for 10 tiles per side

  if (index >= 0 && index <= 9) {
    // Edge 1 (Bottom): Right to Left (Counter-clockwise progression)
    return {
      x: size / 2 - index * step,
      z: size / 2
    };
  } else if (index > 9 && index <= 18) {
    // Edge 2 (Left): Bottom to Top
    return {
      x: -size / 2,
      z: size / 2 - (index - 9) * step
    };
  } else if (index > 18 && index <= 27) {
    // Edge 3 (Top): Left to Right
    return {
      x: -size / 2 + (index - 18) * step,
      z: -size / 2
    };
  } else {
    // Edge 4 (Right): Top to Bottom, leading back to START (index 0)
    return {
      x: size / 2,
      z: -size / 2 + (index - 27) * step
    };
  }
}

export const Board3D: React.FC<Board3DProps> = ({
  board,
  players,
  activePlayerIndex,
  selectedTileIndex,
  onTileClick,
  deviceMode,
  cameraView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mesh refs
  const tileMeshesRef = useRef<THREE.Mesh[]>([]);
  const playerPawnGroupsRef = useRef<THREE.Group[]>([]);
  const alliancePillarsRef = useRef<THREE.Mesh[]>([]);
  const occultCenterRingRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.05, phi: Math.PI / 3.4, radius: 18.5 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0712); // Deep midnight occult purple-black
    scene.fog = new THREE.FogExp2(0x0a0712, 0.035);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 14, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Occult Lighting
    const ambientLight = new THREE.AmbientLight(0x2d1b4e, 1.8);
    scene.add(ambientLight);

    // Blood Moon directional light
    const bloodMoonLight = new THREE.DirectionalLight(0xd946ef, 2.2);
    bloodMoonLight.position.set(8, 16, 10);
    bloodMoonLight.castShadow = true;
    bloodMoonLight.shadow.mapSize.width = 1024;
    bloodMoonLight.shadow.mapSize.height = 1024;
    scene.add(bloodMoonLight);

    // Center demonic glow
    const centerPointLight = new THREE.PointLight(0xef4444, 3.5, 15);
    centerPointLight.position.set(0, 1.5, 0);
    scene.add(centerPointLight);

    // Board Foundation Slab
    const baseGeo = new THREE.CylinderGeometry(8.6, 9.2, 0.4, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x130e24,
      roughness: 0.8,
      metalness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Center Occult Altar & Pentagram
    const centerGroup = new THREE.Group();
    occultCenterRingRef.current = centerGroup;

    // Outer Rune Ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    centerGroup.add(ringMesh);

    // Inner glowing demonic altar
    const altarGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.6, 8);
    const altarMat = new THREE.MeshStandardMaterial({
      color: 0x1c1432,
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x581c87,
      emissiveIntensity: 0.3
    });
    const altarMesh = new THREE.Mesh(altarGeo, altarMat);
    altarMesh.position.y = 0.1;
    centerGroup.add(altarMesh);

    // Floating Demon King Seal (Octahedron)
    const sealGeo = new THREE.OctahedronGeometry(0.55, 0);
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.y = 1.6;
    centerGroup.add(sealMesh);

    scene.add(centerGroup);

    // Create 36 Board Tiles (10 tiles per side)
    tileMeshesRef.current = [];
    board.forEach((tile, index) => {
      const pos = getTile3DPosition(index);
      const isCorner = index % 9 === 0;

      const tileWidth = isCorner ? 1.35 : 1.02;
      const tileLength = isCorner ? 1.35 : 1.02;
      const tileGeo = new THREE.BoxGeometry(tileWidth, 0.2, tileLength);

      let tileColor = 0x22183d;
      let emissiveColor = 0x000000;
      let emissiveIntensity = 0.0;

      if (tile.type === 'start') {
        tileColor = 0x7f1d1d; // Dark blood red
        emissiveColor = 0xef4444;
        emissiveIntensity = 0.3;
      } else if (tile.type === 'occult_rift') {
        tileColor = 0x1e1b4b;
        emissiveColor = 0x6366f1;
        emissiveIntensity = 0.4;
      } else if (tile.type === 'blood_tax') {
        tileColor = 0x450a0a;
        emissiveColor = 0xb91c1c;
        emissiveIntensity = 0.3;
      } else if (tile.type === 'curse_relic') {
        tileColor = 0x3b0764;
        emissiveColor = 0xa855f7;
        emissiveIntensity = 0.35;
      } else if (tile.cryptid) {
        // Grade based border color
        if (tile.cryptid.grade === '特級') {
          tileColor = 0x311b92;
          emissiveColor = 0x7c3aed;
          emissiveIntensity = 0.25;
        } else if (tile.cryptid.grade === '1級') {
          tileColor = 0x1e293b;
        } else if (tile.cryptid.grade === '2級') {
          tileColor = 0x27272a;
        }
      }

      const tileMat = new THREE.MeshStandardMaterial({
        color: tileColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.6,
        metalness: 0.3
      });

      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(pos.x, 0.05, pos.z);
      tileMesh.receiveShadow = true;
      tileMesh.castShadow = true;
      tileMesh.userData = { tileIndex: index };

      // Add a subtle glowing rune frame
      const frameGeo = new THREE.BoxGeometry(tileWidth + 0.04, 0.05, tileLength + 0.04);
      const frameMat = new THREE.MeshBasicMaterial({
        color: isCorner ? 0xf59e0b : 0x4c1d95,
        wireframe: true
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.y = 0.08;
      tileMesh.add(frameMesh);

      scene.add(tileMesh);
      tileMeshesRef.current.push(tileMesh);
    });

    // Create 4 Player Character Pawns (Human + 3 AI demons)
    playerPawnGroupsRef.current = [];
    players.forEach((p, pIdx) => {
      const pawnGroup = new THREE.Group();
      const pColor = new THREE.Color(p.color);

      // Base glowing ring
      const baseRingGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.1, 16);
      const baseRingMat = new THREE.MeshStandardMaterial({
        color: pColor,
        emissive: pColor,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });
      const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRing.position.y = 0.15;
      pawnGroup.add(baseRing);

      // Character distinct 3D stylized totem
      let tokenMesh: THREE.Mesh;
      if (p.isHuman) {
        // Human Exorcist/Sorcerer: Mystical Octahedron with floating crown
        const tokenGeo = new THREE.ConeGeometry(0.24, 0.65, 6);
        const tokenMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4,
          metalness: 0.7,
          roughness: 0.2
        });
        tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
        tokenMesh.position.y = 0.55;

        // Floating halo
        const haloGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 24);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 0.95;
        pawnGroup.add(halo);
      } else if (p.modelType === 'baphomet') {
        // Baphomet: Dark horned pillar
        const tokenGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.7, 8);
        const tokenMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.4,
          metalness: 0.8
        });
        tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
        tokenMesh.position.y = 0.55;

        // Horns
        const hornGeo = new THREE.ConeGeometry(0.08, 0.35, 4);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
        const hornL = new THREE.Mesh(hornGeo, hornMat);
        hornL.position.set(-0.16, 0.9, 0);
        hornL.rotation.z = 0.4;
        const hornR = new THREE.Mesh(hornGeo, hornMat);
        hornR.position.set(0.16, 0.9, 0);
        hornR.rotation.z = -0.4;
        pawnGroup.add(hornL, hornR);
      } else if (p.modelType === 'beelzebub') {
        // Beelzebub: Spiked insectoid crystal
        const tokenGeo = new THREE.DodecahedronGeometry(0.28);
        const tokenMat = new THREE.MeshStandardMaterial({
          color: 0x84cc16,
          emissive: 0x4d7c0f,
          emissiveIntensity: 0.45,
          roughness: 0.3
        });
        tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
        tokenMesh.position.y = 0.55;
      } else {
        // Asmodeus: Spired infernal crystal
        const tokenGeo = new THREE.TetrahedronGeometry(0.32);
        const tokenMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0xc2410c,
          emissiveIntensity: 0.5,
          metalness: 0.6
        });
        tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
        tokenMesh.position.y = 0.55;
      }

      tokenMesh.castShadow = true;
      pawnGroup.add(tokenMesh);

      // Offset slightly per player so they don't overlap on the same tile
      const offsets = [
        { ox: -0.22, oz: -0.22 },
        { ox: 0.22, oz: -0.22 },
        { ox: -0.22, oz: 0.22 },
        { ox: 0.22, oz: 0.22 }
      ];
      const off = offsets[pIdx % 4];
      const startPos = getTile3DPosition(p.position);
      pawnGroup.position.set(startPos.x + off.ox, 0.15, startPos.z + off.oz);

      scene.add(pawnGroup);
      playerPawnGroupsRef.current.push(pawnGroup);
    });

    // Handle Window Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate occult center seal
      if (centerGroup) {
        centerGroup.rotation.y += delta * 0.4;
        const seal = centerGroup.children[2];
        if (seal) {
          seal.rotation.x += delta * 0.8;
          seal.rotation.z += delta * 0.6;
          seal.position.y = 1.6 + Math.sin(elapsed * 2) * 0.12;
        }
      }

      // Floating gentle animation for player pawns
      playerPawnGroupsRef.current.forEach((grp, idx) => {
        const isActive = idx === activePlayerIndex;
        if (isActive) {
          grp.position.y = 0.15 + Math.abs(Math.sin(elapsed * 3)) * 0.18;
          grp.rotation.y += delta * 1.5;
        } else {
          grp.position.y = 0.15;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction for 3D Camera Orbit
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.008));
      updateCameraFromAngles();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Raycast on click for selecting tile
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(tileMeshesRef.current);
      if (intersects.length > 0) {
        const hitTile = intersects[0].object as THREE.Mesh;
        if (hitTile.userData && typeof hitTile.userData.tileIndex === 'number') {
          onTileClick(hitTile.userData.tileIndex);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  // Helper to update camera from spherical angles
  const updateCameraFromAngles = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Adjust camera when cameraView preset changes
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraView === 'overview') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.4, radius: deviceMode === 'mobile' ? 17 : 14 };
    } else if (cameraView === 'topdown') {
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: deviceMode === 'mobile' ? 18 : 15 };
    } else {
      // Dynamic follow active player
      const activePlayer = players[activePlayerIndex];
      if (activePlayer) {
        const pos = getTile3DPosition(activePlayer.position);
        const angle = Math.atan2(pos.x, pos.z);
        cameraAngleRef.current = { theta: angle + 0.3, phi: Math.PI / 3.2, radius: deviceMode === 'mobile' ? 15 : 12.5 };
      }
    }
    updateCameraFromAngles();
  }, [cameraView, activePlayerIndex, deviceMode]);

  // Update pawn positions when player moves
  useEffect(() => {
    const offsets = [
      { ox: -0.22, oz: -0.22 },
      { ox: 0.22, oz: -0.22 },
      { ox: -0.22, oz: 0.22 },
      { ox: 0.22, oz: 0.22 }
    ];

    players.forEach((p, idx) => {
      const pawnGroup = playerPawnGroupsRef.current[idx];
      if (!pawnGroup) return;

      const pos = getTile3DPosition(p.position);
      const off = offsets[idx % 4];
      const targetX = pos.x + off.ox;
      const targetZ = pos.z + off.oz;

      pawnGroup.position.x = targetX;
      pawnGroup.position.z = targetZ;
      pawnGroup.visible = !p.isBankrupt;
    });
  }, [players]);

  // Update tile visual styles for alliance ownership and selection
  useEffect(() => {
    tileMeshesRef.current.forEach((mesh, idx) => {
      const tile = board[idx];
      const isSelected = selectedTileIndex === idx;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (tile.ownerId) {
        const owner = players.find(p => p.id === tile.ownerId);
        if (owner) {
          mat.color.set(owner.color);
          mat.emissive.set(owner.color);
          mat.emissiveIntensity = 0.55;
        }
      } else {
        // Reset or highlight
        if (isSelected) {
          mat.emissive.set(0xf59e0b); // amber highlight
          mat.emissiveIntensity = 0.7;
        } else {
          // original emissive
          if (tile.type === 'start') {
            mat.emissive.set(0xef4444);
            mat.emissiveIntensity = 0.3;
          } else if (tile.type === 'occult_rift') {
            mat.emissive.set(0x6366f1);
            mat.emissiveIntensity = 0.4;
          } else if (tile.cryptid?.grade === '特級') {
            mat.emissive.set(0x7c3aed);
            mat.emissiveIntensity = 0.25;
          } else {
            mat.emissive.set(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [board, selectedTileIndex, players]);

  return (
    <div
      ref={containerRef}
      id="three-board-canvas-container"
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* 3D Viewport Controls & HUD Overlay */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-purple-900/60 shadow-lg text-xs">
        <span className="text-purple-300 font-mono self-center px-1.5 hidden sm:inline">3D視点:</span>
        <button
          onClick={() => {
            cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.4, radius: deviceMode === 'mobile' ? 16 : 13 };
            updateCameraFromAngles();
          }}
          className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 rounded border border-purple-800 transition"
          title="俯瞰斜め視点"
        >
          斜視
        </button>
        <button
          onClick={() => {
            cameraAngleRef.current = { theta: 0, phi: 0.1, radius: deviceMode === 'mobile' ? 17 : 14 };
            updateCameraFromAngles();
          }}
          className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 rounded border border-purple-800 transition"
          title="真上からの戦術盤"
        >
          盤面
        </button>
      </div>

      {/* Occult Ambience Watermark */}
      <div className="absolute bottom-2 left-3 z-10 pointer-events-none text-[10px] text-purple-400/50 font-serif tracking-widest">
        ◆ 冥界盤上儀式場 - 3D REALTIME RENDER ◆
      </div>
    </div>
  );
};
