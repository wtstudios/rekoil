// HM2023

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
  socket.emit("play-request", {platform: platform, timestamp: JSON.parse(serverWeightMeasure).ip});

  document.getElementById("select-breach").addEventListener("click", function() {changeGun("breach");});
  document.getElementById("select-assault").addEventListener("click", function() {changeGun("assault");});
  document.getElementById("select-scout").addEventListener("click", function() {changeGun("scout");});

  document.getElementById("respawn-button").addEventListener("click", function() {requestSpawn();});
}

function changeGun(gun) {

  document.getElementById("select-breach").style.backgroundColor = "#498ee967";
  document.getElementById("select-assault").style.backgroundColor = "#498ee967";
  document.getElementById("select-scout").style.backgroundColor = "#498ee967";

  document.getElementById("select-" + gun + "").style.backgroundColor = "#498ee9b6";

  document.getElementById("character-body").src = "assets/player/pose-" + gun + ".svg";
  gameData.selectedClass = gun;
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
  updateGunHUD();
}

function connectToRemoteServer(address) {
  var cleanAddress = document.getElementById("server-input").value.replace(/^https?\:\/\//i, "");
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
  if(data.players[permanentID].health > 0) {
  } else {
    document.getElementById("weapon-selection").style.display = "block";
    document.getElementById("gun-hud").style.display = "none";
  }
}

function displayParticles() {
  for(let i = 0; i < gameData.particles.length; i++) { 
    const particleData = gameData.particles[i],
    opacity = Math.round(255 - (Date.now() - particleData.timeStamp) / 2) + 1;
    if(opacity <= -1) {
      gameData.particles.splice(i, 1);
      i--;
    } else {
      push();
      translate(particleData.position.x + Math.cos(particleData.angle) * ((sqrt(Date.now() - particleData.timeStamp - gameData.lastTickDelay) * 15) - 44), particleData.position.y + Math.sin(particleData.angle) * ((sqrt(Date.now() - particleData.timeStamp - gameData.lastTickDelay) * 15) - 44));
      rotate(particleData.rotation / Math.PI * 180 + (Date.now() - particleData.timeStamp) / 10);
      tint(255, 255, 255, opacity);
      if(particleData.colour != "none") {
        fill(particleData.colour + hex(opacity)[6] + (hex(opacity)[7]));
        if(particleData.colour == "blue" || particleData.colour === "red") {
          fill("#e9494f" + hex(opacity)[6] + (hex(opacity)[7]));
          if(particleData.colour == gameData.players[permanentID].team) {
            fill("#498fe9" + hex(opacity)[6] + (hex(opacity)[7]));
          }
        }
        ellipse(0, 0, particleData.size * 0.3125, particleData.size * 0.3125);
      }
      image(assetsLoaded[particleData.src], 0, 0, particleData.size, particleData.size);
      if(debug) {
        fill(255, 150, 0, 100);
        rect(0, 0, particleData.size, particleData.size);
      }
      pop();
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
    if(gameData.players[gameData.users[i]].health > 0) {
      const playerData = gameData.players[gameData.users[i]],
      gun = gameData.weapons[playerData.guns[playerData.state.activeWeaponIndex]],
      tickDelay = syncedMS;
      push();
      translate(playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay), playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay));
      if(gameData.users[i] == permanentID) {
        rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        const oldAngleVector = {
          x: Math.cos(playerData.state.previousAngle * Math.PI / 180),
          y: Math.sin(playerData.state.previousAngle * Math.PI / 180)
        },
        newAngleVector = {
          x: Math.cos(playerData.state.angle * Math.PI / 180),
          y: Math.sin(playerData.state.angle * Math.PI / 180)
        }
        rotate(Math.atan2(oldAngleVector.y + (newAngleVector.y - oldAngleVector.y) * (tickDelay / gameData.lastTickDelay), oldAngleVector.x + (newAngleVector.x - oldAngleVector.x) * (tickDelay / gameData.lastTickDelay)) / Math.PI * 180 - 90);
      }
      scale(0.7);
      image(assetsLoaded[gun.images.topdownSRC], gun.images.offset.x + playerData.state.recoilTimer * gun.recoilImpulse[2].x, gun.images.offset.y + playerData.state.recoilTimer * gun.recoilImpulse[2].y);
      scale(1 / 0.7);
      fill("#e9494f");  
      if (playerData.team == gameData.players[permanentID].team) {
        fill("#498fe9");
      }
      for (let j = 0; j < gun.handPositions.length; j++) {
        ellipse(gun.handPositions[j].x + playerData.state.recoilTimer * (gun.recoilImpulse[j].x * 0.7), gun.handPositions[j].y + playerData.state.recoilTimer * (gun.recoilImpulse[j].y * 0.7), 90, 90);
        image(assetsLoaded["/assets/player/player-hand.svg"], gun.handPositions[j].x + playerData.state.recoilTimer * (gun.recoilImpulse[j].x * 0.7), gun.handPositions[j].y + playerData.state.recoilTimer * (gun.recoilImpulse[j].y * 0.7), 100, 100);
      }
      pop();
    }
  }
}

