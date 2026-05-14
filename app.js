const width = 12;
const height = 8;
const world = document.getElementById("world");
const input = document.getElementById("commandInput");
const toast = document.getElementById("toast");
const levelNumber = document.getElementById("levelNumber");
const xpEl = document.getElementById("xp");
const fpsEl = document.getElementById("fps");
const commandBook = document.getElementById("commandBook");
const lowMode = document.getElementById("lowMode");

let xp = 0;
let levelIndex = 0;
let player = { x: 1, y: 5, mode: "survival", inventory: {} };
let state = {};

const commandHelp = [
  ["Teleporte", "/tp @p 8 5", "Move o jogador para uma coordenada."],
  ["Dar item", "/give @p minecraft:torch 8", "Coloca itens no inventario."],
  ["Modo de jogo", "/gamemode creative", "Troca para creative, survival, adventure ou spectator."],
  ["Tempo", "/time set day", "Muda o horario do mundo."],
  ["Clima", "/weather clear", "Remove chuva e tempestade."],
  ["Regra", "/gamerule keepInventory true", "Altera regras do mundo."],
  ["Invocar", "/summon minecraft:cow 6 4", "Cria entidades em uma posicao."],
  ["Bloco", "/setblock 5 5 minecraft:stone", "Coloca bloco em uma coordenada."],
  ["Efeito", "/effect give @p minecraft:speed", "Aplica um efeito simples."],
  ["Limpar", "/kill @e[type=minecraft:zombie]", "Remove entidades perigosas."]
];

const levels = [
  {
    title: "Noite perigosa",
    text: "Voce nasceu num mundo escuro. Use um comando para virar dia.",
    objective: "Objetivo: deixe o tempo como dia.",
    tips: ["/time set day"],
    setup: () => ({ time: "night", weather: "clear", zombies: [[8, 5]], base: [10, 5], lit: [] }),
    check: () => state.time === "day"
  },
  {
    title: "Base sem luz",
    text: "A base esta escura. Pegue tochas com /give e ilumine perto da casa.",
    objective: "Objetivo: tenha tochas e coloque luz na base.",
    tips: ["/give @p minecraft:torch 8", "/setblock 10 5 minecraft:torch"],
    setup: () => ({ time: "night", weather: "clear", zombies: [[7, 4]], base: [10, 5], lit: [] }),
    check: () => (player.inventory.torch || 0) > 0 && state.lit.some(([x, y]) => x === 10 && y === 5)
  },
  {
    title: "Fuga rapida",
    text: "Um zumbi bloqueia o caminho. Use teleporte para chegar perto da base.",
    objective: "Objetivo: chegue na coordenada X 10, Y 5.",
    tips: ["/tp @p 10 5"],
    setup: () => ({ time: "night", weather: "rain", zombies: [[5, 5], [6, 5]], base: [10, 5], lit: [[10, 5]] }),
    check: () => player.x === 10 && player.y === 5
  },
  {
    title: "Construtor criativo",
    text: "Aprenda a trocar modo de jogo e colocar blocos.",
    objective: "Objetivo: entre no creative e coloque pedra em X 6, Y 4.",
    tips: ["/gamemode creative", "/setblock 6 4 minecraft:stone"],
    setup: () => ({ time: "day", weather: "clear", zombies: [], base: [10, 5], lit: [[10, 5]], blocks: {} }),
    check: () => player.mode === "creative" && state.blocks["6,4"] === "stone"
  },
  {
    title: "Chuva e sobrevivencia",
    text: "A chuva atrapalha seu PC antigo e a visibilidade. Limpe o clima.",
    objective: "Objetivo: clima limpo e keepInventory ativado.",
    tips: ["/weather clear", "/gamerule keepInventory true"],
    setup: () => ({ time: "day", weather: "thunder", keepInventory: false, zombies: [[9, 3]], base: [10, 5], lit: [[10, 5]] }),
    check: () => state.weather === "clear" && state.keepInventory === true
  },
  {
    title: "Administrador do mundo",
    text: "Finalize limpando os zumbis e invocando uma vaca perto da base.",
    objective: "Objetivo: sem zumbis e com uma vaca no mapa.",
    tips: ["/kill @e[type=minecraft:zombie]", "/summon minecraft:cow 9 5"],
    setup: () => ({ time: "day", weather: "clear", zombies: [[4, 4], [5, 4], [6, 4]], cows: [], base: [10, 5], lit: [[10, 5]] }),
    check: () => state.zombies.length === 0 && state.cows.length > 0
  }
];

function startLevel(index) {
  levelIndex = index;
  player = { x: 1, y: 5, mode: player.mode || "survival", inventory: player.inventory || {} };
  state = { blocks: {}, cows: [], keepInventory: false, ...levels[index].setup() };
  document.getElementById("missionTitle").textContent = levels[index].title;
  document.getElementById("missionText").textContent = levels[index].text;
  document.getElementById("objectiveText").textContent = levels[index].objective;
  document.getElementById("tips").innerHTML = levels[index].tips.map(tip => `<li><code>${tip}</code></li>`).join("");
  levelNumber.textContent = index + 1;
  say("Missao iniciada. Digite o comando no console.");
  render();
}

