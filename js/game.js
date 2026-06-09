// ==================== O'YIN ASOSIY LOGIKASI ====================

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 80, 280);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  clock = new THREE.Clock();

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));

  const sun = new THREE.DirectionalLight(0xfff4d6, 1.1);
  sun.position.set(60, 100, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  scene.add(sun);

  // Yer
  const groundGeo = new THREE.PlaneGeometry(FIELD_SIZE*2, FIELD_SIZE*2, 40, 40);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7c3a });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  for (let i = 0; i < 100; i++) {
    const patchGeo = new THREE.CircleGeometry(Math.random()*3+1, 8);
    const patchMat = new THREE.MeshStandardMaterial({ 
      color: Math.random() > 0.5 ? 0x3a6c2a : 0x5a8c4a 
    });
    const patch = new THREE.Mesh(patchGeo, patchMat);
    patch.rotation.x = -Math.PI/2;
    patch.position.set(
      (Math.random()-0.5)*FIELD_SIZE*1.8, 0.01,
      (Math.random()-0.5)*FIELD_SIZE*1.8
    );
    scene.add(patch);
  }

  // Bazalar
  createBaseZone(RED_BASE_POS.x, RED_BASE_POS.z, 0xff0000);
  createBaseZone(BLUE_BASE_POS.x, BLUE_BASE_POS.z, 0x0000ff);

  // Labirint / Binolar
  createBuilding(0, 0, 0, 20, 8, 20, 0x4a4a4a); // O'rtadagi katta bino
  
  createBuilding(-25, 0, 0, 6, 6, 40, 0x555555); // Chap devor
  createBuilding(25, 0, 0, 6, 6, 40, 0x555555); // O'ng devor
  
  createBuilding(0, 0, 35, 40, 5, 6, 0x666666); // Qizil baza oldi to'siq
  createBuilding(0, 0, -35, 40, 5, 6, 0x666666); // Ko'k baza oldi to'siq

  // Chiqish uchun zinalar / platformalar
  createBuilding(-13, 0, 16, 6, 2, 6, 0x777777);
  createBuilding(-13, 0, 8, 6, 4, 6, 0x777777);
  createBuilding(-13, 0, 0, 6, 6, 6, 0x777777);

  createBuilding(13, 0, -16, 6, 2, 6, 0x777777);
  createBuilding(13, 0, -8, 6, 4, 6, 0x777777);
  createBuilding(13, 0, 0, 6, 6, 6, 0x777777);

  // Daraxtlar (bezak uchun xarita chetida)
  for (let i = 0; i < 30; i++) {
    const tree = createTree();
    const angle = Math.random()*Math.PI*2;
    const dist = 60 + Math.random()*15;
    tree.position.set(Math.cos(angle)*dist, 0, Math.sin(angle)*dist);
    scene.add(tree);
  }

  // Qurol
  playerGroup = new THREE.Group();
  playerGroup.userData.restPos = new THREE.Vector3(0.32, -0.3, -0.5);
  
  const gunGroup = new THREE.Group();
  playerGroup.userData.gunGroup = gunGroup;
  
  const gunBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.14, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  gunBody.position.set(0, 0, -0.05);
  gunGroup.add(gunBody);

  const gunBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.7, 10),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
  );
  gunBarrel.rotation.x = Math.PI/2;
  gunBarrel.position.set(0, 0.04, -0.5);
  gunGroup.add(gunBarrel);

  const gunHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.28, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3a2410 })
  );
  gunHandle.position.set(0, -0.14, 0.12);
  gunGroup.add(gunHandle);

  const gunStock = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.2, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x4a2f15 })
  );
  gunStock.position.set(0, -0.02, 0.42);
  gunGroup.add(gunStock);

  const gunMag = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.22, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  gunMag.position.set(0, -0.16, -0.05);
  gunGroup.add(gunMag);

  const handGeo = new THREE.BoxGeometry(0.18, 0.18, 0.4);
  const handMat = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
  const hand1 = new THREE.Mesh(handGeo, handMat);
  hand1.position.set(0, -0.04, -0.2);
  gunGroup.add(hand1);
  const hand2 = new THREE.Mesh(handGeo, handMat);
  hand2.position.set(0, -0.14, 0.3);
  gunGroup.add(hand2);

  gunGroup.position.copy(playerGroup.userData.restPos);
  playerGroup.add(gunGroup);

  camera.add(playerGroup);
  scene.add(camera);

  // Eventlar
  addEventListener('resize', onResize);
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyR') reload();
    if (e.code === 'Space' && isGrounded && gameActive && !paused) {
      velocityY = JUMP_FORCE;
      isGrounded = false;
    }
    if (e.code === 'Digit1') switchWeapon(0);
    if (e.code === 'Digit2') switchWeapon(1);
    if (e.code === 'Digit3') switchWeapon(2);
    if (e.code === 'Digit4') switchWeapon(3);
    if (e.code === 'KeyG' && !isSpectating) throwGrenadeLocal('explosive');
    if (e.code === 'KeyF' && !isSpectating) throwGrenadeLocal('smoke');
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  
  // Sichqoncha bilan mo'jalga olish (Pointer Lock)
  addEventListener('mousemove', onMouseMove);
  addEventListener('mousedown', onMouseDown);
  addEventListener('mouseup', onMouseUp);
  addEventListener('contextmenu', e => e.preventDefault());
  
  // Pointer lock o'zgarishi — pauza
  document.addEventListener('pointerlockchange', () => {
    if (gameActive && !document.pointerLockElement) {
      paused = true;
      if (!isDead) document.getElementById('pauseMsg').style.display = 'block';
    } else {
      paused = false;
      document.getElementById('pauseMsg').style.display = 'none';
    }
  });

  animate();
}

