// HM2024

let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});

window.addEventListener("contextmenu", e => e.preventDefault());

function requestConnectToGame() {
  let platform;
  if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
    platform = "mobile";
  } else {
    platform = "desktop";
  }
  socket.emit("play-request", {platform: platform, /*timestamp: JSON.parse(serverWeightMeasure).ip, */nickname: document.getElementById("nickname-input").value});

  document.getElementById("select-breach").addEventListener("click", function() {changeGun("breach");});
  document.getElementById("select-recon").addEventListener("click", function() {changeGun("recon");});
  document.getElementById("select-assault").addEventListener("click", function() {changeGun("assault");});
  document.getElementById("select-scout").addEventListener("click", function() {changeGun("scout");});
  document.getElementById("select-sniper").addEventListener("click", function() {changeGun("sniper");});

  document.getElementById("respawn-button").addEventListener("click", function() {requestSpawn(); loop();});
}

function changeGun(gun) {
  document.getElementById("select-breach").style.backgroundColor = "#498ee967";
  document.getElementById("select-recon").style.backgroundColor = "#498ee967";
  document.getElementById("select-assault").style.backgroundColor = "#498ee967";
  document.getElementById("select-scout").style.backgroundColor = "#498ee967";
  document.getElementById("select-sniper").style.backgroundColor = "#498ee967";

  document.getElementById("select-" + gun + "").style.backgroundColor = "#498ee9b6";

  document.getElementById("character-body").src = "assets/player/pose-" + gun + ".svg";
  gameData.selectedClass = gun;

  document.getElementById("main").src = gameData.weapons[gameData.mapData.config.loadouts[gun][0]].images.lootSRC;
  document.getElementById("pistol").src = gameData.weapons[gameData.mapData.config.loadouts[gun][1]].images.lootSRC;
  document.getElementById("melee").src = gameData.weapons[gameData.mapData.config.loadouts[gun][2]].images.lootSRC;
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

function requestSpawn() {
  socket.emit("spawn", {class: gameData.selectedClass});
  document.getElementById("weapon-selection").style.display = "none";
  document.getElementById("gun-hud").style.display = "block";
  gameData.players[permanentID].health = 100;
  updateGunHUD(gameData);
  updateHUD(gameData);
}

function connectToRemoteServer(address) {
  var cleanAddress = address;
  if(cleanAddress.includes("localhost")) {
    socket = io.connect("http://" + cleanAddress, { withCredentials: true });
  } else {
    socket = io.connect("wss://" + cleanAddress, { withCredentials: true });
  }

  setupGame();
}

function squaredDist(ptA, ptB) {
  return (ptB.x - ptA.x) ** 2 + (ptB.y - ptA.y) ** 2;
}

function countingSort(arr, min, max) { // credit to arnorhs (https://https://github.com/arnorhs) (modified by me)
  var i, z = 0, count = [];
  for (i = min; i <= max; i++) {
      count[i] = 0;
  }
  for (i=0; i < arr.length; i++) {
      count[arr[i]]++;
  }
  for (i = min; i <= max; i++) {
      while (count[i]-- > 0) {
          arr[z++] = i;
      }
  }
  return arr;
}

function secondsToTimestamp(seconds) {
  if(seconds < 0) {
    return "0:00";
  }
  if(seconds - Math.floor(seconds / 60) * 60 < 10) {
    return Math.floor(gameData.secondsLeft / 60) + ":0" + (gameData.secondsLeft - (Math.floor(gameData.secondsLeft / 60) * 60));
  } else {
    return Math.floor(gameData.secondsLeft / 60) + ":" + (gameData.secondsLeft - (Math.floor(gameData.secondsLeft / 60) * 60));
  }
}

function updateScoreboard(data) {
  //try {
    let scoreList = [],
    highestScore = 0;

    for(let i = 0; i < data.users.length; i++) {
      scoreList.push(data.scoreboard[data.users[i]].score);
      if(data.scoreboard[data.users[i]].score > highestScore) {
        highestScore = data.scoreboard[data.users[i]].score;
      }
    }

    let orderedByScore = countingSort(scoreList, 0, highestScore),
    remainingUsers = JSON.parse(JSON.stringify(data.users)),
    listInnerHTML = "<tr id='scoreboard-headers' style='background-color: #498ee9b6; text-align: center;'><th>NICKNAME</th><th>SCORE</th><th>ELIMS</th><th>DEATHS</th><th>DAMAGE</th></tr>";

    for(let i = orderedByScore.length - 1; i > -1; i--) {
      for(let j = 0; j < remainingUsers.length; j++) {
        if(data.scoreboard[remainingUsers[j]].score == orderedByScore[i]) {
          let teamColour = "#e9494f67";
          if (gameData.players[remainingUsers[j]].team == gameData.players[permanentID].team) {
            teamColour = "#498fe967";
          }
          let newScoreboardRow = "<tr style='background-color: " + teamColour + "; text-align: center;'><td>" + data.scoreboard[remainingUsers[j]].nickname + "</th><td>" + data.scoreboard[remainingUsers[j]].score + "</th><td>" + data.scoreboard[remainingUsers[j]].kills + "</th><td>" + data.scoreboard[remainingUsers[j]].deaths + "</th><td>" + data.scoreboard[remainingUsers[j]].damage + "</th></tr>";

          listInnerHTML = listInnerHTML + newScoreboardRow;

          remainingUsers.splice(j, 1);
          j--;
        }
      }
    }
    document.getElementById("scoreboard").innerHTML = listInnerHTML;
  //} catch {}
}

function updateGunHUD(data) {
  try {
    document.getElementById("main").src = gameData.weapons[data.players[permanentID].guns[0]].images.lootSRC;
    document.getElementById("pistol").src = gameData.weapons[data.players[permanentID].guns[1]].images.lootSRC;
    document.getElementById("melee").src = gameData.weapons[data.players[permanentID].guns[2]].images.lootSRC;
    document.getElementById("main-backing").style.width = "calc(" + document.getElementById("main").width + "px + 4.5vw + 4.5vh)";
    document.getElementById("pistol-backing").style.width = "calc(" + document.getElementById("pistol").width + "px + 4.5vw + 4.5vh)";
    document.getElementById("melee-backing").style.width = "calc(" + document.getElementById("melee").width + "px + 4.5vw + 4.5vh)";
    document.getElementById("main-backing").style.backgroundColor = "#498ee967";
    document.getElementById("pistol-backing").style.backgroundColor = "#498ee967";
    document.getElementById("melee-backing").style.backgroundColor = "#498ee967";
    document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex] + "-backing").style.width = "calc(" + document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex]).width + "px + 7vw + 7vh)";
    document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex] + "-backing").style.backgroundColor = "#498ee9b6";
  } catch { }
}

