// SETTING UP LOCAL SERVER REMINDER!!!!

// cd <drag in full directory> ENTER

// type in "node index.js"

// PRESTO

const Filter = require("bad-words");

require('dotenv').config();

const ciqlJson = require("ciql-json");

const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT);

app.use(express.static("public"));

console.log("Server online");

const socket = require("socket.io");

const io = socket(server, {
  cors: {
    methods: ["GET", "PATCH", "POST", "PUT"],
    origin: true,
    credentials: true
  }
});

const Matter = require("matter-js");

const functions = require("./raycast.js");

let messageLoad = [];

let ticks = 0,
lastTime = Date.now();

const tickRate = 50;

const Engine = Matter.Engine,
  World = Matter.World,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  engine = Engine.create(void 0),
  world = engine.world;
const runner14832948 = Matter.Runner.run(engine);

let imageBodyList = [];

engine.gravity.y = 0;

class bullet {
  coordinates = { start: {}, finish: {} };
  emitter;
  angle;
  timeLeft;
  tracerLength;
  collisionSurface = [];
  shouldEjectCartridge;

  constructor(coordinates, emitter, angle, timeLeft, collisionSurface, shouldEjectCartridge) {
    this.coordinates = coordinates;
    this.emitter = emitter;
    this.angle = angle;
    this.timeLeft = timeLeft;
    this.collisionSurface = collisionSurface;
    this.tracerLength = squaredDist({x: coordinates.start.x, y: coordinates.start.y}, {x: coordinates.finish.x, y: coordinates.finish.y});
    this.shouldEjectCartridge = shouldEjectCartridge;
  }
}

class weapon {
  name;
  type;
  magSize;
  view;
  fireDelay;
  spread;
  damage;
  bulletsPerShot;
  handPositions;
  images = {};
  reloadLength;
  roundsPerReload;
  playerDensity;
  damageArea;
  recoilImpulse;
  lifeTime;
  sounds;

  constructor(data) {
    this.name = data.name;
    this.type = data.type;
    if(data.type != "melee") {
      this.magSize = data.magSize;
      this.spread = data.spread;
      this.bulletsPerShot = data.bulletsPerShot;
      this.reloadLength = data.reloadLength;
      this.roundsPerReload = data.roundsPerReload;
      this.damageArea = {};
      this.lifeTime = data.lifeTime;
    } else {
      this.magSize = 1;
      this.spread = 0;
      this.bulletsPerShot = 1;
      this.reloadLength = 1;
      this.roundsPerReload = Infinity;
      this.damageArea = data.damageArea;
      this.lifeTime = 0;
    }
    this.view = data.view;
    this.fireDelay = data.fireDelay;
    this.damage = data.damage;
    this.handPositions = data.handPositions;
    this.images = data.images;
    this.playerDensity = data.playerDensity;
    this.recoilImpulse = data.recoilImpulse;
    this.sounds = data.sounds;
  }
}

class particle {
  position;
  rotation;
  angle;
  colour;
  opacity;
  src;
  size;
  type;

  constructor(position, rotation, angle, colour, opacity, src, size, type) {
    this.position = position;
    this.rotation = rotation;
    this.angle = angle;
    this.colour = colour;
    this.opacity = opacity;
    this.src = src;
    this.size = size;
    this.type = type;
  }
}