// ===== SICHQONCHA HARAKATI =====
function onMouseMove(e) {
  if (!document.pointerLockElement || !gameActive || paused) return;
  yaw -= e.movementX * MOUSE_SENSITIVITY;
  pitch -= e.movementY * MOUSE_SENSITIVITY;
  pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, pitch));
}

function onMouseDown(e) {
  if (e.button === 0) {
    mouseDown = true;
    if (gameActive && !document.pointerLockElement) {
      renderer.domElement.requestPointerLock();
      return;
    }
    if (gameActive && !paused) shoot();
  }
  if (e.button === 2) {
    // Right click for zoom
    const weapon = weapons[currentWeaponIndex];
    if (weapon.name === 'Miltiq' || weapon.name === 'Sniper') {
      isZooming = true;
      targetFov = ZOOM_FOV;
      document.getElementById('scopeOverlay').style.display = 'flex';
      document.getElementById('crosshair').style.display = 'none';
      playerGroup.userData.gunGroup.visible = false; // yashiramiz qurolni
    } else {
      isZooming = true;
      targetFov = 50; // Kichik zoom boshqa qurollar uchun
    }
  }
}

function onMouseUp(e) {
  if (e.button === 0) mouseDown = false;
  if (e.button === 2) {
    isZooming = false;
    targetFov = NORMAL_FOV;
    document.getElementById('scopeOverlay').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    playerGroup.userData.gunGroup.visible = true;
  }
}

function switchWeapon(index) {
  if (currentWeaponIndex === index || reloading || !gameActive || paused) return;
  currentWeaponIndex = index;
  ammo = weapons[currentWeaponIndex].maxAmmo;
  // Agar zoom qilingan bo'lsa, uni bekor qilamiz
  isZooming = false;
  targetFov = NORMAL_FOV;
  document.getElementById('scopeOverlay').style.display = 'none';
  document.getElementById('crosshair').style.display = 'block';
  playerGroup.userData.gunGroup.visible = true;
  updateHUD();
}

function shoot() {
  if (!gameActive || paused || reloading || isDead || isSpectating) return;
  const weapon = weapons[currentWeaponIndex];
  if (shootCooldown > 0) return;
  
  ammo--;
  shootCooldown = weapon.cooldown;
  updateHUD();
  playShootSound();

  const flash = document.getElementById('muzzleFlash');
  flash.style.opacity = '1';
  setTimeout(()=>flash.style.opacity='0', 70);

  recoilKick = weapon.recoil;
  recoilTilt = -weapon.recoil * 1.5;
  pitchRecoil = weapon.recoil * 0.15;

  const enemyGroups = Object.values(networkPlayers).filter(p => !p.userData.isDying);
  const validTargets = Object.values(networkPlayers).filter(p => !p.userData.isDying && p.userData.team !== myTeam);
  
  const allMeshes = [];
  validTargets.forEach(eg => {
    eg.traverse(child => {
      if (child.isMesh) {
        child.userData._parentEnemy = eg;
        allMeshes.push(child);
      }
    });
  });

  for (let i = 0; i < weapon.count; i++) {
    const spreadX = (Math.random() - 0.5) * weapon.spread;
    const spreadY = (Math.random() - 0.5) * weapon.spread;
    const shootCenter = screenCenter.clone();
    shootCenter.x += spreadX;
    shootCenter.y += spreadY;
    
    raycaster.setFromCamera(shootCenter, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    
    // Yuborish uchun ma'lumot
    const startPos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(1.2));
    const endPos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(150));

    if (hits.length > 0) {
      const hit = hits[0];
      const enemy = hit.object.userData._parentEnemy;
      
      if (enemy && enemy.userData && !enemy.userData.isDying) {
        const isHeadshot = (hit.object === enemy.userData.headMesh);
        const damage = isHeadshot ? weapon.headshotDamage : weapon.damage;
        
        playHitSound();
        const hm = document.getElementById('hitMarker');
        hm.style.opacity = '1';
        setTimeout(()=>hm.style.opacity='0', 180);
        spawnBlood(hit.point, isHeadshot ? 15 : 8);

        socket.emit('hit', { targetId: enemy.userData.id, damage: damage, isHeadshot: isHeadshot });
      }
    }
    
    socket.emit('shoot', { start: startPos, end: endPos });
    createBulletTracer(shootCenter);
  }
}

