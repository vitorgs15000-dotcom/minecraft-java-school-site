const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

const CHUNK = 16;
const TILE = 24;
const keys = new Set();
const chunks = new Map();
const mobs = [];

let ultraLight = true;
let running = false;
let last = 0;
let fpsTimer = 0;
let frames = 0;
let fps = 0;
let targetFrameMs = 1000 / 30;
let drawnTiles = 0;
let culledTiles = 0;
let time = "day";

const player = {
  x: 0,
  y: 30,
  hp: 20,
  hunger: 20,
  tick: 0
};

const palette = {
  air: "#5d95d2",
  skyNight: "#121722",
  grass: "#4f8f43",
  dirt: "#73523a",
  stone: "#747b82",
  log: "#5b3d25",
  leaves: "#3f8840",
  water: "#246ba8",
  sand: "#cfb77a",
  coal: "#2d3033",
  iron: "#b09b84",
  torch: "#f2c35f",
  planks: "#a67942"
};

const hardware = detectHardware();
applyAutoProfile();
renderHardware();

document.getElementById("play").addEventListener("click", startGame);
document.getElementById("toggleMode").addEventListener("click", () => {
  ultraLight = !ultraLight;
  targetFrameMs = 1000 / (ultraLight ? 30 : 45);
  document.getElementById("toggleMode").textContent = `Modo ultra leve: ${ultraLight ? "ON" : "OFF"}`;
  document.getElementById("profileLabel").textContent = ultraLight ? "Ultra leve" : "Desempenho";
});

document.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === "m") showMenu();
  if (event.key === " ") mine();
  if (event.key === "1") place("stone");
  if (event.key === "2") place("planks");
  if (event.key === "3") place("torch");
});
document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener("mousedown", mine);

function detectHardware() {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4;
  const gpu = getGpuName();
  return { cores, memory, gpu };
}

function getGpuName() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const debug = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "GPU generica";
  } catch {
    return "GPU generica";
  }
}

function applyAutoProfile() {
  ultraLight = hardware.cores <= 2 || hardware.memory <= 4;
  targetFrameMs = 1000 / (ultraLight ? 30 : 45);
  document.getElementById("toggleMode").textContent = `Modo ultra leve: ${ultraLight ? "ON" : "OFF"}`;
}

function renderHardware() {
  document.getElementById("hardware").innerHTML = `
    <span>CPU: ${hardware.cores} threads</span>
    <span>RAM estimada: ${hardware.memory}GB</span>
    <span>GPU: ${escapeHtml(hardware.gpu).slice(0, 42)}</span>
    <span>Chunks: ${ultraLight ? "3" : "5"}</span>
  `;
}

function startGame() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  resizeCanvas();
  seedMobs();
  running = true;
  requestAnimationFrame(loop);
}

function showMenu() {
  running = false;
  document.getElementById("game").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(640, Math.floor(rect.width));
  canvas.height = Math.max(360, Math.floor(rect.height));
}

window.addEventListener("resize", resizeCanvas);

function loop(now) {
  if (!running) return;
  if (now - last < targetFrameMs) {
    requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min(2, (now - last) / 16.67 || 1);
  last = now;
  update(dt);
  render();
  updateFps(now);
  requestAnimationFrame(loop);
}

function update(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("a")) dx--;
  if (keys.has("d")) dx++;
  if (keys.has("w")) dy--;
  if (keys.has("s")) dy++;
  if (dx || dy) move(dx, dy);

  player.tick++;
  if (player.tick % 60 === 0) {
    player.hunger = Math.max(0, player.hunger - 1);
    if (player.hunger === 0) player.hp = Math.max(0, player.hp - 1);
  }
  if (player.tick % (ultraLight ? 18 : 10) === 0) updateMobs();
  trimChunkCache();
}

function move(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!solid(blockAt(nx, ny))) {
    player.x = nx;
    player.y = ny;
  }
}

function mine() {
  const tx = player.x;
  const ty = player.y + 1;
  const block = blockAt(tx, ty);
  if (block !== "air" && block !== "water") {
    setBlock(tx, ty, "air");
    status(`Minerou ${block}.`);
  }
}

function place(block) {
  setBlock(player.x, player.y - 1, block);
  status(`Colocou ${block}.`);
}

function updateMobs() {
  for (const mob of mobs) {
    const dist = Math.abs(mob.x - player.x) + Math.abs(mob.y - player.y);
    if (dist > 12) continue;
    const dx = Math.sign(player.x - mob.x);
    const dy = Math.abs(player.x - mob.x) > Math.abs(player.y - mob.y) ? 0 : Math.sign(player.y - mob.y);
    if (!solid(blockAt(mob.x + dx, mob.y + dy))) {
      mob.x += dx;
      mob.y += dy;
    }
    if (Math.abs(mob.x - player.x) <= 1 && Math.abs(mob.y - player.y) <= 1) {
      player.hp = Math.max(0, player.hp - 1);
      status("Zumbi atacou. Fuja, minere caminho ou coloque blocos.");
    }
  }
}

function render() {
  drawnTiles = 0;
  culledTiles = 0;

  const viewW = Math.ceil(canvas.width / TILE) + 2;
  const viewH = Math.ceil(canvas.height / TILE) + 2;
  const startX = player.x - Math.floor(viewW / 2);
  const startY = player.y - Math.floor(viewH / 2);
  const renderDistance = (ultraLight ? 3 : 5) * CHUNK;

  ctx.fillStyle = time === "night" ? palette.skyNight : palette.air;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = startY; y < startY + viewH; y++) {
    for (let x = startX; x < startX + viewW; x++) {
      if (Math.abs(x - player.x) > renderDistance || Math.abs(y - player.y) > renderDistance) {
        culledTiles++;
        continue;
      }
      const block = blockAt(x, y);
      if (block === "air" && y > player.y + 10) {
        culledTiles++;
        continue;
      }
      drawBlock(block, (x - startX) * TILE, (y - startY) * TILE, y);
      drawnTiles++;
    }
  }

  for (const mob of mobs) {
    drawMob(mob, startX, startY);
  }
  drawPlayer(canvas.width / 2, canvas.height / 2);
  updateHud();
}

