document.addEventListener('DOMContentLoaded', main)

function main() {
  let gameState = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    meteorCount: 0,
  }

  this.addEventListener('keydown', controlShipStart)
  this.addEventListener('keyup', controlShipStop)

  let gameLoop

  const ship = document.getElementById('ship')
  const hitMessage = document.getElementById('hit-message')

  startLoop()

  document
    .getElementById('hit-message__button')
    .addEventListener('click', startLoop)

  /**
   * Modifies display based on game state every tick
   */
  function tick() {
    createMeteor()
    moveMeteors()
    moveShip()
    detectCollisions()
  }

  function startLoop() {
    const meteors = document.getElementsByClassName('meteor')
    for (let meteor of meteors) {
      meteor.remove() // this does not remove all the meteors, need to fix
    }
    gameState.meteorCount = 0

    ship.style.left = '50%'
    ship.style.bottom = '5%'

    hitMessage.classList.remove('show')

    gameLoop = setInterval(tick, 50)
  }
  /**
   * Creates a meteor with a random X position at the top of the game area
   */
  function createMeteor() {
    if (gameState.meteorCount < 10 && Math.random() > 0.4) {
      gameState.meteorCount++
      let newMeteor = document.createElement('div')
      newMeteor.className = 'meteor'
      newMeteor.style.top = '0px'
      newMeteor.style.left = `${Math.random() * 90}%`
      let meteorIcon = document.createElement('i')
      meteorIcon.className = 'fa-solid fa-meteor'
      newMeteor.appendChild(meteorIcon)
      document.getElementById('game-area').appendChild(newMeteor)
    }
  }

  /**
   * Moves meteors down towards the bottom of the game area
   */
  function moveMeteors() {
    const disappearingHeight =
      +window
        .getComputedStyle(document.getElementById('game-area'))
        .height.slice(0, -2) * 1.1 // 10% added onto height as meteor disappears a little too early otherwise
    const meteors = document.getElementsByClassName('meteor')

    for (meteor of meteors) {
      const newTop = +meteor.style.top.slice(0, -2) + 10
      if (newTop > disappearingHeight) {
        gameState.meteorCount--
        meteor.remove()
      } else {
        meteor.style.top = `${newTop}px`
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
    const key = event.key.toLowerCase()

    const keyMap = {
      w: 'moveUp',
      arrowup: 'moveUp',
      s: 'moveDown',
      arrowdown: 'moveDown',
      a: 'moveLeft',
      arrowleft: 'moveLeft',
      d: 'moveRight',
      arrowright: 'moveRight',
    }

    const action = keyMap[key] ? keyMap[key] : false

    if (action) {
      gameState[action] = newState
    }
  }

  /**
   * Applies controlShip when key is pressed
   *
   * @param {event} event
   */
  function controlShipStart(event) {
    controlShip(event, true)
  }

  /**
   * Applies controlShip when key is no longer pressed
   *
   * @param {event} event
   */
  function controlShipStop(event) {
    controlShip(event, false)
  }

  /**
   * Moves the ship on the screen each tick based on current game state
   */
  function moveShip() {
    let outcome = { bottom: 0, left: 0 }

    const directionMapping = {
      moveUp: { bottom: 1, left: 0 },
      moveDown: { bottom: -1, left: 0 },
      moveLeft: { bottom: 0, left: -1 },
      moveRight: { bottom: 0, left: 1 },
    }

    Object.keys(directionMapping).forEach((direction) => {
      if (gameState[direction]) {
        outcome.bottom += directionMapping[direction].bottom
        outcome.left += directionMapping[direction].left
      }
    })

    if (outcome.bottom === 0) outcome.left * 2
    if (outcome.left === 0) outcome.bottom * 2

    let newBottom = +ship.style.bottom.slice(0, -1) + outcome.bottom
    let newLeft = +ship.style.left.slice(0, -1) + outcome.left

    // Out of bounds check
    if (newBottom < 0) newBottom = 0
    if (newLeft < 0) newLeft = 0
    if (newBottom > 100) newBottom = 100
    if (newLeft > 100) newLeft = 100

    ship.style.bottom = `${newBottom}%`
    ship.style.left = `${newLeft}%`
  }

  function detectCollisions() {
    const shipHitbox = makeHitbox(ship)

    const meteors = document.getElementsByClassName('meteor')

    for (meteor of meteors) {
      const meteorHitbox = makeHitbox(meteor)

      const calculatedDistance = Math.sqrt(
        (shipHitbox.x - meteorHitbox.x) ** 2 +
          (shipHitbox.y - meteorHitbox.y) ** 2
      )

      if (calculatedDistance < shipHitbox.r + meteorHitbox.r) {
        clearInterval(gameLoop)
        hitMessage.classList.add('show')
      }
    }
  }

  function makeHitbox(object) {
    const rect = object.getBoundingClientRect()

    const centerWidth = (rect.right - rect.left) / 2
    const centerHeight = (rect.bottom - rect.top) / 2

    const hitbox = {
      x: rect.right + centerHeight,
      y: rect.bottom + centerWidth,
    }

    hitbox.r = Math.min(centerHeight, centerWidth)

    return hitbox
  }
}
