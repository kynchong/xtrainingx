const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

// Load external resources
const music = new Audio("audio/bg-music.mp3")
const death = new Audio("audio/death-explosion.mp3")

canvas.width *= 2
canvas.height *= 2
let width = canvas.width
let height = canvas.height
let lastRender = 0

/* USER INPUT HANDLING EVENTS ---------------------------------------------------------------------------------------- */
let keyMap = {
    68: 'right', 39: 'right',
    65: 'left', 37: 'left',
    87: 'up', 38: 'up',
    83: 'down', 40: 'down'
}
function keydown(event) {
    let key = keyMap[event.keyCode]
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
    p1.pressedKeys[key] = true
}
function keyup(event) {
    let key = keyMap[event.keyCode]
    p1.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)

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
        this.rotation = 0
        this.size = 10
        this.speed = 5
        this.color = {
            hue: 360,
            saturation: 0,
            lightness: 100
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
        this.initPosition()
        this.acquirePlayerPos(0, 0)
    }
}

/* INSTANTIATE GAME OBJECTS */
const p1 = new player
const enemyCount = 200
let enemies = []

for (let i = 0; i < enemyCount; i++) {
    enemies.push(new enemy)
}

/* UPDATE ---------------------------------------------------------------------------------------- */
function updatePlayer() {

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

function updateEnemies() {
    // This function controls the direction and velocity of each enemy as they reach the border of a screen.
    const velocitymultiplier = 3
    const varianceFactor = 2

    for (const e in enemies) {
        let offsetx = 0
        let offsety = 0

        enemies[e].x += enemies[e].velX * velocitymultiplier
        enemies[e].y += enemies[e].velY * velocitymultiplier

        // collision with border check
        if (enemies[e].x < 0 || enemies[e].x > width || enemies[e].y < 0 || enemies[e].y > height) {
            if (enemies[e].x < 0) {
                enemies[e].x = width
                offsety = varianceFactor
            } else if (enemies[e].x > width) {
                enemies[e].x = 0
                offsety = varianceFactor
            }
            if (enemies[e].y < 0) {
                enemies[e].y = height
                offsetx = varianceFactor
            } else if (enemies[e].y > height) {
                enemies[e].y = 0
                offsetx = varianceFactor
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
    ctx.lineWidth = 2

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

    // position of player
    p1.position.x += -p1.heading.left + p1.heading.right
    p1.position.y += -p1.heading.up + p1.heading.down
    ctx.translate(p1.position.x, p1.position.y)
    ctx.rotate((Math.PI / 180) * p1.rotation)
    ctx.strokeStyle = "hsl(" + p1.color.hue + "," + p1.color.saturation + "%," + p1.color.lightness-- + "%)"
    
    p1.size++
    // draw the path of the shape
    ctx.beginPath()

    for (let angle = 0; angle < sides; angle++) {
        if (angle % 2 == 0) {
            ctx.moveTo(p1.size * Math.sin( angle * 1.9 * Math.PI / sides), p1.size * Math.cos(angle * 2 * Math.PI / sides) )
        } else {
            ctx.lineTo(p1.size * Math.sin( angle * 2.1 * Math.PI / sides), p1.size * Math.cos(angle * 2 * Math.PI / sides) )            
        }
    }
    
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

function drawEnemies() {
    for (const e in enemies) {
        ctx.save()
        ctx.beginPath();
        ctx.arc(enemies[e].x, enemies[e].y, enemies[e].size, 0, 2 * Math.PI, false);
        ctx.fillStyle = "hsl(" + enemies[e].color + ", 100%, 50%)"
        ctx.fill();
        ctx.closePath();
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
    } else {
        drawPlayerDeath()
        scoreScreen()
    }

    // enemy
    updateEnemies()    
    drawEnemies()

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
    ctx.lineWidth = 10

    // Title
    ctx.font = "130px RacingSansOne"
    ctx.fillText("X-TRAINING X", width / 2, height / 3)

    // Play Button
    ctx.font = "72px RacingSansOne"
    ctx.fillText("PLAY", width / 2, height / 2)

    ctx.beginPath()
    ctx.rect(width/2 - 100, height/2 - 60, 200, 75)
    
    ctx.stroke()
    ctx.closePath()
    ctx.restore()

    // Clicking Play Button
    canvas.addEventListener('click', startgame)
}

function startgame(e) {
    const bound = canvas.getBoundingClientRect()
    let clickX = e.clientX - bound.left
    let clickY = e.clientY - bound.top

    if (clickX > width/2 - 100 && clickX < width/2 + 100 && clickY > height/2 - 65 && clickY < height/2 + 20) {
        canvas.removeEventListener('click', startgame)
        music.play()
        p1.score = Date.now()
        window.requestAnimationFrame(loop)
    }
}

function scoreScreen() {
    ctx.save()
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.lineWidth = 10

    // Game Over message
    ctx.font = "60px RacingSansOne"
    ctx.fillText("GAME OVER!", width / 2, height / 2 - 100)

    // Formatting Player Score
    let formattedScore = null
    ctx.font = "100px RacingSansOne"    
    if (p1.score < 60) {
        formattedScore = new Date(p1.score * 1000).toISOString().substring(17,22) + " s"
    } else {
        formattedScore = new Date(p1.score * 1000).toISOString().substring(14,22)
    }    
    ctx.fillText(formattedScore, width / 2, height / 2)

    // Restart Button
    ctx.font = "60px RacingSansOne"
    ctx.fillText("RESTART", width / 2, height / 2 + 100)
    ctx.beginPath()
    ctx.rect(width/2 - 160, height/2 + 40, 320, 80)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
    

    // Clicking Try Again
    canvas.addEventListener('click', restartgame)
}

function restartgame(e) {
    const bound = canvas.getBoundingClientRect()
    let clickX = e.clientX - bound.left
    let clickY = e.clientY - bound.top

    if (clickX > width/2 - 165 && clickX < width/2 + 165 && clickY > height/2 + 30 && clickY < height/2 + 130) {
        console.log(clickX, clickY)
        canvas.removeEventListener('click', restartgame)
        music.play()
        p1.reset()
        p1.score = Date.now()
    
        for (const e in enemies) {
            enemies[e].reset()
        }
    }
}

/* MAIN CALL TO LOOP ---------------------------------------------------------------------------------------- */
// Settings
music.volume = 0.5

// Preloading FontFace
let f = new FontFace("RacingSansOne", "url(./fonts/RacingSansOne-Regular.ttf)");
f.load().then((font) => {
    document.fonts.add(font);
    console.log(font)
    titleScreen() // Launch Game
  });