function reload() {
  const weapon = weapons[currentWeaponIndex];
  if (reloading || ammo === weapon.maxAmmo) return;
  reloading = true;
  playReloadSound();
  document.getElementById('ammoVal').textContent = "🔄 QAYTA O'QLANMOQDA...";
  setTimeout(() => {
    ammo = weapon.maxAmmo;
    reloading = false;
    updateHUD();
  }, weapon.reloadTime);
}

function updateHUD() {
  const weapon = weapons[currentWeaponIndex];
  document.getElementById('hpVal').textContent = Math.max(0, Math.round(hp));
  document.getElementById('killVal').textContent = killCount;
  document.getElementById('weaponVal').textContent = weapon.name;
  if (!reloading) document.getElementById('ammoVal').textContent = `${ammo} / ${weapon.maxAmmo}`;
  
  if(document.getElementById('grenadeVal')) document.getElementById('grenadeVal').textContent = grenadeCount;
  if(document.getElementById('smokeVal')) document.getElementById('smokeVal').textContent = smokeCount;

  // Raund vaqti
  if (document.getElementById('roundTimer')) {
    let m = Math.floor(roundTime / 60);
    let s = roundTime % 60;
    document.getElementById('roundTimer').textContent = (m < 10 ? '0'+m : m) + ':' + (s < 10 ? '0'+s : s);
  }
}

// ===== GRANATA OTISH =====
function throwGrenadeLocal(type) {
  if (!gameActive || paused || isDead || isSpectating) return;
  if (type === 'explosive' && grenadeCount <= 0) return;
  if (type === 'smoke' && smokeCount <= 0) return;

  if (type === 'explosive') grenadeCount--;
  else smokeCount--;
  updateHUD();

  // Yonalishni topish
  const lookDir = new THREE.Vector3();
  camera.getWorldDirection(lookDir);

  const startPos = playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)).add(lookDir.clone().multiplyScalar(1.0));
  const velocity = lookDir.clone().multiplyScalar(18).add(new THREE.Vector3(0, 5, 0)); // Oldinga va yuqoriga

  const grenadeId = myId + '_' + Date.now() + Math.floor(Math.random()*1000);
  
  socket.emit('throwGrenade', {
    id: grenadeId,
    type: type,
    start: startPos,
    velocity: velocity
  });

  createAndThrowGrenade(grenadeId, type, startPos, velocity, true);
}

function createAndThrowGrenade(id, type, startPos, vel, isMine) {
  const mesh = createGrenadeMesh(type);
  mesh.position.copy(startPos);
  
  mesh.userData = {
    id: id,
    type: type,
    vel: vel,
    life: 0,
    maxLife: 2.5, // 2.5 soniyadan so'ng portlaydi
    isMine: isMine,
    bounces: 0
  };
  
  scene.add(mesh);
  activeGrenades.push(mesh);
}

