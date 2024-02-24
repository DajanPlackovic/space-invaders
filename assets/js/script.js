document.addEventListener('DOMContentLoaded', function () {
  createMeteor()
  this.addEventListener('keydown', controlShip)
  setInterval(tick, 50)
})

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

function controlShip(event) {
  const key = event.key.toLowerCase()

  const keyMap = {
    w: () => {
      move('up')
    },
    arrowup: () => {
      move('up')
    },
    s: () => {
      move('down')
    },
    arrowdown: () => {
      move('down')
    },
    a: () => {
      move('left')
    },
    arrowleft: () => {
      move('left')
    },
    d: () => {
      move('right')
    },
    arrowright: () => {
      move('right')
    },
  }
  console.log(key)

  keyMap[key] ? keyMap[key]() : ''
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
