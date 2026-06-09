// ===== TOSH YARATISH =====
function createRock() {
  const group = new THREE.Group();
  
  // Asosiy tosh — deformatsiya qilingan sfera
  const size = 1.0 + Math.random() * 1.5;
  const geo = new THREE.DodecahedronGeometry(size, 1);
  
  // Vertexlarni tasodifiy siljitish (tabiiy ko'rinish)
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const noise = 0.7 + Math.random() * 0.6;
    posAttr.setXYZ(i, vx * noise, vy * noise * 0.7, vz * noise);
  }
  geo.computeVertexNormals();
  
  const grayShade = 0.35 + Math.random() * 0.25;
  const rockColor = new THREE.Color(grayShade, grayShade * 0.95, grayShade * 0.9);
  const mat = new THREE.MeshStandardMaterial({ 
    color: rockColor, 
    roughness: 0.9,
    flatShading: true
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = size * 0.35;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  
  // Ba'zan kichik toshlar atrofida
  const extraCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < extraCount; i++) {
    const eSize = size * (0.2 + Math.random() * 0.3);
    const eGeo = new THREE.DodecahedronGeometry(eSize, 0);
    const eMesh = new THREE.Mesh(eGeo, mat);
    eMesh.position.set(
      (Math.random()-0.5) * size * 2,
      eSize * 0.3,
      (Math.random()-0.5) * size * 2
    );
    eMesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    eMesh.castShadow = true;
    group.add(eMesh);
  }
  
  group.scale.setScalar(1);
  return group;
}

function createTree() {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.65, 4.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  tree.add(trunk);

  const leavesColor = Math.random() > 0.5 ? 0x2d5a2d : 0x3a6a3a;
  for (let i = 0; i < 3; i++) {
    const leavesGeo = new THREE.ConeGeometry(2.6 - i*0.4, 3, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: leavesColor });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 4.2 + i*1.5;
    leaves.castShadow = true;
    tree.add(leaves);
  }
  return tree;
}

function createSoldier(bodyColor, pantsColor) {
  const soldier = new THREE.Group();
  soldier.userData.isEnemy = true;
  
  // Tana
  const bodyGeo = new THREE.BoxGeometry(0.85, 1.2, 0.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.4;
  body.castShadow = true;
  soldier.add(body);
  soldier.userData.bodyMesh = body;
  soldier.userData.originalBodyColor = bodyColor;

  // Bronejilet (Vest)
  const vestGeo = new THREE.BoxGeometry(0.9, 0.7, 0.55);
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });
  const vest = new THREE.Mesh(vestGeo, vestMat);
  vest.position.y = 1.5;
  vest.castShadow = true;
  soldier.add(vest);

  // Ryukzak (Backpack)
  const backpackGeo = new THREE.BoxGeometry(0.6, 0.8, 0.3);
  const backpackMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d });
  const backpack = new THREE.Mesh(backpackGeo, backpackMat);
  backpack.position.set(0, 1.5, -0.35);
  backpack.castShadow = true;
  soldier.add(backpack);

  // Oyoqlar
  const legGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
  const legMat = new THREE.MeshStandardMaterial({ color: pantsColor });
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-0.22, 0.4, 0);
  legL.castShadow = true;
  soldier.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat);
  legR.position.set(0.22, 0.4, 0);
  legR.castShadow = true;
  soldier.add(legR);
  soldier.userData.legL = legL;
  soldier.userData.legR = legR;

  // Etiklar (Boots)
  const bootGeo = new THREE.BoxGeometry(0.38, 0.3, 0.45);
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const bootL = new THREE.Mesh(bootGeo, bootMat);
  bootL.position.set(0, -0.25, 0.05);
  legL.add(bootL);
  const bootR = new THREE.Mesh(bootGeo, bootMat);
  bootR.position.set(0, -0.25, 0.05);
  legR.add(bootR);

  // Bosh (Head)
  const headGeo = new THREE.SphereGeometry(0.28, 14, 14);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf4c896 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.25;
  head.castShadow = true;
  soldier.add(head);
  soldier.userData.headMesh = head;

  // Ko'zoynak (Goggles)
  const gogglesGeo = new THREE.BoxGeometry(0.4, 0.12, 0.3);
  const gogglesMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  const goggles = new THREE.Mesh(gogglesGeo, gogglesMat);
  goggles.position.set(0, 2.28, 0.18);
  soldier.add(goggles);

  // Kaska (Helmet)
  const helmetGeo = new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI*2, 0, Math.PI/2);
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0x3a4a2a });
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.y = 2.3;
  helmet.castShadow = true;
  soldier.add(helmet);

  // Qo'llar (Arms)
  const armGeo = new THREE.BoxGeometry(0.22, 0.8, 0.22);
  const armMat = new THREE.MeshStandardMaterial({ color: bodyColor });
  
  const armL = new THREE.Mesh(armGeo, armMat);
  armL.position.set(-0.55, 1.4, 0);
  soldier.add(armL);
  
  const armR = new THREE.Mesh(armGeo, armMat);
  armR.position.set(0.55, 1.4, 0.15);
  armR.rotation.x = -0.5;
  soldier.add(armR);
  soldier.userData.armL = armL;
  soldier.userData.armR = armR;

  // Qo'l panjalari (Hands)
  const handGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const handL = new THREE.Mesh(handGeo, headMat);
  handL.position.set(0, -0.45, 0);
  armL.add(handL);
  const handR = new THREE.Mesh(handGeo, headMat);
  handR.position.set(0, -0.45, 0);
  armR.add(handR);

  // Qurol (Weapon) - Batafsilroq
  const weaponGroup = new THREE.Group();
  const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.7), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  gunBarrel.rotation.x = Math.PI / 2;
  gunBarrel.position.set(0, 0.03, 0.5);
  const gunMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  gunMag.position.set(0, -0.15, 0.1);
  weaponGroup.add(gunBody);
  weaponGroup.add(gunBarrel);
  weaponGroup.add(gunMag);
  
  weaponGroup.position.set(0.45, 1.25, 0.4);
  soldier.add(weaponGroup);
  soldier.userData.weaponMesh = weaponGroup;

  return soldier;
}

