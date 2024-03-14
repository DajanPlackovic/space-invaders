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
    round: 0,
    roundOver: false,
    bgPosition: 0,
  };

  const roundSpecificData = [
    { color: undefined, totalMeteors: 0, maxMeteors: 0, safety: 0 },
    { color: '#ffb700', totalMeteors: 40, maxMeteors: 10, safety: 17 },
    { color: '#ff9d00', totalMeteors: 80, maxMeteors: 15, safety: 15 },
    { color: '#ff8100', totalMeteors: 100, maxMeteors: 20, safety: 15 },
    { color: '#ff6100', totalMeteors: 160, maxMeteors: 30, safety: 12 },
    { color: '#fd3500', totalMeteors: 200, maxMeteors: 45, safety: 12 },
  ];

  const initialGameState = {};
  Object.assign(initialGameState, gameState);

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
  const warning = document.getElementById('warning');

  window
    .matchMedia('(min-height: 500px)')
    .addEventListener('change', (event) => {
      if (event.matches) {
        if (gameState.round > 0) startLoop();
        warning.classList.remove('show');
      } else {
        if (gameLoop) clearInterval(gameLoop);
        warning.classList.add('show');
      }
    });

  intro();

  /**
   * Modifies display based on game state every tick
   */
  function tick() {
    increaseRound();
    createMeteor();
    moveMeteors();
    moveShip();
    animateShip();
    detectCollisions();
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

    const homeworld = document.getElementsByClassName('homeworld');
    if (homeworld[0]) {
      homeworld[0].remove();
    }

    Object.assign(gameState, initialGameState);

    ship.style.left = '50%';
    ship.style.bottom = '5%';
    ship.classList.remove('ending');

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
      newMeteor.style.color = roundSpecificData[gameState.round].color;

      let position = Math.random() * 90 + 5;
      if (
        Math.abs(position - gameState.safety) <
        roundSpecificData[gameState.round].safety
      ) {
        position +=
          roundSpecificData[gameState.round].safety *
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
      const innerRound = gameState.round;
      const innerDisplay = displayRestartGameMessage;

      const meteorHitbox = makeHitbox(meteor);

      const calculatedDistance = Math.sqrt(
        Math.pow(shipHitbox.x - meteorHitbox.x, 2) +
          Math.pow(shipHitbox.y - meteorHitbox.y, 2)
      );

      if (calculatedDistance < shipHitbox.r + meteorHitbox.r) {
        meteor.innerHTML = '<i class="fa-solid fa-burst"></i>';
        clearInterval(gameLoop);
        setTimeout(
          () => innerDisplay(`You made it to Wave ${innerRound}!`),
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
      roundSpecificData[gameState.round].totalMeteors
    ) {
      gameState.roundOver = true;
      gameState.currentMaximumMeteorCount = 0;
    }

    if (gameState.roundOver === true && gameState.currentMeteorCount === 0) {
      gameState.roundOver = false;

      clearInterval(gameLoop);

      gameState.round++;

      if (gameState.round > 5) {
        endingAnimation();
      } else {
        gameState.totalMeteorCount = 0;

        message.innerHTML = `Wave ${gameState.round}`;
        message.classList.add('show');
        message.style.color = roundSpecificData[gameState.round].color;
        setTimeout(() => {
          message.classList.remove('show');
          gameState.currentMaximumMeteorCount =
            roundSpecificData[gameState.round].maxMeteors;
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

    const safetyOutOfBounds = roundSpecificData[gameState.round].safety;

    if (gameState.safety > 100 - safetyOutOfBounds) {
      gameState.safety = 100 - safetyOutOfBounds;
      gameState.moveSafetyLeft = true;
    }

    if (gameState.safety < safetyOutOfBounds) {
      gameState.safety = safetyOutOfBounds;
      gameState.moveSafetyLeft = false;
    }
  }

  function endingAnimation() {
    const homeworld = document.createElement('i');

    homeworld.className = 'fa-solid fa-earth-oceania homeworld';

    ship.classList.add('ending');

    document.getElementById('game-area').appendChild(homeworld);

    setTimeout(
      () =>
        displayRestartGameMessage(
          '<p>You made it!</p><p>Glarp thanks you!</p>'
        ),
      3000
    );
  }

  function intro() {
    const menuText = document.getElementById('menu-text');
    const menuButton = document.getElementById('menu-button');

    menuText.innerHTML = `
    <p>This is Glarp.</p>
    <p>He's just escaped from some awful place full of hyperevolved monkeys in a state called Neva'Da.</p>
    `;

    menuButton.addEventListener('click', () => {
      menuText.innerHTML = `<p>To get back home, his starship needs to make it through five meteor showers between earth and his homeworld, coincidentally also called Neva'Da.</p>
     <p>Help Glarp get home.</p>`;
      menuButton.addEventListener('click', () => {
        menuText.innerHTML = `
  <ul>
    <li>Avoid meteors</li>
    <li>Use ← and →, A and D or the on-screen arrows to navigate the ship</li>
    <li>As you get closer to Neva'Da, the meteors will get faster and more numerous</li>
  </ul>`;
        for (const control of controls) {
          control.classList.remove('hidden');
        }
        menuButton.textContent = 'Start Game';
        menuButton.addEventListener('click', () => {
          restartGame();
          document.getElementById('menu').style = 'display: none;';
        });
      });
    });
  }
}
