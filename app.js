const commands = [
  ["advancement", "Jogador", "/advancement grant <jogador> only <avanco>", "Concede, remove ou testa avancos.", "OP"],
  ["attribute", "Entidades", "/attribute <alvo> <atributo> base set <valor>", "Consulta ou altera atributos como vida, dano e velocidade.", "OP"],
  ["ban", "Servidor", "/ban <jogador> [motivo]", "Bane um jogador pelo nome.", "Servidor"],
  ["ban-ip", "Servidor", "/ban-ip <ip|jogador> [motivo]", "Bane um endereco IP.", "Servidor"],
  ["banlist", "Servidor", "/banlist players", "Mostra banimentos de jogadores ou IPs.", "Servidor"],
  ["bossbar", "Interface", "/bossbar add minecraft:vida \"Boss\"", "Cria e controla barras de boss personalizadas.", "OP"],
  ["clear", "Inventario", "/clear <jogador> <item> <quantidade>", "Remove itens do inventario.", "OP"],
  ["clone", "Mundo", "/clone x1 y1 z1 x2 y2 z2 x y z", "Copia uma area para outro lugar.", "OP"],
  ["damage", "Entidades", "/damage <alvo> <quantidade>", "Causa dano por comando.", "1.19.4+"],
  ["data", "NBT", "/data get entity <alvo>", "Le ou altera dados de entidades, blocos e armazenamento.", "Avancado"],
  ["datapack", "Mundo", "/datapack list", "Ativa, desativa e lista datapacks.", "OP"],
  ["debug", "Desempenho", "/debug start", "Gera diagnostico de desempenho.", "OP"],
  ["defaultgamemode", "Jogador", "/defaultgamemode survival", "Define o modo padrao para novos jogadores.", "OP"],
  ["deop", "Servidor", "/deop <jogador>", "Remove permissao de operador.", "Servidor"],
  ["difficulty", "Mundo", "/difficulty peaceful", "Muda dificuldade do mundo.", "OP"],
  ["effect", "Entidades", "/effect give @p minecraft:speed 60 1", "Aplica ou remove efeitos.", "OP"],
  ["enchant", "Inventario", "/enchant @p minecraft:sharpness 5", "Encanta o item segurado.", "OP"],
  ["execute", "Avancado", "/execute as @e[type=zombie] at @s run say oi", "Executa comandos com contexto, posicao e condicoes.", "Avancado"],
  ["experience", "Jogador", "/experience add @p 10 levels", "Adiciona, remove ou consulta XP. Tambem aceita /xp.", "OP"],
  ["fill", "Mundo", "/fill x1 y1 z1 x2 y2 z2 minecraft:stone", "Preenche uma area com blocos.", "OP"],
  ["fillbiome", "Mundo", "/fillbiome x1 y1 z1 x2 y2 z2 minecraft:plains", "Troca bioma de uma area.", "1.19.3+"],
  ["forceload", "Mundo", "/forceload add x z", "Mantem chunks carregados.", "OP"],
  ["function", "Datapack", "/function namespace:nome", "Executa uma funcao de datapack.", "Avancado"],
  ["gamemode", "Jogador", "/gamemode creative @p", "Muda modo de jogo.", "OP"],
  ["gamerule", "Mundo", "/gamerule keepInventory true", "Altera regras do mundo.", "OP"],
  ["give", "Inventario", "/give @p minecraft:diamond 64", "Entrega itens.", "OP"],
  ["help", "Basico", "/help give", "Mostra ajuda dos comandos.", "Livre"],
  ["item", "Inventario", "/item replace entity @p weapon.mainhand with minecraft:diamond_sword", "Edita itens em slots.", "OP"],
  ["jfr", "Desempenho", "/jfr start", "Ferramenta de profiling Java Flight Recorder.", "Servidor"],
  ["kick", "Servidor", "/kick <jogador> [motivo]", "Expulsa jogador do servidor.", "Servidor"],
  ["kill", "Entidades", "/kill @e[type=minecraft:zombie]", "Remove entidades ou mata jogador.", "OP"],
  ["list", "Servidor", "/list", "Lista jogadores online.", "Livre"],
  ["locate", "Exploracao", "/locate structure minecraft:village", "Encontra estruturas, biomas ou pontos de interesse.", "OP"],
  ["loot", "Inventario", "/loot give @p loot minecraft:chests/simple_dungeon", "Gera loot de tabelas.", "OP"],
  ["me", "Chat", "/me encontrou diamantes", "Envia acao no chat.", "Livre"],
  ["msg", "Chat", "/msg <jogador> ola", "Mensagem privada. Tambem /tell e /w.", "Livre"],
  ["op", "Servidor", "/op <jogador>", "Da permissao de operador.", "Servidor"],
  ["pardon", "Servidor", "/pardon <jogador>", "Remove banimento de jogador.", "Servidor"],
  ["pardon-ip", "Servidor", "/pardon-ip <ip>", "Remove banimento de IP.", "Servidor"],
  ["particle", "Visual", "/particle minecraft:flame ~ ~1 ~ 0.3 0.3 0.3 0 20", "Cria particulas.", "OP"],
  ["perf", "Desempenho", "/perf start", "Coleta metricas de performance do servidor.", "Servidor"],
  ["place", "Mundo", "/place feature minecraft:oak", "Coloca features, estruturas ou jigsaws.", "OP"],
  ["playsound", "Audio", "/playsound minecraft:block.note_block.pling master @p", "Toca sons para jogadores.", "OP"],
  ["publish", "Servidor", "/publish", "Abre mundo singleplayer para LAN.", "Dono"],
  ["random", "Avancado", "/random roll 1..100", "Gera valores aleatorios.", "1.20.2+"],
  ["recipe", "Jogador", "/recipe give @p *", "Libera ou remove receitas.", "OP"],
  ["reload", "Datapack", "/reload", "Recarrega datapacks.", "OP"],
  ["return", "Datapack", "/return 1", "Retorna valor em funcoes.", "Avancado"],
  ["ride", "Entidades", "/ride @p mount @e[type=horse,limit=1]", "Controla montaria entre entidades.", "OP"],
  ["save-all", "Servidor", "/save-all flush", "Salva o mundo do servidor.", "Servidor"],
  ["save-off", "Servidor", "/save-off", "Desliga salvamento automatico.", "Servidor"],
  ["save-on", "Servidor", "/save-on", "Liga salvamento automatico.", "Servidor"],
  ["say", "Chat", "/say servidor reiniciando", "Envia mensagem como servidor.", "OP"],
  ["schedule", "Datapack", "/schedule function pack:tick 10s", "Agenda funcao para depois.", "Avancado"],
  ["scoreboard", "Avancado", "/scoreboard objectives add pontos dummy", "Cria placares, variaveis e contadores.", "Avancado"],
  ["seed", "Mundo", "/seed", "Mostra seed do mundo.", "Permissao"],
  ["setblock", "Mundo", "/setblock ~ ~ ~ minecraft:diamond_block", "Coloca um bloco em uma coordenada.", "OP"],
  ["setidletimeout", "Servidor", "/setidletimeout 10", "Expulsa inativos apos minutos.", "Servidor"],
  ["setworldspawn", "Mundo", "/setworldspawn ~ ~ ~", "Define spawn global.", "OP"],
  ["spawnpoint", "Jogador", "/spawnpoint @p ~ ~ ~", "Define spawn de jogador.", "OP"],
  ["spectate", "Jogador", "/spectate <alvo> <jogador>", "Faz jogador espectar entidade.", "OP"],
  ["spreadplayers", "Jogador", "/spreadplayers 0 0 20 80 false @a", "Espalha jogadores/entidades.", "OP"],
  ["stop", "Servidor", "/stop", "Desliga o servidor.", "Servidor"],
  ["stopsound", "Audio", "/stopsound @a", "Para sons.", "OP"],
  ["summon", "Entidades", "/summon minecraft:zombie ~ ~ ~", "Invoca entidades.", "OP"],
  ["tag", "Entidades", "/tag @p add builder", "Adiciona tags em entidades.", "OP"],
  ["team", "Servidor", "/team add azul", "Cria e gerencia times.", "OP"],
  ["teammsg", "Chat", "/teammsg vamos", "Mensagem para time. Tambem /tm.", "Time"],
  ["teleport", "Jogador", "/tp @p 0 80 0", "Teleporta jogadores ou entidades. Tambem /tp.", "OP"],
  ["tellraw", "Chat", "/tellraw @a {\"text\":\"Ola\",\"color\":\"aqua\"}", "Mensagem JSON personalizada.", "Avancado"],
  ["tick", "Desempenho", "/tick rate 20", "Controla velocidade de ticks em mundos com permissao.", "1.20.3+"],
  ["time", "Mundo", "/time set day", "Controla horario.", "OP"],
  ["title", "Interface", "/title @a title {\"text\":\"Bem-vindo\"}", "Mostra titulo/subtitulo/actionbar.", "OP"],
  ["transfer", "Servidor", "/transfer <host> [porta] [jogadores]", "Move jogadores para outro servidor.", "1.20.5+"],
  ["trigger", "Jogador", "/trigger home", "Ativa objetivos permitidos no scoreboard.", "Datapack"],
  ["weather", "Mundo", "/weather clear", "Muda clima.", "OP"],
  ["whitelist", "Servidor", "/whitelist add <jogador>", "Controla lista de entrada no servidor.", "Servidor"],
  ["worldborder", "Mundo", "/worldborder set 1000", "Controla borda do mundo.", "OP"]
].map(([name, category, syntax, description, tag]) => ({ name, category, syntax, description, tag }));