function createNameTag(nameStr) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.roundRect(10, 10, 236, 44, 10);
  ctx.fill();
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nameStr, 128, 32);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.5, 0.375, 1);
  return sprite;
}

function createPlayerMesh(team, name) {
  const bodyColor = team === 'red' ? 0xcc2222 : 0x2222cc;
  const pantsColor = team === 'red' ? 0x661111 : 0x111166;
  const mesh = createSoldier(bodyColor, pantsColor);
  mesh.userData.hp = 100;
  mesh.userData.walkPhase = 0;
  
  if (name) {
    const nameTag = createNameTag(name);
    nameTag.position.y = 3.0; // Boshidan teparoqda
    mesh.add(nameTag);
    mesh.userData.nameTag = nameTag;
  }
  
  scene.add(mesh);
  return mesh;
}

function spawnBlood(position, count) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.1, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    const particle = new THREE.Mesh(geo, mat);
    particle.position.copy(position);
    particle.userData.vel = new THREE.Vector3(
      (Math.random()-0.5)*5, Math.random()*4 + 1, (Math.random()-0.5)*5
    );
    particle.userData.life = 0;
    particle.userData.isBlood = true;
    scene.add(particle);
    particles.push(particle);
  }
}

function createBulletTracer(shootCenter) {
  // raycaster game.js da o'rnatilgan holatda bo'ladi
  const start = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(1.2));
  const end = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(150));
  const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
  const mat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent:true, opacity:1.0 });
  const line = new THREE.Line(geo, mat);
  line.userData.life = 0;
  line.userData.isTracer = true;
  scene.add(line);
  particles.push(line);
}

// Multiplayer tracer
function createNetworkTracer(startPos, endPos) {
  createEnemyTracer(startPos, endPos);
}

function createEnemyTracer(startPos, endPos) {
  const bulletGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(startPos);
  const glow = new THREE.PointLight(0xff0000, 2.0, 5);
  bullet.add(glow);
  const dir = new THREE.Vector3().subVectors(endPos, startPos);
  const dist = dir.length();
  const speed = 120;
  const flightTime = dist / speed;
  bullet.userData.isEnemyBullet = true;
  bullet.userData.startPos = startPos.clone();
  bullet.userData.endPos = endPos.clone();
  bullet.userData.flightTime = flightTime;
  bullet.userData.life = 0;
  bullet.userData.lastTrailPos = startPos.clone();
  bullet.userData.trailTimer = 0;
  scene.add(bullet);
  particles.push(bullet);
}

