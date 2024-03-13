document.addEventListener('DOMContentLoaded', main);

function main() {
  let gameState = {
    moveLeft: false,
    moveRight: false,
    currentMeteorCount: 0,
    totalMeteorCount: 0,
    currentMaximumMeteorCount: 10,
    meteorSpeed: 10,
    tickFrequency: 50,
    safety: Math.random() * 90 + 5,
    moveSafetyLeft: Math.random() > 0.5,
    moveSafetySteps: Math.ceil(Math.random() * 20 + 5),
    round: 1,
    roundOver: false,
    bgPosition: 0,
  };

  const roundSpecificData = [
    { color: '#ffb700', totalMeteors: 40, maxMeteors: 10, safety: 17 },
    { color: '#ffaa00', totalMeteors: 80, maxMeteors: 15, safety: 15 },
    { color: '#ff9d00', totalMeteors: 100, maxMeteors: 20, safety: 15 },
    { color: '#ff8f00', totalMeteors: 160, maxMeteors: 30, safety: 12 },
    { color: '#ff8100', totalMeteors: 200, maxMeteors: 45, safety: 12 },
    { color: '#ff7100', totalMeteors: 250, maxMeteors: 60, safety: 10 },
    { color: '#ff6100', totalMeteors: 300, maxMeteors: 100, safety: 10 },
    { color: '#fe4d00', totalMeteors: 500, maxMeteors: 100, safety: 8 },
    { color: '#fd3500', totalMeteors: 1000, maxMeteors: 100, safety: 8 },
    { color: '#fb0404', totalMeteors: 2000, maxMeteors: 100, safety: 8 },
  ];

  const initialGameState = { ...gameState };

  this.addEventListener('keydown', controlShipStart);
  this.addEventListener('keyup', controlShipStop);

  const controls = document.getElementsByClassName('control');
  for (const control of controls) {
    control.addEventListener('mousedown', controlShipStart);
    control.addEventListener('touchstart', controlShipStart);
    control.addEventListener('mouseup', controlShipStop);
    control.addEventListener('touchend', controlShipStop);
  }

  let gameLoop;

  const ship = document.getElementById('ship');
  const message = document.getElementById('message');

  document.getElementById('start-button').addEventListener('click', () => {
    restartGame();
    document.getElementById('menu').style = 'display: none;';
  });

  /**
   * Modifies display based on game state every tick
   */
  function tick() {
    createMeteor();
    moveMeteors();
    moveShip();
    animateShip();
    detectCollisions();
    increaseRound();
    moveSafety();

    document.getElementById('game-area').style.backgroundPositionY = `${
      ++gameState.bgPosition / 100
    }%`;
  }

  function restartGame() {
    const meteors = document.getElementsByClassName('meteor');
    while (meteors.length) {
      meteors[0].remove();
    }

    gameState = { ...initialGameState };

    ship.style.left = '50%';
    ship.style.bottom = '5%';

    message.classList.remove('show');
    message.classList.remove('hit-message');

    startLoop();
  }

  /**
   * Function to start the game loop and reset the game state.
   *
   */
  function startLoop() {
    gameLoop = setInterval(tick, gameState.tickFrequency);
  }
  /**
   * Creates a meteor with a random X position at the top of the game area
   */
  function createMeteor() {
    if (
      gameState.currentMeteorCount < gameState.currentMaximumMeteorCount &&
      Math.random() > 0.4
    ) {
      gameState.currentMeteorCount++;
      gameState.totalMeteorCount++;
      let newMeteor = document.createElement('div');
      newMeteor.className = 'meteor';
      newMeteor.style.top = '-10%';
      newMeteor.style.color = roundSpecificData[gameState.round - 1].color;

      let position = Math.random() * 90 + 5;
      if (
        Math.abs(position - gameState.safety) <
        roundSpecificData[gameState.round - 1].safety
      ) {
        position +=
          roundSpecificData[gameState.round - 1].safety *
          Math.sign(position - gameState.safety);
      }
      newMeteor.style.left = `${position}%`;

      newMeteor.innerHTML = '<i class="fa-solid fa-meteor"></i>';
      document.getElementById('game-area').appendChild(newMeteor);
    }
  }

  /**
   * Moves meteors down towards the bottom of the game area
   */
  function moveMeteors() {
    const meteors = document.getElementsByClassName('meteor');

    for (const meteor of meteors) {
      const newTop = +meteor.style.top.slice(0, -1) + gameState.meteorSpeed / 6;
      if (newTop > 110) {
        gameState.currentMeteorCount--;
        meteor.remove();
      } else {
        meteor.style.top = `${newTop}%`;
      }
    }
  }

  /**
   * Modifies game state to account for movement control input from player
   *
   * @param {event} event
   * @param {boolean} newState
   */
  function controlShip(event, newState) {
    let key;

    if (event.key) {
      key = event.key.toLowerCase();
    } else {
      key = event.currentTarget.id;
    }

    const keyMap = {
      a: 'moveLeft',
      arrowleft: 'moveLeft',
      d: 'moveRight',
      arrowright: 'moveRight',
    };

    const action = keyMap[key] ? keyMap[key] : false;

    if (action) {
      gameState[action] = newState;
    }
  }

  /**
   * Applies controlShip when key is pressed
   *
   * @param {event} event
   */
  function controlShipStart(event) {
    controlShip(event, true);
  }

  /**
   * Applies controlShip when key is no longer pressed
   *
   * @param {event} event
   */
  function controlShipStop(event) {
    controlShip(event, false);
  }

  /**
   * Moves the ship on the screen each tick based on current game state
   */
  function moveShip() {
    let outcome = { bottom: 0, left: 0 };

    const directionMapping = {
      moveLeft: { bottom: 0, left: -1.5 },
      moveRight: { bottom: 0, left: 1.5 },
    };

    Object.keys(directionMapping).forEach((direction) => {
      if (gameState[direction]) {
        outcome.left += directionMapping[direction].left;
      }
    });

    let newLeft = +ship.style.left.slice(0, -1) + outcome.left;

    // Out of bounds check
    if (newLeft <= 5) newLeft = 5;
    if (newLeft >= 95) newLeft = 95;

    ship.style.left = `${newLeft}%`;
  }

  function detectCollisions() {
    const shipHitbox = makeHitbox(ship);

    const meteors = document.getElementsByClassName('meteor');

    for (const meteor of meteors) {
      const meteorHitbox = makeHitbox(meteor);

      const calculatedDistance = Math.sqrt(
        (shipHitbox.x - meteorHitbox.x) ** 2 +
          (shipHitbox.y - meteorHitbox.y) ** 2
      );

      if (calculatedDistance < shipHitbox.r + meteorHitbox.r) {
        meteor.innerHTML = '<i class="fa-solid fa-burst"></i>';
        clearInterval(gameLoop);
        setTimeout(
          () =>
            displayRestartGameMessage(
              `You made it to Round ${gameState.round}!`
            ),
          1000
        );
      }
    }
  }

  function makeHitbox(object) {
    const rect = object.getBoundingClientRect();

    const centerWidth = (rect.right - rect.left) / 2;
    const centerHeight = (rect.bottom - rect.top) / 2;

    const hitbox = {
      x: rect.right + centerHeight,
      y: rect.bottom + centerWidth,
    };

    hitbox.r = Math.min(centerHeight, centerWidth) * 0.5;

    return hitbox;
  }

  function increaseRound() {
    if (
      gameState.totalMeteorCount ===
      roundSpecificData[gameState.round - 1].totalMeteors
    ) {
      gameState.roundOver = true;
      gameState.currentMaximumMeteorCount = 0;
    }

    if (gameState.roundOver === true && gameState.currentMeteorCount === 0) {
      gameState.roundOver = false;

      clearInterval(gameLoop);

      gameState.round++;

      if (gameState.round === 20) {
        displayRestartGameMessage('Congratulations! You won!');
      } else {
        gameState.totalMeteorCount = 0;

        message.innerHTML = `Round ${gameState.round}`;
        message.classList.add('show');
        message.style.color = roundSpecificData[gameState.round - 1].color;
        setTimeout(() => {
          message.classList.remove('show');
          gameState.currentMaximumMeteorCount =
            roundSpecificData[gameState.round - 1].maxMeteors;
          gameState.meteorSpeed++;
          gameState.tickFrequency--;
        }, 3000);

        startLoop(tick, gameState.tickFrequency);
      }
    }
  }

  function displayRestartGameMessage(text) {
    message.classList.add('show');
    message.classList.add('hit-message');
    message.innerHTML = `<p>${text}</p>
      <button id="hit-message__button">Play Again</button>
        `;
    document
      .getElementById('hit-message__button')
      .addEventListener('click', restartGame);
  }

  function animateShip() {
    if (gameState.moveLeft) {
      ship.classList.add('left');
    } else {
      ship.classList.remove('left');
    }

    if (gameState.moveRight) {
      ship.classList.add('right');
    } else {
      ship.classList.remove('right');
    }
  }

  function moveSafety() {
    if (gameState.moveSafetySteps === 0) {
      gameState.moveSafetySteps = Math.ceil(Math.random() * 20 + 5);
      gameState.moveSafetyLeft = !gameState.moveSafetyLeft;
    }

    if (!gameState.moveSafetyLeft) {
      gameState.safety += 0.5;
    } else {
      gameState.safety -= 0.5;
    }

    if (gameState.safety > 95) {
      gameState.safety = 95;
      gameState.moveSafetyLeft = true;
    }

    if (gameState.safety < 5) {
      gameState.safety = 5;
      gameState.moveSafetyLeft = false;
    }
  }
}
