const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const music = new Audio("audio/bg-music.mp3")

canvas.width *= 2
canvas.height *= 2
let width = canvas.width
let height = canvas.height

let gameover = false
let score = 0

/* OBJECTS ---------------------------------------------------------------------------------------- */
let player = {
    position: {
        x: (width / 2),
        y: (height / 2)
    },
    rotation: 0,
    pressedKeys: {
        left: false,
        right: false,
        up: false,
        down: false
    },
    size: 10,
    speed: 5,
    color: 'white'
}

let enemy = function() {
    // initial position of enemies
    let r = ((Math.min(width, height) * 0.6))
    let theta = Math.random() * (Math.PI * 2)
    this.x = r * Math.cos(theta) + (canvas.width * 0.5)
    this.y = r * Math.sin(theta) + (canvas.height * 0.5)

    // attributes of enemy
    this.color = 360 * Math.random()
    this.size = 2

    // retarget player's position
    this.acquirePlayerPos = function(offsetx, offsety) {
        let opp = player.position.x - this.x
        let adj = player.position.y - this.y
        let oppadj = (Math.abs(opp)+Math.abs(adj)) 
        this.velX = Math.abs(opp)/oppadj * (opp/Math.abs(opp)) * (Math.random() * offsetx + 0.75)
        this.velY = Math.abs(adj)/oppadj * (adj/Math.abs(adj)) * (Math.random() * offsety + 0.75)
    }
    this.acquirePlayerPos(0, 0)
}

const enemyCount = 200
let enemies = []

for (let i = 0; i < enemyCount; i++) {
    enemies.push(new enemy)
}

/* UPDATE ---------------------------------------------------------------------------------------- */
function update(progress) {
    // let p = progress / 16
    updatePlayer()
    updateEnemies()
}

function updatePlayer() {

    // This function block controls the player's character movement and bounds the player character within the game area
    if (player.pressedKeys.up) {
        if (player.position.y > 0) {
            player.position.y -= player.speed
        }         
    }    
    if (player.pressedKeys.down) {
        if (player.position.y < height) {
            player.position.y += player.speed
        }        
    }
    if (player.pressedKeys.left) {
        if (player.position.x > 0) {
            player.position.x -= player.speed
        }
        player.rotation -= player.speed
    }    
    if (player.pressedKeys.right) {
        if (player.position.x < width) {
            player.position.x += player.speed
        }
        player.rotation += player.speed
    }
}

function updateEnemies() {
    // This function controls the direction and velocity of each enemy as they reach the border of a screen.
    const velocitymultiplier = 3
    const offsetMultiplier = 0.5

    for (const e in enemies) {
        let offsetx = 0
        let offsety = 0

        enemies[e].x += enemies[e].velX * velocitymultiplier
        enemies[e].y += enemies[e].velY * velocitymultiplier

        // collision with border check
        if (enemies[e].x < 0 || enemies[e].x > width || enemies[e].y < 0 || enemies[e].y > height) {
            if (enemies[e].x < 0) {
                enemies[e].x = width
                offsety = offsetMultiplier
            } else if (enemies[e].x > width) {
                enemies[e].x = 0
                offsety = offsetMultiplier
            }
            if (enemies[e].y < 0) {
                enemies[e].y = height
                offsetx = offsetMultiplier
            } else if (enemies[e].y > height) {
                enemies[e].y = 0
                offsetx = offsetMultiplier
            }

            enemies[e].acquirePlayerPos(offsetx, offsety)
            offsetx = 0
            offsety = 0
        }    
        
        // collision with player
        if ((Math.abs(player.position.x - enemies[e].x) < player.size) && (Math.abs(player.position.y - enemies[e].y) < player.size)) {
            player.color = "hsl(" + enemies[e].color + ", " + ((Math.random() * 50) + 50) + "%, 50%)"
        }
    }
}
/* COLLISION ---------------------------------------------------------------------------------- */
function collisionCheck() {

}

/* DRAW ---------------------------------------------------------------------------------------- */
function draw() {
    ctx.clearRect(0, 0, width, height)

    drawPlayer()
    drawEnemies()

}

function drawPlayer() {
    ctx.save()
    ctx.translate(player.position.x, player.position.y)
    ctx.rotate((Math.PI / 180) * player.rotation)
    ctx.strokeStyle = player.color

    ctx.beginPath()
    ctx.moveTo(-player.size, -player.size)
    ctx.lineTo(player.size, -player.size)
    ctx.lineTo(player.size, player.size)
    ctx.lineTo(-player.size, player.size)
    ctx.lineTo(-player.size, -player.size)
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

/* LOOP */
function loop(timestamp) {
    let progress = timestamp - lastRender

    if (!gameover) {
        update(progress)
        draw()
    
        lastRender = timestamp
        window.requestAnimationFrame(loop)
    } else {
        score = (Date.now() - score) / 1000
        let endtext = "GAME OVER! "
        ctx.font = "60px Impact"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(endtext, width/2, height/2)
        ctx.font = "72px Impact"
        ctx.fillText(score.toFixed(2) + "s", width/2, height/2 + 100)
        music.pause()
    }

}

/* SCREENS */
function titleScreen() {
    let startText = "PLAY"
    ctx.font = "72px Impact"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.fillText(startText, width/2, height/2)
    
    // Clicking Start Button
    canvas.addEventListener('click', function start(e) {
        window.requestAnimationFrame(loop)
        canvas.removeEventListener('click', start)
        music.play()
        score = Date.now()
        // temporary game ender
        canvas.addEventListener('click', function endgame() {
            gameover = true

        })
    })

}

/* MAIN CALL TO LOOP */
let lastRender = 0
titleScreen()

/* USER INPUT HANDLING EVENTS */
let keyMap = {
    68: 'right',    39: 'right',
    65: 'left',     37: 'left',
    87: 'up',       38: 'up',
    83: 'down',     40: 'down'
}
function keydown(event) {
    let key = keyMap[event.keyCode]
    player.pressedKeys[key] = true
}
function keyup(event) {
    let key = keyMap[event.keyCode]
    player.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)