function onResize() {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

let plantProgress = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  if (shootCooldown > 0) shootCooldown -= dt;

  // Avtomatik o'q otish
  if (mouseDown && gameActive && !paused && shootCooldown <= 0 && !reloading && ammo > 0 && !isSpectating && !isDead) {
    shoot();
  }

  if (gameActive && !paused) {
    if (!isDead && !isSpectating) {
      // Harakat — WASD
      const runKey = keys['ShiftLeft'] || keys['ShiftRight'];
      const speed = runKey ? 13 : 6;
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const moveDir = new THREE.Vector3();
      let isMoving = false;
      
      if (keys['KeyW']) { moveDir.add(forward); isMoving = true; }
      if (keys['KeyS']) { moveDir.sub(forward); isMoving = true; }
      if (keys['KeyD']) { moveDir.add(right); isMoving = true; }
      if (keys['KeyA']) { moveDir.sub(right); isMoving = true; }
      
      const nextPos = playerPos.clone();
      if (isMoving) {
        moveDir.normalize().multiplyScalar(speed*dt);
        nextPos.add(moveDir);
        nextPos.x = Math.max(-FIELD_SIZE+2, Math.min(FIELD_SIZE-2, nextPos.x));
        nextPos.z = Math.max(-FIELD_SIZE+2, Math.min(FIELD_SIZE-2, nextPos.z));
      }

      // AABB Koliziya (Binolar bilan gorizontal)
      const pRadius = 0.6;
      let hitX = false;
      let hitZ = false;

      for (const mesh of walkableObjects) {
        const box = new THREE.Box3().setFromObject(mesh);
        // X o'qi bo'yicha to'qnashuv
        if (nextPos.x + pRadius > box.min.x && nextPos.x - pRadius < box.max.x &&
            playerPos.z + pRadius > box.min.z && playerPos.z - pRadius < box.max.z &&
            playerPos.y > box.min.y && playerPos.y - 1.8 < box.max.y) {
            hitX = true;
        }
        // Z o'qi bo'yicha to'qnashuv
        if (playerPos.x + pRadius > box.min.x && playerPos.x - pRadius < box.max.x &&
            nextPos.z + pRadius > box.min.z && nextPos.z - pRadius < box.max.z &&
            playerPos.y > box.min.y && playerPos.y - 1.8 < box.max.y) {
            hitZ = true;
        }
      }

      if (!hitX) playerPos.x = nextPos.x;
      if (!hitZ) playerPos.z = nextPos.z;

      // Sakrash va tortishish (Jump and Gravity)
      velocityY -= GRAVITY * dt;
      playerPos.y += velocityY * dt;

      // Pastga raycast (yer yoki bino ustida ekanligini bilish)
      const rayDown = new THREE.Raycaster(new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z), new THREE.Vector3(0, -1, 0));
      const intersects = rayDown.intersectObjects(walkableObjects, false);
      
      let groundY = 0; // Oddiy yer
      if (intersects.length > 0) {
        groundY = intersects[0].point.y;
      }

      if (playerPos.y - 2.0 <= groundY && velocityY <= 0) {
         playerPos.y = groundY + 2.0;
         velocityY = 0;
         isGrounded = true;
      } else {
         isGrounded = false;
      }

      camera.position.copy(playerPos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch + pitchRecoil;
      camera.updateMatrixWorld(true);

      // Bomba qo'yish
      if (keys['KeyE'] && roundState === 'PLAYING') {
        const distToBlue = Math.hypot(playerPos.x - BLUE_BASE_POS.x, playerPos.z - BLUE_BASE_POS.z);
        if (myTeam === 'red' && bombState === 'INACTIVE' && distToBlue <= BASE_RADIUS) {
          plantProgress += dt;
          document.getElementById('bombUI').style.display = 'block';
          document.getElementById('bombActionText').textContent = "BOMBA O'RNATILMOQDA...";
          document.getElementById('bombProgressBar').style.width = (plantProgress / 3.0 * 100) + '%';
          if (plantProgress >= 3.0) {
            socket.emit('plantBomb');
            plantProgress = 0;
            keys['KeyE'] = false;
            document.getElementById('bombUI').style.display = 'none';
          }
        } else if (myTeam === 'blue' && bombState === 'PLANTED' && window.bombPos) {
          const distToBomb = Math.hypot(playerPos.x - window.bombPos.x, playerPos.z - window.bombPos.z);
          if (distToBomb <= 4.0) {
            plantProgress += dt;
            document.getElementById('bombUI').style.display = 'block';
            document.getElementById('bombActionText').textContent = "BOMBA ZARARSIZLANTIRILMOQDA...";
            document.getElementById('bombProgressBar').style.width = (plantProgress / 3.0 * 100) + '%';
            if (plantProgress >= 3.0) {
              socket.emit('defuseBomb');
              plantProgress = 0;
              keys['KeyE'] = false;
              document.getElementById('bombUI').style.display = 'none';
            }
          } else {
            plantProgress = 0;
            document.getElementById('bombUI').style.display = 'none';
          }
        } else {
          plantProgress = 0;
          document.getElementById('bombUI').style.display = 'none';
        }
      } else {
        plantProgress = 0;
        document.getElementById('bombUI').style.display = 'none';
      }
    } else if (isSpectating) {
      // Spectator kamera harakati
      const speed = 25;
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), yaw).applyAxisAngle(new THREE.Vector3(1,0,0), pitch);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
      let moveDir = new THREE.Vector3();
      if (keys['KeyW']) moveDir.add(forward);
      if (keys['KeyS']) moveDir.sub(forward);
      if (keys['KeyD']) moveDir.add(right);
      if (keys['KeyA']) moveDir.sub(right);
      if (moveDir.lengthSq() > 0) moveDir.normalize();
      playerPos.add(moveDir.multiplyScalar(speed * dt));
      if (playerPos.y < 2) playerPos.y = 2;

      camera.position.copy(playerPos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      camera.updateMatrixWorld(true);
    }

    pitchRecoil *= Math.pow(0.0001, dt);
    if (Math.abs(pitchRecoil) < 0.0001) pitchRecoil = 0;

    const gunGroup = playerGroup.userData.gunGroup;
    const restPos = playerGroup.userData.restPos;
    const kickOffsetZ = recoilKick;
    const kickOffsetY = recoilKick * 0.3;
    const bobSpeed = runKey ? 12 : 8;
    const bobY = Math.sin(elapsed*bobSpeed) * (isMoving ? 0.025 : 0.003);
    const bobX = Math.sin(elapsed*bobSpeed*0.5) * (isMoving ? 0.015 : 0);

    gunGroup.position.x = restPos.x + bobX;
    gunGroup.position.y = restPos.y + bobY + kickOffsetY;
    gunGroup.position.z = restPos.z + kickOffsetZ;
    gunGroup.rotation.x = recoilTilt;
    gunGroup.rotation.y = 0;
    gunGroup.rotation.z = 0;

    const recovery = 1 - Math.pow(0.0005, dt);
    recoilKick *= (1 - recovery);
    recoilTilt *= (1 - recovery);
    if (Math.abs(recoilKick) < 0.001) recoilKick = 0;
    if (Math.abs(recoilTilt) < 0.001) recoilTilt = 0;

    // Aptekalar bilan koliziya va aylanish
    for (let i = medkits.length - 1; i >= 0; i--) {
      const mk = medkits[i];
      mk.mesh.rotation.y += dt; // aylantirib turish
      const dist = Math.hypot(playerPos.x - mk.x, playerPos.z - mk.z);
      if (dist < mk.radius && hp < 100) {
        hp = Math.min(100, hp + MEDKIT_HEAL);
        scene.remove(mk.mesh);
        medkits.splice(i, 1);
        updateHUD();
        // kichik ovoz qo'shish mumkin: playHitSound() kabi (ixtiyoriy)
      }
    }
    
    // Aptekalar tasodifiy chiqishi
    if (Math.random() < 0.005 && medkits.length < 5) {
      const x = (Math.random()-0.5)*FIELD_SIZE*1.5;
      const z = (Math.random()-0.5)*FIELD_SIZE*1.5;
      spawnMedkit(x, z);
    }

    // Network O'yinchilar
    for (const id in networkPlayers) {
      const enemy = networkPlayers[id];
      
      if (enemy.userData.isDying) {
        const t = elapsed - enemy.userData.deathTime;
        enemy.rotation.z = Math.min(t*3, Math.PI/2);
        enemy.position.y = Math.max(-0.5, -t*1.5);
        if (t > 3) enemy.visible = false;
        continue;
      }
      
      enemy.visible = true;

      // Pozitsiyani va burilishni lerp orqali tekislash
      enemy.position.x += (enemy.userData.targetX - enemy.position.x) * 10 * dt;
      enemy.position.y += (enemy.userData.targetY - enemy.position.y) * 10 * dt;
      enemy.position.z += (enemy.userData.targetZ - enemy.position.z) * 10 * dt;
      
      // Yurish animatsiyasi
      const distMoved = Math.hypot(enemy.userData.targetX - enemy.position.x, enemy.userData.targetZ - enemy.position.z);
      if (distMoved > 0.05) {
        enemy.userData.walkPhase += dt*9;
        enemy.userData.legL.rotation.x = Math.sin(enemy.userData.walkPhase)*0.7;
        enemy.userData.legR.rotation.x = -Math.sin(enemy.userData.walkPhase)*0.7;
        enemy.userData.armL.rotation.x = -Math.sin(enemy.userData.walkPhase)*0.5;
      } else {
        enemy.userData.legL.rotation.x = 0;
        enemy.userData.legR.rotation.x = 0;
        enemy.userData.armL.rotation.x = 0;
      }

      enemy.rotation.y = enemy.userData.targetYaw;

      if (enemy.userData.isHit) {
        if (elapsed - enemy.userData.hitTime > 0.4) {
          if (enemy.userData.bodyMesh) {
            enemy.userData.bodyMesh.material.color.setHex(enemy.userData.originalBodyColor);
          }
          enemy.userData.isHit = false;
        }
      }
    }

    if (socket && gameActive && !isDead) {
      socket.emit('updateState', { x: playerPos.x, y: playerPos.y, z: playerPos.z, yaw: yaw, pitch: pitch });
    }

    // Zarrachalar
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.userData.life += dt;
      
      if (p.userData.isEnemyBullet) {
        const t = Math.min(p.userData.life / p.userData.flightTime, 1);
        p.position.lerpVectors(p.userData.startPos, p.userData.endPos, t);
        p.userData.trailTimer -= dt;
        if (p.userData.trailTimer <= 0) {
          p.userData.trailTimer = 0.02;
          const segGeo = new THREE.BufferGeometry().setFromPoints([
            p.userData.lastTrailPos.clone(), p.position.clone()
          ]);
          const segMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent:true, opacity: 1.0 });
          const seg = new THREE.Line(segGeo, segMat);
          seg.userData.life = 0;
          seg.userData.isEnemyTrail = true;
          scene.add(seg);
          particles.push(seg);
          p.userData.lastTrailPos = p.position.clone();
        }
        if (t >= 1) { scene.remove(p); particles.splice(i, 1); }
      } else if (p.userData.isEnemyTrail) {
        if (p.material) p.material.opacity = Math.max(0, 1 - p.userData.life * 4);
        if (p.userData.life > 0.25) { scene.remove(p); particles.splice(i, 1); }
      } else if (p.userData.isTracer) {
        if (p.material) p.material.opacity = Math.max(0, 1 - p.userData.life*12);
        if (p.userData.life > 0.1) { scene.remove(p); particles.splice(i, 1); }
      } else if (p.userData.isBlood) {
        p.position.add(p.userData.vel.clone().multiplyScalar(dt));
        p.userData.vel.y -= 18*dt;
        if (p.position.y < 0) {
          p.position.y = 0;
          p.userData.vel.multiplyScalar(0.3);
          p.userData.vel.y = Math.abs(p.userData.vel.y) * 0.3;
        }
        if (p.userData.life > 1.5) { scene.remove(p); particles.splice(i, 1); }
      } else if (p.userData.isExplosion) {
        p.position.add(p.userData.vel.clone().multiplyScalar(dt));
        p.userData.vel.y -= 5*dt;
        if(p.material) p.material.opacity = Math.max(0, 1 - (p.userData.life/p.userData.maxLife));
        if(p.userData.life >= p.userData.maxLife) { scene.remove(p); particles.splice(i, 1); }
      } else if (p.userData.isSmokeCloud) {
        p.position.add(p.userData.vel.clone().multiplyScalar(dt));
        p.scale.addScalar(p.userData.scaleSpeed * dt * 0.5);
        if(p.material) p.material.opacity = Math.max(0, 0.8 * (1 - (p.userData.life/p.userData.maxLife)));
        if(p.userData.life >= p.userData.maxLife) { scene.remove(p); particles.splice(i, 1); }
      }
    }

    // Granatalar harakati
    for (let i = activeGrenades.length - 1; i >= 0; i--) {
      const g = activeGrenades[i];
      g.userData.life += dt;
      
      // Harakat
      g.position.add(g.userData.vel.clone().multiplyScalar(dt));
      g.userData.vel.y -= GRAVITY * 0.8 * dt; // Biros sekinroq gravitatsiya

      // Yer bilan to'qnashuv
      if (g.position.y <= 0.15) {
        g.position.y = 0.15;
        g.userData.vel.y = Math.abs(g.userData.vel.y) * 0.4; // Sakrash
        g.userData.vel.x *= 0.7; // Ishqalanish
        g.userData.vel.z *= 0.7;
        g.userData.bounces++;
      }

      if (g.userData.life >= g.userData.maxLife) {
        // Portlash
        if (g.userData.type === 'explosive') {
          spawnExplosion(g.position);
          playShootSound(); // hozircha portlash ovozi o'rniga o'q ovozi
          
          // Faqat granata egasi zararni hisoblaydi (serverga jo'natadi)
          if (g.userData.isMine) {
            const expRadius = 12;
            const validTargets = Object.values(networkPlayers).filter(p => !p.userData.isDying && p.userData.team !== myTeam);
            validTargets.forEach(enemy => {
              const dist = g.position.distanceTo(enemy.position);
              if (dist <= expRadius) {
                const dmg = Math.max(10, 120 - (dist * 10)); // Yaxshi damage
                socket.emit('hit', { targetId: enemy.userData.id, damage: dmg, isHeadshot: false });
              }
            });
          }
        } else if (g.userData.type === 'smoke') {
          spawnSmokeCloud(g.position);
        }
        
        scene.remove(g);
        activeGrenades.splice(i, 1);
      }
    }

    if (Math.random() < 0.025) spawnEnemy();
  } // <-- End if (gameActive && !paused && !isDead)

  if (gameActive && isDead && isSpectating) {
    // Spectator uchun UI update kerakmas, faqat kamera update qilinadi va u animate ni boshida bajarilgan
  }

  // Camera FOV lerp
  if (Math.abs(camera.fov - targetFov) > 0.1) {
    camera.fov += (targetFov - camera.fov) * 15 * dt;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}

