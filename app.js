const W = 16;
const H = 10;
const $ = (id) => document.getElementById(id);

const worldEl = $("world");
const logEl = $("log");
const inputEl = $("commandInput");
const commandBookEl = $("commandBook");
const searchEl = $("commandSearch");

let player = { x: 2, y: 6, mode: "survival", health: 20, hunger: 20, xp: 0 };
let world = [];
let mobs = [];
let inventory = { wood: 0, planks: 0, stone: 0, torch: 0, diamond: 0, food: 0 };
let day = 1;
let time = "day";
let weather = "clear";
let activeLesson = "survival";
let completed = new Set();

const lessons = {
  survival: {
    title: "Survival: sobreviva ao primeiro dia",
    text: "Colete madeira, transforme em tabuas, construa uma mesa, minere pedra e ilumine a base.",
    goal: "Objetivo: 4 madeiras, 4 tabuas, 4 pedras, 1 mesa e 1 tocha colocada.",
    tasks: [
      ["Coletar madeira", () => inventory.wood >= 4],
      ["Criar tabuas", () => inventory.planks >= 4],
      ["Colocar mesa de trabalho", () => hasBlock("crafting_table")],
      ["Minerar pedra", () => inventory.stone >= 4],
      ["Colocar uma tocha", () => hasBlock("torch")]
    ]
  },
  creative: {
    title: "Creative: construa sem limite",
    text: "Entre no modo criativo, voe pelo mapa com teleporte e monte uma mini base.",
    goal: "Objetivo: usar creative, colocar 6 blocos e invocar uma vaca.",
    tasks: [
      ["Entrar no creative", () => player.mode === "creative"],
      ["Colocar 6 blocos", () => countPlaced() >= 6],
      ["Invocar uma vaca", () => mobs.some(m => m.type === "cow")]
    ]
  },
  commands: {
    title: "Comandos: controle o mundo",
    text: "Pratique os principais comandos de Minecraft Java atual.",
    goal: "Objetivo: usar /time, /weather, /give, /tp e /gamerule.",
    tasks: [
      ["Usar /time", () => completed.has("time")],
      ["Usar /weather", () => completed.has("weather")],
      ["Usar /give", () => completed.has("give")],
      ["Usar /tp", () => completed.has("tp")],
      ["Usar /gamerule", () => completed.has("gamerule")]
    ]
  }
};

