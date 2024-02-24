document.addEventListener('DOMContentLoaded', function () {
  createMeteor()
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