class playerLike {
  #body;
  get body() { return this.#body; }
  guns; // array of guns in inventory
  health; // self explanatory, out of 100
  view; // fov
  keys = []; // list of all keys on the keyboard, in order of keycodes
  team; // red or blue
  platform;
  state = {
    fireTimer: 0,
    isReloading: false,
    reloadProgress: 0,
    angle: 0,
    previousPosition: 0,
    isMoving: false,
    position: {},
    previousPosition: {x: 0, y: 0},
    spawnNumber: 0,
    recoilTimer: 0,
    spawnpoint: {},
    mag: [0, 0, 0],
    activeWeaponIndex: 0,
    hasStarted: false,
    objectRenderList: [],
    ping: 0,
    force: {x: 0, y: 0},
  };

  constructor(body, angle, guns, health, view, team, platform) {
    this.#body = body;
    this.state.angle = angle;
    this.view = view;
    this.guns = guns;
    this.health = health;
    this.view = view;
    this.team = team;
    this.state.isMoving = false;
    this.platform = platform;
    this.state.position = body.position;
    this.state.previousPosition = {x: body.position.x / 1, y: body.position.y / 1};
  }
  destroy() {
    this.#body = void 0;
  }
}

let gameData = {
  mapData: ciqlJson.open("maps/dm_dunes.json").data,
  teamNumbers: { "blue": 0, "red": 0 },
  roundsWonScore: {"blue": 0, "red": 0},
  currentRoundScore: { "blue": 0, "red": 0 },
  secondsLeft: 360,
  players: {},
  objects: [],
  bullets: [],
  particles: [],
  scoreboard: {},
  point: {},
  usersOnline: 0,
  users: [],
  certificate: "",
  queuedSounds: [],
  weapons: {},
  loadouts: ciqlJson.open("maps/dm_dunes.json").data.config.loadouts,
  lastTickDelay: tickRate,
  shouldUpdateUI: false,
  shouldUpdateScoreboard: false,
  usernameFilter: new Filter({placeHolder: "*"})
};

function squaredDist(ptA, ptB) {
  return (ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2;
}

function fillWeapons() {
  const gunAPI = ciqlJson.open("public/api/weapons.json").data.weapons;
  for(let i = 0; i < gunAPI.length; i++) {
    gameData.weapons[gunAPI[i].name] = new weapon(gunAPI[i]);
  }
}

function initialize() {  
  Composite.clear(world, false);
  imageBodyList = [];
  for (let i = 0; i < gameData.mapData.obstacles.length; i++) {
    let obstacle = gameData.mapData.obstacles[i]["body-data"],
    body;
    if(obstacle.options.chamfer) {
      gameData.mapData.obstacles[i]["display-data"].chamfer = obstacle.options.chamfer.radius;
    } else {
      gameData.mapData.obstacles[i]["display-data"].chamfer = 0;
    }
    switch (obstacle.type) {
      case "rectangle":
        body = Bodies.rectangle(obstacle.position.x, obstacle.position.y, obstacle.dimensions.width, obstacle.dimensions.height, obstacle.options);
      break;
      case "circle": 
        body = Bodies.circle(obstacle.position.x, obstacle.position.y, obstacle.radius, obstacle.options);
      break;
    }
    body.tag = JSON.stringify({colour: body.tag});
    Composite.add(world, body);
    console
    imageBodyList.push(
      Bodies.rectangle(
        obstacle.position.x + gameData.mapData.obstacles[i]["display-data"].offset.x, 
        obstacle.position.y + gameData.mapData.obstacles[i]["display-data"].offset.y, 
        gameData.mapData.obstacles[i]["display-data"].dimensions.width, 
        gameData.mapData.obstacles[i]["display-data"].dimensions.height, 
        {
          angle: (gameData.mapData.obstacles[i]["display-data"].offset.angle * Math.PI / 180),
          tag: "" + i
        }
      )
    );
  }
  if(gameData.mapData.config.gamemode == "hardpoint") {
    gameData.point = {
      position: gameData.mapData.config.point.position,
      state: "uncontested",
      teamNumbers: {
        blue: 0,
        red: 0,
      }
    }
  }
  fillWeapons();
}

initialize();

let updateCertificate = setInterval(function() { gameData.certificate = Math.random() * 5 + ""; }, 10000),
updatePoint = setInterval(function() {
  if(gameData.mapData.config.gamemode == "hardpoint") {
    gameData.point.teamNumbers.blue = 0,
    gameData.point.teamNumbers.red = 0;
    let playerBodies = [];
    for(let i = 0; i < gameData.users.length; i++) {
      if(gameData.players[gameData.users[i]].health > 0) {
        playerBodies.push(gameData.players[gameData.users[i]].body);
      }
    }
    let collisions = Matter.Query.collides(Bodies.rectangle(gameData.mapData.config.point.position.x, gameData.mapData.config.point.position.y, 1570, 1570, {chamfer: {radius: 50}}), playerBodies);
    gameData.point.state = "uncontested";
    if(collisions[0]) {
      for(let i = 0; i < collisions.length; i++) {
        gameData.point.teamNumbers[JSON.parse(collisions[i].bodyA.tag).colour]++;
        gameData.scoreboard[JSON.parse(collisions[i].bodyA.tag).id].score += 50;
      }
      if(gameData.point.teamNumbers.red > gameData.point.teamNumbers.blue) {
        gameData.currentRoundScore.red++;
        gameData.point.state = "red";
      } else if(gameData.point.teamNumbers.blue > gameData.point.teamNumbers.red) {
        gameData.currentRoundScore.blue++;
        gameData.point.state = "blue";
      }
      gameData.shouldUpdateUI = true;
      gameData.shouldUpdateScoreboard = true;
    } 
  }
}, 2000),
updateSecondsLeft = setInterval(function() {
  if(gameData.users.length > 0) {
    gameData.secondsLeft--;
  }
  if(gameData.secondsLeft < -10) {
    initialize();
    gameData.secondsLeft = 360;
    gameData.shouldUpdateUI = true;
    for(let i = 0; i < gameData.users.length; i++) {
      gameData.scoreboard[gameData.users[i]] = {
        nickname: gameData.scoreboard[gameData.users[i]].nickname,
        kills: 0,
        deaths: 0,
        score: 0,
        damage: 0
      };
    }
    gameData.shouldUpdateScoreboard = true;
    gameData.currentRoundScore = { "blue": 0, "red": 0 };
  }
  if(gameData.secondsLeft == 0) {
    gameData.shouldUpdateUI = true;
  }
  if(gameData.secondsLeft < 1) {
    for(let i = 0; i < gameData.users.length; i++) {
      gameData.players[gameData.users[i]].keys = [];
      gameData.players[gameData.users[i]].health = 0;
      gameData.players[gameData.users[i]].state.hasStarted = false;
      Composite.remove(world, gameData.players[gameData.users[i]].body);
    }
  }
}, 1000);

function updatePlayerPrev() {
  for(let i = 0; i < gameData.users.length; i++) {
    const body = gameData.players[gameData.users[i]].body,
    player = gameData.players[gameData.users[i]];

    player.state.previousPosition = {x: body.position.x / 1, y: body.position.y / 1};
    player.state.previousAngle = player.state.angle;
  }
}

function updatePlayer(player, delay, id) {
  const w = !!player.keys[83],
    a = !!player.keys[65],
    s = !!player.keys[87],
    d = !!player.keys[68],
    body = player.body,
    base = player.body.circleRadius / (14.14);

  player.state.force = {x: (player.state.position.x - player.state.previousPosition.x), y: (player.state.position.y - player.state.previousPosition.y)};

  if(w || s) {
    Body.setVelocity(body, {
      x: body.velocity.x,
      y: +(w ^ s) && (((a ^ d) ? 0.7071 : 1) * [-1, 1][+w] * base * delay / 1.5 / (body.density / 0.15))
    });
  }
  if(a || d) {
    Body.setVelocity(body, {
      x: +(a ^ d) && (((w ^ s) ? 0.7071 : 1) * [-1, 1][+d] * base * delay / 1.5 / (body.density / 0.15)),
      y: body.velocity.y
    });
  }

  player.state.isMoving = !!Math.floor(Math.abs(player.state.force.x)) || !!Math.floor(Math.abs(player.state.force.y));

  if(player.keys[950]) {
    const position = { x: player.state.position.x, y: player.state.position.y },
    currentWeapon = gameData.weapons[player.guns[player.state.activeWeaponIndex]];
    let randomAngleOffset = (Math.random() - 0.5) * currentWeapon.spread.standing;
    let activeWeaponSpread = currentWeapon.spread.standing;
    if(player.state.isMoving) {
      randomAngleOffset = (Math.random() - 0.5) * currentWeapon.spread.moving;
      activeWeaponSpread = currentWeapon.spread.moving;
    }
    const bulletLength = gameData.mapData.config["map-dimensions"].width + gameData.mapData.config["map-dimensions"].height;
    if (player.state.fireTimer > currentWeapon.fireDelay && player.state.mag[player.state.activeWeaponIndex] > 0 && player.state.hasStarted && player.health > 0 && !player.state.isReloading) {
      if(currentWeapon.type == "melee") {
        const angle = player.state.angle * Math.PI / 180 - Math.PI;
        let playerBodies = [];
        for(let i = 0; i < gameData.users.length; i++) {
          if(gameData.users[i] != socket.id) {
            playerBodies.push(gameData.players[gameData.users[i]].body);
          }
        }
        const collisions = Matter.Query.collides(Matter.Bodies.circle(player.state.position.x + Math.cos(angle) * 300, player.state.position.y + Math.sin(angle) * 300, 150), playerBodies);
        player.state.recoilTimer = 1;
        player.state.fireTimer = 0;
        if(collisions[0]) {
          const ray = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos(Math.atan2(collisions[0].bodyA.position.y - position.y, collisions[0].bodyA.position.x - position.x)) * 300, y: player.state.position.y + Math.sin(Math.atan2(collisions[0].bodyA.position.y - position.y, collisions[0].bodyA.position.x - position.x)) * 300 }, true);
          if(ray[1] && ray[1].body == collisions[0].bodyA) {
            gameData.particles.push(new particle({x: ray[1].point.x / 1, y: ray[1].point.y / 1}, Math.random() * 360, player.state.angle * Math.PI / 180 + (Math.random() - 2) * 1 + Math.PI / 2, JSON.parse(ray[1].body.tag).colour, 250, "/assets/misc/particle.svg", 100, "residue"));
            if(JSON.parse(collisions[0].bodyA.tag).colour != JSON.parse(player.body.tag).colour) {
              for(let i = 0; i < gameData.users.length; i++) {
                if(gameData.players[gameData.users[i]].body == collisions[0].bodyA) {
                  gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                  gameData.shouldUpdateScoreboard = true;
                  gameData.scoreboard[id].damage += currentWeapon.damage;
                  if (gameData.players[gameData.users[i]].health < 1) {   
                    for(let k = 0; k < 7; k++) {
                      const angle = Math.random() * Math.PI * 2;
                      gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                    }  
                    gameData.players[gameData.users[i]].health = 0;
                    //Body.setPosition(gameData.players[gameData.users[i]].body, gameData.players[gameData.users[i]].state.spawnpoint);
                    gameData.players[gameData.users[i]].state.hasStarted = false;
                    Composite.remove(world, gameData.players[gameData.users[i]].body);
                    gameData.players[gameData.users[i]].keys = [];
                    gameData.currentRoundScore[player.team] += 1;
                    gameData.scoreboard[id].kills++;
                    gameData.scoreboard[id].score += 100;
                    gameData.scoreboard[gameData.users[i]].deaths++;
                    gameData.players[gameData.users[i]].state.mag[0] = gameData.weapons[gameData.players[gameData.users[i]].guns[0]].magSize;
                    gameData.players[gameData.users[i]].state.mag[1] = gameData.weapons[gameData.players[gameData.users[i]].guns[1]].magSize;
                    gameData.players[gameData.users[i]].state.isReloading = false;
                  }
                }
              }
            }
          }
        }
      } else {
        player.state.mag[player.state.activeWeaponIndex]--;
        player.state.reloadProgress = 0;
        if (currentWeapon.bulletsPerShot > 1) {
          for (let j = 0; j < currentWeapon.bulletsPerShot; j++) {
            let angle = ((player.state.angle + (activeWeaponSpread / currentWeapon.bulletsPerShot) * (j - Math.floor(currentWeapon.bulletsPerShot / 2))) + (Math.random() - 0.5) * activeWeaponSpread / 30) * Math.PI / 180 - Math.PI;
            let ray = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos(angle) * bulletLength, y: player.state.position.y + Math.sin(angle) * bulletLength }, true);
            let finish = ray[1].point;
            for (let i = 0; i < gameData.users.length; i++) {
              if (gameData.players[gameData.users[i]].body == ray[1].body && gameData.players[gameData.users[i]] != player) {
                finish = ray[1].point;
                if (gameData.players[gameData.users[i]].team != player.team) {
                  gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                  gameData.shouldUpdateScoreboard = true;
                  gameData.scoreboard[id].damage += currentWeapon.damage;
                  if (gameData.players[gameData.users[i]].health < 1) {    
                    for(let k = 0; k < 7; k++) {
                      const angle = Math.random() * Math.PI * 2;
                      gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                    }  
                    gameData.players[gameData.users[i]].health = 0;
                    gameData.players[gameData.users[i]].state.hasStarted = false;
                    Composite.remove(world, gameData.players[gameData.users[i]].body);
                    gameData.players[gameData.users[i]].keys = [];
                    gameData.currentRoundScore[player.team] += 1;
                    gameData.scoreboard[id].kills++;
                    gameData.scoreboard[id].score += 100;
                    gameData.scoreboard[gameData.users[i]].deaths++;
                    gameData.players[gameData.users[i]].state.mag[0] = gameData.weapons[gameData.players[gameData.users[i]].guns[0]].magSize;
                    gameData.players[gameData.users[i]].state.mag[1] = gameData.weapons[gameData.players[gameData.users[i]].guns[1]].magSize;
                    gameData.players[gameData.users[i]].state.isReloading = false;
                  }
                }
              }
            }
            let shouldEjectCartridge = false;
            if(j == 0) {
              shouldEjectCartridge = true;
            }
            gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, player.state.angle + (activeWeaponSpread / currentWeapon.bulletsPerShot) * (j - Math.floor(currentWeapon.bulletsPerShot / 2)), currentWeapon.lifeTime, [{x: ray[1].verts[0].x, y: ray[1].verts[0].y, colour: JSON.parse(ray[1].body.tag).colour}, {x: ray[1].verts[1].x, y: ray[1].verts[1].y, colour: JSON.parse(ray[1].body.tag).colour}], shouldEjectCartridge));
          }
          player.state.fireTimer = 0;
        } else {
          let ray = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength }, true);
          let finish = ray[1].point;
          for (let i = 0; i < gameData.users.length; i++) {
            if (gameData.players[gameData.users[i]].body == ray[1].body && gameData.players[gameData.users[i]] != player) {
              finish = ray[1].point;
              if (gameData.players[gameData.users[i]].team != player.team) {
                gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                gameData.shouldUpdateScoreboard = true;
                gameData.scoreboard[id].damage += currentWeapon.damage;
                if (gameData.players[gameData.users[i]].health < 1) {
                  for(let k = 0; k < 7; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                  }  
                  gameData.players[gameData.users[i]].health = 0;
                  gameData.players[gameData.users[i]].state.hasStarted = false;
                  Composite.remove(world, gameData.players[gameData.users[i]].body);
                  gameData.players[gameData.users[i]].keys = [];
                  gameData.currentRoundScore[player.team] += 1;
                  gameData.scoreboard[id].kills++;
                  gameData.scoreboard[id].score += 100;
                  gameData.scoreboard[gameData.users[i]].deaths++;
                  gameData.players[gameData.users[i]].state.mag[0] = gameData.weapons[gameData.players[gameData.users[i]].guns[0]].magSize;
                  gameData.players[gameData.users[i]].state.mag[1] = gameData.weapons[gameData.players[gameData.users[i]].guns[1]].magSize;                    
                  gameData.players[gameData.users[i]].state.isReloading = false;
                }
              }
            }
          }
          gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, player.state.angle + randomAngleOffset, currentWeapon.lifeTime, [{x: ray[1].verts[0].x, y: ray[1].verts[0].y, colour: JSON.parse(ray[1].body.tag).colour}, {x: ray[1].verts[1].x, y: ray[1].verts[1].y, colour: JSON.parse(ray[1].body.tag).colour}], true));
          player.state.fireTimer = 0;
        }
        player.state.recoilTimer = 1;
      }
      gameData.shouldUpdateUI = true;
      gameData.queuedSounds.push({path: currentWeapon.sounds.fire, origin: player.state.position});
    }
    if(player.state.mag[player.state.activeWeaponIndex] <= 0 && !player.state.isReloading) {
      player.state.isReloading = true;
      player.state.reloadProgress = 0;
      gameData.queuedSounds.push({path: currentWeapon.sounds.reload, origin: player.state.position});
    }
  }
}

