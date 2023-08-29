// SETTING UP LOCAL SERVER REMINDER!!!!

// cd <drag in full directory> ENTER

// type in "node index.js"

// PRESTO

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
    origin: true
  }
});

const Matter = require("matter-js");

const functions = require("./raycast.js");

let messageLoad = [];

let ticks = 0,
lastTime = Date.now();

const tickRate = 35;

const Engine = Matter.Engine,
  World = Matter.World,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  engine = Engine.create(void 0, {
    gravity: {
      y: 0 // For some reason, this doesn't work
    }
  }),
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

  constructor(coordinates, emitter, angle, timeLeft) {
    this.coordinates = coordinates;
    this.emitter = emitter;
    this.angle = angle;
    this.timeLeft = timeLeft;
    this.tracerLength = Math.ceil(Math.sqrt(squaredDist({x: coordinates.start.x, y: coordinates.start.y}, {x: coordinates.finish.x, y: coordinates.finish.y})));
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
    isMoving: false,
    position: {},
    spawnNumber: 0,
    recoilTimer: 0,
    spawnpoint: {},
    mag: [0, 0, 0],
    activeWeaponIndex: 0,
    hasStarted: false,
    objectRenderList: [],
    ping: 0,
    force: {x: 0, y: 0},
    previousPosition: {x: 0, y: 0}
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
    this.state.previousPosition = {x: body.position.x / 1, y: body.position.y / 1}
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
  point: {},
  usersOnline: 0,
  users: [],
  certificate: "",
  queuedSounds: [],
  loadouts: {
    "scar": [
      new weapon(
        {
          name: "SCAR-L",
          type: "rifle",
          magSize: 20,
          view: 0,
          fireDelay: 5,
          spread: {
            standing: 2.5,
            moving: 10
          },
          damage: 14,
          bulletsPerShot: 1,
          handPositions: [{ x: -25, y: -270 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/scar_topdown.svg", lootSRC: "/assets/weapons/scar_loot.svg", offset: { x: 0, y: -290 } },
          reloadLength: 80,
          roundsPerReload: "all",
          playerDensity: 0.02,
          sounds: {
            fire: "/assets/audio/guns/scar_fire.mp3",
            reload: "/assets/audio/guns/scar_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 65
            },
            {
              x: 0,
              y: 65
            },
            {
              x: 0,
              y: 65
            },
          ],
          lifeTime: 30,
        }
      ),
      new weapon(
        {
          name: "T509",
          type: "handgun",
          magSize: 12,
          view: 0,
          fireDelay: 9,
          spread: {
            standing: 1.5,
            moving: 8
          },
          damage: 16,
          bulletsPerShot: 1,
          handPositions: [{ x: -30, y: -115 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/509_topdown.svg", lootSRC: "/assets/weapons/509_loot.svg", offset: { x: 0, y: -335 } },
          reloadLength: 70,
          roundsPerReload: "all",
          playerDensity: 0.018,          
          sounds: {
            fire: "/assets/audio/guns/509_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
          ],
          lifeTime: 20,
        }
      ),
      new weapon(
        {
          name: "Bayonet | Classic",
          type: "melee",
          view: 0,
          fireDelay: 10,
          damage: 55,
          damageArea: {
            position: {
              x: 0,
              y: -400
            },
            radius: 200
          },
          handPositions: [{ x: -65, y: -120 }, { x: 65, y: -120 }],
          images: { topdownSRC: "/assets/weapons/bayonet_topdown.svg", lootSRC: "/assets/weapons/bayonet_loot.svg", offset: { x: 15, y: -270 } },
          reloadLength: 0,
          roundsPerReload: "all",
          playerDensity: 0.017,          
          sounds: {
            fire: "/assets/audio/guns/melee_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: -10,
              y: 15
            },
            {
              x: 0,
              y: -100
            },
            {
              x: 0,
              y: -100
            },
          ],
          lifeTime: 0,
        }
      ),
    ],
    "ballista": [
      new weapon(
        {
          name: "Ballista",
          type: "rifle",
          magSize: 5,
          view: 1200,
          fireDelay: 95,
          spread: {
            standing: 0.5,
            moving: 15
          },
          damage: 70,
          bulletsPerShot: 1,
          handPositions: [{ x: -25, y: -300 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/ballista_topdown.svg", lootSRC: "/assets/weapons/ballista_loot.svg", offset: { x: 0, y: -390 } },
          reloadLength: 150,
          roundsPerReload: "all",
          playerDensity: 0.022,          
          sounds: {
            fire: "/assets/audio/guns/ballista_fire.mp3",
            reload: "/assets/audio/guns/ballista_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 110
            },
            {
              x: 0,
              y: 110
            },
            {
              x: 0,
              y: 110
            },
          ],
          lifeTime: 50,
        }
      ),
      new weapon(
        {
          name: "T509",
          type: "handgun",
          magSize: 12,
          view: 0,
          fireDelay: 9,
          spread: {
            standing: 1.5,
            moving: 8
          },
          damage: 16,
          bulletsPerShot: 1,
          handPositions: [{ x: -30, y: -115 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/509_topdown.svg", lootSRC: "/assets/weapons/509_loot.svg", offset: { x: 0, y: -335 } },
          reloadLength: 70,
          roundsPerReload: "all",
          playerDensity: 0.018,          
          sounds: {
            fire: "/assets/audio/guns/509_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
          ],
          lifeTime: 20,
        }
      ),
      new weapon(
        {
          name: "Knife | Classic",
          type: "melee",
          view: 0,
          fireDelay: 10,
          damage: 55,
          damageArea: {
            position: {
              x: 0,
              y: -400
            },
            radius: 200
          },
          handPositions: [{ x: -65, y: -120 }, { x: 65, y: -120 }],
          images: { topdownSRC: "/assets/weapons/knife_topdown.svg", lootSRC: "/assets/weapons/knife_loot.svg", offset: { x: 15, y: -260 } },
          reloadLength: 0,
          roundsPerReload: "all",
          playerDensity: 0.017,          
          sounds: {
            fire: "/assets/audio/guns/melee_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: -10,
              y: 15
            },
            {
              x: 0,
              y: -100
            },
            {
              x: 0,
              y: -100
            },
          ],
          lifeTime: 0,
        }
      ),
    ],
    "slp": [
      new weapon(
        {
          name: "SLP",
          type: "shotgun",
          magSize: 4,
          view: 0,
          fireDelay: 40,
          spread: {
            standing: 17,
            moving: 21
          },
          damage: 11,
          bulletsPerShot: 7,
          handPositions: [{ x: -25, y: -255 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/slp_topdown.svg", lootSRC: "/assets/weapons/slp_loot.svg", offset: { x: 0, y: -320 } },
          reloadLength: 45,
          roundsPerReload: 1,
          playerDensity: 0.02,          
          sounds: {
            fire: "/assets/audio/guns/slp_fire.mp3",
            reload: "/assets/audio/guns/slp_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 60
            },
            {
              x: 0,
              y: 60
            },
            {
              x: 0,
              y: 60
            },
          ],
          lifeTime: 25,
        }
      ),
      new weapon(
        {
          name: "T509",
          magSize: 12,
          view: 0,
          fireDelay: 9,
          spread: {
            standing: 1.5,
            moving: 8
          },
          damage: 16,
          bulletsPerShot: 1,
          handPositions: [{ x: -30, y: -115 }, { x: 25, y: -120 }],
          images: { topdownSRC: "/assets/weapons/509_topdown.svg", lootSRC: "/assets/weapons/509_loot.svg", offset: { x: 0, y: -335 } },
          reloadLength: 70,
          roundsPerReload: "all",
          playerDensity: 0.018,          
          sounds: {
            fire: "/assets/audio/guns/509_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
            {
              x: 0,
              y: 40
            },
          ],
          lifeTime: 20,
        }
      ),
      new weapon(
        {
          name: "Knife | Classic",
          type: "melee",
          view: 0,
          fireDelay: 10,
          damage: 55,
          damageArea: {
            position: {
              x: 0,
              y: -400
            },
            radius: 200
          },
          handPositions: [{ x: -65, y: -120 }, { x: 65, y: -120 }],
          images: { topdownSRC: "/assets/weapons/knife_topdown.svg", lootSRC: "/assets/weapons/knife_loot.svg", offset: { x: 15, y: -260 } },
          reloadLength: 0,
          roundsPerReload: "all",
          playerDensity: 0.017,          
          sounds: {
            fire: "/assets/audio/guns/melee_fire.mp3",
            reload: "/assets/audio/guns/509_reload.mp3"
          },
          recoilImpulse: [
            {
              x: -10,
              y: 15
            },
            {
              x: 0,
              y: -100
            },
            {
              x: 0,
              y: -100
            },
          ],
          lifeTime: 0,
        }
      ),
    ]
  }
};

function squaredDist(ptA, ptB) {
  return (ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2;
}

function populateObstacles() {  
  Composite.clear(world, false);
  imageBodyList = [];
  for (let i = 0; i < gameData.mapData.obstacles.length; i++) {
    const obstacle = gameData.mapData.obstacles[i]["body-data"];
    let body;
    switch (obstacle.type) {
      case "rectangle":
        body = Bodies.rectangle(obstacle.position.x, obstacle.position.y, obstacle.dimensions.width, obstacle.dimensions.height, obstacle.options);
      break;
      case "circle": 
        body = Bodies.circle(obstacle.position.x, obstacle.position.y, obstacle.radius, obstacle.options);
      break;
    }
    Composite.add(world, body);
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
}

populateObstacles();

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
        gameData.point.teamNumbers[collisions[i].bodyA.tag]++;
      }
      if(gameData.point.teamNumbers.red > gameData.point.teamNumbers.blue) {
        gameData.currentRoundScore.red++;
        gameData.point.state = "red";
      } else if(gameData.point.teamNumbers.blue > gameData.point.teamNumbers.red) {
        gameData.currentRoundScore.blue++;
        gameData.point.state = "blue";
      }
    } 
    io.sockets.emit("ui-change", {players: gameData.players, currentRoundScore: gameData.currentRoundScore});
  }
}, 2000),

updateSecondsLeft = setInterval(function() {
  if(gameData.users.length > 0) {
    gameData.secondsLeft--;
  }
  if(gameData.secondsLeft < -20) {
    gameData.secondsLeft = 360;
  }
}, 1000);

function updatePlayer(player, delay) {
  /*const deacceleration = 1.4;
  if(player.body.velocity.x < 0) {
    Body.setVelocity(player.body, { x: Math.ceil((player.body.velocity.x / deacceleration)), y: player.body.velocity.y });
  } else if(player.body.velocity.x > 0) {
    Body.setVelocity(player.body, { x: Math.floor((player.body.velocity.x / deacceleration)), y: player.body.velocity.y });
  }
  if(player.body.velocity.y < 0) {
    Body.setVelocity(player.body, { x: player.body.velocity.x, y: Math.ceil((player.body.velocity.y / deacceleration)) });
  } else if(player.body.velocity.y > 0) {
    Body.setVelocity(player.body, { x: player.body.velocity.x, y: Math.floor((player.body.velocity.y / deacceleration)) });
  }*/

  const w = !!player.keys[83],
    a = !!player.keys[65],
    s = !!player.keys[87],
    d = !!player.keys[68],
    body = player.body,
    base = player.body.circleRadius / (10 * Math.SQRT2);

  Body.applyForce(body, body.position, {
    x: +(a ^ d) && (((w ^ s) ? Math.SQRT1_2 : 1) * [-1, 1][+d] * base * 6 * delay),
    y: +(w ^ s) && (((a ^ d) ? Math.SQRT1_2 : 1) * [-1, 1][+w] * base * 6 * delay)
  });

  player.state.isMoving = !!Math.round(body.velocity.x) || !!Math.round(body.velocity.y);
  player.state.force = {x: player.state.position.x - player.state.previousPosition.x, y: player.state.position.y - player.state.previousPosition.y};
  player.state.previousPosition = {x: body.position.x / 1, y: body.position.y / 1};
}

function updateGame() {
  if (gameData.usersOnline > 0) {
    let time = Date.now();
    
    const tickDelay = ((time - lastTime) / ((25 / tickRate) * tickRate));
    lastTime = Date.now();
    for (let x = 0; x < gameData.users.length; x++) {
      const player = gameData.players[gameData.users[x]];
      player.state.fireTimer+=tickDelay;
      if (player.state.recoilTimer > 0) {
        player.state.recoilTimer -= 1 / 7 * tickDelay;
      }
      if(player.state.isReloading) {
        if(player.state.reloadProgress >= player.guns[player.state.activeWeaponIndex].reloadLength) {
          if(player.guns[player.state.activeWeaponIndex].roundsPerReload == "all") {
            player.state.isReloading = false;
            player.state.mag[player.state.activeWeaponIndex] = player.guns[player.state.activeWeaponIndex].magSize;
          } else {
            player.state.mag[player.state.activeWeaponIndex] += player.guns[player.state.activeWeaponIndex].roundsPerReload;
            if(player.state.mag[player.state.activeWeaponIndex] >= player.guns[player.state.activeWeaponIndex].magSize) {
              player.state.isReloading = false;
            } else {
              gameData.queuedSounds.push({path: player.guns[player.state.activeWeaponIndex].sounds.reload, origin: player.state.position});
            }
          }
          player.state.reloadProgress = 0;
          player.state.fireTimer = player.guns[player.state.activeWeaponIndex].fireDelay - 5;
        } else {
          player.state.reloadProgress+=tickDelay;
        }
        io.to(gameData.users[x]).emit("ui-change", { players: gameData.players, currentRoundScore: gameData.currentRoundScore });
      }
      io.to(gameData.users[x]).emit("world-update", {
        players: gameData.players,
        bullets: gameData.bullets,
        particles: gameData.particles,
        usersOnline: gameData.usersOnline,
        secondsLeft: gameData.secondsLeft,
        users: gameData.users,
        point: gameData.point,
        currentRoundScore: gameData.currentRoundScore,
        certificate: gameData.certificate,
        queuedSounds: gameData.queuedSounds
      });
      updatePlayer(player, tickDelay);
    }
    gameData.bullets = [],
    gameData.particles = [];
    if (messageLoad.length > 0) {
      for (let i = 0; i < messageLoad.length; i++) {
        io.to(messageLoad[i][0]).emit(messageLoad[i][1], messageLoad[i][2]);
      }
    }
    messageLoad = [];
    gameData.queuedSounds = [];
  }
}

var updateGameTimer = setInterval(updateGame, tickRate),
updateObjectRenderLists = setInterval(function() {
  for(let i = 0; i < gameData.users.length; i++) {
    const player = gameData.players[gameData.users[i]];

    player.state.objectRenderList = [];
    const collisionList = Matter.Query.collides(Bodies.rectangle(player.state.position.x, player.state.position.y, 5000 + player.guns[player.state.activeWeaponIndex].view ** 1.15, 3000 + player.guns[player.state.activeWeaponIndex].view ** 1.15), imageBodyList);
    for (let i = 0; i < collisionList.length; i++) {
      player.state.objectRenderList.push(collisionList[i].bodyA.tag / 1);
    }
  }
}, tickRate * 10);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  socket.on("play-request", (data) => {
    if (gameData.usersOnline < 4) {
      let alreadyExists = false;
      for(let j = 0; j < gameData.users.length; j++) {
        if(gameData.users[j] == socket.id) {
          alreadyExists = true;
        }
      }
      if(!alreadyExists) {
        console.log("New client. " + (gameData.usersOnline + 1) + " Users online.");
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
          Bodies.circle(spawnpoint.x, spawnpoint.y, 115, {
            friction: 0,
            restitution: 0,
            inertia: 0.1,
            density: 0.015,
            frictionAir: 0.25,
            tag: spawnpoint.team
          }),
          0,
          gameData.loadouts["scar"],
          100,
          0,
          spawnpoint.team,
          data.platform || "desktop"
        );
        gameData.players[socket.id].state.mag[gameData.players[socket.id].state.activeWeaponIndex] = gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].magSize;
        gameData.players[socket.id].state.spawnpoint = spawnpoint;
        Composite.add(world, gameData.players[socket.id].body);
        socket.emit("load-world", gameData);

        socket.on("disconnect", function() {
          if (gameData.players[socket.id]) {
            gameData.teamNumbers[gameData.players[socket.id].team]--;
            gameData.usersOnline--;
            console.log(gameData.usersOnline + " Users connected. 1 user has disconnected.");
            Composite.remove(world, gameData.players[socket.id].body);
            gameData.players[socket.id] = void 0;
            for (let i = 0; i < gameData.users.length; i++) {
              if (gameData.users[i] === socket.id) {
                gameData.users.splice(i, 1);
              }
            }
            if(gameData.users.length == 0) {
              gameData.currentRoundScore["blue"] = 0;
              gameData.currentRoundScore["red"] = 0;
              gameData.secondsLeft = 360;
            }
          }
        });

        socket.on("pick-weapon", (data) => {
          try {
            let player = gameData.players[socket.id];
            if(!player.state.hasStarted) {
              player.guns = gameData.loadouts[data.gun];
              player.state.mag[0] = player.guns[0].magSize;
              player.state.mag[1] = player.guns[1].magSize;
              player.state.mag[2] = player.guns[2].magSize;
              io.to(socket.id).emit("gun-ui-change", {players: gameData.players});
              player.state.fireTimer = 1000;
              player.state.hasStarted = true;
              Body.setDensity(player.body, player.guns[player.state.activeWeaponIndex].playerDensity * 2.5);
              io.to(socket.id).emit("ui-change", { players: gameData.players, currentRoundScore: gameData.currentRoundScore});
            }
          }
          catch { }
        });
        socket.on("move-key-change", (data) => {
          try {
            let player = gameData.players[socket.id];
            if(player.health > 0) {
              if(player.state.hasStarted) {
                player.keys = data.keys;
    
                if(player.keys[82] && player.state.mag[player.state.activeWeaponIndex] < player.guns[player.state.activeWeaponIndex].magSize && !player.state.isReloading) {
                  player.state.isReloading = true;
                  gameData.queuedSounds.push({path: player.guns[player.state.activeWeaponIndex].sounds.reload, origin: player.state.position});
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
                Body.setDensity(player.body, player.guns[player.state.activeWeaponIndex].playerDensity * 2.5);
                if(player.state.mag[data.index] < 1 && !player.state.isReloading) {
                  player.state.isReloading = true;
                  gameData.queuedSounds.push({path: player.guns[player.state.activeWeaponIndex].sounds.reload, origin: player.state.position});
                }
              }
              io.to(socket.id).emit("gun-ui-change", {players: gameData.players});
              io.to(socket.id).emit("ui-change", { players: gameData.players, currentRoundScore: gameData.currentRoundScore});
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
        socket.on("ping", (data) => {
          gameData.players[socket.id].state.ping = Date.now() - data.time;
        });
        socket.on("shoot-request", (data) => {
          //try {
            const player = gameData.players[socket.id];
            const position = { x: player.state.position.x, y: player.state.position.y };
            let randomAngleOffset = (Math.random() - 0.5) * player.guns[player.state.activeWeaponIndex].spread.standing;
            let activeWeaponSpread = player.guns[player.state.activeWeaponIndex].spread.standing;
            if(player.state.isMoving) {
              randomAngleOffset = (Math.random() - 0.5) * player.guns[player.state.activeWeaponIndex].spread.moving;
              activeWeaponSpread = player.guns[player.state.activeWeaponIndex].spread.moving;
            }
            const bulletLength = gameData.mapData.config["map-dimensions"].width + gameData.mapData.config["map-dimensions"].height;
            if (player.state.fireTimer > player.guns[player.state.activeWeaponIndex].fireDelay && player.state.mag[player.state.activeWeaponIndex] > 0 && player.state.hasStarted && player.health > 0 && !player.state.isReloading) {
              if(player.guns[player.state.activeWeaponIndex].type == "melee") {
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
                    gameData.particles.push(new particle(ray[1].point, Math.random() * 360, player.state.angle * Math.PI / 180 + (Math.random() - 2) * 1 + Math.PI / 2, ray[1].body.tag, 250, "/assets/misc/particle.svg", 100, "residue"));
                    if(collisions[0].bodyA.tag != player.body.tag) {
                      for(let i = 0; i < gameData.users.length; i++) {
                        if(gameData.players[gameData.users[i]].body == collisions[0].bodyA) {
                          gameData.players[gameData.users[i]].health -= gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].damage;
                          if (gameData.players[gameData.users[i]].health < 1) {   
                            for(let k = 0; k < 10; k++) {
                              const angle = Math.random() * Math.PI * 2;
                              gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                            }  
                            gameData.players[gameData.users[i]].health = 0;
                            //Body.setPosition(gameData.players[gameData.users[i]].body, gameData.players[gameData.users[i]].state.spawnpoint);
                            gameData.players[gameData.users[i]].state.hasStarted = false;
                            Composite.remove(world, gameData.players[gameData.users[i]].body);
                            gameData.players[gameData.users[i]].keys = [];
                            gameData.currentRoundScore[gameData.players[socket.id].team]+=5;
                            gameData.players[gameData.users[i]].state.mag[0] = gameData.players[gameData.users[i]].guns[0].magSize;
                            gameData.players[gameData.users[i]].state.mag[1] = gameData.players[gameData.users[i]].guns[1].magSize;
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
                gameData.particles.push(new particle({x: player.state.position.x + Math.cos((player.state.angle * Math.PI / 180) + Math.PI) * 165, y: player.state.position.y + Math.sin((player.state.angle * Math.PI / 180) + Math.PI) * 155}, player.state.angle * Math.PI / 180 + (Math.random() - 0.5) / 2 - Math.PI / 2, player.state.angle * Math.PI / 180 + (Math.random() - 0.5) / 2 - Math.PI / 2, "none", 200, "/assets/weapons/cartridge.svg", 100, "cartridge"));
                if (player.guns[player.state.activeWeaponIndex].bulletsPerShot > 1) {
                  for (let j = 0; j < player.guns[player.state.activeWeaponIndex].bulletsPerShot; j++) {
                    let angle = ((player.state.angle + (activeWeaponSpread / player.guns[player.state.activeWeaponIndex].bulletsPerShot) * (j - Math.floor(player.guns[player.state.activeWeaponIndex].bulletsPerShot / 2))) + (Math.random() - 0.5) * activeWeaponSpread / 30) * Math.PI / 180 - Math.PI;
                    let ray = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos(angle) * bulletLength, y: player.state.position.y + Math.sin(angle) * bulletLength }, true);
                    let finish = ray[1].point;
                    if(ray[1].body.tag != "none") {
                      const particleRay = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos(angle) * bulletLength, y: player.state.position.y + Math.sin(angle) * bulletLength }, true);
                      gameData.particles.push(new particle(particleRay[1].point, Math.random() * 360, player.state.angle * Math.PI / 180 + (Math.random() - 0.5) * 1, particleRay[1].body.tag, 250, "/assets/misc/particle.svg", 100, "residue"));
                    }
                    for (let i = 0; i < gameData.users.length; i++) {
                      if (gameData.players[gameData.users[i]].body == ray[1].body && gameData.players[gameData.users[i]] != gameData.players[socket.id]) {
                        finish = ray[1].point;
                        if (gameData.players[gameData.users[i]].team != gameData.players[socket.id].team) {
                          gameData.players[gameData.users[i]].health -= gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].damage;
                          if (gameData.players[gameData.users[i]].health < 1) {    
                            for(let k = 0; k < 10; k++) {
                              const angle = Math.random() * Math.PI * 2;
                              gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                            }  
                            gameData.players[gameData.users[i]].health = 0;
                            //Body.setPosition(gameData.players[gameData.users[i]].body, gameData.players[gameData.users[i]].state.spawnpoint);
                            gameData.players[gameData.users[i]].state.hasStarted = false;
                            Composite.remove(world, gameData.players[gameData.users[i]].body);
                            gameData.players[gameData.users[i]].keys = [];
                            gameData.currentRoundScore[gameData.players[socket.id].team]+=5;
                            gameData.players[gameData.users[i]].state.mag[0] = gameData.players[gameData.users[i]].guns[0].magSize;
                            gameData.players[gameData.users[i]].state.mag[1] = gameData.players[gameData.users[i]].guns[1].magSize;
                            gameData.players[gameData.users[i]].state.isReloading = false;
                          }
                        }
                      }
                    }
                    gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, player.state.angle + (activeWeaponSpread / player.guns[player.state.activeWeaponIndex].bulletsPerShot) * (j - Math.floor(player.guns[player.state.activeWeaponIndex].bulletsPerShot / 2)), player.guns[player.state.activeWeaponIndex].lifeTime));
                    }
                  player.state.fireTimer = 0;
                } else {
                  let ray = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength }, true);
                  let finish = ray[1].point;
                  if(ray[1].body.tag != "none") {
                    const particleRay = functions.raycast(Composite.allBodies(world), position, { x: player.state.position.x + Math.cos((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength, y: player.state.position.y + Math.sin((player.state.angle + randomAngleOffset) * Math.PI / 180 - Math.PI) * bulletLength }, true);
                    gameData.particles.push(new particle(particleRay[1].point, Math.random() * 360, player.state.angle * Math.PI / 180 + (Math.random() - 0.5) * 1, particleRay[1].body.tag, 250, "/assets/misc/particle.svg", 100, "residue"));
                  }
                  for (let i = 0; i < gameData.users.length; i++) {
                    if (gameData.players[gameData.users[i]].body == ray[1].body && gameData.players[gameData.users[i]] != gameData.players[socket.id]) {
                      finish = ray[1].point;
                      if (gameData.players[gameData.users[i]].team != gameData.players[socket.id].team) {
                        gameData.players[gameData.users[i]].health -= gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].damage;
                        if (gameData.players[gameData.users[i]].health < 1) {
                          for(let k = 0; k < 10; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            gameData.particles.push(new particle({x: (gameData.players[gameData.users[i]].state.position.x / 1) + Math.cos(angle) * 100, y: (gameData.players[gameData.users[i]].state.position.y / 1) + Math.sin(angle) * 100}, Math.random() * 360, angle, gameData.players[gameData.users[i]].team, 250, "/assets/misc/particle.svg", 100, "residue"));
                          }  
                          gameData.players[gameData.users[i]].health = 0;
                          //Body.setPosition(gameData.players[gameData.users[i]].body, gameData.players[gameData.users[i]].state.spawnpoint);
                          gameData.players[gameData.users[i]].state.hasStarted = false;
                          Composite.remove(world, gameData.players[gameData.users[i]].body);
                          gameData.players[gameData.users[i]].keys = [];
                          gameData.currentRoundScore[gameData.players[socket.id].team]+=5;
                          gameData.players[gameData.users[i]].state.mag[0] = gameData.players[gameData.users[i]].guns[0].magSize;
                          gameData.players[gameData.users[i]].state.mag[1] = gameData.players[gameData.users[i]].guns[1].magSize;                      
                          gameData.players[gameData.users[i]].state.isReloading = false;
                        }
                      }
                    }
                  }
                  gameData.bullets.push(new bullet({ start: player.state.position, finish: finish }, player.team, player.state.angle + randomAngleOffset, player.guns[player.state.activeWeaponIndex].lifeTime));
                  player.state.fireTimer = 0;
                }
                player.state.recoilTimer = 1;
              }
              io.emit("ui-change", {players: gameData.players, currentRoundScore: gameData.currentRoundScore});
              gameData.queuedSounds.push({path: player.guns[player.state.activeWeaponIndex].sounds.fire, origin: player.state.position});
            }
            if(player.state.mag[gameData.players[socket.id].state.activeWeaponIndex] <= 0 && !player.state.isReloading) {
              player.state.isReloading = true;
              player.state.reloadProgress = 0;
              gameData.queuedSounds.push({path: player.guns[player.state.activeWeaponIndex].sounds.reload, origin: player.state.position});
            }
          /*}
          catch { }*/
        });
      }
    }
  });
}







