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

let lastTime = Date.now();

let tickRate = 1000 / 20;

const Engine = Matter.Engine,
  World = Matter.World,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  engine = Engine.create(void 0),
  world = engine.world;

let justObstacles = [];
const runner14832948 = Matter.Runner.run(engine, );

let imageBodyList = {nonShootables: [], basic: []};

engine.gravity.y = 0;

class bullet {
  coordinates = { start: {}, finish: {} };
  emitter;
  player;
  angle;
  timeLeft;
  tracerLength;
  collisionSurface = [];
  shouldEjectCartridge;

  constructor(coordinates, emitter, player, angle, timeLeft, collisionSurface, shouldEjectCartridge) {
    this.coordinates = coordinates;
    this.emitter = emitter;
    this.player = player;
    this.angle = angle;
    this.timeLeft = timeLeft;
    this.collisionSurface = collisionSurface;
    this.tracerLength = squaredDist({x: coordinates.start.x, y: coordinates.start.y}, {x: coordinates.finish.x, y: coordinates.finish.y});
    this.shouldEjectCartridge = shouldEjectCartridge;
  }
}

class damageArea {
  position
  team;
  player;
  timestamp;
  damage;
  radius;

  constructor(data) {
    this.position = data.position;
    this.team = data.team;
    this.player = data.player;
    this.timestamp = data.timestamp;
    this.damage = data.damage;
    this.radius = data.radius;
  }
}

class grenade {
  coordinates = { start: {}, finish: {} };
  emitter;
  player;
  angle;
  src;
  rotation;
  throwLength;

  constructor(data) {
    this.coordinates = data.coordinates;
    this.emitter = data.emitter;
    this.player = data.player;
    this.angle = data.angle;
    this.src = data.src;
    this.rotation = data.rotation;
    this.throwLength = squaredDist({x: data.coordinates.start.x, y: data.coordinates.start.y}, {x: data.coordinates.finish.x, y: data.coordinates.finish.y});
  }
}

class weapon {
  name;
  type;
  magSize;
  view;
  fireDelay;
  fireMode;
  spread;
  damage;
  bulletsPerShot;
  handPositions;
  images = {};
  reloadLength;
  roundsPerReload;
  playerDensity;
  damageArea;
  throwLength;
  particleType;
  recoilImpulse;
  lifeTime;
  sounds;

