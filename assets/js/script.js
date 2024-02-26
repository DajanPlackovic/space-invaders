document.addEventListener('DOMContentLoaded', main)

function main() {
  let gameState = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    meteorCount: 0,
  }

  createMeteor()

  this.addEventListener('keydown', controlShipStart)
  this.addEventListener('keyup', controlShipStop)

  setInterval(tick, 50)

  function tick() {
    moveMeteors()
  }

  /**
   * Creates a meteor with a random X position at the top of the game area
   */
  function createMeteor() {
    let newMeteor = document.createElement('div')
    newMeteor.className = 'meteor'
    newMeteor.style.top = '0px'
    newMeteor.style.left = `${Math.random() * 90}%`
    document.getElementById('game-area').appendChild(newMeteor)
  }

  function moveMeteors() {
    const disappearingHeight =
      +window
        .getComputedStyle(document.getElementById('game-area'))
        .height.slice(0, -2) * 1.1 // 10% added onto height as meteor disappears a little too early otherwise
    const meteors = document.getElementsByClassName('meteor')

    for (meteor of meteors) {
      const newTop = +meteor.style.top.slice(0, -2) + 10
      if (newTop > disappearingHeight) {
        meteor.remove()
      } else {
        meteor.style.top = `${newTop}px`
      }
    }
  }

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

    console.log(gameState)
  }

  function controlShipStart(event) {
    controlShip(event, true)
  }

  function controlShipStop(event) {
    controlShip(event, false)
  }

  function move(direction) {
    const directionMapping = {
      up: { bottom: 1, left: 0 },
      down: { bottom: -1, left: 0 },
      left: { bottom: 0, left: -1 },
      right: { bottom: 0, left: 1 },
    }

    const ship = document.getElementById('ship')

    ship.style.bottom = `${
      +ship.style.bottom.slice(0, -1) + directionMapping[direction].bottom
    }%`
    ship.style.left = `${
      +ship.style.left.slice(0, -1) + directionMapping[direction].left
    }%`
  }
}