function startGame() {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('scoreUI').style.display = 'block';
  document.getElementById('volumeControl').style.display = 'flex';
  renderer.domElement.requestPointerLock();
  gameActive = true;
  startTime = clock.getElapsedTime();
  
  if (!socket) initMultiplayer();
  updateHUD();
}

function initMultiplayer() {
  const nameInput = document.getElementById('playerName').value || 'Askar';
  socket = io({ query: { name: nameInput, team: userSelectedTeam } });
  
  socket.on('init', (data) => {
    myId = data.id;
    myTeam = data.team;
    
    if (data.score) {
      document.getElementById('redScore').textContent = data.score.red;
      document.getElementById('blueScore').textContent = data.score.blue;
    }

    // O'zimizning boshlang'ich nuqtamizni serverdan qabul qilish
    if (data.state && data.state[myId]) {
        playerPos.set(data.state[myId].x, 2, data.state[myId].z);
        isSpectating = data.state[myId].isSpectator;
        if (isSpectating) {
          document.getElementById('spectatorUI').style.display = 'block';
        }
    }

    roundState = data.gameState || 'WAITING';
    roundTime = data.roundTime || 0;
    bombState = data.bombState || 'INACTIVE';

    for (const key in data.state) {
      if (key !== myId && !data.state[key].isDead) {
        addNetworkPlayer(data.state[key]);
      }
    }
  });

  socket.on('timeUpdate', (data) => {
    roundState = data.gameState;
    roundTime = data.roundTime;
    bombState = data.bombState;
    if (bombState === 'PLANTED') {
      document.getElementById('bombTimerDisplay').style.display = 'block';
      document.getElementById('bombTimerDisplay').textContent = `💣 BOMBA: ${data.bombTime}s`;
    } else {
      document.getElementById('bombTimerDisplay').style.display = 'none';
    }
    
    if (roundState === 'WAITING') {
      document.getElementById('roundMessageUI').style.display = 'block';
      document.getElementById('roundMessageTitle').textContent = "KUTILMOQDA...";
      document.getElementById('roundMessageTitle').style.color = "white";
      document.getElementById('roundMessageSubtitle').textContent = "Boshqa o'yinchilar qo'shilishi kutilmoqda";
    } else if (roundState === 'PLAYING') {
      document.getElementById('roundMessageUI').style.display = 'none';
    }
  });

  socket.on('roundStart', (data) => {
    if (data.score) {
      document.getElementById('redScore').textContent = data.score.red;
      document.getElementById('blueScore').textContent = data.score.blue;
    }
    roundState = 'PLAYING';
    roundTime = data.roundTime;
    bombState = 'INACTIVE';
    document.getElementById('bombTimerDisplay').style.display = 'none';
    document.getElementById('roundMessageUI').style.display = 'none';
    document.getElementById('spectatorUI').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('pauseMsg').style.display = 'none';

    // Barcha network mesh larni tozalash va yangilash
    for (let id in networkPlayers) {
      scene.remove(networkPlayers[id]);
      delete networkPlayers[id];
    }

    const state = data.state;
    if (state[myId]) {
      isDead = false;
      isSpectating = false;
      gameActive = true;
      hp = 100;
      grenadeCount = 3;
      smokeCount = 3;
      playerPos.set(state[myId].x, 2, state[myId].z);
      yaw = 0; pitch = 0;
      updateHUD();
      if (!paused) renderer.domElement.requestPointerLock();
    }

    for (const key in state) {
      if (key !== myId && !state[key].isDead) {
        addNetworkPlayer(state[key]);
      }
    }
  });

  socket.on('roundEnd', (data) => {
    roundState = 'ROUND_END';
    if (data.score) {
      document.getElementById('redScore').textContent = data.score.red;
      document.getElementById('blueScore').textContent = data.score.blue;
    }
    const winnerName = data.winner === 'red' ? 'QIZILLAR YUTDI!' : "KO'KLAR YUTDI!";
    const color = data.winner === 'red' ? '#ff4444' : '#4444ff';
    document.getElementById('roundMessageUI').style.display = 'block';
    document.getElementById('roundMessageTitle').textContent = winnerName;
    document.getElementById('roundMessageTitle').style.color = color;
    document.getElementById('roundMessageSubtitle').textContent = data.reason;
  });

  socket.on('bombPlanted', (data) => {
    bombState = 'PLANTED';
    window.bombPos = data.pos;
    // Ovoz chalish va xabar
    playShootSound(); // bomba ovozi yo'q, shunga shuni chalamiz
    document.getElementById('roundMessageUI').style.display = 'block';
    document.getElementById('roundMessageTitle').textContent = "BOMBA O'RNATILDI!";
    document.getElementById('roundMessageTitle').style.color = "#ffd700";
    document.getElementById('roundMessageSubtitle').textContent = data.planterName + " bombani joylashtirdi. 40 soniya!";
    setTimeout(() => { document.getElementById('roundMessageUI').style.display = 'none'; }, 3000);
  });

  socket.on('bombDefused', (data) => {
    bombState = 'DEFUSED';
    document.getElementById('bombTimerDisplay').style.display = 'none';
  });

  socket.on('playerJoined', (player) => {
    addNetworkPlayer(player);
  });

  socket.on('stateUpdate', (state) => {
    for (const key in state) {
      if (key !== myId && networkPlayers[key] && !state[key].isDead) {
        networkPlayers[key].userData.targetX = state[key].x;
        networkPlayers[key].userData.targetY = state[key].y - 2.0; // Koz hizosidan oyoq hizosiga o'tkazish
        networkPlayers[key].userData.targetZ = state[key].z;
        networkPlayers[key].userData.targetYaw = state[key].yaw;
        networkPlayers[key].userData.targetPitch = state[key].pitch;
      }
    }
  });

  socket.on('playerLeft', (id) => {
    if (networkPlayers[id]) {
      scene.remove(networkPlayers[id]);
      delete networkPlayers[id];
    }
  });

  socket.on('playerShot', (data) => {
    if (data.id !== myId) {
      createNetworkTracer(data.start, data.end);
      playEnemyShootSound(Math.hypot(playerPos.x - data.start.x, playerPos.z - data.start.z));
    }
  });

  socket.on('playerThrewGrenade', (data) => {
    if (data.playerId !== myId) {
      createAndThrowGrenade(data.grenadeId, data.type, data.start, data.velocity, false);
    }
  });

  socket.on('playerHit', (data) => {
    if (data.id === myId) {
      hp = data.hp;
      updateHUD();
      playDamageSound();
      const overlay = document.getElementById('damageOverlay');
      overlay.style.boxShadow = 'inset 0 0 120px rgba(255,0,0,0.6)';
      setTimeout(() => overlay.style.boxShadow = 'inset 0 0 0px rgba(255,0,0,0)', 300);
    } else if (networkPlayers[data.id]) {
      const pMesh = networkPlayers[data.id];
      pMesh.userData.isHit = true;
      pMesh.userData.hitTime = clock.getElapsedTime();
      if (pMesh.userData.bodyMesh) {
        pMesh.userData.bodyMesh.material = pMesh.userData.bodyMesh.material.clone();
        pMesh.userData.bodyMesh.material.color.setHex(0xff1111);
      }
    }
  });

  socket.on('playerDied', (data) => {
    if (data.victimId === myId) {
      isDead = true;
      isSpectating = true;
      gameActive = true; // Spectator kamera ishlashi uchun true
      document.exitPointerLock();
      document.getElementById('gameOver').style.display = 'block';
      document.getElementById('spectatorUI').style.display = 'block';
    } else if (networkPlayers[data.victimId]) {
      const pMesh = networkPlayers[data.victimId];
      pMesh.userData.isDying = true;
      pMesh.userData.deathTime = clock.getElapsedTime();
    }
    if (data.killerId === myId) {
      killCount++;
      updateHUD();
    }
  });

  // playerRespawned, captureUpdate va gameOver olib tashlandi. Hammasi roundStart va roundEnd da qilinadi.
}