function updateHUD(data) {
  if(data.players[permanentID]) {
    if(gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].type == "melee") {
      document.getElementById("ammocount").innerHTML = '∞';
    } else {
      document.getElementById("ammocount").innerHTML = data.players[permanentID].state.mag[data.players[permanentID].state.activeWeaponIndex] + " <smol> I " + gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].magSize + '</smol> <img src="/assets/misc/bullet-icon.svg" style="width: calc(0.2vw + 0.2vh);"></img>';
    }
    document.getElementById("healthbar").style.width = ((windowWidth * 0.1) * (data.players[permanentID].health / 100)) + ((windowHeight * 0.1) * (data.players[permanentID].health / 100)) + "px";
    document.getElementById("healthbar-opposite").style.width = ((windowWidth * 0.1) * -((data.players[permanentID].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[permanentID].health / 100) - 1)) + "px";
    document.getElementById("healthbar-opposite").style.right = "calc(16.5vw + 16.5vh - " + ((windowWidth * 0.1) * (-((data.players[permanentID].health / 100) - 1)) + ((windowHeight * 0.1) * -((data.players[permanentID].health / 100) - 1))) + "px)" ;
    document.getElementById("healthbar-text").innerHTML = gameData.players[permanentID].health + '<smol> I 100 </smol><img src="/assets/misc/health-icon.svg" style="width: calc(0.8vw + 0.8vh); margin-top: calc(0.4vw + 0.4vh); margin-right: calc(0.8vw + 0.8vh); transform: skew(14deg);"></img> ';
    document.getElementById("reloadcolumn").style.height = ((width * 0.085) * (data.players[permanentID].state.reloadProgress / gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength)) + ((height * 0.085) * (data.players[permanentID].state.reloadProgress / gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength)) + "px";
    document.getElementById("reloadcolumn").style.right = ((width * 0.155) * (data.players[permanentID].state.reloadProgress / gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength)) + ((height * 0.155) * (data.players[permanentID].state.reloadProgress / gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength)) - ((data.players[permanentID].state.reloadProgress - gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength) * (width / (gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength * 6.025) + height / (gameData.weapons[data.players[permanentID].guns[data.players[permanentID].state.activeWeaponIndex]].reloadLength * 6.025))) + "px";
    switch(data.players[permanentID].team) {
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
  if(data.players[permanentID].health < 1 && data.secondsLeft > 0) {
    document.getElementById("weapon-selection").style.display = "block";
    document.getElementById("gun-hud").style.display = "none";
  } else if(document.getElementById("weapon-selection").style.display != "none") {
    document.getElementById("weapon-selection").style.display = "none";
  }
  if(data.secondsLeft < 1) {
    noLoop();
    document.getElementById("gun-hud").style.display = "none";
    document.getElementById("blue-score-container").style.display = "none";
    document.getElementById("time-left-container").style.display = "none";
    document.getElementById("red-score-container").style.display = "none";
    document.getElementById("scoreboard-container").style.display = "block";
    document.getElementById("end-of-game-page-container").style.display = "block";
    switch(data.players[permanentID].team) {
      case "blue":
        if(data.currentRoundScore["blue"] > data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "VICTORY";
        } else if(data.currentRoundScore["blue"] < data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "DEFEAT";
        } else if(data.currentRoundScore["blue"] == data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "TIE";
        }
      break;
      case "red":
        if(data.currentRoundScore["blue"] < data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "VICTORY";
        } else if(data.currentRoundScore["blue"] > data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "DEFEAT";
        } else if(data.currentRoundScore["blue"] == data.currentRoundScore["red"]) {
          document.getElementById("end-of-game-winloss-text").textContent = "TIE";
        }
      break;
    }
  } else if(data.players[permanentID].health > 0) {
    document.getElementById("blue-score-container").style.display = "block";
    document.getElementById("time-left-container").style.display = "block";
    document.getElementById("red-score-container").style.display = "block";
    document.getElementById("gun-hud").style.display = "block";
  } else {
    document.getElementById("scoreboard-container").style.display = "none";
    document.getElementById("end-of-game-page-container").style.display = "none";
    document.getElementById("scoreboard-container").style.display = "none";
  }
}

