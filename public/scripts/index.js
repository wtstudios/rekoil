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
  socket.emit("play-request", {platform: platform});

  document.getElementById("select-slp").addEventListener("click", function() {changeGun("slp");});
  document.getElementById("select-scar").addEventListener("click", function() {changeGun("scar");});
  document.getElementById("select-ballista").addEventListener("click", function() {changeGun("ballista");});
}

function changeGun(gun) {
  socket.emit("pick-weapon", {gun: gun});
  document.getElementById("weapon-selection").style.display = "none";
  document.getElementById("gun-hud").style.display = "block";
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
  document.getElementById("main").src = data.players[permanentID].guns[0].images.lootSRC;
  document.getElementById("pistol").src = data.players[permanentID].guns[1].images.lootSRC;
  document.getElementById("melee").src = data.players[permanentID].guns[2].images.lootSRC;
  document.getElementById("main-backing").style.width = "calc(" + document.getElementById("main").width + "px + 4.5vw + 4.5vh)";
  document.getElementById("pistol-backing").style.width = "calc(" + document.getElementById("pistol").width + "px + 4.5vw + 4.5vh)";
  document.getElementById("melee-backing").style.width = "calc(" + document.getElementById("melee").width + "px + 4.5vw + 4.5vh)";
  document.getElementById("main-backing").style.backgroundColor = "#498ee967";
  document.getElementById("pistol-backing").style.backgroundColor = "#498ee967";
  document.getElementById("melee-backing").style.backgroundColor = "#498ee967";
  document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex] + "-backing").style.width = "calc(" + document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex]).width + "px + 7vw + 7vh)";
  document.getElementById(["main", "pistol", "melee"][data.players[permanentID].state.activeWeaponIndex] + "-backing").style.backgroundColor = "#498ee9b6";
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
      translate(particleData.position.x + Math.cos(particleData.angle) * (Date.now() - particleData.timeStamp) / 2, particleData.position.y + Math.sin(particleData.angle) * (Date.now() - particleData.timeStamp) / 2);
      rotate(particleData.rotation / Math.PI * 180 + (Date.now() - particleData.timeStamp) / 10);
      tint(255, 255, 255, opacity);
      if(particleData.colour != "none") {
        fill(particleData.colour + hex(opacity)[6] + (hex(opacity)[7]));
        if(particleData.colour === "blue" || particleData.colour === "red") {
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
    translate(obstacleData["body-data"].position.x + obstacleData["display-data"]["offset"].x, obstacleData["body-data"].position.y + obstacleData["display-data"]["offset"].y);
    rotate(obstacleData["display-data"]["offset"].angle);
    image(assetsLoaded[obstacleData["display-data"].src], 0, 0, obstacleData["display-data"].dimensions.width, obstacleData["display-data"].dimensions.height);
    if(debug) {
      fill(0, 255, 0, 100);
      rotate(-obstacleData["display-data"]["offset"].angle -obstacleData["body-data"].options.angle / Math.PI * 180);
      switch(obstacleData["body-data"].type) {
        case "rectangle":
          if(obstacleData["body-data"].options.chamfer) {
            rect(-obstacleData["display-data"]["offset"].x, -obstacleData["display-data"]["offset"].y, obstacleData["body-data"].dimensions.width, obstacleData["body-data"].dimensions.height, 1000);
          } else {
            rect(-obstacleData["display-data"]["offset"].x, -obstacleData["display-data"]["offset"].y, obstacleData["body-data"].dimensions.width, obstacleData["body-data"].dimensions.height);
          }
          break;
        case "circle":
          ellipse(-obstacleData["display-data"]["offset"].x, -obstacleData["display-data"]["offset"].y,  obstacleData["body-data"].radius * 2,  obstacleData["body-data"].radius * 2);
          break;
      }
    }
    pop();
  }
}