const examples = [
  "/gamemode creative @p",
  "/gamerule keepInventory true",
  "/time set day",
  "/weather clear",
  "/give @p minecraft:torch 64",
  "/tp @p 0 80 0",
  "/difficulty easy",
  "/spawnpoint @p ~ ~ ~"
];

const $ = (id) => document.getElementById(id);
let favorites = JSON.parse(localStorage.getItem("mcFavorites") || "[]");

function init() {
  $("totalCommands").textContent = commands.length;
  buildCategories();
  renderCommands();
  renderExamples();
  renderCheatSheet();
  renderFavorites();

  $("search").addEventListener("input", renderCommands);
  $("categoryFilter").addEventListener("change", renderCommands);
  $("ecoMode").addEventListener("change", (event) => {
    document.body.classList.toggle("eco", event.target.checked);
    localStorage.setItem("mcEco", event.target.checked ? "1" : "0");
  });
  $("ecoMode").checked = localStorage.getItem("mcEco") === "1";
  document.body.classList.toggle("eco", $("ecoMode").checked);

  document.querySelectorAll(".nav").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
}

function buildCategories() {
  const categories = ["Todas", ...new Set(commands.map((command) => command.category).sort())];
  $("categoryFilter").innerHTML = categories.map((category) => `<option>${category}</option>`).join("");
}

