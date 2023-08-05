let socket,
  gameData,
  assetsLoaded = {},
  assetsAreLoaded = false,
  queuedCameraLocation = {
    x: 0,
    y: 0,
    z: 0,
    targetX: 0,
    targetY: 0,
    targetZ: 0
  },
  cameraLocation = {
    x: 0,
    y: 0,
    z: 0,
    targetX: 0,
    targetY: 0,
    targetZ: 0
  },
  keys = [],
  updateObjects,
  objectRenderCount,
  debug = false,
  sourceSansPro,
  ping;

socket = io.connect(window.location.origin);

function keyReleased() {
  if(assetsAreLoaded) {
    keys[keyCode] = false;
    socket.emit("move-key-change", {keys: keys});
  }
}

function keyPressed() {
  if(assetsAreLoaded) {
    keys[keyCode] = true;
    socket.emit("move-key-change", {keys: keys});

    if(keys[49]) {
      socket.emit("change-weapon-index", {index: 0});
      keys[49] = false;
    }
    if(keys[50]) {
      socket.emit("change-weapon-index", {index: 1});
      keys[50] = false;
    }
    if(keys[51]) {
      socket.emit("change-weapon-index", {index: 2});
      keys[51] = false;
    }
    if(keys[73]) {
      debug = !debug;
      if(debug) {
        document.getElementById("stats").style.display = "block";
      } else {
        document.getElementById("stats").style.display = "none";
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  document.getElementById("defaultCanvas0").style.display = "none";
  background("#333333");
  pixelDensity(1.5);
  noLoop();
  window.addEventListener(
    "resize",
    function() {
      resizeCanvas(windowWidth, windowHeight);
      background("#333333");
      updateGunHUD(gameData);
    }
  );

  rectMode(CENTER);
  imageMode(CENTER);
  angleMode(DEGREES)
  noStroke();

  sourceSansPro = loadFont("/fonts/SourceSansPro-Black.ttf")

  assetsLoaded["/assets/player/player-base.svg"] = loadImage("/assets/player/player-base.svg");
  assetsLoaded["/assets/player/player-hand.svg"] = loadImage("/assets/player/player-hand.svg");
  assetsLoaded["/assets/weapons/tracer-start.svg"] = loadImage("/assets/weapons/tracer-start.svg");
  assetsLoaded["/assets/weapons/tracer-end.svg"] = loadImage("/assets/weapons/tracer-end.svg");
  assetsLoaded["/assets/weapons/scar_topdown.svg"] = loadImage("/assets/weapons/scar_topdown.svg");
  assetsLoaded["/assets/weapons/ballista_topdown.svg"] = loadImage("/assets/weapons/ballista_topdown.svg");
  assetsLoaded["/assets/weapons/slp_topdown.svg"] = loadImage("/assets/weapons/slp_topdown.svg");
  assetsLoaded["/assets/weapons/509_topdown.svg"] = loadImage("/assets/weapons/509_topdown.svg");
  assetsLoaded["/assets/weapons/knife_default_topdown.svg"] = loadImage("/assets/weapons/knife_default_topdown.svg");
  assetsLoaded["/assets/misc/particle.svg"] = loadImage("/assets/misc/particle.svg");
  assetsLoaded["/assets/weapons/cartridge.svg"] = loadImage("/assets/weapons/cartridge.svg");
  assetsLoaded["/assets/environment/point-outline.svg"] = loadImage("/assets/environment/point-outline.svg");

  socket.on("load-world", data => { // first time loading world, right after pressing play
    gameData = data;
    for(let i = 0; i < data.mapData.obstacles.length; i++) {
      assetsLoaded[data.mapData.obstacles[i]["display-data"].src] = loadImage(data.mapData.obstacles[i]["display-data"].src);
    }
    assetsLoaded[data.mapData.config["ground-image"]] = loadImage(data.mapData.config["ground-image"]);
    assetsAreLoaded = true;
    queuedCameraLocation = {
      x: gameData.players[socket.id].state.position.x,
      y: gameData.players[socket.id].state.position.y,
      z: 2200 + gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].view,
      targetX: gameData.players[socket.id].state.position.x,
      targetY: gameData.players[socket.id].state.position.y,
      targetZ: 0
    };
    loop();
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("main").src = data.players[socket.id].guns[0].images.lootSRC;
    document.getElementById("pistol").src = data.players[socket.id].guns[1].images.lootSRC;
    document.getElementById("melee").src = data.players[socket.id].guns[2].images.lootSRC;
    if(gameData.players[socket.id].guns[gameData.players[socket.id].state.activeWeaponIndex].type == "melee") {
      document.getElementById("ammocount").innerHTML = '∞';
    } else {
      document.getElementById("ammocount").innerHTML = data.players[socket.id].state.mag[data.players[socket.id].state.activeWeaponIndex] + " <smol> I " + data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].magSize + '</smol> <img src="/assets/misc/bullet-icon.svg" style="width: calc(0.2vw + 0.2vh);"></img>';
    }
    document.getElementById("healthbar").style.width = ((windowWidth * 0.1) * (gameData.players[socket.id].health / 100)) + ((windowHeight * 0.1) * (gameData.players[socket.id].health / 100)) + "px";
    document.getElementById("healthbar-opposite").style.width = ((windowWidth * 0.1) * -((data.players[socket.id].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[socket.id].health / 100) - 1)) + "px";
    document.getElementById("healthbar-opposite").style.right = "calc(16.5vw + 16.5vh - " + ((windowWidth * 0.1) * (-((data.players[socket.id].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[socket.id].health / 100) - 1))) + "px)" ;
    document.getElementById("healthbar-text").innerHTML = '<img src="/assets/misc/health-icon.svg" style="width: calc(1.2vw + 1.2vh); margin-top: calc(0.4vw + 0.4vh); margin-right: calc(0.4vw + 0.4vh);"></img>';
    document.getElementById("defaultCanvas0").style.display = "block";
    document.getElementById("mapname").textContent = "Map: " + gameData.mapData.config["map-name"];
    document.getElementById("fps").textContent = "FPS: " + round(frameRate());
    document.getElementById("pingcount").textContent = "Ping: " + gameData.players[socket.id].state.ping;
    updateObjects = setInterval(function() { if(debug) { document.getElementById("object-count").textContent = objectRenderCount + gameData.bullets.length + gameData.particles.length + gameData.users.length + " objects being rendered"; objectRenderCount = 0; document.getElementById("fps").textContent = "FPS: " + round(frameRate());     document.getElementById("pingcount").textContent = "Ping: " + gameData.players[socket.id].state.ping; } }, 600);
    ping = setInterval(function() {
      const start = Date.now();
    
      socket.emit("ping", {time: start});
    }, 1000);
    switch(gameData.players[socket.id].team) {
      case "blue":
        document.getElementById("blue-score").textContent = gameData.currentRoundScore.blue;
        document.getElementById("red-score").textContent = gameData.currentRoundScore.red;
      break;
      case "red":
        document.getElementById("red-score").textContent = gameData.currentRoundScore.blue;
        document.getElementById("blue-score").textContent = gameData.currentRoundScore.red;
      break;
    }
  });
  
  socket.on("world-update", data => { // LITERALLY EVERY 25 MILLISECONDS !!
    gameData.players = data.players,
    gameData.bullets = data.bullets,
    gameData.particles = data.particles,
    gameData.point = data.point,
    gameData.usersOnline = data.usersOnline,
    gameData.users = data.users;
    gameData.currentRoundScore = data.currentRoundScore;
    gameData.certificate = data.certificate;
    if(gameData.players[socket.id].health > 0) {
      queuedCameraLocation.x = gameData.players[socket.id].state.position.x;
      queuedCameraLocation.y = gameData.players[socket.id].state.position.y;
      queuedCameraLocation.targetX = gameData.players[socket.id].state.position.x;
      queuedCameraLocation.targetY = gameData.players[socket.id].state.position.y;  
    }
  });

  socket.on("gun-ui-change", data => {
    updateGunHUD(data);
  });

  socket.on("ui-change", data => {
    if(data.players[socket.id]) {
      if(data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].type == "melee") {
        document.getElementById("ammocount").innerHTML = '∞';
      } else {
        document.getElementById("ammocount").innerHTML = data.players[socket.id].state.mag[data.players[socket.id].state.activeWeaponIndex] + " <smol> I " + data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].magSize + '</smol> <img src="/assets/misc/bullet-icon.svg" style="width: calc(0.2vw + 0.2vh);"></img>';
      }
      document.getElementById("healthbar").style.width = ((windowWidth * 0.1) * (data.players[socket.id].health / 100)) + ((windowHeight * 0.1) * (data.players[socket.id].health / 100)) + "px";
      document.getElementById("healthbar-opposite").style.width = ((windowWidth * 0.1) * -((data.players[socket.id].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[socket.id].health / 100) - 1)) + "px";
      document.getElementById("healthbar-opposite").style.right = "calc(16.5vw + 16.5vh - " + ((windowWidth * 0.1) * (-((data.players[socket.id].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[socket.id].health / 100) - 1))) + "px)" ;
      document.getElementById("reloadcolumn").style.height = ((width * 0.085) * (data.players[socket.id].state.reloadProgress / data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength)) + ((height * 0.085) * (data.players[socket.id].state.reloadProgress / data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength)) + "px";
      document.getElementById("reloadcolumn").style.right = ((width * 0.155) * (data.players[socket.id].state.reloadProgress / data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength)) + ((height * 0.155) * (data.players[socket.id].state.reloadProgress / data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength)) - ((data.players[socket.id].state.reloadProgress - data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength) * (width / (data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength * 6.025) + height / (data.players[socket.id].guns[data.players[socket.id].state.activeWeaponIndex].reloadLength * 6.025))) + "px";
      switch(data.players[socket.id].team) {
        case "blue":
          document.getElementById("blue-score").textContent = data.currentRoundScore["blue"];
          document.getElementById("red-score").textContent = data.currentRoundScore["red"];
        break;
        case "red":
          document.getElementById("red-score").textContent = data.currentRoundScore["blue"];
          document.getElementById("blue-score").textContent = data.currentRoundScore["red"];
        break;
      }
    }
  });
}

function draw() {
  textFont(sourceSansPro);
  textSize(100);
  animatePlayers();
  displayWorld();
  if(mouseIsPressed && assetsAreLoaded) {
    socket.emit("shoot-request", {});
  }
}