const commands = [
  ["advancement", "/advancement grant @p everything", "Avancos/conquistas."],
  ["attribute", "/attribute @p minecraft:generic.max_health base set 40", "Atributos de entidades."],
  ["ban", "/ban Steve grief", "Bane jogador no servidor."],
  ["ban-ip", "/ban-ip 127.0.0.1", "Bane IP."],
  ["banlist", "/banlist players", "Lista banimentos."],
  ["bossbar", "/bossbar add minecraft:vida \"Vida\"", "Barra de boss customizada."],
  ["clear", "/clear @p minecraft:dirt", "Limpa itens."],
  ["clone", "/clone 0 60 0 5 65 5 10 60 10", "Copia area."],
  ["damage", "/damage @p 2", "Causa dano."],
  ["data", "/data get entity @p", "NBT/dados avancados."],
  ["datapack", "/datapack list", "Gerencia datapacks."],
  ["debug", "/debug start", "Diagnostico."],
  ["defaultgamemode", "/defaultgamemode survival", "Modo padrao."],
  ["deop", "/deop Steve", "Remove operador."],
  ["difficulty", "/difficulty easy", "Dificuldade."],
  ["effect", "/effect give @p minecraft:speed 60 1", "Efeitos."],
  ["enchant", "/enchant @p minecraft:sharpness 5", "Encanta item."],
  ["execute", "/execute as @e[type=zombie] run say oi", "Comando avancado."],
  ["experience", "/xp add @p 10 levels", "XP."],
  ["fill", "/fill 0 60 0 5 65 5 minecraft:stone", "Preenche area."],
  ["fillbiome", "/fillbiome 0 60 0 5 65 5 minecraft:plains", "Troca bioma."],
  ["forceload", "/forceload add 0 0", "Mantem chunk carregado."],
  ["function", "/function pack:start", "Executa funcao."],
  ["gamemode", "/gamemode creative", "Troca survival/creative."],
  ["gamerule", "/gamerule keepInventory true", "Regras do mundo."],
  ["give", "/give @p minecraft:diamond 3", "Da item."],
  ["help", "/help give", "Ajuda."],
  ["item", "/item replace entity @p weapon.mainhand with minecraft:diamond_sword", "Edita slots."],
  ["jfr", "/jfr start", "Profiling servidor."],
  ["kick", "/kick Steve", "Expulsa jogador."],
  ["kill", "/kill @e[type=minecraft:zombie]", "Remove entidades."],
  ["list", "/list", "Jogadores online."],
  ["locate", "/locate structure minecraft:village", "Localiza estruturas."],
  ["loot", "/loot give @p loot minecraft:chests/simple_dungeon", "Gera loot."],
  ["me", "/me achou diamante", "Acao no chat."],
  ["msg", "/msg Steve ola", "Mensagem privada."],
  ["op", "/op Steve", "Da operador."],
  ["particle", "/particle minecraft:flame ~ ~1 ~", "Particulas."],
  ["perf", "/perf start", "Performance servidor."],
  ["place", "/place feature minecraft:oak", "Coloca feature."],
  ["playsound", "/playsound minecraft:block.note_block.pling master @p", "Toca som."],
  ["publish", "/publish", "Abre LAN."],
  ["random", "/random roll 1..100", "Numero aleatorio."],
  ["recipe", "/recipe give @p *", "Receitas."],
  ["reload", "/reload", "Recarrega datapacks."],
  ["return", "/return 1", "Retorna valor."],
  ["ride", "/ride @p mount @e[type=horse,limit=1]", "Montaria."],
  ["save-all", "/save-all", "Salva servidor."],
  ["say", "/say ola mundo", "Mensagem servidor."],
  ["schedule", "/schedule function pack:tick 10s", "Agenda funcao."],
  ["scoreboard", "/scoreboard objectives add pontos dummy", "Placar/variaveis."],
  ["seed", "/seed", "Mostra seed."],
  ["setblock", "/setblock 5 6 minecraft:torch", "Coloca bloco."],
  ["setworldspawn", "/setworldspawn ~ ~ ~", "Spawn global."],
  ["spawnpoint", "/spawnpoint @p ~ ~ ~", "Spawn jogador."],
  ["spectate", "/spectate @e[type=cow,limit=1]", "Espectar entidade."],
  ["spreadplayers", "/spreadplayers 0 0 20 80 false @a", "Espalha jogadores."],
  ["stop", "/stop", "Desliga servidor."],
  ["stopsound", "/stopsound @a", "Para sons."],
  ["summon", "/summon minecraft:cow 8 6", "Invoca entidade."],
  ["tag", "/tag @p add builder", "Tags."],
  ["team", "/team add azul", "Times."],
  ["teammsg", "/teammsg vamos", "Chat do time."],
  ["teleport", "/tp @p 8 6", "Teleporte."],
  ["tellraw", "/tellraw @a {\"text\":\"Ola\"}", "Mensagem JSON."],
  ["tick", "/tick rate 20", "Velocidade de ticks."],
  ["time", "/time set day", "Horario."],
  ["title", "/title @a title {\"text\":\"Bem-vindo\"}", "Titulo na tela."],
  ["transfer", "/transfer servidor.com", "Move servidor."],
  ["trigger", "/trigger home", "Aciona scoreboard."],
  ["weather", "/weather clear", "Clima."],
  ["whitelist", "/whitelist add Steve", "Lista permitida."],
  ["worldborder", "/worldborder set 1000", "Borda do mundo."]
];

function initWorld() {
  world = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let block = y < 4 ? "sky" : y === 4 ? "grass" : y < 8 ? "dirt" : "stone";
      if ((x === 3 || x === 12) && y === 3) block = "tree";
      if ((x === 3 || x === 12) && y === 4) block = "tree";
      if (x > 6 && x < 10 && y === 5) block = "water";
      if (x === 14 && y === 8) block = "diamond";
      row.push({ block, placed: false });
    }
    world.push(row);
  }
  mobs = [{ type: "zombie", x: 13, y: 6 }];
}

function render() {
  $("modeLabel").textContent = player.mode;
  $("healthLabel").textContent = player.health;
  $("hungerLabel").textContent = player.hunger;
  $("xpLabel").textContent = player.xp;
  $("dayLabel").textContent = day;

  const night = time === "night";
  let html = "";
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let block = world[y][x].block;
      let cls = block === "sky" && night ? "night" : block;
      let text = symbol(block);
      const mob = mobs.find(m => m.x === x && m.y === y);
      if (mob) text = mob.type === "zombie" ? "Z" : "C";
      if (player.x === x && player.y === y) text = "@";
      html += `<div class="tile ${cls} ${mob ? "mob" : ""} ${player.x === x && player.y === y ? "player" : ""}">${text}</div>`;
    }
  }
  worldEl.innerHTML = html;
  renderInventory();
  renderLesson();
}

function symbol(block) {
  return {
    tree: "♣", water: "~", diamond: "♦", torch: "✦",
    crafting_table: "▣", bed: "▤", planks: "▥", stone: "■"
  }[block] || "";
}

