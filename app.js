'use strict'

const container = document.querySelector('.container')

const alert = document.createElement('div')

/**
 * 
 */
const img = {
  bird: new Image(),
  bird_1: new Image(),
  ground: new Image(),
  column: new Image(),
  cloud: new Image()
}

img.bird.src = './img/bird.svg' 
img.bird_1.src = './img/bird_gif/bird-02-01.png'
img.ground.src = './img/ground-grass.svg'
img.column.src = './img/column.svg'
img.cloud.src = './img/clouds.svg'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const col = {
  sky: '#C4D8FC'
}

/**
 * options section
 */
let bird = {
  size: 75,
  posX: 50,
  posY: canvas.height / 2
}

let column = {
  posX: canvas.width,
  posY: 0,
  width: 80,
  height: 0
}

let grassPosX = canvas.width

let options = {
  speedY: 1,
  maxSpeedY: 4,
  speedingY: .15, 
  speedX: 3
}

/**
 * game section
 */

let score = 0
let addTmp = 0
let paused = false
let i = 0

columnStuff()
gameLoop()
handleEvents()

/**
 * functions
 */

function gameLoop() {
  
  draw()
  
  movement() 

  objectLoop()

  crash()
  
  document.querySelector('.score').textContent = score

  requestAnimationFrame(gameLoop)
}

function draw() {
  //draw canvas
  ctx.fillStyle = col.sky
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  //clouds
  ctx.drawImage(img.cloud, grassPosX, 50, canvas.width - 100, canvas.height / 2)
  ctx.drawImage(img.cloud, grassPosX - canvas.width, 50, canvas.width - 100, canvas.height / 2)
  // col
  ctx.drawImage(img.column, column.posX, column.posY, column.width, column.height)
  //grass
  ctx.drawImage(img.ground, grassPosX, canvas.height - 45, canvas.width, 50)
  ctx.drawImage(img.ground, grassPosX - canvas.width, canvas.height - 45, canvas.width, 50)
  //draw bird
  ctx.drawImage(img.bird, bird.posX, bird.posY, bird.size, bird.size)
 
}

function movement() {
  
  bird.posY += options.speedY
  column.posX -= options.speedX
  grassPosX -= options.speedX

  if (options.speedY < options.maxSpeedY && options.speedY) options.speedY += options.speedingY

}

/**
 * finding out if player crashed
 */
function crash() {

  // hit grass
  if ( bird.posY > canvas.height - bird.size) {
    gameOver()
  }

  // hit barrier
  if (bird.posX + bird.size - 20 >= column.posX && bird.posY + bird.size - 20 >= column.posY && bird.posX <= column.posX + column.width) {
    gameOver()
  }

  // get over barrier
  if (bird.posX >= column.posX + column.width && ! addTmp) {
    addScore()
  }

} 

/**
 * infinite column and grass loop
 */
function objectLoop() {
    // column loop
    if ( column.posX < 0 - column.width) {
      column.posX = canvas.width
      columnStuff()
    }
  
    // grass loop
    if (grassPosX < 0) {
      grassPosX = canvas.width
    }
}

/**
 * birdy go up
 */
function flyUp() {

  if (options.speedY == 0) return


  if (oldPos - 55 < bird.posY) {
    options.speedY = -5

    options.speedY -= 5
    requestAnimationFrame(flyUp)
  }
  else {
    options.speedY = .75
  }

}

/**
 * birdy go on bottom
 */
function flyDown() {
  if (bird.posY <= canvas.height - bird.size) {
    bird.posY++
    requestAnimationFrame(flyDown)
  }
}

let oldPos = 0

function handleEvents() {
  
  document.addEventListener('keydown', (e) => {

    if (e.code === 'Space') {
      oldPos = bird.posY
      flyUp()
    }
    else {

      //if game was paused we continue, else we restart game
      if (options.speedY === 0 && !paused)  gameRestart() 
      else if (options.speedY === 0 ) gameContinue()
    
    }

    if (e.code === 'KeyP') {
      gamePause()
    }

  })

  document.addEventListener('touchstart', () => {
    oldPos = bird.posY
    flyUp()
    console.log('a')
  })
  
  // on button click restart game
  document.querySelector('.restart').addEventListener('click', gameRestart)

}

/**
 * setting values back to normal, game continues
 */
function gameContinue() {
  options.speedY = 1
  options.speedX = 3
  paused = false
}

/**
 * resseting everything, game restarts
 */
function gameRestart() {
  bird.posY = canvas.height / 2 - bird.size / 2
  score = 0
  columnStuff()
  
  gameContinue()

  hideAlert()

  blurAll()
}

function addScore() {
  addTmp = 1
  score++
  options.speedX += options.speedingY
}

function columnStuff() {
  addTmp = 0

  column.height = getRandomInt(canvas.height - 100, 200)
  column.posY = canvas.height - column.height
  column.posX = canvas.width
}


/**
 * reseting values, game just stop
*/
function gamePause() {
  paused = true
  options.speedY = 0
  options.speedX = 0
}

/**
 * reseting everything, GAME OVER
 */
function gameOver() {
  flyDown()
  gamePause()
  paused = false

  showAlert()
}

/**
 * get random int
 * 
 * @param {Number} max 
 * @param {Number} min 
 * 
 * @returns random INT
 */
function getRandomInt(max, min) {
  return Math.floor(Math.random() * Math.floor(max - min) + Math.floor(min))
}

/**
 * create element, focus on it, then remove it
 * 
 * using for unfocus element
 */
function blurAll(){
  var tmp = document.createElement("input")
  document.body.appendChild(tmp)
  tmp.focus()
  document.body.removeChild(tmp)
}


function showAlert() {
  alert.classList.add('alert')
  alert.textContent = 'You crashed. Your score is ' + score

  alert.style.top = canvas.height / 2 + 'px'
  alert.style.left = canvas.width / 2 + 'px'

  container.appendChild(alert)
}

function hideAlert() {
  container.removeChild(alert)
}