function spawnMedkit(x, z) {
  const group = new THREE.Group();
  
  // Quti (Box)
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.5;
  box.castShadow = true;
  group.add(box);

  // Qizil xoch
  const crossMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const hCrossGeo = new THREE.BoxGeometry(0.8, 0.2, 0.1);
  const vCrossGeo = new THREE.BoxGeometry(0.2, 0.8, 0.1);
  
  const hCross = new THREE.Mesh(hCrossGeo, crossMat);
  hCross.position.set(0, 0.5, 0.51);
  group.add(hCross);
  
  const vCross = new THREE.Mesh(vCrossGeo, crossMat);
  vCross.position.set(0, 0.5, 0.51);
  group.add(vCross);
  
  // Boshqa tomonlarga ham xoch
  const hCrossB = new THREE.Mesh(hCrossGeo, crossMat);
  hCrossB.position.set(0, 0.5, -0.51);
  group.add(hCrossB);
  
  const vCrossB = new THREE.Mesh(vCrossGeo, crossMat);
  vCrossB.position.set(0, 0.5, -0.51);
  group.add(vCrossB);

  group.position.set(x, 0, z);
  scene.add(group);
  
  medkits.push({ mesh: group, x: x, z: z, radius: 1.5 });
}

// Baza doirasi
function createBaseZone(x, z, colorStr) {
  const geo = new THREE.CylinderGeometry(BASE_RADIUS, BASE_RADIUS, 1, 32);
  const mat = new THREE.MeshBasicMaterial({ color: colorStr, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 0.5, z);
  scene.add(mesh);
  
  // Halqasi
  const ringGeo = new THREE.RingGeometry(BASE_RADIUS - 0.5, BASE_RADIUS, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: colorStr, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 1.05, z);
  scene.add(ring);
}

// Bino / Devor yasash
// walkableObjects globals.js da yozilgan

function createBuilding(x, y, z, width, height, depth, colorHex) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const bldgMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9 });
  const bldg = new THREE.Mesh(geo, bldgMat);
  bldg.position.set(x, y + height/2, z);
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  scene.add(bldg);
  obstacles.push(bldg);
  walkableObjects.push(bldg);
  return bldg;
}

// ==================== GRANATA VA TUTATQI EFEKTLARI ====================
function createGrenadeMesh(type) {
  const geo = new THREE.SphereGeometry(0.15, 8, 8);
  const color = type === 'explosive' ? 0x225522 : 0xaaaaaa;
  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function spawnExplosion(pos) {
  // Olov zarralari
  for (let i = 0; i < 40; i++) {
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff4400 : 0xffaa00 });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(pos);
    p.userData = {
      isExplosion: true,
      life: 0,
      maxLife: 0.5 + Math.random() * 0.3,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.2) * 15,
        (Math.random() - 0.5) * 15
      )
    };
    scene.add(p);
    particles.push(p);
  }
}

function spawnSmokeCloud(pos) {
  // Tutun zarralari
  for (let i = 0; i < 20; i++) {
    const geo = new THREE.SphereGeometry(1.5 + Math.random(), 7, 7);
    const mat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.8 });
    const p = new THREE.Mesh(geo, mat);
    
    // Tutun markaz atrofida tarqaladi
    p.position.set(
      pos.x + (Math.random() - 0.5) * 4,
      pos.y + Math.random() * 3,
      pos.z + (Math.random() - 0.5) * 4
    );
    
    p.userData = {
      isSmokeCloud: true,
      life: 0,
      maxLife: 15.0, // 15 soniya yashaydi
      scaleSpeed: 1 + Math.random(),
      vel: new THREE.Vector3((Math.random() - 0.5)*0.5, Math.random()*0.2, (Math.random() - 0.5)*0.5)
    };
    scene.add(p);
    particles.push(p);
  }
}