function displayBullets() {
  for (let i = 0; i < gameData.bullets.length; i++) {
    const bullet = gameData.bullets[i],
    tickDelay = syncedMS,
    opacity = Math.round((-(Date.now() - bullet.timeStamp) / 3) + (bullet.timeLeft * 6)),
    lengthMultiplier = restrict((Date.now() - bullet.timeStamp) / (gameData.lastTickDelay), 0, 1);
    if(opacity <= 1) {
      gameData.bullets.splice(i, 1);
      i--;
    } else {
      push();
      imageMode(CORNER);
      translate(bullet.coordinates.start.x, bullet.coordinates.start.y);
      if (bullet.emitter == gameData.players[permanentID].team) {
        tint(40, 150, 255, (bullet.timeLeft / 25) * opacity);
      } else {
        tint(230, 40, 40, (bullet.timeLeft / 25) * opacity);
      }
      rotate(bullet.angle - 90);
      if(lengthMultiplier * bullet.tracerLength > 2000) {
        image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, (lengthMultiplier * bullet.tracerLength - 2000) - (lengthMultiplier * bullet.tracerLength), 25, 2000);
        image(assetsLoaded["/assets/weapons/tracer-end.svg"], -12.5, -(lengthMultiplier * bullet.tracerLength + 15), 25, (lengthMultiplier * bullet.tracerLength - 1985));
      } else {
        image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, -(lengthMultiplier * bullet.tracerLength), 25, (lengthMultiplier * bullet.tracerLength + 15));
      }
      imageMode(CENTER);
      if(debug) {
        fill(255, 255, 0, 200);
        rectMode(CORNER);
        rect(-12.5, 0, 25, -dist(bullet.coordinates.start.x, bullet.coordinates.start.y, bullet.coordinates.finish.x, bullet.coordinates.finish.y));
        fill(255, 0, 0, 255);
        rect(-0.5, 0, 1, -dist(bullet.coordinates.start.x, bullet.coordinates.start.y, bullet.coordinates.finish.x, bullet.coordinates.finish.y));
        rectMode(CENTER);
      }
      pop();
    }
  }
}

