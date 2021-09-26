const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
/* WINDOW SIZE & RESIZE ---------------------------------------------------------------------------------------- */
const upscale = 2
let width = null
let height = null

window.onresize = function () {
    canvas.width = canvas.getBoundingClientRect().width * upscale
    canvas.height = canvas.getBoundingClientRect().height * upscale
    width = canvas.width
    height = canvas.height
}()

let lastRender = 0
// Load external resources
const music = new Audio("audio/bg-music.mp3")
const death = new Audio("audio/death-explosion.mp3")
const titleImage = new Image()
titleImage.src = 'imgs/xtrainer.png'
titleImage.addEventListener('load', function () {
    console.log("Image loaded.")
})

/* USER INPUT HANDLING EVENTS ---------------------------------------------------------------------------------------- */
let keyMap = {
    68: 'right',
    39: 'right',
    65: 'left',
    37: 'left',
    87: 'up',
    38: 'up',
    83: 'down',
    40: 'down'
}

function keydown(event) {
    let key = keyMap[event.keyCode]
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault()
    }
    p1.pressedKeys[key] = true
}

function keyup(event) {
    let key = keyMap[event.keyCode]
    p1.pressedKeys[key] = false
}
window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)
/* Touch */
window.addEventListener('touchstart', function (event) {
    event.preventDefault()
    p1.touchStart.x = event.touches[0].clientX * 2
    p1.touchStart.y = event.touches[0].clientY * 2
}, {
    passive: false
})
window.addEventListener('touchmove', function (event) {
    event.preventDefault()
    p1.target.x = event.touches[0].clientX * 2
    p1.target.y = event.touches[0].clientY * 2
}, {
    passive: false
})
window.addEventListener('touchend', function (event) {
    p1.touchStart.x = null
    p1.touchStart.y = null
}, false)
/* OBJECTS ---------------------------------------------------------------------------------------- */
class player {
    constructor() {
        this.reset()
    }

    // init & reset
    reset() {
        this.position = {
            x: width / 2,
            y: height / 2
        }
        this.target = {
            x: width / 2,
            y: height / 2
        }
        this.touchStart = {
            x: null,
            y: null
        }
        this.rotation = 0
        this.size = 10
        this.speed = 4
        this.speedDampener = 0.05
        this.deadZoneThreshold = 10
        this.color = {
            hue: 360,
            saturation: 100,
            lightness: 50
        }
        this.entitySides = 4 // shape of player entity
        this.pressedKeys = {
            left: false,
            right: false,
            up: false,
            down: false
        }
        this.heading = this.pressedKeys // stores last used keys

        this.score = null
        this.alive = true
    }
}
class enemy {
    constructor() {
        this.reset()
    }
    // initialize position
    initPosition() {
        let r = ((Math.min(width, height) * 0.6))
        let theta = Math.random() * (Math.PI * 2)
        this.x = r * Math.cos(theta) + (width * 0.5)
        this.y = r * Math.sin(theta) + (height * 0.5)
    }
    // retarget p1's position
    acquirePlayerPos(offsetx, offsety) {
        let opp = p1.position.x - this.x
        let adj = p1.position.y - this.y
        let oppadj = (Math.abs(opp) + Math.abs(adj))
        this.velX = Math.abs(opp) / oppadj * (opp / Math.abs(opp)) * (Math.random() * offsetx + 0.75)
        this.velY = Math.abs(adj) / oppadj * (adj / Math.abs(adj)) * (Math.random() * offsety + 0.75)
    }
    // init & reset
    reset() {
        this.color = 360 * Math.random()
        this.size = 2
        this.x
        this.y
        this.velX
        this.velY
        this.varianceMultiplier = 4
        this.initPosition()
        this.acquirePlayerPos(0, 0)
    }
}