function renderInventory() {
  $("inventory").innerHTML = Object.entries(inventory)
    .map(([item, amount]) => `<div class="slot"><b>${item}</b>${amount}</div>`)
    .join("");
}

function renderLesson() {
  const lesson = lessons[activeLesson];
  $("lessonTitle").textContent = lesson.title;
  $("lessonText").textContent = lesson.text;
  $("goalText").textContent = lesson.goal;
  $("taskList").innerHTML = lesson.tasks.map(([text, done]) =>
    `<li class="${done() ? "done" : ""}">${text}</li>`
  ).join("");
  if (lesson.tasks.every(([, done]) => done())) {
    log(`Modulo ${activeLesson} concluido. Muito bom.`);
  }
}

function move(dx, dy) {
  const nx = clamp(player.x + dx, 0, W - 1);
  const ny = clamp(player.y + dy, 0, H - 1);
  const target = world[ny][nx].block;
  if (player.mode !== "creative" && !["sky", "grass", "torch", "water"].includes(target)) {
    return log("Bloco solido no caminho. Quebre ou use creative.");
  }
  player.x = nx;
  player.y = ny;
  tickSurvival();
  render();
}

function mine() {
  const y = clamp(player.y + 1, 0, H - 1);
  const x = player.x;
  const block = world[y][x].block;
  if (block === "sky" || block === "water") return log("Nada util para quebrar aqui.");
  if (block === "tree") addItem("wood", 1);
  if (block === "stone") addItem("stone", 1);
  if (block === "diamond") addItem("diamond", 1);
  if (block === "dirt" || block === "grass") addItem("dirt", 1);
  world[y][x] = { block: "sky", placed: false };
  player.xp += 1;
  tickSurvival();
  log(`Voce quebrou ${block}.`);
  render();
}

function build(block) {
  const x = player.x;
  const y = clamp(player.y - 1, 0, H - 1);
  if (player.mode !== "creative") {
    if (block === "planks" && inventory.planks <= 0) return log("Voce precisa de tabuas.");
    if (block === "stone" && inventory.stone <= 0) return log("Voce precisa de pedra.");
    if (block === "torch" && inventory.torch <= 0) return log("Voce precisa de tocha.");
    if (block === "crafting_table" && inventory.planks < 4) return log("Mesa custa 4 tabuas.");
  }
  if (block === "planks") inventory.planks = Math.max(0, inventory.planks - 1);
  if (block === "stone") inventory.stone = Math.max(0, inventory.stone - 1);
  if (block === "torch") inventory.torch = Math.max(0, inventory.torch - 1);
  if (block === "crafting_table") inventory.planks = Math.max(0, inventory.planks - 4);
  world[y][x] = { block, placed: true };
  log(`Voce colocou ${block}.`);
  render();
}

function craft(item) {
  if (item === "planks" && inventory.wood > 0) {
    inventory.wood -= 1;
    inventory.planks += 4;
    return log("Craft: 1 madeira virou 4 tabuas.");
  }
  if (item === "torch" && inventory.wood > 0 && inventory.stone > 0) {
    inventory.wood -= 1;
    inventory.stone -= 1;
    inventory.torch += 4;
    return log("Craft: tochas criadas.");
  }
  log("Receita indisponivel. Use madeira/pedra.");
}

function runCommand(raw) {
  const command = raw.trim();
  const lower = command.toLowerCase().replace(/\s+/g, " ");
  if (!lower.startsWith("/")) return log("Digite comandos com /, exemplo: /gamemode creative");
  const p = lower.split(" ");
  const cmd = p[0];

  if (cmd === "/gamemode") {
    player.mode = p[1] || "survival";
    completed.add("gamemode");
    log(`Modo alterado para ${player.mode}.`);
  } else if (cmd === "/give") {
    const item = (p[2] || "minecraft:stone").replace("minecraft:", "");
    const amount = Math.max(1, Number(p[3] || 1));
    addItem(item, amount);
    completed.add("give");
    log(`Recebido ${amount}x ${item}.`);
  } else if (cmd === "/tp" || cmd === "/teleport") {
    player.x = clamp(Number(p[2]), 0, W - 1);
    player.y = clamp(Number(p[3]), 0, H - 1);
    completed.add("tp");
    log(`Teleportado para ${player.x}, ${player.y}.`);
  } else if (cmd === "/time") {
    time = p[2] === "night" ? "night" : "day";
    completed.add("time");
    log(`Tempo: ${time}.`);
  } else if (cmd === "/weather") {
    weather = p[1] || "clear";
    completed.add("weather");
    log(`Clima: ${weather}.`);
  } else if (cmd === "/gamerule") {
    completed.add("gamerule");
    log(`${p[1]} = ${p[2]}.`);
  } else if (cmd === "/setblock") {
    const x = clamp(Number(p[1]), 0, W - 1);
    const y = clamp(Number(p[2]), 0, H - 1);
    const block = (p[3] || "minecraft:stone").replace("minecraft:", "");
    world[y][x] = { block, placed: true };
    completed.add("setblock");
    log(`Bloco ${block} colocado em ${x}, ${y}.`);
  } else if (cmd === "/summon") {
    const type = (p[1] || "minecraft:cow").replace("minecraft:", "");
    mobs.push({ type, x: clamp(Number(p[2] || player.x), 0, W - 1), y: clamp(Number(p[3] || player.y), 0, H - 1) });
    completed.add("summon");
    log(`${type} invocado.`);
  } else if (cmd === "/kill") {
    if (lower.includes("zombie")) mobs = mobs.filter(m => m.type !== "zombie");
    else mobs = [];
    completed.add("kill");
    log("Entidades removidas.");
  } else if (cmd === "/difficulty" || cmd === "/effect" || cmd === "/enchant" || cmd === "/locate" || cmd === "/seed" || cmd === "/help") {
    completed.add(cmd.slice(1));
    log(`Comando ${cmd} aprendido. Veja como ele funciona no livro.`);
  } else {
    const known = commands.find(([name]) => `/${name}` === cmd);
    log(known ? `Comando ${cmd} existe no Minecraft Java. Este simulador explica no livro.` : "Comando nao encontrado no livro.");
  }
  render();
}