function switchView(view) {
  document.querySelectorAll(".nav").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active-view", section.id === view));
}

function renderCommands() {
  const query = $("search").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const filtered = commands.filter((command) => {
    const matchesCategory = category === "Todas" || command.category === category;
    const text = `${command.name} ${command.category} ${command.syntax} ${command.description}`.toLowerCase();
    return matchesCategory && text.includes(query);
  });
  $("commandList").innerHTML = filtered.map(cardTemplate).join("") || `<div class="panel">Nada encontrado.</div>`;
  bindFavoriteButtons();
}

function cardTemplate(command) {
  const active = favorites.includes(command.name);
  return `
    <article class="card">
      <button class="fav" data-command="${command.name}" title="Favoritar">${active ? "★" : "☆"}</button>
      <h3>/${command.name}</h3>
      <p>${command.description}</p>
      <code class="syntax">${escapeHtml(command.syntax)}</code>
      <span class="tag">${command.category}</span>
      <span class="tag">${command.tag}</span>
    </article>
  `;
}

function bindFavoriteButtons() {
  document.querySelectorAll(".fav").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.command;
      favorites = favorites.includes(name) ? favorites.filter((item) => item !== name) : [...favorites, name];
      localStorage.setItem("mcFavorites", JSON.stringify(favorites));
      renderCommands();
      renderFavorites();
    });
  });
}

function renderFavorites() {
  const favoriteCommands = commands.filter((command) => favorites.includes(command.name));
  $("favoriteList").innerHTML = favoriteCommands.map(cardTemplate).join("") || `<p class="muted">Nenhum favorito ainda.</p>`;
  bindFavoriteButtons();
}

function renderExamples() {
  $("safeExamples").innerHTML = examples.map((example) => `<code class="syntax">${escapeHtml(example)}</code>`).join("");
}

function renderCheatSheet() {
  const rows = [
    ["Criativo", "/gamemode creative"],
    ["Sobrevivencia", "/gamemode survival"],
    ["Dia", "/time set day"],
    ["Sem chuva", "/weather clear"],
    ["Manter inventario", "/gamerule keepInventory true"],
    ["Dar comida", "/give @p minecraft:cooked_beef 32"],
    ["TP para base", "/tp @p X Y Z"],
    ["Achar vila", "/locate structure minecraft:village"],
    ["Spawn aqui", "/setworldspawn ~ ~ ~"],
    ["Limpar mobs", "/kill @e[type=!player,distance=..80]"]
  ];
  $("cheatSheet").innerHTML = rows.map(([label, command]) => `<p><b>${label}</b><br><code>${escapeHtml(command)}</code></p>`).join("");
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

init();