function updateGame() {
  if (gameData.usersOnline > 0) {
    let time = Date.now();
    
    const tickDelay = ((time - lastTime) / 25);
    gameData.lastTickDelay = (time - lastTime);

    lastTime = Date.now();
    for (let x = 0; x < gameData.users.length; x++) {
      const player = gameData.players[gameData.users[x]];
      const currentWeapon = gameData.weapons[player.guns[player.state.activeWeaponIndex]];
      player.state.fireTimer+=tickDelay;
      if (player.state.recoilTimer > 0) {
        player.state.recoilTimer -= 1 / 7 * tickDelay;
      }
      if(player.state.isReloading) {
        if(player.state.reloadProgress >= currentWeapon.reloadLength) {
          if(currentWeapon.roundsPerReload == "all") {
            player.state.isReloading = false;
            player.state.mag[player.state.activeWeaponIndex] = currentWeapon.magSize;
          } else {
            player.state.mag[player.state.activeWeaponIndex] += currentWeapon.roundsPerReload;
            if(player.state.mag[player.state.activeWeaponIndex] >= currentWeapon.magSize) {
              player.state.isReloading = false;
            } else {
              gameData.queuedSounds.push({path: currentWeapon.sounds.reload, origin: player.state.position});
            }
          }
          player.state.reloadProgress = 0;
          player.state.fireTimer = currentWeapon.fireDelay - 5;
        } else {
          player.state.reloadProgress+=tickDelay;
        }
        gameData.shouldUpdateUI = true;
      }
      updatePlayer(player, tickDelay, gameData.users[x]);
    }
    for(let x = 0; x < gameData.users.length; x++) {
      io.to(gameData.users[x]).emit("world-update", {
        players: gameData.players,
        bullets: gameData.bullets,
        particles: gameData.particles,
        usersOnline: gameData.usersOnline,
        secondsLeft: gameData.secondsLeft,
        users: gameData.users,
        point: gameData.point,
        scoreboard: gameData.scoreboard,
        currentRoundScore: gameData.currentRoundScore,
        certificate: gameData.certificate,
        queuedSounds: gameData.queuedSounds,
        lastTickDelay: gameData.lastTickDelay,
        shouldUpdateUI: gameData.shouldUpdateUI,
        shouldUpdateScoreboard: gameData.shouldUpdateScoreboard
      });
    }
    gameData.bullets = [],
    gameData.particles = [];
    gameData.queuedSounds = [];
    gameData.shouldUpdateUI = false;
    gameData.shouldUpdateScoreboard = false;
    updatePlayerPrev();
  }
}

