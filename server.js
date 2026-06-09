const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Oddiy JSON bazasi reytinglar uchun
const DB_FILE = path.join(__dirname, 'db.json');
let ratingsDB = {};

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      ratingsDB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch(e) { ratingsDB = {}; }
  }
}
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(ratingsDB, null, 2));
}
loadDB();

// Reytinglarni olish API
app.get('/api/ratings', (req, res) => {
  res.json(ratingsDB);
});

// Statik fayllarni uzatish
app.use(express.static(__dirname));

let players = {};
let redCount = 0;
let blueCount = 0;

// Base Capture Variables
const BASE_RADIUS = 8;
const RED_BASE_POS = { x: 0, z: 65 };
const BLUE_BASE_POS = { x: 0, z: -65 };
let captureProgress = { red: 0, blue: 0 };
let teamScore = { red: 0, blue: 0 };
const CAPTURE_TIME = 15; // 15 sekund

io.on('connection', (socket) => {
  console.log('Yangi o\'yinchi ulandi:', socket.id);

  const queryName = socket.handshake.query.name || 'Askar';
  const queryTeam = socket.handshake.query.team || 'auto';

  // Jamoaga bo'lish (maksimal 5v5 deb hisoblasak)
  let assignedTeam = 'red';
  if (queryTeam === 'red') {
    assignedTeam = 'red';
    redCount++;
  } else if (queryTeam === 'blue') {
    assignedTeam = 'blue';
    blueCount++;
  } else {
    // Auto assignment
    if (blueCount < redCount) {
      assignedTeam = 'blue';
      blueCount++;
    } else {
      redCount++;
    }
  }

  // Spawn point
  const spawnZ = assignedTeam === 'red' ? RED_BASE_POS.z + (Math.random()-0.5)*15 : BLUE_BASE_POS.z + (Math.random()-0.5)*15;
  const spawnX = (Math.random() - 0.5) * 30;

  // O'yinchining boshlang'ich holati
  players[socket.id] = {
    id: socket.id,
    name: queryName.substring(0, 15), // Maks 15 harf
    x: spawnX,
    y: 2,
    z: spawnZ,
    yaw: 0,
    pitch: 0,
    hp: 100,
    team: assignedTeam,
    isDead: false,
    kills: 0,
    deaths: 0
  };

  // Yangi o'yinchiga o'z IDsi va jamoasi haqida xabar berish
  socket.emit('init', { id: socket.id, team: assignedTeam, state: players, score: teamScore });

  // Qolganlarga yangi o'yinchi haqida xabar berish
  socket.broadcast.emit('playerJoined', players[socket.id]);

  // Harakat ma'lumotlarini qabul qilish
  socket.on('updateState', (state) => {
    if (players[socket.id] && !players[socket.id].isDead) {
      players[socket.id].x = state.x;
      players[socket.id].y = state.y;
      players[socket.id].z = state.z;
      players[socket.id].yaw = state.yaw;
      players[socket.id].pitch = state.pitch;
    }
  });

  // O'q otish haqida ma'lumot qabul qilish (vizual effektlar uchun)
  socket.on('shoot', (data) => {
    // data: { start: {x,y,z}, dir: {x,y,z} }
    socket.broadcast.emit('playerShot', { id: socket.id, ...data });
  });

  // Zarba (Hit) ma'lumotini qabul qilish
  socket.on('hit', (data) => {
    // data: { targetId: '...', damage: 60, isHeadshot: false }
    const target = players[data.targetId];
    if (target && !target.isDead) {
      target.hp -= data.damage;
      
      if (target.hp <= 0) {
        target.hp = 0;
        target.isDead = true;
        target.deaths++;
        
        // Qurbonning umumiy reytingini yangilash
        if (!ratingsDB[target.name]) ratingsDB[target.name] = { kills: 0, deaths: 0 };
        ratingsDB[target.name].deaths++;
        
        if (players[socket.id]) {
          players[socket.id].kills++;
          const killerName = players[socket.id].name;
          // Qotilning reytingini yangilash
          if (!ratingsDB[killerName]) ratingsDB[killerName] = { kills: 0, deaths: 0 };
          ratingsDB[killerName].kills++;
        }
        
        saveDB(); // Bazaga saqlash

        io.emit('playerDied', { victimId: data.targetId, killerId: socket.id });
        
        // Birozdan keyin qayta tiriltirish (Respawn)
        setTimeout(() => {
          if (players[data.targetId]) {
            players[data.targetId].hp = 100;
            players[data.targetId].isDead = false;
            const sZ = players[data.targetId].team === 'red' ? RED_BASE_POS.z + (Math.random()-0.5)*15 : BLUE_BASE_POS.z + (Math.random()-0.5)*15;
            players[data.targetId].x = (Math.random() - 0.5) * 30;
            players[data.targetId].z = sZ;
            io.emit('playerRespawned', players[data.targetId]);
          }
        }, 3000);
      }
      
      io.emit('playerHit', { id: data.targetId, hp: target.hp, isHeadshot: data.isHeadshot });
    }
  });

  // Ulanish uzilganda
  socket.on('disconnect', () => {
    console.log('O\'yinchi chiqib ketdi:', socket.id);
    if (players[socket.id]) {
      if (players[socket.id].team === 'red') redCount--;
      else blueCount--;
      delete players[socket.id];
      io.emit('playerLeft', socket.id);
    }
  });
});

// Har 50ms da (sekundiga 20 marta) barchaga yangilangan holatni yuboramiz
setInterval(() => {
  io.emit('stateUpdate', players);
}, 50);

// Har 1 soniyada Baza egallashni tekshirish
setInterval(() => {
  let redInBlueBase = false;
  let blueInRedBase = false;

  for (const id in players) {
    const p = players[id];
    if (p.isDead) continue;
    
    // Qizillar ko'k bazada
    if (p.team === 'red') {
      const dist = Math.hypot(p.x - BLUE_BASE_POS.x, p.z - BLUE_BASE_POS.z);
      if (dist <= BASE_RADIUS) redInBlueBase = true;
    }
    // Ko'klar qizil bazada
    if (p.team === 'blue') {
      const dist = Math.hypot(p.x - RED_BASE_POS.x, p.z - RED_BASE_POS.z);
      if (dist <= BASE_RADIUS) blueInRedBase = true;
    }
  }

  if (redInBlueBase) captureProgress.red++;
  else if (captureProgress.red > 0) captureProgress.red--; // Sekin pasayishi mumkin yoki nolga tushishi mumkin, pasaytiramiz

  if (blueInRedBase) captureProgress.blue++;
  else if (captureProgress.blue > 0) captureProgress.blue--;

  io.emit('captureUpdate', captureProgress);

  if (captureProgress.red >= CAPTURE_TIME) {
    teamScore.red++;
    io.emit('gameOver', { winner: 'red', score: teamScore });
    captureProgress = { red: 0, blue: 0 };
    resetGame();
  } else if (captureProgress.blue >= CAPTURE_TIME) {
    teamScore.blue++;
    io.emit('gameOver', { winner: 'blue', score: teamScore });
    captureProgress = { red: 0, blue: 0 };
    resetGame();
  }
}, 1000);

function resetGame() {
  for (const id in players) {
    const p = players[id];
    p.hp = 100;
    p.isDead = false;
    p.z = p.team === 'red' ? RED_BASE_POS.z + (Math.random()-0.5)*15 : BLUE_BASE_POS.z + (Math.random()-0.5)*15;
    p.x = (Math.random() - 0.5) * 30;
    p.kills = 0;
    p.deaths = 0;
    io.emit('playerRespawned', p);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi!`);
});
