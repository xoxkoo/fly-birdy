'use strict'
// import defaultOptions from './options.js'
const defaultOptions = {
	speedY: 0,
	maxSpeedY: 6,
	speedingY: 0.225,
	speedX: 2.5,
	space: 150,
}

let options = {
	speedY: defaultOptions.speedY,
	maxSpeedY: defaultOptions.maxSpeedY,
	speedingY: defaultOptions.speedingY,
	speedX: defaultOptions.speedX,
	space: defaultOptions.space,
}

const scoreEl = document.querySelector('.score')
const alert = document.querySelector('.alert')
let counter = 1
let fps = 15
let birdStarted = false

const scoreMsg = document.createElement('p')

/**
 *
 */
const img = {
	bird: new Image(),
	bird_1: new Image(),
	bird_2: new Image(),
	ground: new Image(),
	column: new Image(),
	column_r: new Image(),
	cloud: new Image(),
}

img.bird.src = './img/bird_1.svg'
img.bird_1.src = './img/bird.svg'
img.bird_2.src = './img/bird_2.svg'
img.ground.src = './img/ground-grass.svg'
img.column.src = './img/column.svg'
img.column_r.src = './img/column_r.svg'
img.cloud.src = './img/clouds.svg'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

if (window.innerHeight <= 600) canvas.height = window.innerHeight
else canvas.height = 670

if (window.innerWidth <= 400) canvas.width = window.innerWidth
else canvas.width = 400

const col = {
	sky: '#C4D8FC',
}

/**
 * options section
 */
let bird = {
	size: 75,
	posX: 50,
	posY: 200,
	rotationX: -20,
}

let column = {
	posX: canvas.width,
	posY: 0,
	rPosY: 0,
	width: 80,
	height: 0,
}

let grassPosX = canvas.width
let cloudsPosX = canvas.width

/**
 * game section
 */

let score = 0
let addTmp = 0
let paused = false
let i = 0

hideAlert()

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

	scoreEl.textContent = score

	console.log(defaultOptions)

	if (!paused) {
		requestAnimationFrame(gameLoop)
	}
}

function draw() {
	//draw canvas
	ctx.fillStyle = col.sky
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	//clouds
	ctx.drawImage(img.cloud, cloudsPosX, 50, canvas.width - 100, canvas.height / 2)
	ctx.drawImage(img.cloud, cloudsPosX - canvas.width, 50, canvas.width - 100, canvas.height / 2)
	// col
	ctx.drawImage(img.column, column.posX, column.posY, column.width, column.height)
	ctx.drawImage(img.column_r, column.posX, column.rPosY, column.width, column.height)
	//grass
	ctx.drawImage(img.ground, grassPosX, canvas.height - 45, canvas.width, 50)
	ctx.drawImage(img.ground, grassPosX - canvas.width, canvas.height - 45, canvas.width, 50)
	//draw bird
	// ctx.drawImage(img.bird, bird.posX, bird.posY, bird.size, bird.size)

	if ((counter / fps) % 2 > 0 && (counter / fps) % 2 < 1) {
		rotateAndPaintImage(ctx, img.bird, bird.posX, bird.posY, bird.rotationX * (Math.PI / 180), 0.06)
	} else {
		rotateAndPaintImage(ctx, img.bird_1, bird.posX, bird.posY, bird.rotationX * (Math.PI / 180), 0.06)
	}
	ctx.fillStyle = 'black'
	counter++
	// ctx.fillRect(column.posX, column.rPosY + column.height - 20, 20, 20)
	// ctx.fillRect(bird.posX, bird.posY, 20, 20)
}

function movement() {
	if (birdStarted) {
		bird.posY += bird.posY * 0.014 + options.speedY
		if (bird.rotationX < 60) bird.rotationX += 1.5
		column.posX -= options.speedX
	}
	// if (bird.rotationX < 0) {
	// 	bird.rotationX = 0
	// } else {
	// 	bird.rotationX += 1.5
	// }

	grassPosX -= options.speedX
	cloudsPosX -= options.speedX * 1.2

	if (options.speedY < options.maxSpeedY && options.speedY) options.speedY += options.speedingY
}

/**
 * finding out if player crashed
 */
