const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const DB_FILE = path.join(__dirname, 'db.json');
let ratingsDB = {};
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try { ratingsDB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) { ratingsDB = {}; }
  }
}
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(ratingsDB, null, 2));
}
loadDB();

app.get('/api/ratings', (req, res) => { res.json(ratingsDB); });
app.use(express.static(__dirname));

let players = {};
let redCount = 0;
let blueCount = 0;

const BASE_RADIUS = 8;
const RED_BASE_POS = { x: 0, z: 65 };
const BLUE_BASE_POS = { x: 0, z: -65 };

let teamScore = { red: 0, blue: 0 };

// Raund holati
let gameState = 'WAITING'; // WAITING, PLAYING, ROUND_END
let roundTime = 0; 
let bombState = 'INACTIVE'; // INACTIVE, PLANTED, DEFUSED, EXPLODED
let bombTime = 0;
let bombPos = null;

const ROUND_DURATION = 120; // 2 daqiqa
const BOMB_TIMER = 40; // bomba 40 soniyada portlaydi

function checkWinCondition() {
  if (gameState !== 'PLAYING') return;

  let aliveRed = 0;
  let aliveBlue = 0;
  for (let id in players) {
    if (!players[id].isDead && !players[id].isSpectator) {
      if (players[id].team === 'red') aliveRed++;
      if (players[id].team === 'blue') aliveBlue++;
    }
  }

  if (aliveRed === 0 && bombState !== 'PLANTED') {
    endRound('blue', 'Barcha Terroristlar yo\'q qilindi');
    return;
  }
  if (aliveBlue === 0 && bombState !== 'PLANTED') {
    endRound('red', 'Barcha Maxsus Kuchlar yo\'q qilindi');
    return;
  }
  if (aliveBlue === 0 && bombState === 'PLANTED') {
    endRound('red', 'Maxsus Kuchlar yo\'q qilindi (Bomba o\'rnatilgan)');
    return;
  }
}

function endRound(winnerTeam, reason) {
  gameState = 'ROUND_END';
  roundTime = 8; // Keyingi raundgacha 8 soniya
  if (winnerTeam === 'red') teamScore.red++;
  if (winnerTeam === 'blue') teamScore.blue++;
  
  io.emit('roundEnd', { winner: winnerTeam, reason: reason, score: teamScore });
}

function startRound() {
  gameState = 'PLAYING';
  roundTime = ROUND_DURATION;
  bombState = 'INACTIVE';
  bombTime = 0;
  bombPos = null;

  for (let id in players) {
    const p = players[id];
    p.isDead = false;
    p.isSpectator = false;
    p.hp = 100;
    p.z = p.team === 'red' ? RED_BASE_POS.z + (Math.random()-0.5)*15 : BLUE_BASE_POS.z + (Math.random()-0.5)*15;
    p.x = (Math.random() - 0.5) * 30;
  }
  io.emit('roundStart', { state: players, roundTime: roundTime, score: teamScore });
}