function render() {
  const tiles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      let type = y > 5 ? "dirt" : "grass";
      let text = "";
      if (state.weather === "rain" || state.weather === "thunder") type = "water";
      if (state.time === "night") type = "dark";
      if (state.blocks?.[key] === "stone") type = "stone";
      if (state.lit?.some(([lx, ly]) => lx === x && ly === y)) type += " lit";
      if (state.base?.[0] === x && state.base?.[1] === y) text = "⌂";
      if (state.zombies?.some(([zx, zy]) => zx === x && zy === y)) text = "Z";
      if (state.cows?.some(([cx, cy]) => cx === x && cy === y)) text = "C";
      if (player.x === x && player.y === y) text = "@";
      tiles.push(`<div class="tile ${type} ${text === "@" ? "player" : ""}">${text}</div>`);
    }
  }
  world.innerHTML = tiles.join("");
  xpEl.textContent = xp;
}

function runCommand(raw) {
  const command = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!command.startsWith("/")) {
    return say("Comandos comecam com barra, exemplo: /time set day", false);
  }

  const parts = command.split(" ");
  const name = parts[0];

  if (name === "/time" && parts[1] === "set") {
    state.time = parts[2] === "night" ? "night" : "day";
    say(`Tempo alterado para ${state.time}.`);
  } else if (name === "/weather") {
    state.weather = parts[1] || "clear";
    say(`Clima alterado para ${state.weather}.`);
  } else if (name === "/give" && parts[1] === "@p") {
    const item = (parts[2] || "").replace("minecraft:", "");
    const amount = Number(parts[3] || 1);
    player.inventory[item] = (player.inventory[item] || 0) + Math.max(1, amount);
    say(`Voce recebeu ${amount}x ${item}.`);
  } else if ((name === "/tp" || name === "/teleport") && parts[1] === "@p") {
    const x = clamp(Number(parts[2]), 0, width - 1);
    const y = clamp(Number(parts[3]), 0, height - 1);
    player.x = x;
    player.y = y;
    say(`Teleportado para ${x}, ${y}.`);
  } else if (name === "/gamemode") {
    player.mode = parts[1] || "survival";
    say(`Modo de jogo: ${player.mode}.`);
  } else if (name === "/gamerule" && parts[1] === "keepinventory") {
    state.keepInventory = parts[2] === "true";
    say(`keepInventory = ${state.keepInventory}.`);
  } else if (name === "/setblock") {
    const x = clamp(Number(parts[1]), 0, width - 1);
    const y = clamp(Number(parts[2]), 0, height - 1);
    const block = (parts[3] || "").replace("minecraft:", "");
    if (block === "torch") state.lit.push([x, y]);
    else state.blocks[`${x},${y}`] = block || "stone";
    say(`Bloco ${block || "stone"} colocado em ${x}, ${y}.`);
  } else if (name === "/summon") {
    const entity = (parts[1] || "").replace("minecraft:", "");
    const x = clamp(Number(parts[2] || player.x), 0, width - 1);
    const y = clamp(Number(parts[3] || player.y), 0, height - 1);
    if (entity === "cow") state.cows.push([x, y]);
    if (entity === "zombie") state.zombies.push([x, y]);
    say(`${entity} invocado em ${x}, ${y}.`);
  } else if (name === "/kill" && command.includes("zombie")) {
    state.zombies = [];
    say("Zumbis removidos.");
  } else if (name === "/effect") {
    say("Efeito aplicado. No Minecraft real, use: /effect give @p minecraft:speed 60 1");
  } else {
    say("Comando ainda nao resolve esta missao. Veja o Livro de comandos.", false);
  }

  render();
  if (levels[levelIndex].check()) completeLevel();
}

function completeLevel() {
  xp += 10;
  render();
  if (levelIndex + 1 >= levels.length) {
    say("Voce zerou o Command Quest. Agora voce ja sabe os comandos essenciais do Minecraft Java.");
    return;
  }
  say("Missao completa. Proxima fase carregando...");
  setTimeout(() => startLevel(levelIndex + 1), 900);
}

function say(message, ok = true) {
  toast.textContent = message;
  toast.style.borderColor = ok ? "rgba(126,231,135,.55)" : "rgba(255,107,107,.65)";
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function renderBook() {
  commandBook.innerHTML = commandHelp.map(([title, syntax, desc]) => `
    <div class="book-entry">
      <b>${title}</b>
      <span>${desc}</span>
      <code>${syntax}</code>
    </div>
  `).join("");
}

function bindControls() {
  document.getElementById("runCommand").addEventListener("click", () => {
    runCommand(input.value);
    input.value = "";
    input.focus();
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      runCommand(input.value);
      input.value = "";
    }
  });
  lowMode.addEventListener("change", () => document.body.classList.toggle("low", lowMode.checked));
  document.body.classList.toggle("low", lowMode.checked);
}

let frameCount = 0;
let lastFps = performance.now();
function fpsLoop(now) {
  frameCount++;
  if (now - lastFps >= 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    lastFps = now;
  }
  requestAnimationFrame(fpsLoop);
}

renderBook();
bindControls();
startLevel(0);
requestAnimationFrame(fpsLoop);