function displayGuns() {
  for (let i = 0; i < gameData.users.length; i++) {
    if(gameData.players[gameData.users[i]].health > 0) {
      const playerData = gameData.players[gameData.users[i]],
      gun = playerData.guns[playerData.state.activeWeaponIndex],
      tickDelay = Date.now() - gameData.timeStamp;
      push();
      translate(playerData.state.position.x + playerData.state.force.x * (tickDelay / 70), playerData.state.position.y + playerData.state.force.y * (tickDelay / 70));
      if(gameData.users[i] == permanentID) {
        rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        rotate(playerData.state.angle - 90);
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
    opacity = Math.round((-(Date.now() - bullet.timeStamp) / 3) + (bullet.timeLeft * 6));
    if(opacity <= 1) {
      gameData.bullets.splice(i, 1);
      i--;
    } else {
      push();
      imageMode(CORNER);
      translate(bullet.coordinates.finish.x, bullet.coordinates.finish.y);
      if (bullet.emitter == gameData.players[permanentID].team) {
        tint(40, 150, 255, (bullet.timeLeft / 25) * opacity);
      } else {
        tint(230, 40, 40, (bullet.timeLeft / 25) * opacity);
      }
      rotate(bullet.angle - 90);
      if(bullet.tracerLength > 2000) {
        image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, bullet.tracerLength - 2000, 25, 2000);
        image(assetsLoaded["/assets/weapons/tracer-end.svg"], -12.5, -5, 25, bullet.tracerLength - 1995);
      } else {
        image(assetsLoaded["/assets/weapons/tracer-start.svg"], -12.5, -5, 25, bullet.tracerLength + 5);
      }
      imageMode(CENTER);
      if(debug) {
        fill(255, 255, 0, 200);
        rectMode(CORNER);
        rect(-10, 0, 20, dist(bullet.coordinates.start.x, bullet.coordinates.start.y, bullet.coordinates.finish.x, bullet.coordinates.finish.y));
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
      tickDelay = Date.now() - gameData.timeStamp;
      push();
      fill("#e9494f");
      if (playerData.team == gameData.players[permanentID].team) {
        fill("#498fe9");
      }
      translate(playerData.state.position.x + playerData.state.force.x * (tickDelay / 70), playerData.state.position.y + playerData.state.force.y * (tickDelay / 70));
      if(gameData.users[i] == permanentID) {
        rotate(atan2(mouseY - height / 2, mouseX - width / 2) + 90);
      } else {
        rotate(playerData.state.angle - 90);
      }
      ellipse(0, 0, 230, 230);
      image(assetsLoaded["/assets/player/player-base.svg"], 0, 0, 250, 250);
      if(debug) {
        fill(0, 255, 0, 100);
        ellipse(0, 0, 230, 230);
        if(playerData.state.isMoving) {
          if(gameData.users[i] == permanentID) {
            rotate(-atan2(mouseY - height / 2, mouseX - width / 2) + 90);
          } else {
            rotate(-playerData.state.angle - 90);
          }
          if(!!playerData.state.force.y) {
            image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.y * 7);
          }
          if(!!playerData.state.force.x) {
            rotate(-90);
            image(assetsLoaded["/assets/misc/arrow.svg"], 0, 0, 30, playerData.state.force.x * 7);          
          }
        }
      }
      pop();
    }
  }
}

function interpolateCamera() {
  const playerData = gameData.players[permanentID],
  tickDelay = Date.now() - gameData.timeStamp;
  queuedCameraLocation.x = playerData.state.position.x + playerData.state.force.x * (tickDelay / 70);
  queuedCameraLocation.y  = playerData.state.position.y + playerData.state.force.y * (tickDelay / 70);
  queuedCameraLocation.targetX = playerData.state.position.x + playerData.state.force.x * (tickDelay / 70);
  queuedCameraLocation.targetY  = playerData.state.position.y + playerData.state.force.y * (tickDelay / 70);
}

function displayFog() {
  const playerData = gameData.players[permanentID];
  push();
  translate(playerData.state.position.x + cos(playerData.state.angle) * 500, playerData.state.position.y + sin(playerData.state.angle) * 500, 0.05);
  fill("#33333380");
  arc(0, 0, playerData.guns[playerData.state.activeWeaponIndex].view + 9000, playerData.guns[playerData.state.activeWeaponIndex].view + 9000, playerData.state.angle + 210, playerData.state.angle + 150);
  pop();
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
    interpolateCamera();
    cameraLocation = queuedCameraLocation;
    camera(cameraLocation.x/* + (mouseX - width / 2) / 2*/, cameraLocation.y/* + (mouseY - height / 2) / 2*/, cameraLocation.z + sin(frameCount * 1.5) * 10, cameraLocation.targetX/* + (mouseX - width / 2) / 2*/, cameraLocation.targetY/* + (mouseY - height / 2) / 2*/, cameraLocation.targetZ);
    background(gameData.mapData.config["background-colour"]);
    //fill(gameData.mapData.config["ground-colour"]);
    rectMode(CORNER);
    //rect(0, 0, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height, 150);
    image(assetsLoaded[gameData.mapData.config["ground-image"]], gameData.mapData.config["map-dimensions"].width / 2, gameData.mapData.config["map-dimensions"].height / 2, gameData.mapData.config["map-dimensions"].width, gameData.mapData.config["map-dimensions"].height);
    rectMode(CENTER);
    if(gameData.mapData.config.gamemode == "hardpoint") {
      displayPoint();
    }
    displayBullets();
    displayParticles();
    displayGuns();
    displayPlayers();
    displayObstacles();
    if(queuedCameraLocation.z != gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex].view + 2000) {
      queuedCameraLocation.z += Math.round((gameData.players[permanentID].guns[gameData.players[permanentID].state.activeWeaponIndex].view + 2000 - queuedCameraLocation.z) / 6)
    }
    if(mouseX != pmouseX || mouseY != pmouseY) {
      socket.emit("angle-change", { angle: atan2(mouseY - height / 2, mouseX - width / 2) + 180, certificate: gameData.certificate });
    }
  }
}