function displayParticles() {
  for(let i = 0; i < gameData.particles.length; i++) { 
    const particleData = gameData.particles[i];
    let opacity = Math.round(255 - (Date.now() - particleData.timeStamp) / 2) + 1;
    let tickDelay = syncedMS;
    if(opacity <= -1) {
      gameData.particles.splice(i, 1);
      i--;
    } else {
      if(particleData.timeStamp + 20 > Date.now()) {
        opacity = 0;
      }
      playerBuffer.push();
      playerBuffer.translate(particleData.position.x + Math.cos(particleData.angle) * ((sqrt(Date.now() - particleData.timeStamp - gameData.lastTickDelay) * 20) - 88) - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, particleData.position.y + Math.sin(particleData.angle) * ((sqrt(Date.now() - particleData.timeStamp - gameData.lastTickDelay) * 20) - 80) - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
      playerBuffer.rotate(particleData.rotation / Math.PI * 180 + (Date.now() - particleData.timeStamp) / 10);
      playerBuffer.tint(255, 255, 255, opacity);
      if(particleData.colour != "none") {
        playerBuffer.fill(particleData.colour + hex(opacity)[6] + (hex(opacity)[7]));
        if(particleData.colour == "blue" || particleData.colour === "red") {
          playerBuffer.fill("#e9494f" + hex(opacity)[6] + (hex(opacity)[7]));
          if(particleData.colour == gameData.players[permanentID].team) {
            playerBuffer.fill("#498fe9" + hex(opacity)[6] + (hex(opacity)[7]));
          }
        }
        playerBuffer.ellipse(0, 0, particleData.size * 0.3125, particleData.size * 0.3125);
      }
      playerBuffer.image(assetsLoaded[particleData.src], 0, 0, particleData.size, particleData.size);
      if(debug) {
        playerBuffer.fill(255, 150, 0, 100);
        playerBuffer.rect(0, 0, particleData.size, particleData.size);
      }
      playerBuffer.pop();
    }
  }
}

function displayObstacles() {
  const player = gameData.players[permanentID];
  for (let i = 0; i < player.state.objectRenderList.length; i++) {
    const obstacleData = gameData.mapData.obstacles[player.state.objectRenderList[i]];
    push();
    translate(obstacleData["body-data"].position.x + obstacleData["display-data"]["offset"].x, obstacleData["body-data"].position.y + obstacleData["display-data"]["offset"].y, 0.15);
    rotate(obstacleData["display-data"]["offset"].angle);
    image(assetsLoaded[obstacleData["display-data"].src], 0, 0, obstacleData["display-data"].dimensions.width, obstacleData["display-data"].dimensions.height);
    if(debug) {
      fill(0, 255, 0, 100);
      //noFill();
      //stroke("red");
      //strokeWeight(4);
      rotate(-obstacleData["display-data"]["offset"].angle -obstacleData["body-data"].options.angle / Math.PI * 180);
      switch(obstacleData["body-data"].type) {
        case "rectangle":
          rect(-obstacleData["display-data"]["offset"].x, -obstacleData["display-data"]["offset"].y, obstacleData["body-data"].dimensions.width, obstacleData["body-data"].dimensions.height, obstacleData["display-data"].chamfer);
          break;
        case "circle":
          ellipse(-obstacleData["display-data"]["offset"].x, -obstacleData["display-data"]["offset"].y,  obstacleData["body-data"].radius * 2,  obstacleData["body-data"].radius * 2);
          break;
      }
      strokeWeight(0);
      fill(240, 240, 240, 200);
      textFont(sourceSansPro);
      textSize(60);
      textAlign(CENTER);
      text(obstacleData["display-data"].src.replace("/assets/environment/", ""), 0, 0);
    }
    pop();
  }
}

function displayGuns() {
  for (let i = 0; i < gameData.users.length; i++) {
    if(gameData.players[gameData.users[i]].health > 0 || gameData.secondsLeft < 1) {
      const playerData = gameData.players[gameData.users[i]],
      gun = gameData.weapons[playerData.guns[playerData.state.activeWeaponIndex]],
      tickDelay = syncedMS;
      playerBuffer.push();
      playerBuffer.translate((playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)) - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay) - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
      if(gameData.users[i] == permanentID) {
        playerBuffer.rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        const oldAngleVector = {
          x: Math.cos(playerData.state.previousAngle * Math.PI / 180),
          y: Math.sin(playerData.state.previousAngle * Math.PI / 180)
        },
        newAngleVector = {
          x: Math.cos(playerData.state.angle * Math.PI / 180),
          y: Math.sin(playerData.state.angle * Math.PI / 180)
        }
        playerBuffer.rotate(Math.atan2(oldAngleVector.y + (newAngleVector.y - oldAngleVector.y) * (tickDelay / gameData.lastTickDelay), oldAngleVector.x + (newAngleVector.x - oldAngleVector.x) * (tickDelay / gameData.lastTickDelay)) / Math.PI * 180 - 90);
      }
      playerBuffer.scale(0.7);
      playerBuffer.image(assetsLoaded[gun.images.topdownSRC], gun.images.offset.x + playerData.state.recoilTimer * gun.recoilImpulse[2].x, gun.images.offset.y + playerData.state.recoilTimer * gun.recoilImpulse[2].y);
      playerBuffer.scale(1 / 0.7);
      playerBuffer.fill("#e9494f");  
      if (playerData.team == gameData.players[permanentID].team) {
        playerBuffer.fill("#498fe9");
      }
      for (let j = 0; j < gun.handPositions.length; j++) {
        playerBuffer.ellipse(gun.handPositions[j].x + playerData.state.recoilTimer * (gun.recoilImpulse[j].x * 0.7), gun.handPositions[j].y + playerData.state.recoilTimer * (gun.recoilImpulse[j].y * 0.7), 90, 90);
        playerBuffer.image(assetsLoaded["/assets/player/player-hand.svg"], gun.handPositions[j].x + playerData.state.recoilTimer * (gun.recoilImpulse[j].x * 0.7), gun.handPositions[j].y + playerData.state.recoilTimer * (gun.recoilImpulse[j].y * 0.7), 100, 100);
      }
      playerBuffer.pop();
    }
  }
}