function addNetworkPlayer(playerData) {
  const mesh = createPlayerMesh(playerData.team, playerData.name);
  mesh.position.set(playerData.x, playerData.y - 2.0, playerData.z);
  mesh.userData.id = playerData.id;
  mesh.userData.team = playerData.team;
  mesh.userData.targetX = playerData.x;
  mesh.userData.targetY = playerData.y - 2.0;
  mesh.userData.targetZ = playerData.z;
  mesh.userData.targetYaw = playerData.yaw;
  mesh.userData.targetPitch = playerData.pitch;
  networkPlayers[playerData.id] = mesh;
}

function endGame() {
  gameActive = false;
  if (document.pointerLockElement) document.exitPointerLock();
  playGameOverSound();
  document.getElementById('gameOver').style.display = 'flex';
  const timePlayed = Math.floor(clock.getElapsedTime() - startTime);
  document.getElementById('finalStats').innerHTML = 
    `🎯 O'ldirilgan: <b style="color:#ffd24a">${killCount}</b><br>⏱️ Vaqt: <b style="color:#ffd24a">${timePlayed}</b> soniya`;
}

let userSelectedTeam = 'auto';

document.querySelectorAll('.team-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.team-btn').forEach(b => b.style.border = '2px solid transparent');
    e.target.style.border = '2px solid white';
    userSelectedTeam = e.target.getAttribute('data-team');
  });
});

document.getElementById('startBtn').addEventListener('click', startGame);

// Pauzadan chiqish — ekran bosilsa
document.getElementById('pauseMsg').addEventListener('click', () => {
  if (gameActive) renderer.domElement.requestPointerLock();
});

// O'yinni boshlash
init();
