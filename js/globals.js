let scene, camera, renderer, clock;
let playerPos = new THREE.Vector3(0, 2, 0);
let yaw = 0, pitch = 0;
const keys = {};
let enemies = [];
let particles = [];
let trees = [];
let rocks = [];       
let obstacles = [];   
let activeGrenades = [];
let activeSmokes = [];
let grenadeCount = 3;
let smokeCount = 3;
let killCount = 0;
let hp = 100;

// Sakrash uchun
let velocityY = 0;
const GRAVITY = 30;
const JUMP_FORCE = 12;
let isGrounded = true;

// Medkits
let medkits = [];
const MEDKIT_HEAL = 50;

// Qurollar
const weapons = [
  { name: 'Avtomat', maxAmmo: 30, damage: 60, headshotDamage: 100, cooldown: 0.12, spread: 0, count: 1, recoil: 0.25, reloadTime: 1500 },
  { name: 'Drobovik', maxAmmo: 8, damage: 25, headshotDamage: 35, cooldown: 0.7, spread: 0.1, count: 6, recoil: 0.5, reloadTime: 2000 },
  { name: 'Miltiq', maxAmmo: 5, damage: 200, headshotDamage: 400, cooldown: 1.5, spread: 0, count: 1, recoil: 0.7, reloadTime: 2500 },
  { name: 'Pulemyot', maxAmmo: 100, damage: 40, headshotDamage: 70, cooldown: 0.06, spread: 0.04, count: 1, recoil: 0.18, reloadTime: 3500 }
];
let currentWeaponIndex = 0;
let ammo = weapons[0].maxAmmo;

let isZooming = false;
let targetFov = 75;
const NORMAL_FOV = 75;
const ZOOM_FOV = 20;

let reloading = false;
let startTime = 0;
let gameActive = false;
let paused = false;
let playerGroup;
let shootCooldown = 0;
let mouseDown = false;

let recoilKick = 0;
let recoilTilt = 0;
let pitchRecoil = 0;

const FIELD_SIZE = 80;
const BASE_RADIUS = 8;
const RED_BASE_POS = { x: 0, z: 65 };
const BLUE_BASE_POS = { x: 0, z: -65 };

const ENEMY_COUNT_MAX = 14;
const ENEMY_SHOOT_RANGE = 25;
const ENEMY_HP = 180;
const MOUSE_SENSITIVITY = 0.002;

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

// Multiplayer o'zgaruvchilari
let socket = null;
let myId = null;
let myTeam = null;
let networkPlayers = {}; // Serverdan keladigan boshqa o'yinchilar
let isDead = false;
let deaths = 0;

// Raund o'zgaruvchilari
let roundState = 'WAITING';
let roundTime = 0;
let bombState = 'INACTIVE';
let bombTime = 0;
let isSpectating = false;
let walkableObjects = [];