function displayBullets() {
  for (let i = 0; i < gameData.bullets.length; i++) {
    const bullet = gameData.bullets[i],
    tickDelay = syncedMS,
    opacity = Math.round(((-(Date.now() - bullet.timeStamp) / 3) + (bullet.timeLeft * 6))) / 2,
    lengthMultiplier = restrict(((Date.now() - bullet.timeStamp) / (gameData.lastTickDelay)) / 2, 0, 1);
    if(opacity <= 1) {
      gameData.bullets.splice(i, 1);
      i--;
    } else {
      playerBuffer.push();
      playerBuffer.imageMode(CORNER);
      playerBuffer.translate(bullet.coordinates.start.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, bullet.coordinates.start.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
      if (bullet.emitter == gameData.players[permanentID].team) {
        playerBuffer.tint(40, 150, 255, (bullet.timeLeft / 25) * opacity);
      } else {
        playerBuffer.tint(230, 40, 40, (bullet.timeLeft / 25) * opacity);
      }
      playerBuffer.rotate(bullet.angle - 90);
      if(lengthMultiplier * bullet.tracerLength > 2000) {
        playerBuffer.image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, (lengthMultiplier * bullet.tracerLength - 2000) - (lengthMultiplier * bullet.tracerLength), 25, 2000);
        playerBuffer.image(assetsLoaded["/assets/weapons/tracer-end.svg"], -12.5, -(lengthMultiplier * bullet.tracerLength + 15), 25, (lengthMultiplier * bullet.tracerLength - 1985));
      } else {
        playerBuffer.image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, -(lengthMultiplier * bullet.tracerLength), 25, (lengthMultiplier * bullet.tracerLength + 15));
      }
      playerBuffer.imageMode(CENTER);
      playerBuffer.tint(255, 255, 255, ((bullet.timeLeft / 25) * opacity) + 100);
      playerBuffer.image(assetsLoaded["/assets/weapons/bullet.svg"], 0, -(lengthMultiplier * bullet.tracerLength) - 20, 100, 100);
      playerBuffer.tint(255);
      if(debug) {
        playerBuffer.fill(255, 255, 0, 200);
        playerBuffer.rectMode(CORNER);
        playerBuffer.rect(-12.5, 0, 25, -dist(bullet.coordinates.start.x, bullet.coordinates.start.y, bullet.coordinates.finish.x, bullet.coordinates.finish.y));
        playerBuffer.fill(255, 0, 0, 255);
        playerBuffer.rect(-0.5, 0, 1, -dist(bullet.coordinates.start.x, bullet.coordinates.start.y, bullet.coordinates.finish.x, bullet.coordinates.finish.y));
        playerBuffer.rectMode(CENTER);
      }
      playerBuffer.pop();
    }
  }
}