/* INSTANTIATE GAME OBJECTS */
const p1 = new player
let enemyCount = Math.round((width / 8))
let enemies = []
for (let i = 0; i < enemyCount; i++) {
    enemies.push(new enemy)
}
/* UPDATE ---------------------------------------------------------------------------------------- */
function updatePlayer() {
    // Check if touch movement or keyboard movement
    if (p1.touchStart.x != null) {
        // Check if movement is greater than deadzone threshold to prevent over sensitivity
        if (Math.abs(p1.target.x - p1.touchStart.x) > p1.deadZoneThreshold || Math.abs(p1.target.y - p1.touchStart.y) > p1.deadZoneThreshold) {

            // move player based on whether or not they will cross boundaries
            let dx = (p1.target.x - p1.touchStart.x) * p1.speedDampener
            let dy = (p1.target.y - p1.touchStart.y) * p1.speedDampener
            dx = Math.abs(dx) < p1.speed ? dx : p1.speed * Math.sign(dx)
            dy = Math.abs(dy) < p1.speed ? dy : p1.speed * Math.sign(dy)

            if (p1.position.x + dx > 0 && p1.position.x + dx < width) {
                p1.position.x += dx
            }
            if (p1.position.y + dy > 0 && p1.position.y + dy < height) {
                p1.position.y += dy
            }

        }
    } else {
        // This function block controls the p1's character movement and bounds the p1 character within the game area
        if (p1.pressedKeys.up) {
            if (p1.position.y > 0) {
                p1.position.y -= p1.speed
            }
        }
        if (p1.pressedKeys.down) {
            if (p1.position.y < height) {
                p1.position.y += p1.speed
            }
        }
        if (p1.pressedKeys.left) {
            if (p1.position.x > 0) {
                p1.position.x -= p1.speed
            }
            p1.rotation -= p1.speed
        }
        if (p1.pressedKeys.right) {
            if (p1.position.x < width) {
                p1.position.x += p1.speed
            }
            p1.rotation += p1.speed
        }
        p1.heading = Object.assign({}, p1.pressedKeys)
    }
}

function updateEnemies() {
    // This function controls the direction and velocity of each enemy as they reach the border of a screen.
    for (const e in enemies) {
        let offsetx = 0
        let offsety = 0
        enemies[e].x += enemies[e].velX * enemies[e].varianceMultiplier
        enemies[e].y += enemies[e].velY * enemies[e].varianceMultiplier
        // collision with border check
        if (enemies[e].x < 0 - enemies[e].size / 2 || enemies[e].x > width + enemies[e].size / 2 || enemies[e].y < 0 - enemies[e].size / 2 || enemies[e].y > height + enemies[e].size / 2) {
            if (enemies[e].x < 0) {
                enemies[e].x = width
                offsety = enemies[e].varianceMultiplier
            } else if (enemies[e].x > width) {
                enemies[e].x = 0
                offsety = enemies[e].varianceMultiplier
            }
            if (enemies[e].y < 0 - enemies[e].size / 2) {
                enemies[e].y = height
                offsetx = enemies[e].varianceMultiplier
            } else if (enemies[e].y > height) {
                enemies[e].y = 0
                offsetx = enemies[e].varianceMultiplier
            }
            enemies[e].acquirePlayerPos(offsetx, offsety)
            offsetx = 0
            offsety = 0
        }
        // check collision with player
        if (p1.alive && (Math.abs(p1.position.x - enemies[e].x) < p1.size) && (Math.abs(p1.position.y - enemies[e].y) < p1.size)) {
            p1.score = (Date.now() - p1.score) / 1000
            p1.alive = false
            // the sound of death
            death.currentTime = 0
            death.play()
        }
    }
}
/* DRAW ---------------------------------------------------------------------------------------- */
function drawPlayer() {
    ctx.save()
    ctx.translate(p1.position.x, p1.position.y)
    ctx.rotate((Math.PI / 180) * p1.rotation)
    ctx.strokeStyle = "hsl(" + p1.color.hue + "," + p1.color.saturation + "%," + p1.color.lightness + "%)"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(-p1.size, -p1.size)
    ctx.lineTo(p1.size, -p1.size)
    ctx.lineTo(p1.size, p1.size)
    ctx.lineTo(-p1.size, p1.size)
    ctx.lineTo(-p1.size, -p1.size)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

function drawPlayerDeath() {
    const sides = p1.entitySides * 2
    ctx.save()
    // inertia of dead player box
    p1.position.x += (-p1.heading.left + p1.heading.right)
    p1.position.y += (-p1.heading.up + p1.heading.down)
    ctx.translate(p1.position.x, p1.position.y)
    // asploding limbs
    p1.size++
    for (let angle = 0; angle < sides; angle++) {
        if (angle % 2 == 0) {
            ctx.moveTo(0.5 * p1.size * Math.sin(angle * 2 * Math.PI / sides), p1.size * Math.cos(angle * 2 * Math.PI / sides))
        } else {
            ctx.lineTo(p1.size * Math.sin(angle * 2 * Math.PI / sides), p1.size * Math.cos(angle * 2 * Math.PI / sides))
        }
    }
    // fade out
    p1.color.lightness *= p1.color.lightness > 0 ? 0.991 : 0
    ctx.strokeStyle = "hsl(" + p1.color.hue + "," + p1.color.saturation + "%," + p1.color.lightness + "%)"
    ctx.stroke()
    ctx.restore()
}

function drawEnemies() {
    for (const e in enemies) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(enemies[e].x, enemies[e].y, enemies[e].size, 0, 2 * Math.PI, false)
        ctx.fillStyle = "hsl(" + enemies[e].color + ", 100%, 50%)"
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }
}