var updateGameTimer = setInterval(updateGame, tickRate),
updateObjectRenderLists = setInterval(function() {
  for(let i = 0; i < gameData.users.length; i++) {
    const player = gameData.players[gameData.users[i]];

    player.state.objectRenderList = [];
    const collisionList = Matter.Query.collides(Bodies.rectangle(player.state.position.x, player.state.position.y, 5000 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15, 3000 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15), imageBodyList);
    for (let i = 0; i < collisionList.length; i++) {
      player.state.objectRenderList.push(collisionList[i].bodyA.tag / 1);
    }
  }
}, 500);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  socket.on("play-request", (data) => {
    if (gameData.usersOnline < 6) {
      let alreadyExists = false;
      for(let j = 0; j < gameData.users.length; j++) {
        if(gameData.users[j] == socket.id) {
          alreadyExists = true;
        }
      }
      if(gameData.usernameFilter.isProfane(data.nickname + "")) console.log("Inappropriate username blocked from entry");
      if(!alreadyExists && !gameData.usernameFilter.isProfane(data.nickname + "")) {
        console.log(data.nickname + " Has connected");
        gameData.usersOnline++;
        gameData.users.push(socket.id);
        let spawnpoint;
        if (gameData.teamNumbers.blue == gameData.teamNumbers.red || gameData.teamNumbers.blue < gameData.teamNumbers.red) {
          spawnpoint = gameData.mapData.config.spawns.blue[gameData.teamNumbers.blue];
          gameData.teamNumbers.blue++;
        } else {
          spawnpoint = gameData.mapData.config.spawns.red[gameData.teamNumbers.red];
          gameData.teamNumbers.red++;
        }
        gameData.players[socket.id] = new playerLike(
          Bodies.circle(gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, 115, {
            friction: 0,
            restitution: 0,
            inertia: 1,
            density: 0.015,
            frictionAir: 0.25,
            tag: JSON.stringify({colour: spawnpoint.team, id: socket.id}) 
          }),
          0,
          gameData.loadouts["assault"],
          0,
          0,
          spawnpoint.team,
          data.platform || "desktop"
        );
        gameData.players[socket.id].state.mag[gameData.players[socket.id].state.activeWeaponIndex] = gameData.weapons[gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex]].magSize;
        gameData.players[socket.id].state.spawnpoint = spawnpoint;

        gameData.scoreboard[socket.id] = {
          nickname: data.nickname || "Player " + gameData.usersOnline,
          kills: 0,
          deaths: 0,
          score: 0,
          damage: 0
        };
        gameData.shouldUpdateScoreboard = true;
        socket.emit("load-world", gameData);

        socket.on("disconnect", function() {
          if (gameData.players[socket.id]) {
            gameData.teamNumbers[gameData.players[socket.id].team]--;
            gameData.usersOnline--;
            console.log("1 user has disconnected. " + gameData.usersOnline + " players remain connected.");
            Composite.remove(world, gameData.players[socket.id].body);
            gameData.players[socket.id] = void 0;
            gameData.scoreboard[socket.id] = void 0;
            gameData.shouldUpdateScoreboard = true;
            for (let i = 0; i < gameData.users.length; i++) {
              if (gameData.users[i] === socket.id) {
                gameData.users.splice(i, 1);
              }
            }
            if(gameData.users.length == 0) {
              gameData.currentRoundScore = { "blue": 0, "red": 0 };
              gameData.secondsLeft = 360;
            }
          }
        });
        socket.on("move-key-change", (data) => {
          try {
            let player = gameData.players[socket.id];
            if(player.health > 0 && gameData.secondsLeft > 0) {
              if(player.state.hasStarted) {
                player.keys = data.keys;
                if(player.keys[82] && player.state.mag[player.state.activeWeaponIndex] < gameData.weapons[player.guns[player.state.activeWeaponIndex]].magSize && !player.state.isReloading) {
                  player.state.isReloading = true;
                  gameData.queuedSounds.push({path: gameData.weapons[player.guns[player.state.activeWeaponIndex]].sounds.reload, origin: player.state.position});
                }
              }
            }
          }
          catch { }
        });
        socket.on("change-weapon-index", (data) => {
          try {
            const player = gameData.players[socket.id];
            if(player.health > 0) {
              if(data.index != player.state.activeWeaponIndex) {
                player.state.activeWeaponIndex = data.index;
                player.state.isReloading = false;
                player.state.reloadProgress = 0;
                player.state.recoilTimer = 0;
                Body.setDensity(player.body, gameData.weapons[player.guns[player.state.activeWeaponIndex]].playerDensity * 2.5);
                if(player.state.mag[data.index] < 1 && !player.state.isReloading) {
                  player.state.isReloading = true;
                  gameData.queuedSounds.push({path: gameData.weapons[player.guns[player.state.activeWeaponIndex]].sounds.reload, origin: player.state.position});
                }
              }
              gameData.shouldUpdateUI = true;
            }
          }
          catch { }
        });
        socket.on("angle-change", (data) => {
          try {
            if(gameData.players[socket.id].state.hasStarted && data.certificate == gameData.certificate && gameData.players[socket.id].health > 0) {
              gameData.players[socket.id].state.angle = data.angle;
            }
          }
          catch { } 
        });
        socket.on("spawn", (data) => {
          try {
            let player = gameData.players[socket.id];
            if(!player.state.hasStarted || gameData.players[socket.id].health < 0) {
              player.guns = gameData.loadouts[data.class];
              player.state.mag[0] = gameData.weapons[player.guns[0]].magSize;
              player.state.mag[1] = gameData.weapons[player.guns[1]].magSize;
              player.state.mag[2] = gameData.weapons[player.guns[2]].magSize;
              player.state.fireTimer = 1000;
              player.state.hasStarted = true;
              Body.setDensity(player.body, gameData.weapons[player.guns[player.state.activeWeaponIndex]].playerDensity * 2.5);
              player.health = 100;

              const spawn = gameData.mapData.config.spawns[player.team][Math.floor(Math.random() * gameData.mapData.config.spawns[player.team].length)];

              Body.setPosition(player.body, {x: spawn.x, y: spawn.y});
              player.state.previousPosition = {x: spawn.x, y: spawn.y};
              Composite.add(world, player.body);

              gameData.shouldUpdateUI = true;

              player.state.objectRenderList = [];
              const collisionList = Matter.Query.collides(Bodies.rectangle(player.state.position.x, player.state.position.y, 5000 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15, 3000 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15), imageBodyList);
              for (let i = 0; i < collisionList.length; i++) {
                player.state.objectRenderList.push(collisionList[i].bodyA.tag / 1);
              }
            }
          }
          catch { }
        });
        socket.on("ping", (data) => {
          gameData.players[socket.id].state.ping = Date.now() - data.time;
        });
      }
    }
  });
}