function displayPlayers() {
  for (let i = 0; i < gameData.users.length; i++) {
    if(gameData.players[gameData.users[i]].health > 0 || gameData.secondsLeft < 1) {
      const playerData = gameData.players[gameData.users[i]],
      tickDelay = syncedMS;
      playerBuffer.push();
      playerBuffer.translate((playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)) - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay) - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
      if(gameData.users[i] == permanentID) {
        playerBuffer.rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        playerBuffer.rotate(playerData.state.angle - 90);
      }
      playerBuffer.fill("#e9494f");
      if (playerData.team == gameData.players[permanentID].team) {
        playerBuffer.fill("#498fe9");
      }
      playerBuffer.ellipse(0, 0, 230, 230);
      playerBuffer.image(assetsLoaded["/assets/player/player-base.svg"], 0, 0, 250, 250);
      playerBuffer.pop();
      playerBuffer.push();
      if(debug) {
        playerBuffer.fill(0, 255, 0, 100);
        playerBuffer.ellipse(playerData.state.position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, playerData.state.position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2, 230, 230);      
        playerBuffer.translate((playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)) - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay) - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);  
        if(!!playerData.state.force.y) {
          playerBuffer.rotate(180);
          if(playerData.state.force.y < 0) playerBuffer.rotate(180);
          playerBuffer.image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.y * 7);
          if(playerData.state.force.y < 0) playerBuffer.rotate(-180);
        }
        if(!!playerData.state.force.x) {
          playerBuffer.rotate(-90);
          if(playerData.state.force.x < 0) playerBuffer.rotate(180);
          playerBuffer.image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.x * 7);       
          if(playerData.state.force.x < 0) playerBuffer.rotate(-180);   
        }
      }
      playerBuffer.pop();
    }
  }
}

function interpolateCamera() {
  const playerData = gameData.players[permanentID],
  tickDelay = syncedMS;
  queuedCameraLocation.x = playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay);
  queuedCameraLocation.y = playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay);
  queuedCameraLocation.targetX = playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay);
  queuedCameraLocation.targetY  = playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay);
}