function drawBlock(block, x, y, worldY) {
  ctx.fillStyle = shade(palette[block] || "#ff00ff", ultraLight ? 0 : Math.max(0, worldY - 30));
  ctx.fillRect(x, y, TILE, TILE);
  if (!ultraLight && block !== "air") {
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.strokeRect(x, y, TILE, TILE);
  }
  if (block === "torch") {
    ctx.fillStyle = "#ffe082";
    ctx.fillRect(x + 10, y + 5, 4, 14);
  }
}

function drawPlayer(x, y) {
  ctx.fillStyle = "#315bdc";
  ctx.fillRect(x - 7, y - 14, 14, 26);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x - 4, y - 10, 3, 3);
  ctx.fillRect(x + 2, y - 10, 3, 3);
}

function drawMob(mob, startX, startY) {
  const sx = (mob.x - startX) * TILE;
  const sy = (mob.y - startY) * TILE;
  if (sx < -TILE || sy < -TILE || sx > canvas.width || sy > canvas.height) return;
  ctx.fillStyle = mob.type === "zombie" ? "#55a868" : "#a5754f";
  ctx.fillRect(sx + 5, sy + 5, TILE - 10, TILE - 10);
  ctx.fillStyle = "#000";
  ctx.fillText(mob.type === "zombie" ? "Z" : "C", sx + 8, sy + 17);
}

function blockAt(x, y) {
  const chunk = getChunk(Math.floor(x / CHUNK), Math.floor(y / CHUNK));
  return chunk.blocks[index(Math.floorMod(x, CHUNK), Math.floorMod(y, CHUNK))];
}

function setBlock(x, y, block) {
  const chunk = getChunk(Math.floor(x / CHUNK), Math.floor(y / CHUNK));
  chunk.blocks[index(Math.floorMod(x, CHUNK), Math.floorMod(y, CHUNK))] = block;
}

function getChunk(cx, cy) {
  const key = `${cx},${cy}`;
  let chunk = chunks.get(key);
  if (!chunk) {
    chunk = generateChunk(cx, cy);
    chunks.set(key, chunk);
  }
  chunk.last = performance.now();
  return chunk;
}

function generateChunk(cx, cy) {
  const blocks = new Array(CHUNK * CHUNK);
  for (let y = 0; y < CHUNK; y++) {
    for (let x = 0; x < CHUNK; x++) {
      const wx = cx * CHUNK + x;
      const wy = cy * CHUNK + y;
      blocks[index(x, y)] = generateBlock(wx, wy);
    }
  }
  return { blocks, last: performance.now() };
}

function generateBlock(x, y) {
  const surface = 34 + fastNoise(x) % 5;
  if (y < surface - 5) return "air";
  if (y === surface - 5 && Math.floorMod(x, 21) === 0) return "leaves";
  if (y >= surface - 4 && y <= surface - 2 && Math.floorMod(x, 21) === 0) return "log";
  if (y === surface && Math.floorMod(x, 29) < 4) return "sand";
  if (y === surface) return "grass";
  if (y < surface + 4) return "dirt";
  if (Math.floorMod(x * 5 + y * 11, 53) === 0) return "coal";
  if (Math.floorMod(x * 13 + y * 7, 97) === 0) return "iron";
  if (Math.floorMod(x * 17 + y * 19, 211) === 0) return "water";
  return "stone";
}

function fastNoise(x) {
  let n = x * 374761393;
  n = (n ^ (n >> 13)) * 1274126177;
  return Math.abs(n ^ (n >> 16));
}

function trimChunkCache() {
  const limit = ultraLight ? 72 : 140;
  if (chunks.size <= limit) return;
  const sorted = [...chunks.entries()].sort((a, b) => a[1].last - b[1].last);
  for (let i = 0; i < sorted.length - limit; i++) chunks.delete(sorted[i][0]);
}

function seedMobs() {
  if (mobs.length) return;
  mobs.push({ type: "cow", x: 8, y: 33 });
  mobs.push({ type: "zombie", x: 14, y: 33 });
  mobs.push({ type: "zombie", x: -10, y: 34 });
}

function solid(block) {
  return !["air", "water", "torch"].includes(block);
}

function shade(hex, amount) {
  if (amount <= 0) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - amount);
  const g = Math.max(0, ((n >> 8) & 255) - amount);
  const b = Math.max(0, (n & 255) - amount);
  return `rgb(${r},${g},${b})`;
}

function index(x, y) {
  return y * CHUNK + x;
}

Math.floorMod = Math.floorMod || ((a, b) => ((a % b) + b) % b);

function updateFps(now) {
  frames++;
  if (now - fpsTimer >= 1000) {
    fps = frames;
    frames = 0;
    fpsTimer = now;
  }
}

function updateHud() {
  document.getElementById("fps").textContent = fps;
  document.getElementById("chunks").textContent = chunks.size;
  document.getElementById("culled").textContent = culledTiles;
  document.getElementById("hp").textContent = player.hp;
  document.getElementById("hunger").textContent = player.hunger;
}

function status(text) {
  document.getElementById("status").textContent = text;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