function crash() {
	// hit grass
	if (bird.posY > canvas.height - bird.size) {
		gameOver()
	}

	// hit barrier
	if (
		bird.posX + bird.size - 20 >= column.posX &&
		bird.posY + bird.size - 20 >= column.posY &&
		bird.posX <= column.posX + column.width
	) {
		gameOver()
	}

	// hit up barrier
	if (
		bird.posY + 20 <= column.rPosY + column.height &&
		bird.posX + bird.size - 20 >= column.posX &&
		bird.posX <= column.posX + column.width
	) {
		gameOver()
	}

	// get over barrier
	if (bird.posX >= column.posX + column.width && !addTmp) {
		addScore()
	}
}

/**
 * infinite column and grass loop
 */
function objectLoop() {
	// column loop
	if (column.posX < 0 - column.width) {
		column.posX = canvas.width
		columnStuff()
	}

	// grass loop
	if (grassPosX < 0) {
		grassPosX = canvas.width
	}

	if (cloudsPosX < 0) {
		cloudsPosX = canvas.width
	}
}

/**
 * birdy go up
 */
function flyUp() {
	if (options.speedY == 0 || paused) return

	if (oldPos - 55 < bird.posY) {
		options.speedY = -5

		if (bird.rotationX > 0) {
			bird.rotationX = -5
		} else if (bird.rotationX > -30) {
			bird.rotationX -= 5
		}

		options.speedY -= 5
		requestAnimationFrame(flyUp)
	} else {
		options.speedY = 0.75
	}
}

/**
 * birdy go on bottom
 */
function flyDown() {
	if (bird.posY <= canvas.height - bird.size) {
		bird.posY += 1 + options.speedingY
		requestAnimationFrame(flyDown)
	} else paused = true
}

let oldPos = 0

function handleEvents() {
	document.addEventListener('keydown', (e) => {
		if (e.code === 'Space') {
			birdStarted = true
			options.speedY = 0.9
			oldPos = bird.posY
			flyUp()
		} else {
			//if game was paused we continue, else we restart game
			if (options.speedY === 0 && !paused) gameRestart()
			else if (options.speedY === 0) gameContinue()
		}

		if (e.code === 'KeyP') {
			gamePause()
		}
	})

	document.addEventListener('touchstart', () => {
		oldPos = bird.posY
		flyUp()
	})

	// on button click restart game
	document.querySelector('.restart').addEventListener('click', gameRestart)
}

/**
 * setting values back to normal, game continues
 */
function gameContinue() {
	options.speedY = defaultOptions.speedY
	options.speedX = defaultOptions.speedX
	paused = false

	console.log(defaultOptions.speedX)

	gameLoop()
}

/**
 * resseting everything, game restarts
 */
function gameRestart() {
	bird.posY = 200
	bird.rotationX = -20
	score = 0
	columnStuff()

	gameContinue()

	hideAlert()

	blurAll()
}

function rotateAndPaintImage(ctx, img, x, y, angle = 0, scale = 1) {
	ctx.save()
	ctx.translate(x + (img.width * scale) / 2, y + (img.height * scale) / 2)
	ctx.rotate(angle)
	ctx.translate(-x - (img.width * scale) / 2, -y - (img.height * scale) / 2)
	ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
	ctx.restore()
}

function addScore() {
	addTmp = 1
	score++
	options.speedX += options.speedingY

	//on every second pass we make space between barriers smaller
	if (score % 2 == 0 && options.space > 125) options.space -= 5
}

function columnStuff() {
	addTmp = 0

	column.height = getRandomInt(canvas.height - options.space - 50, canvas.height / 2)
	column.rPosY = canvas.height - column.height * 2 - options.space
	column.posY = canvas.height - column.height
	column.posX = canvas.width
}

/**
 * reseting values, game just stop
 */
function gamePause() {
	bird.rotationX = 50
	options.speedY = 0
	options.speedX = 0
}

/**
 * reseting everything, GAME OVER
 */
function gameOver() {
	gamePause()
	flyDown()

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
function blurAll() {
	var tmp = document.createElement('input')
	document.body.appendChild(tmp)
	tmp.focus()
	document.body.removeChild(tmp)
}

function showAlert() {
	alert.classList.add('alert')

	// const restart = document.createElement('button')
	// restart.classList.add('restart')
	// restart.textContent = 'Restart'

	// const about = document.createElement('button')
	// about.classList.add('about')
	// about.textContent = 'About'
	if (score < 20) scoreMsg.textContent = `Congrats. You are noob. Your score is ${score}`
	else scoreMsg.textContent = `You are not noob. Your score is ${score}`

	alert.prepend(scoreMsg)

	alert.style.display = 'block'
}

function hideAlert() {
	alert.style.display = 'none'
}