function displayFog() {
  const playerData = gameData.players[permanentID],
  currentWeapon = gameData.weapons[playerData.guns[playerData.state.activeWeaponIndex]],
  tickDelay = syncedMS;
  shadowBuffer.noStroke();
  playerBuffer.noStroke();
  // retarded vision cone mechanic
  /*shadowBuffer.push();
  shadowBuffer.translate((playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)) - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay) - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
  shadowBuffer.rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
  shadowBuffer.image(assetsLoaded["/assets/misc/vision-cone.svg"], 0, 0, 7000, 7000);
  shadowBuffer.pop();*/
  for(let i = 0; i < playerData.state.objectRenderList.length; i++) {
    const obstacleData = gameData.mapData.obstacles[playerData.state.objectRenderList[i]],
    playerObjectAngle = -atan2(obstacleData["body-data"].position.x - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), obstacleData["body-data"].position.y - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) + 90;
    switch(obstacleData["body-data"].type) {
      case "rectangle":
        let playerCoordinates = {x: (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))},
        relativePositionState = {x: "middle", y: "middle"},
        points = {point1: {}, point2: {}, optional1: {exists: false}, optional2: {exists: false} };
        if(obstacleData["body-data"].options.angle == 0) {
          if(playerCoordinates.x < obstacleData["body-data"].position.x - obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "left";
          } else if(playerCoordinates.x >= obstacleData["body-data"].position.x - obstacleData["body-data"].dimensions.width / 2 && playerCoordinates.x <= obstacleData["body-data"].position.x + obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "middle";
          } else if(playerCoordinates.x > obstacleData["body-data"].position.x + obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "right";
          }

          if(playerCoordinates.y < obstacleData["body-data"].position.y - obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "top";
          } else if(playerCoordinates.y >= obstacleData["body-data"].position.y - obstacleData["body-data"].dimensions.height / 2 && playerCoordinates.y <= obstacleData["body-data"].position.y + obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "middle";
          } else if(playerCoordinates.y > obstacleData["body-data"].position.y + obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "bottom";
          }

          switch(relativePositionState.x) {
            case "left": 
            switch(relativePositionState.y) {
              case "top": 
                points.point1 = {
                  x: -5 + obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
              case "middle": 
                points.point1 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
              case "bottom": 
                points.point1 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: -5 + obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
            }
            break;
            case "middle": 
              switch(relativePositionState.y) {
                case "top": 
                  points.point1 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "middle": 
                  points.point1 = {
                    x: "inside",
                    y: "inside"
                  };
                  points.point2 = {
                    x: "inside",
                    y: "inside"
                  };
                break;
                case "bottom": 
                  points.point1 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
              }
            break;
            case "right": 
              switch(relativePositionState.y) {
                case "top": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "middle": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "bottom": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
              }
            break;
          }

          playerBuffer.erase();
          playerBuffer.push();
          playerBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
          playerBuffer.beginShape();
          playerBuffer.vertex(points.point1.x, points.point1.y);
          playerBuffer.vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          playerBuffer.vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          playerBuffer.vertex(points.point2.x, points.point2.y);
          playerBuffer.endShape();
          playerBuffer.pop();
          playerBuffer.noErase();

          shadowBuffer.push();
          shadowBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.height / 2);
          shadowBuffer.translate(0, 0, 0.15);
          shadowBuffer.fill("#ffffff");
          shadowBuffer.beginShape();
          shadowBuffer.vertex(points.point1.x, points.point1.y);
          shadowBuffer.vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          shadowBuffer.vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          shadowBuffer.vertex(points.point2.x, points.point2.y);
          shadowBuffer.endShape();
          shadowBuffer.pop();
        } else {
          let objectToPlayerData = {
            distance: Math.sqrt(squaredDist(obstacleData["body-data"].position, playerCoordinates)),
            angle: atan2(obstacleData["body-data"].position.y - playerCoordinates.y, obstacleData["body-data"].position.x - playerCoordinates.x),
            objectAngle: obstacleData["body-data"].options.angle * 180 / Math.PI
          },
          newRotatedPlayerCoordinates = {
            x: (cos(objectToPlayerData.angle + -objectToPlayerData.objectAngle) * objectToPlayerData.distance) + obstacleData["body-data"].position.x,
            y: (sin(objectToPlayerData.angle + -objectToPlayerData.objectAngle) * objectToPlayerData.distance) + obstacleData["body-data"].position.y,
          };
          if(newRotatedPlayerCoordinates.x < obstacleData["body-data"].position.x - obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "left";
          } else if(newRotatedPlayerCoordinates.x >= obstacleData["body-data"].position.x - obstacleData["body-data"].dimensions.width / 2 && newRotatedPlayerCoordinates.x <= obstacleData["body-data"].position.x + obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "middle";
          } else if(newRotatedPlayerCoordinates.x > obstacleData["body-data"].position.x + obstacleData["body-data"].dimensions.width / 2) {
            relativePositionState.x = "right";
          }

          if(newRotatedPlayerCoordinates.y < obstacleData["body-data"].position.y - obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "top";
          } else if(newRotatedPlayerCoordinates.y >= obstacleData["body-data"].position.y - obstacleData["body-data"].dimensions.height / 2 && newRotatedPlayerCoordinates.y <= obstacleData["body-data"].position.y + obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "middle";
          } else if(newRotatedPlayerCoordinates.y > obstacleData["body-data"].position.y + obstacleData["body-data"].dimensions.height / 2) {
            relativePositionState.y = "bottom";
          }

          switch(relativePositionState.x) {
            case "left": 
            switch(relativePositionState.y) {
              case "top": 
                points.point1 = {
                  x: -5 + obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
              case "middle": 
                points.point1 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
              case "bottom": 
                points.point1 = {
                  x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                  y: 5 + -obstacleData["body-data"].dimensions.height / 2
                };
                points.point2 = {
                  x: -5 + obstacleData["body-data"].dimensions.width / 2,
                  y: -5 + obstacleData["body-data"].dimensions.height / 2
                };
              break;
            }
            break;
            case "middle": 
              switch(relativePositionState.y) {
                case "top": 
                  points.point1 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "middle": 
                  points.point1 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "bottom": 
                  points.point1 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
              }
            break;
            case "right": 
              switch(relativePositionState.y) {
                case "top": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "middle": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
                case "bottom": 
                  points.point1 = {
                    x: -5 + obstacleData["body-data"].dimensions.width / 2,
                    y: 5 + -obstacleData["body-data"].dimensions.height / 2
                  };
                  points.point2 = {
                    x: 5 + -obstacleData["body-data"].dimensions.width / 2,
                    y: -5 + obstacleData["body-data"].dimensions.height / 2
                  };
                break;
              }
            break;
          }
          const radius = (Math.sqrt(obstacleData["body-data"].dimensions.width ** 2 + obstacleData["body-data"].dimensions.height ** 2) / 2) - 5,
          pointAngles = {
            point1: atan2(-points.point1.y, -points.point1.x),
            point2: atan2(-points.point2.y, -points.point2.x)
          };
          points.point1 = {
            x: cos(pointAngles.point1 + objectToPlayerData.objectAngle) * radius,
            y: sin(pointAngles.point1 + objectToPlayerData.objectAngle) * radius
          };
          points.point2 = {
            x: cos(pointAngles.point2 + objectToPlayerData.objectAngle) * radius,
            y: sin(pointAngles.point2 + objectToPlayerData.objectAngle) * radius
          };

          playerBuffer.erase();
          playerBuffer.push();
          playerBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
          playerBuffer.beginShape();
          playerBuffer.vertex(points.point1.x, points.point1.y);
          playerBuffer.vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          playerBuffer.vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          playerBuffer.vertex(points.point2.x, points.point2.y);
          playerBuffer.endShape();
          playerBuffer.pop();
          playerBuffer.noErase();

          shadowBuffer.push();
          shadowBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.height / 2);
          shadowBuffer.translate(0, 0, 0.15);
          shadowBuffer.fill("#ffffff");
          shadowBuffer.beginShape();
          shadowBuffer.vertex(points.point1.x, points.point1.y);
          shadowBuffer.vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          shadowBuffer.vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          shadowBuffer.vertex(points.point2.x, points.point2.y);
          shadowBuffer.endShape();
          shadowBuffer.pop();
        }
        break;
      case "circle":
        // solves ssa triangle to determine what portion of the circle is visible
        let playerObjectDistance = Math.sqrt(squaredDist({x: (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))}, obstacleData["body-data"].position)),
        radius = obstacleData["body-data"].radius,
        secondAngle = asin((radius * sin(90)) / playerObjectDistance),
        finalAngle = 90 - secondAngle,
        negativeCoordinate = {x: cos(playerObjectAngle - finalAngle + 180) * radius, y: sin(playerObjectAngle - finalAngle + 180) * radius},
        positiveCoordinate = {x: cos(playerObjectAngle + finalAngle + 180) * radius, y: sin(playerObjectAngle + finalAngle + 180) * radius};

        playerBuffer.erase();
        playerBuffer.push();
        playerBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + playerBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + playerBuffer.height / 2);
        playerBuffer.beginShape();
        playerBuffer.vertex(positiveCoordinate.x, positiveCoordinate.y);
        playerBuffer.vertex(positiveCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), positiveCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        playerBuffer.vertex(negativeCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), negativeCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        playerBuffer.vertex(negativeCoordinate.x, negativeCoordinate.y);
        playerBuffer.endShape();
        playerBuffer.pop();
        playerBuffer.noErase();
          
        shadowBuffer.push();
        shadowBuffer.translate(obstacleData["body-data"].position.x - (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.width / 2, obstacleData["body-data"].position.y - (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (tickDelay / gameData.lastTickDelay)) + shadowBuffer.height / 2);
        shadowBuffer.fill("#ffffff");
        shadowBuffer.translate(0, 0, 0.15);
        shadowBuffer.beginShape();
        shadowBuffer.vertex(positiveCoordinate.x, positiveCoordinate.y);
        shadowBuffer.vertex(positiveCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), positiveCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        shadowBuffer.vertex(negativeCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), negativeCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        shadowBuffer.vertex(negativeCoordinate.x, negativeCoordinate.y);
        shadowBuffer.endShape();
        shadowBuffer.pop();
        break;
    }
  }
}