function tickSurvival() {
  if (player.mode !== "survival") return;
  player.hunger = Math.max(0, player.hunger - 1);
  if (mobs.some(m => m.type === "zombie" && Math.abs(m.x - player.x) <= 1 && Math.abs(m.y - player.y) <= 1)) {
    player.health = Math.max(0, player.health - 2);
    log("Zumbi perto. Use /kill, fuja ou mude para creative.");
  }
  if (player.hunger === 0) player.health = Math.max(0, player.health - 1);
}

function addItem(item, amount) {
  const key = item.replace("minecraft:", "");
  inventory[key] = (inventory[key] || 0) + amount;
}

function hasBlock(block) {
  return world.flat().some(tile => tile.block === block);
}

function countPlaced() {
  return world.flat().filter(tile => tile.placed).length;
}

function renderBook() {
  const q = searchEl.value.toLowerCase();
  commandBookEl.innerHTML = commands
    .filter(([name, syntax, desc]) => `${name} ${syntax} ${desc}`.toLowerCase().includes(q))
    .map(([name, syntax, desc]) => `<div class="book-entry"><b>/${name}</b><span>${desc}</span><code>${escapeHtml(syntax)}</code></div>`)
    .join("");
}

function log(text) {
  logEl.textContent = text;
}

function clamp(v, min, max) {
  return Number.isNaN(v) ? min : Math.max(min, Math.min(max, v));
}

function escapeHtml(v) {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

document.querySelectorAll("[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeLesson = btn.dataset.tab;
    render();
  });
});

document.querySelectorAll("[data-move]").forEach(btn => {
  btn.addEventListener("click", () => {
    const d = btn.dataset.move;
    move(d === "left" ? -1 : d === "right" ? 1 : 0, d === "up" ? -1 : d === "down" ? 1 : 0);
  });
});

document.querySelector("[data-action='mine']").addEventListener("click", mine);
document.querySelectorAll("[data-build]").forEach(btn => btn.addEventListener("click", () => build(btn.dataset.build)));
$("runCommand").addEventListener("click", () => { runCommand(inputEl.value); inputEl.value = ""; inputEl.focus(); });
inputEl.addEventListener("keydown", e => { if (e.key === "Enter") { runCommand(inputEl.value); inputEl.value = ""; } });
searchEl.addEventListener("input", renderBook);
$("lowMode").addEventListener("change", e => document.body.classList.toggle("low", e.target.checked));

document.addEventListener("keydown", e => {
  if (document.activeElement === inputEl || document.activeElement === searchEl) return;
  if (e.key.toLowerCase() === "w") move(0, -1);
  if (e.key.toLowerCase() === "s") move(0, 1);
  if (e.key.toLowerCase() === "a") move(-1, 0);
  if (e.key.toLowerCase() === "d") move(1, 0);
  if (e.code === "Space") mine();
  if (e.key === "1") build("planks");
  if (e.key === "2") build("stone");
  if (e.key === "3") build("torch");
  if (e.key === "4") build("crafting_table");
});

setInterval(() => {
  if (player.mode === "survival") {
    day += time === "day" ? 0 : 1;
    if (player.hunger < 8) log("Fome baixa. No Minecraft real, coma para regenerar.");
  }
}, 18000);

document.body.classList.add("low");
initWorld();
renderBook();
render();
log("Missao survival iniciada. Quebre arvores, crie tabuas e construa sua primeira base.");