function drawEnemiesPlayerDead() {
    for (const e in enemies) {
        ctx.save()
        ctx.beginPath()
        enemies[e].size += Math.random() * 0.05
        ctx.arc(enemies[e].x, enemies[e].y, Math.abs(Math.sin(enemies[e].size)) * 5, 0, 2 * Math.PI, false)
        ctx.fillStyle = "hsl(" + enemies[e].color + ", 50%, 50%)"
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }
}
/* LOOP ---------------------------------------------------------------------------------------- */
function loop(timestamp) {
    ctx.clearRect(0, 0, width, height)
    // player
    if (p1.alive) {
        updatePlayer()
        drawPlayer()
        // enemy
        updateEnemies()
        drawEnemies()
    } else {
        drawPlayerDeath()
        // enemy
        updateEnemies()
        drawEnemiesPlayerDead()
        scoreScreen()
    }
    // animation logic
    lastRender = timestamp
    window.requestAnimationFrame(loop)
}
/* SCREENS ---------------------------------------------------------------------------------------- */
function titleScreen() {
    ctx.save()
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.line = 5
    // Title
    ctx.font = width * (1 / 8) + "px RacingSansOne"
    ctx.fillText("X-TRAINING X", width * (1 / 2), height * (1 / 4))
    ctx.drawImage(titleImage, width * (1 / 3), (height * (1 / 2)) - (width * (1 / 6)), width * (1 / 3), width * (1 / 3))
    // ENTER to start
    ctx.font = width * (1 / 20) + "px RacingSansOne"
    ctx.fillText("Press ENTER or TAP SCREEN to start.", width * (1 / 2), height * (3 / 4))
    // Instructions
    ctx.beginPath()
    ctx.font = width * (1 / 30) + "px Courier"
    ctx.fillText('"WASD" or ←↑↓→ keys to move.', width * (1 / 2), height * (4 / 5))
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
    // Clicking Play Button
    window.addEventListener('keydown', startgame)
    window.addEventListener('touchstart', startgame)
}

function startgame(event) {
    window.removeEventListener('keydown', startgame)
    window.removeEventListener('touchstart', startgame)
    setTimeout(function () {
        if (event.code == 'Enter' || event.touches[0] != undefined) {
            let playPromise = music.play()
            if (playPromise !== undefined) {
                playPromise.then(function () {
                    console.log("Music loaded.")
                }).catch(function (err) {
                    console.log(err)
                })
            }
            p1.score = Date.now()
            window.requestAnimationFrame(loop)
        }
    }, 400) // time delay to assist with play() user interaction
}

function scoreScreen() {
    ctx.save()
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.lineWidth = 10
    // Game Over message
    ctx.font = width * (1 / 6) + "px RacingSansOne"
    ctx.fillText("GAME OVER!", width * (1 / 2), height * (1 / 4))
    // Formatting Player Score
    let formattedScore = null
    ctx.font = width * (1 / 5) + "px Courier"
    if (p1.score < 60) {
        formattedScore = new Date(p1.score * 1000).toISOString().substring(17, 22) + "s"
    } else {
        formattedScore = new Date(p1.score * 1000).toISOString().substring(14, 22)
    }
    ctx.fillText(formattedScore, width * (1 / 2), height * (1 / 2))
    // Restart Button
    ctx.font = width * (1 / 20) + "px RacingSansOne"
    ctx.fillText("Press ENTER or TAP SCREEN to Try Again!", width * (1 / 2), height * (3 / 4))
    ctx.restore()
    // listen for player choice to restart
    window.addEventListener('keydown', restartgame)
    window.addEventListener('touchstart', restartgame)
}

function restartgame(event) {
    if (!p1.alive && (event.code == 'Enter' || event.touches[0] != undefined)) {
        window.removeEventListener('keydown', restartgame)
        window.removeEventListener('touchstart', restartgame)
        p1.reset()
        p1.score = Date.now()
        music.play()
        for (const e in enemies) {
            enemies[e].reset()
        }
    }
}
/* MAIN CALL TO LOOP ---------------------------------------------------------------------------------------- */
// Settings
music.volume = 0.2
death.volume = 0.3
// Preloading FontFace
let f = new FontFace("RacingSansOne", "url(./fonts/RacingSansOne-Regular.ttf)")
f.load().then((font) => {
    document.fonts.add(font)
    titleScreen() // Launch Game
})