function displayPlayerFog() {
  const playerData = gameData.players[permanentID],
  currentWeapon = gameData.weapons[playerData.guns[playerData.state.activeWeaponIndex]],
  tickDelay = syncedMS,
  playerAngle = atan2(mouseY - height / 2, mouseX - width / 2) + 180;
  for(let i = 0; i < gameData.users.length; i++) {
    if(gameData.players[gameData.users[i]].health > 0 && gameData.users[i] != permanentID) {
      let object = gameData.players[gameData.users[i]],
      objectCoordinates = {x: (object.state.previousPosition.x + object.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (object.state.previousPosition.y + object.state.force.y * (tickDelay / gameData.lastTickDelay))},
      playerObjectAngle = -atan2(objectCoordinates.x - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), objectCoordinates.y - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) + 90;
      let playerObjectDistance = Math.sqrt(squaredDist({x: (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))}, objectCoordinates)),
      radius = 125,
      secondAngle = asin((radius * sin(90)) / playerObjectDistance),
      finalAngle = 90 - secondAngle,
      negativeCoordinate = {x: cos(playerObjectAngle - finalAngle + 180) * radius, y: sin(playerObjectAngle - finalAngle + 180) * radius},
      positiveCoordinate = {x: cos(playerObjectAngle + finalAngle + 180) * radius, y: sin(playerObjectAngle + finalAngle + 180) * radius};
      push();
      translate(objectCoordinates.x, objectCoordinates.y);
      fill("#333333");
      beginShape();
      vertex(positiveCoordinate.x, positiveCoordinate.y);
      vertex(positiveCoordinate.x - (cos(-atan2((objectCoordinates.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (objectCoordinates.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), positiveCoordinate.y - (sin(-atan2((objectCoordinates.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (objectCoordinates.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
      vertex(negativeCoordinate.x - (cos(-atan2((objectCoordinates.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (objectCoordinates.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), negativeCoordinate.y - (sin(-atan2((objectCoordinates.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (objectCoordinates.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
      vertex(negativeCoordinate.x, negativeCoordinate.y);
      endShape();
      pop();
      /*push();
      translate(0, 0, 1);
      fill("red");
      beginShape();
      vertex(objectCoordinates.x + positiveCoordinate.x, objectCoordinates.y + positiveCoordinate.y);
      vertex(objectCoordinates.x, objectCoordinates.y);
      vertex((playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay)));
      endShape();
      pop();*/
    }1
  }
}

function displayPoint() {
  push();
  translate(gameData.point.position.x, gameData.point.position.y);
  tint(230, 40, 40);
  switch(gameData.point.state) {
    case "uncontested":
      tint(255, 207, 61);
      break;
    case gameData.players[permanentID].team:
      tint(40, 150, 255);
      break;
  }
  image(assetsLoaded["/assets/environment/point-outline.svg"], 0, 0, 1884, 1884);
  tint("white");
  pop();
}

function displayWorld() {
  if (assetsAreLoaded) {
    rectMode(CENTER);
    syncedMS = Date.now() - gameData.timeStamp;
    interpolateCamera();
    cameraLocation = queuedCameraLocation;
    camera(cameraLocation.x, cameraLocation.y, cameraLocation.z + sin(frameCount * 1.5) * 10, cameraLocation.targetX, cameraLocation.targetY, cameraLocation.targetZ);
    background(gameData.mapData.config["background-colour"]);
    fill(gameData.mapData.config["ground-colour"]);
    rect(gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height);
    image(assetsLoaded[gameData.mapData.config["ground-image"]], gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height);
    if(gameData.mapData.config.gamemode == "hardpoint") {
      displayPoint();
    }
    shadowBuffer.clear();
    playerBuffer.clear();
    displayBullets();
    displayParticles();
    displayGuns();
    displayPlayers(); 
    displayFog();
    image(playerBuffer, (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (syncedMS / gameData.lastTickDelay)), (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (syncedMS / gameData.lastTickDelay)), playerBuffer.width, playerBuffer.height);
    tint("#33333325");
    image(shadowBuffer, (gameData.players[permanentID].state.previousPosition.x + gameData.players[permanentID].state.force.x * (syncedMS / gameData.lastTickDelay)), (gameData.players[permanentID].state.previousPosition.y + gameData.players[permanentID].state.force.y * (syncedMS / gameData.lastTickDelay)), shadowBuffer.width, shadowBuffer.height);
    tint("#ffffff");    
    displayObstacles();
    if(Math.round((queuedCameraLocation.z / 4)) * 4 != Math.round((gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view + 2000 / 4)) * 4) {
      queuedCameraLocation.z += Math.round((gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view + 2000 - queuedCameraLocation.z) / 6);
    }
    if(mouseX != pmouseX || mouseY != pmouseY) {
      socket.emit("angle-change", { angle: atan2(mouseY - height / 2, mouseX - width / 2) + 180, certificate: gameData.certificate });
    }
  }
}