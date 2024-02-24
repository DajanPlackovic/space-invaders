createMeteor()

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