io.on('connection', (socket) => {
  console.log('Yangi o\'yinchi:', socket.id);

  const queryName = socket.handshake.query.name || 'Askar';
  const queryTeam = socket.handshake.query.team || 'auto';

  let assignedTeam = 'red';
  if (queryTeam === 'red') { assignedTeam = 'red'; redCount++; } 
  else if (queryTeam === 'blue') { assignedTeam = 'blue'; blueCount++; } 
  else {
    if (blueCount < redCount) { assignedTeam = 'blue'; blueCount++; } 
    else { assignedTeam = 'red'; redCount++; }
  }

  const spawnZ = assignedTeam === 'red' ? RED_BASE_POS.z + (Math.random()-0.5)*15 : BLUE_BASE_POS.z + (Math.random()-0.5)*15;
  const spawnX = (Math.random() - 0.5) * 30;

  let isSpec = (gameState === 'PLAYING'); // O'yin ketayotganda kirsa, kuzatuvchi bo'ladi

  players[socket.id] = {
    id: socket.id,
    name: queryName.substring(0, 15),
    x: spawnX, y: 2, z: spawnZ,
    yaw: 0, pitch: 0,
    hp: isSpec ? 0 : 100,
    team: assignedTeam,
    isDead: isSpec,
    isSpectator: isSpec,
    kills: 0, deaths: 0
  };

  socket.emit('init', { 
    id: socket.id, team: assignedTeam, state: players, score: teamScore,
    gameState: gameState, roundTime: roundTime, bombState: bombState 
  });
  socket.broadcast.emit('playerJoined', players[socket.id]);

  socket.on('updateState', (state) => {
    if (players[socket.id] && !players[socket.id].isDead) {
      players[socket.id].x = state.x;
      players[socket.id].y = state.y;
      players[socket.id].z = state.z;
      players[socket.id].yaw = state.yaw;
      players[socket.id].pitch = state.pitch;
    }
  });

  socket.on('shoot', (data) => {
    if(!players[socket.id] || players[socket.id].isDead) return;
    socket.broadcast.emit('playerShot', { id: socket.id, ...data });
  });

  socket.on('throwGrenade', (data) => {
    if(!players[socket.id] || players[socket.id].isDead) return;
    socket.broadcast.emit('playerThrewGrenade', {
      playerId: socket.id, grenadeId: data.id, type: data.type,
      start: data.start, velocity: data.velocity
    });
  });

  socket.on('hit', (data) => {
    if(gameState !== 'PLAYING') return;
    const target = players[data.targetId];
    if (target && !target.isDead) {
      target.hp -= data.damage;
      if (target.hp <= 0) {
        target.hp = 0;
        target.isDead = true;
        target.isSpectator = true;
        target.deaths++;
        
        if (!ratingsDB[target.name]) ratingsDB[target.name] = { kills: 0, deaths: 0 };
        ratingsDB[target.name].deaths++;
        
        if (players[socket.id]) {
          players[socket.id].kills++;
          const killerName = players[socket.id].name;
          if (!ratingsDB[killerName]) ratingsDB[killerName] = { kills: 0, deaths: 0 };
          ratingsDB[killerName].kills++;
        }
        saveDB();

        io.emit('playerDied', { victimId: data.targetId, killerId: socket.id });
        checkWinCondition();
      }
      io.emit('playerHit', { id: data.targetId, hp: target.hp, isHeadshot: data.isHeadshot });
    }
  });

  socket.on('plantBomb', () => {
    if (gameState === 'PLAYING' && players[socket.id].team === 'red' && bombState === 'INACTIVE' && !players[socket.id].isDead) {
      const dist = Math.hypot(players[socket.id].x - BLUE_BASE_POS.x, players[socket.id].z - BLUE_BASE_POS.z);
      if (dist <= BASE_RADIUS) {
        bombState = 'PLANTED';
        bombTime = BOMB_TIMER;
        bombPos = { x: players[socket.id].x, y: 0.2, z: players[socket.id].z };
        io.emit('bombPlanted', { pos: bombPos, time: bombTime, planterName: players[socket.id].name });
      }
    }
  });

  socket.on('defuseBomb', () => {
    if (gameState === 'PLAYING' && players[socket.id].team === 'blue' && bombState === 'PLANTED' && !players[socket.id].isDead) {
      if (bombPos) {
        const dist = Math.hypot(players[socket.id].x - bombPos.x, players[socket.id].z - bombPos.z);
        if (dist <= 4.0) { 
          bombState = 'DEFUSED';
          io.emit('bombDefused', { defuserName: players[socket.id].name });
          endRound('blue', 'Bomba zararsizlantirildi!');
        }
      }
    }
  });

  socket.on('disconnect', () => {
    if (players[socket.id]) {
      if (players[socket.id].team === 'red') redCount--;
      else blueCount--;
      delete players[socket.id];
      io.emit('playerLeft', socket.id);
      checkWinCondition();
    }
  });
});

// O'yin taymeri
setInterval(() => {
  if (gameState === 'WAITING') {
    let aliveRed = 0, aliveBlue = 0;
    for (let id in players) {
      if (players[id].team === 'red') aliveRed++;
      if (players[id].team === 'blue') aliveBlue++;
    }
    if (aliveRed >= 1 && aliveBlue >= 1) {
      startRound();
    }
  } else if (gameState === 'PLAYING') {
    if (bombState === 'PLANTED') {
      bombTime--;
      if (bombTime <= 0) {
        bombState = 'EXPLODED';
        endRound('red', 'Bomba portladi!');
      }
    } else {
      roundTime--;
      if (roundTime <= 0) {
        endRound('blue', 'Vaqt tugadi! Baza himoya qilindi');
      }
    }
  } else if (gameState === 'ROUND_END') {
    roundTime--;
    if (roundTime <= 0) {
      let r=0, b=0;
      for (let id in players) {
        if (players[id].team === 'red') r++;
        if (players[id].team === 'blue') b++;
      }
      if (r >= 1 && b >= 1) startRound();
      else gameState = 'WAITING';
    }
  }
  
  io.emit('timeUpdate', { gameState, roundTime, bombState, bombTime });
}, 1000);

setInterval(() => {
  io.emit('stateUpdate', players);
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi!`);
});