function displayPlayers() {
  for (let i = 0; i < gameData.users.length; i++) {
    if(gameData.players[gameData.users[i]].health > 0) {
      const playerData = gameData.players[gameData.users[i]],
      tickDelay = syncedMS;
      push();
      fill("#e9494f");
      if (playerData.team == gameData.players[permanentID].team) {
        fill("#498fe9");
      }
      translate(playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay), playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay));
      if(gameData.users[i] == permanentID) {
        rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        rotate(playerData.state.angle - 90);
      }
      ellipse(0, 0, 230, 230);
      image(assetsLoaded["/assets/player/player-base.svg"], 0, 0, 250, 250);
      pop();
      push();
      if(debug) {
        fill(0, 255, 0, 100);
        ellipse(playerData.state.position.x, playerData.state.position.y, 230, 230);
        translate(playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay), playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay));
        if(!!playerData.state.force.y) {
          rotate(180);
          image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.y * 7);
        }
        if(!!playerData.state.force.x) {
          rotate(-90);
          image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.x * 7);          
        }
      }
      pop();
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
  tickDelay = syncedMS,
  playerAngle = atan2(mouseY - height / 2, mouseX - width / 2) + 180;

  let shadowLog = [];
  for(let i = 0; i < playerData.state.objectRenderList.length; i++) {
    const obstacleData = gameData.mapData.obstacles[playerData.state.objectRenderList[i]],
    playerObjectAngle = -atan2(obstacleData["body-data"].position.x - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), obstacleData["body-data"].position.y - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) + 90;
    push();
    translate(obstacleData["body-data"].position.x, obstacleData["body-data"].position.y);
    switch(obstacleData["body-data"].type) {
      case "rectangle":
        let playerCoordinates = {x: (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))},
        relativePositionState = {x: "middle", y: "middle"},
        points = {point1: {}, point2: {}},
        rectShadow = [];
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

          /*rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point1.x,
              y: obstacleData["body-data"].position.y + points.point1.y
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)),
              y: obstacleData["body-data"].position.y + points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)),
              y: obstacleData["body-data"].position.y + points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point2.x,
              y: obstacleData["body-data"].position.y + points.point2.y
            }
          );

          if(shadowLog.length == 0) {
            shadowLog = CSG.fromPolygons([rectShadow]);
          } else {
            shadowLog = shadowLog.union(CSG.fromPolygons([rectShadow]));
          }*/

          translate(0, 0, 0.1);
          fill("#333333");
          beginShape();
          vertex(points.point1.x, points.point1.y);
          vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          vertex(points.point2.x, points.point2.y);
          endShape();
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

                    /*rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point1.x,
              y: obstacleData["body-data"].position.y + points.point1.y
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)),
              y: obstacleData["body-data"].position.y + points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)),
              y: obstacleData["body-data"].position.y + points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
            }
          );
  
          rectShadow.push(
            {
              x: obstacleData["body-data"].position.x + points.point2.x,
              y: obstacleData["body-data"].position.y + points.point2.y
            }
          );

          if(shadowLog.length == 0) {
            shadowLog = CSG.fromPolygons([rectShadow]);
          } else {
            shadowLog = shadowLog.union(CSG.fromPolygons([rectShadow]));
          }*/

          translate(0, 0, 0.1);
          fill("#333333");
          beginShape();
          vertex(points.point1.x, points.point1.y);
          vertex(points.point1.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point1.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point1.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point1.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          vertex(points.point2.x - (cos(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), points.point2.y - (sin(-atan2((obstacleData["body-data"].position.x + points.point2.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + points.point2.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (500000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
          vertex(points.point2.x, points.point2.y);
          endShape();
        }
        break;
      case "circle":
        // solves ssa triangle to determine what portion of the circle is visible
        let playerObjectDistance = Math.sqrt(squaredDist({x: (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), y: (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))}, obstacleData["body-data"].position)),
        radius = obstacleData["body-data"].radius,
        secondAngle = asin((radius * sin(90)) / playerObjectDistance),
        finalAngle = 90 - secondAngle,
        negativeCoordinate = {x: cos(playerObjectAngle - finalAngle + 180) * radius, y: sin(playerObjectAngle - finalAngle + 180) * radius},
        positiveCoordinate = {x: cos(playerObjectAngle + finalAngle + 180) * radius, y: sin(playerObjectAngle + finalAngle + 180) * radius},
        shadow = [];

        /*shadow.push(
          {
            x: obstacleData["body-data"].position.x + positiveCoordinate.x,
            y: obstacleData["body-data"].position.y + positiveCoordinate.y
          }
        );

        shadow.push(
          {
            x: obstacleData["body-data"].position.x + positiveCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), 
            y: obstacleData["body-data"].position.y + positiveCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
          }
        );

        shadow.push(
          {
            x: obstacleData["body-data"].position.x + negativeCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), 
            y: obstacleData["body-data"].position.y + negativeCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15))
          }
        );

        shadow.push(
          {
            x: obstacleData["body-data"].position.x + negativeCoordinate.x,
            y: obstacleData["body-data"].position.y + negativeCoordinate.y
          }
        );

        if(shadowLog.length == 0) {
          shadowLog = CSG.fromPolygons([shadow]);
        } else {
          shadowLog = shadowLog.union(CSG.fromPolygons([shadow]));
        }*/
          
        fill("#333333");
        translate(0, 0, 0.1);
        beginShape();
        vertex(positiveCoordinate.x, positiveCoordinate.y);
        vertex(positiveCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), positiveCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + positiveCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + positiveCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        vertex(negativeCoordinate.x - (cos(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)), negativeCoordinate.y - (sin(-atan2((obstacleData["body-data"].position.x + negativeCoordinate.x) - (playerData.state.previousPosition.x + playerData.state.force.x * (tickDelay / gameData.lastTickDelay)), (obstacleData["body-data"].position.y + negativeCoordinate.y) - (playerData.state.previousPosition.y + playerData.state.force.y * (tickDelay / gameData.lastTickDelay))) - 90) * (5000 + gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view ** 1.15)));
        vertex(negativeCoordinate.x, negativeCoordinate.y);
        endShape();
        break;
    }
    pop();
  }

  /*if(shadowLog.length != 0) {
    fill("#33333380");
    beginShape();
    for(let i = 0; i < shadowLog.segments.length; i++) {
      vertex(shadowLog.segments[i].vertices[0].x, shadowLog.segments[i].vertices[0].y);
    }
    endShape();
  }*/
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
    camera(cameraLocation.x, cameraLocation.y, 3000 + cameraLocation.z + sin(frameCount * 1.5) * 10, cameraLocation.targetX, cameraLocation.targetY, cameraLocation.targetZ);
    background(gameData.mapData.config["background-colour"]);
    fill(gameData.mapData.config["ground-colour"]);
    rect(gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height);
    image(assetsLoaded[gameData.mapData.config["ground-image"]], gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height);
    if(gameData.mapData.config.gamemode == "hardpoint") {
      displayPoint();
    }
    displayFog();
    displayBullets();
    displayParticles();
    displayGuns();
    displayPlayers(); 
    displayObstacles();
    if(queuedCameraLocation.z != gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view + 2000) {
      queuedCameraLocation.z += Math.round((gameData.weapons[gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex]].view + 2000 - queuedCameraLocation.z) / 6)
    }
    if(mouseX != pmouseX || mouseY != pmouseY) {
      socket.emit("angle-change", { angle: atan2(mouseY - height / 2, mouseX - width / 2) + 180, certificate: gameData.certificate });
    }
  }
}