  constructor(data) {
    this.name = data.name;
    this.type = data.type;
    if(data.type == "gun") {
      this.magSize = data.magSize;
      this.spread = data.spread;
      this.bulletsPerShot = data.bulletsPerShot;
      this.reloadLength = data.reloadLength;
      this.roundsPerReload = data.roundsPerReload;
      this.damageArea = {};
      this.lifeTime = data.lifeTime;
    } else if(data.type == "melee") {
      this.magSize = 1;
      this.spread = 0;
      this.bulletsPerShot = 1;
      this.reloadLength = 1;
      this.roundsPerReload = Infinity;
      this.damageArea = data.damageArea;
      this.lifeTime = 0;
    } else if(data.type == "grenade") {
      this.magSize = data.magSize;
      this.spread = data.spread;
      this.bulletsPerShot = 1;
      this.reloadLength = 0;
      this.roundsPerReload = 1;
      this.damageArea = data.damageArea;
      this.lifeTime = 0;
      this.throwLength = data.throwLength;
      this.particleType = data.particleType;
      this.projectileSRC = data.projectileSRC;
    }
    this.dual = data.dual;
    this.view = data.view;
    this.fireDelay = data.fireDelay;
    this.fireMode = data.fireMode;
    this.damage = data.damage;
    this.handPositions = data.handPositions;
    this.images = data.images;
    this.playerDensity = data.playerDensity;
    this.recoilImpulse = data.recoilImpulse;
    this.sounds = data.sounds;
    if(data.dual) {
      this.fireDelay = data.fireDelay / 2;
      this.magSize = data.magSize * 2;
    }
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
  tracerLength;

  constructor(position, rotation, angle, colour, opacity, src, size, type, tracerLength) {
    this.position = position;
    this.rotation = rotation;
    this.angle = angle;
    this.colour = colour;
    this.opacity = opacity;
    this.src = src;
    this.size = size;
    this.type = type;
    this.tracerLength = tracerLength;
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
    spawnpoint: {},
    mag: [0, 0, 0],
    activeWeaponIndex: 0,
    hasStarted: false,
    objectRenderList: {nonShootables: [], basic: []},
    ping: 0,
    force: {x: 0, y: 0},
    hasFiredOnClick: false,
    stepSoundTicker: 0,
    objectRenderListUpdateTicker: 0
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
  mapData: ciqlJson.open("maps/dm_rust.json").data,
  mapPool: ciqlJson.open("public/api/map-pool.json").data,
  serverSettings: ciqlJson.open("public/api/server-settings.json").data.settings,
  teamNumbers: { "blue": 0, "red": 0 },
  roundsWonScore: {"blue": 0, "red": 0},
  currentRoundScore: { "blue": 0, "red": 0 },
  secondsLeft: 360,
  players: {},
  objects: [],
  bullets: [],
  grenades: [],
  damageAreas: [],
  particles: [],
  scoreboard: {},
  point: {},
  usersOnline: 0,
  users: [],
  certificate: "",
  queuedSounds: [],
  weapons: {},
  loadouts: ciqlJson.open("public/api/loadouts.json").data.loadouts,
  lastTickDelay: tickRate,
  shouldUpdateUI: false,
  shouldUpdateScoreboard: false,
  usernameFilter: new Filter({placeHolder: "*"})
};

function squaredDist(ptA, ptB) {
  return (ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2;
}

function restrict(number, min, max) {
  if(number < min) {
    number = min;
  }
  if(number > max) {
    number = max;
  }
  return number;
}

function fillWeapons() {
  const gunAPI = ciqlJson.open("public/api/weapons.json").data.weapons;
  for(let i = 0; i < gunAPI.length; i++) {
    gameData.weapons[gunAPI[i].name] = new weapon(gunAPI[i]);
  }
  const customGunAPI = ciqlJson.open("public/api/custom-weapons.json").data.weapons;
  for(let i = 0; i < customGunAPI.length; i++) {
    gameData.weapons[customGunAPI[i].name] = new weapon(customGunAPI[i]);
  }
}

function initialize() {  
  Composite.clear(world, false);
  justObstacles = [];
  imageBodyList = {nonShootables: [], basic: []};
  gameData.mapData = JSON.parse(JSON.stringify(ciqlJson.open("maps/" + gameData.mapPool.pool[Math.floor(Math.random() * gameData.mapPool.pool.length)] + ".json").data));
  gameData.mapData.nonShootables = [];
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
    body.tag = JSON.stringify({colour: body.tag, material: gameData.mapData.obstacles[i]["display-data"].material});

    Composite.add(world, body);

    if(!gameData.mapData.obstacles[i]["display-data"].ignoreBulletCollisions) {
      justObstacles.push(body);

      imageBodyList.basic.push(
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
    } else {
      gameData.mapData.nonShootables.push(gameData.mapData.obstacles[i]);
      imageBodyList.nonShootables.push(
        Bodies.rectangle(
          obstacle.position.x + gameData.mapData.obstacles[i]["display-data"].offset.x, 
          obstacle.position.y + gameData.mapData.obstacles[i]["display-data"].offset.y, 
          gameData.mapData.obstacles[i]["display-data"].dimensions.width, 
          gameData.mapData.obstacles[i]["display-data"].dimensions.height, 
          {
            angle: (gameData.mapData.obstacles[i]["display-data"].offset.angle * Math.PI / 180),
            tag: "" + gameData.mapData.nonShootables.length - 1
          }
        )
      );
      gameData.mapData.obstacles.splice(i, 1);
      i--;
    }
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
  for(let i = 0; i < gameData.users.length; i++) {
    io.to(gameData.users[i]).emit("load-world", gameData);
  }
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
      updateObjectRenderList(gameData.players[gameData.users[i]]);
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
      y: +(w ^ s) && (((a ^ d) ? 0.7071 : 1) * [-1, 1][+w] * base * 1.25 / (body.density / 0.15))
    });
  }
  if(a || d) {
    Body.setVelocity(body, {
      x: +(a ^ d) && (((w ^ s) ? 0.7071 : 1) * [-1, 1][+d] * base * 1.25 / (body.density / 0.15)),
      y: body.velocity.y
    });
  }

  player.state.isMoving = !!Math.floor(Math.abs(player.state.force.x)) || !!Math.floor(Math.abs(player.state.force.y));

  if(player.state.isMoving) {
    player.state.stepSoundTicker++;
    player.state.objectRenderListUpdateTicker++;
    if(player.state.stepSoundTicker >= 6) {
      gameData.queuedSounds.push({path: "/assets/audio/footsteps/step" + (Math.round(Math.random() * 7) + 1) + ".mp3", origin: player.state.position});
      player.state.stepSoundTicker = 0;
    }
    if(player.state.objectRenderListUpdateTicker >= 18) {
      updateObjectRenderList(player);
      player.state.objectRenderListUpdateTicker = 0;
    }
  }

  if(player.keys[100]) {
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
      if(currentWeapon.fireMode == "auto" || currentWeapon.fireMode == "semi" && player.state.hasFiredOnClick == false) {
        player.state.hasFiredOnClick = true;
        if(currentWeapon.type == "melee") {
          const angle = player.state.angle * Math.PI / 180 - Math.PI;
          let playerBodies = [];
          for(let i = 0; i < gameData.users.length; i++) {
            if(gameData.users[i] != JSON.parse(player.body.tag).id && gameData.players[gameData.users[i]].health > 0) {
              playerBodies.push(gameData.players[gameData.users[i]].body);
            }
          }
          const collisions = Matter.Query.collides(Matter.Bodies.circle(player.state.position.x + Math.cos(angle) * currentWeapon.damageArea.position.y, player.state.position.y + Math.sin(angle) * currentWeapon.damageArea.position.y, currentWeapon.damageArea.radius), playerBodies);
          player.state.fireTimer = 0;
          gameData.bullets.push(new bullet({ start: player.state.position, finish: player.state.position }, player.team, id, player.state.angle, 0, [{x: 0, y: 0, colour: "none", material: "none"}, {x: 1, y: 1, colour: "none", material: "none"}], false));
          if(collisions[0]) {
            let collisionBodies = playerBodies.concat(justObstacles);
            const ray = functions.raycast(collisionBodies, position, { x: player.state.position.x + Math.cos(Math.atan2(collisions[0].bodyA.position.y - position.y, collisions[0].bodyA.position.x - position.x)) * 300, y: player.state.position.y + Math.sin(Math.atan2(collisions[0].bodyA.position.y - position.y, collisions[0].bodyA.position.x - position.x)) * 300 }, true);
            if(ray[0] && ray[0].body == collisions[0].bodyA) {
              gameData.particles.push(new particle({x: ray[0].point.x / 1, y: ray[0].point.y / 1}, Math.random() * 360, player.state.angle * Math.PI / 180 + (Math.random() - 2) * 1 + Math.PI / 2, JSON.parse(ray[0].body.tag).colour, 250, "/assets/misc/particle.svg", 100, "residue", 0));
              if(JSON.parse(collisions[0].bodyA.tag).colour != JSON.parse(player.body.tag).colour) {
                for(let i = 0; i < gameData.users.length; i++) {
                  if(gameData.players[gameData.users[i]].body == collisions[0].bodyA) {
                    gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                    gameData.shouldUpdateScoreboard = true;
                    gameData.scoreboard[id].damage += currentWeapon.damage;
                    if (gameData.players[gameData.users[i]].health < 1) {   
                      for(let k = 0; k < 7; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue", 0));
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
        } else if(currentWeapon.type == "gun") {
          player.state.mag[player.state.activeWeaponIndex]--;
          player.state.reloadProgress = 0;
          if (currentWeapon.bulletsPerShot > 1) {
            for (let j = 0; j < currentWeapon.bulletsPerShot; j++) {
              let angle = ((player.state.angle + (activeWeaponSpread / currentWeapon.bulletsPerShot) * (j - Math.floor(currentWeapon.bulletsPerShot / 2))) + (Math.random() - 0.5) * activeWeaponSpread / 30) * Math.PI / 180 - Math.PI;
              let playerBodies = [];
              for(let i = 0; i < gameData.users.length; i++) {
                if(gameData.users[i] != JSON.parse(player.body.tag).id && gameData.players[gameData.users[i]].health > 0) {
                  playerBodies.push(gameData.players[gameData.users[i]].body);
                }
              }
              let collisionBodies = playerBodies.concat(justObstacles);
              let ray = functions.raycast(collisionBodies, position, { x: player.state.position.x + Math.cos(angle) * bulletLength, y: player.state.position.y + Math.sin(angle) * bulletLength }, true);
              let finish = ray[0].point;
              for (let i = 0; i < gameData.users.length; i++) {
                if (gameData.players[gameData.users[i]].body == ray[0].body && gameData.players[gameData.users[i]] != player) {
                  finish = ray[0].point;
                  if (gameData.players[gameData.users[i]].team != player.team) {
                    gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                    gameData.shouldUpdateScoreboard = true;
                    gameData.scoreboard[id].damage += currentWeapon.damage;
                    if (gameData.players[gameData.users[i]].health < 1) {    
                      for(let k = 0; k < 7; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue", Math.sqrt(squaredDist(player.state.position, finish))));
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
              gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, id, player.state.angle + (activeWeaponSpread / currentWeapon.bulletsPerShot) * (j - Math.floor(currentWeapon.bulletsPerShot / 2)), currentWeapon.lifeTime, [{x: ray[0].verts[0].x, y: ray[0].verts[0].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}, {x: ray[0].verts[1].x, y: ray[0].verts[1].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}], shouldEjectCartridge));
            }
            player.state.fireTimer = 0;
          } else {
            let playerBodies = [];
            for(let i = 0; i < gameData.users.length; i++) {
              if(gameData.users[i] != JSON.parse(player.body.tag).id && gameData.players[gameData.users[i]].health > 0) {
                playerBodies.push(gameData.players[gameData.users[i]].body);
              }
            }
            let collisionBodies = playerBodies.concat(justObstacles);
            let ray;
            if(currentWeapon.dual && gameData.serverSettings["dual-wield-realism"]) {
              if(player.state.mag[player.state.activeWeaponIndex] % 2 == 0) {
                ray = functions.raycast(collisionBodies, {x: position.x + Math.cos((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x, y: position.y + Math.sin((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x}, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength + Math.cos((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength + Math.sin((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x }, true);
              } else {
                ray = functions.raycast(collisionBodies, {x: position.x + Math.cos((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x, y: position.y + Math.sin((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x}, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength + Math.cos((player.state.angle - 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength + Math.sin((player.state.angle - 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x }, true);
              }
            } else {
              ray = functions.raycast(collisionBodies, position, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength }, true);
            }
            let finish = ray[0].point;
            for (let i = 0; i < gameData.users.length; i++) {
              if (gameData.players[gameData.users[i]].body == ray[0].body && gameData.players[gameData.users[i]] != player) {
                finish = ray[0].point;
                if (gameData.players[gameData.users[i]].team != player.team) {
                  gameData.players[gameData.users[i]].health -= currentWeapon.damage;
                  gameData.shouldUpdateScoreboard = true;
                  gameData.scoreboard[id].damage += currentWeapon.damage;
                  if (gameData.players[gameData.users[i]].health < 1) {
                    for(let k = 0; k < 7; k++) {
                      const angle = Math.random() * Math.PI * 2;
                      gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue", Math.sqrt(squaredDist(player.state.position, finish))));
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
            if(currentWeapon.dual) {
              if(player.state.mag[player.state.activeWeaponIndex] % 2 == 0) {
                const start = {x: player.state.position.x + Math.cos((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x, y: player.state.position.y + Math.sin((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[0].x};
                let angle;
                if(gameData.serverSettings["dual-wield-realism"]) {
                  angle = player.state.angle + randomAngleOffset;
                } else {
                  angle = (Math.atan2(start.y - finish.y, start.x - finish.x) / Math.PI * 180);
                }
                gameData.bullets.push(new bullet({ start: start, finish: finish }, player.team, id, angle, currentWeapon.lifeTime, [{x: ray[0].verts[0].x, y: ray[0].verts[0].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}, {x: ray[0].verts[1].x, y: ray[0].verts[1].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}], true));
              } else {
                const start = {x: player.state.position.x + Math.cos((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x, y: player.state.position.y + Math.sin((player.state.angle + 90) * Math.PI / 180 - Math.PI) * currentWeapon.handPositions[1].x};
                if(gameData.serverSettings["dual-wield-realism"]) {
                  angle = player.state.angle + randomAngleOffset;
                } else {
                  angle = (Math.atan2(start.y - finish.y, start.x - finish.x) / Math.PI * 180);
                }
                gameData.bullets.push(new bullet({ start: start, finish: finish }, player.team, id, angle, currentWeapon.lifeTime, [{x: ray[0].verts[0].x, y: ray[0].verts[0].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}, {x: ray[0].verts[1].x, y: ray[0].verts[1].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}], true));
              }
            } else {
              gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, id, player.state.angle + randomAngleOffset, currentWeapon.lifeTime, [{x: ray[0].verts[0].x, y: ray[0].verts[0].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}, {x: ray[0].verts[1].x, y: ray[0].verts[1].y, colour: JSON.parse(ray[0].body.tag).colour, material: JSON.parse(ray[0].body.tag).material}], true));
            }
            player.state.fireTimer = 0;
          }
        } else if(currentWeapon.type == "grenade") {
          player.state.mag[player.state.activeWeaponIndex]--;
          let ray = functions.raycast(justObstacles, position, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * currentWeapon.throwLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * currentWeapon.throwLength }, true),
          finish,
          damageAreaFinish;
          if(ray[0] && ray[0].point) {
            finish = ray[0].point;
            const actualThrowLength = Math.sqrt(squaredDist(ray[0].point, position)) - 3;
            damageAreaFinish = { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * actualThrowLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * actualThrowLength };
          } else { 
            finish = { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) + 90) * currentWeapon.throwLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) + 90) * currentWeapon.throwLength };
            damageAreaFinish = { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * currentWeapon.throwLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * currentWeapon.throwLength };
          }
            gameData.grenades.push(new grenade({
            coordinates: {
              start: player.state.position,
              finish: finish
            },
            emitter: player.team,
            player: JSON.parse(player.body.tag).id,
            angle: player.state.angle + randomAngleOffset,
            src: currentWeapon.projectileSRC,
            rotation: 0
          }));
          gameData.damageAreas.push(new damageArea({
            position: damageAreaFinish,
            team: player.team,
            player: JSON.parse(player.body.tag).id,
            timestamp: Date.now() + 50 * 4 * (Math.sqrt(squaredDist(player.state.position, finish)) / 300),
            damage: currentWeapon.damage,
            radius: currentWeapon.damageArea.radius
          }));
          player.state.fireTimer = 0;
          gameData.bullets.push(new bullet({ start: player.state.position, finish: player.state.position }, player.team, id, player.state.angle, 0, [{x: 0, y: 0, colour: "none", material: "none"}, {x: 1, y: 1, colour: "none", material: "none"}], false));
        }
        gameData.shouldUpdateUI = true;
        gameData.queuedSounds.push({path: currentWeapon.sounds.fire, origin: player.state.position});
      }
    }
    if(player.state.mag[player.state.activeWeaponIndex] <= 0 && !player.state.isReloading && currentWeapon.type != "grenade") {
      player.state.isReloading = true;
      player.state.reloadProgress = 0;
      gameData.queuedSounds.push({path: currentWeapon.sounds.reload, origin: player.state.position});
    }
  }
}

function updateDamageAreas() {
  for(let i = 0; i < gameData.damageAreas.length; i++) {
    if(gameData.damageAreas[i].timestamp <= Date.now()) {
      const areaData = gameData.damageAreas[i];
      let playerBodies = [];
      for(let j = 0; j < gameData.users.length; j++) {
        if(gameData.players[gameData.users[j]].health > 0) {
          playerBodies.push(Matter.Bodies.circle(gameData.players[gameData.users[j]].body.position.x, gameData.players[gameData.users[j]].body.position.y, 110, {
            tag: gameData.players[gameData.users[j]].body.tag
          }));
        }
      }
      const collisions = Matter.Query.collides(Matter.Bodies.circle(areaData.position.x, areaData.position.y, areaData.radius), playerBodies);
      for(let k = 0; k < collisions.length; k++) {
        const parsed = JSON.parse(collisions[k].bodyA.tag);
        if(parsed.colour != areaData.team || parsed.id == areaData.player) {
          let collisionBodies = playerBodies.concat(justObstacles);
          const ray = functions.raycast(collisionBodies, areaData.position, collisions[k].bodyA.position, true);
          if(squaredDist(areaData.position, collisions[k].bodyA.position) <= 8100 || ray[0] && JSON.parse(ray[0].body.tag).id == parsed.id) {
            const player = gameData.players[parsed.id],
            damage = Math.ceil(((areaData.radius - restrict(Math.sqrt(squaredDist(areaData.position, player.body.position)) - 50, 0, areaData.radius)) / areaData.radius) * areaData.damage);
            gameData.shouldUpdateUI = true;
            gameData.shouldUpdateScoreboard = true;
            if(parsed.id != areaData.player) {
              if(player.health <= damage) {
                for(let v = 0; v < 7; v++) {
                  const angle = Math.random() * Math.PI * 2;
                  gameData.particles.push(new particle({x: (player.state.position.x / 1) + Math.cos(angle) * 100, y: (player.state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, player.team, 250, "/assets/misc/particle.svg", 100, "residue", 0));
                }  
                gameData.scoreboard[areaData.player].damage += player.health;
                player.health = 0;
                player.state.hasStarted = false;
                Composite.remove(world, player.body);
                player.keys = [];
                gameData.currentRoundScore[areaData.team] += 1;
                gameData.scoreboard[areaData.player].kills++;
                gameData.scoreboard[areaData.player].score += 100;
                gameData.scoreboard[parsed.id].deaths++;
                player.state.mag[0] = gameData.weapons[player.guns[0]].magSize;
                player.state.mag[1] = gameData.weapons[player.guns[1]].magSize;                    
                player.state.isReloading = false;
              } else {
                gameData.scoreboard[areaData.player].damage += damage;
                player.health -= damage;
              }
            } else {
              if(player.health <= damage) {
                for(let v = 0; v < 7; v++) {
                  const angle = Math.random() * Math.PI * 2;
                  gameData.particles.push(new particle({x: (player.state.position.x / 1) + Math.cos(angle) * 100, y: (player.state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, player.team, 250, "/assets/misc/particle.svg", 100, "residue", 0));
                }  
                player.health = 0;
                player.state.hasStarted = false;
                Composite.remove(world, player.body);
                player.keys = [];
                gameData.scoreboard[parsed.id].deaths++;
                player.state.mag[0] = gameData.weapons[player.guns[0]].magSize;
                player.state.mag[1] = gameData.weapons[player.guns[1]].magSize;                    
                player.state.isReloading = false;
              } else {
                player.health -= damage;
              }
            }
          }
        }
      }
      gameData.damageAreas.splice(i, 1);
      i--;
    }
  }
}

function updateGame() {
  if (gameData.usersOnline > 0) {
    let time = Date.now();
    
    const tickDelay = ((time - lastTime) / (1000 / tickRate));
    gameData.lastTickDelay = (time - lastTime);
    lastTime = Date.now();
    Engine.update(engine, tickDelay * (1000 / tickRate), tickDelay);

    for (let x = 0; x < gameData.users.length; x++) {
      const player = gameData.players[gameData.users[x]];
      const currentWeapon = gameData.weapons[player.guns[player.state.activeWeaponIndex]];
      player.state.fireTimer+=tickDelay;
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
      updatePlayer(player, gameData.lastTickDelay, gameData.users[x]);
    }
    updateDamageAreas();
    for(let x = 0; x < gameData.users.length; x++) {
      io.to(gameData.users[x]).emit("world-update", {
        players: gameData.players,
        bullets: gameData.bullets,
        grenades: gameData.grenades,
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
    gameData.bullets = [];
    gameData.grenades = [];
    gameData.particles = [];
    gameData.queuedSounds = [];
    gameData.shouldUpdateUI = false;
    gameData.shouldUpdateScoreboard = false;
    updatePlayerPrev();
  }
}

var updateGameTimer = setInterval(updateGame, tickRate),
updateObjectRenderList = function(player) {
  player.state.objectRenderList = {nonShootables: [], basic: []};
  let types = ["nonShootables", "basic"];
  
  for(let v  = 0; v < types.length; v++) {
    const collisionList = Matter.Query.collides(Bodies.rectangle(player.state.position.x, player.state.position.y, 5500 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15, 3500 + gameData.weapons[player.guns[player.state.activeWeaponIndex]].view ** 1.15), imageBodyList[types[v]]);
    for (let i = 0; i < collisionList.length; i++) {
      player.state.objectRenderList[types[v]].push(collisionList[i].bodyA.tag / 1);
    }
  }
};

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
        console.log((data.nickname || "Unnamed user") + " Has connected");
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
            tag: JSON.stringify({colour: spawnpoint.team, id: socket.id, material: "robot"}) 
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
                if(player.keys[100] == false) {
                  player.state.hasFiredOnClick = false;
                }
                player.keys = data.keys;
                if(player.keys[82] && player.state.mag[player.state.activeWeaponIndex] < gameData.weapons[player.guns[player.state.activeWeaponIndex]].magSize && !player.state.isReloading && gameData.weapons[player.guns[player.state.activeWeaponIndex]].type != "grenade") {
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
                let shouldUpdate = false;
                if(gameData.weapons[player.guns[player.state.activeWeaponIndex]].view != gameData.weapons[player.guns[data.index]].view) shouldUpdate = true;
                player.state.activeWeaponIndex = data.index;
                player.state.isReloading = false;
                player.state.reloadProgress = 0;
                Body.setDensity(player.body, gameData.weapons[player.guns[player.state.activeWeaponIndex]].playerDensity * 2.5);
                if(player.state.mag[data.index] < 1 && !player.state.isReloading && gameData.weapons[player.guns[player.state.activeWeaponIndex]].type != "grenade") {
                  player.state.isReloading = true;
                  gameData.queuedSounds.push({path: gameData.weapons[player.guns[player.state.activeWeaponIndex]].sounds.reload, origin: player.state.position});
                }
                if(shouldUpdate) {
                  updateObjectRenderList(player);
                  player.state.objectRenderListUpdateTicker = 0;
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
            if(!player.state.hasStarted || gameData.players[socket.id].health <= 0) {
              player.guns = gameData.loadouts[data.class];
              player.state.mag[0] = gameData.weapons[player.guns[0]].magSize;
              player.state.mag[1] = gameData.weapons[player.guns[1]].magSize;
              player.state.mag[2] = gameData.weapons[player.guns[2]].magSize;
              player.state.mag[3] = gameData.weapons[player.guns[3]].magSize;
              player.state.fireTimer = 1000;
              player.state.hasStarted = true;
              Body.setDensity(player.body, gameData.weapons[player.guns[player.state.activeWeaponIndex]].playerDensity * 2.5);
              player.health = 100;

              const spawn = gameData.mapData.config.spawns[player.team][Math.floor(Math.random() * gameData.mapData.config.spawns[player.team].length)];

              Body.setPosition(player.body, {x: spawn.x, y: spawn.y});
              player.state.previousPosition = {x: spawn.x, y: spawn.y};
              Composite.add(world, player.body);

              gameData.shouldUpdateUI = true;

              updateObjectRenderList(player);
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
