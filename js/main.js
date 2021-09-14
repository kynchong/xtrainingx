const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const music = new Audio("audio/bg-music.mp3")

canvas.width *= 2
canvas.height *= 2
let width = canvas.width
let height = canvas.height

/* OBJECTS */
var player = {
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
    }
}

var enemy = function() {
    const voidZone = 0.4 * Math.min(width, height) // prevent enemies from spawning in player start zone, keep this value below 0.5!!!
    const enemyMinSize = 3 // size of each enemy dot
    const enemyVarianceSize = 0

    // initial position of enemies
    this.x = (Math.random() * width)
    this.y = (Math.random() * height)
    while (this.x > (width/2) - voidZone && this.x < (width/2) + voidZone && this.y > (height/2) - voidZone && this.y < (height/2) + voidZone) {
        this.x = (Math.random() * width)
        this.y = (Math.random() * height)    
    }

    // attributes of enemy
    this.color = 'hsl(' + 360 * Math.random() + ', 50%, 50%)'
    this.size = Math.floor(Math.random() * enemyVarianceSize) + enemyMinSize

    // enemy target each pass across screen
    let opp = (width/2) - this.x
    let adj = (height/2) - this.y
    this.velX = 3 * (opp**2)/(opp**2+adj**2) * (opp/Math.abs(opp))
    this.velY = 3 * (adj**2)/(opp**2+adj**2) * (adj/Math.abs(adj))
    
}

const enemyCount = 200
var enemies = []

for (let i = 0; i < enemyCount; i++) {
    enemies.push(new enemy)
}

/* UPDATE */
function update(progress) {
    // var p = progress / 16

    updatePlayer()
    updateEnemies()
}

function updatePlayer() {

    // Player
    var movementMultiplier = 5;

    if (player.pressedKeys.up) {
        if (player.position.y > 0) {
            player.position.y -= movementMultiplier
        }         
    }    
    if (player.pressedKeys.down) {
        if (player.position.y < height) {
            player.position.y += movementMultiplier
        }        
    }
    if (player.pressedKeys.left) {
        if (player.position.x > 0) {
            player.position.x -= movementMultiplier
        }
        player.rotation -= movementMultiplier
    }    
    if (player.pressedKeys.right) {
        if (player.position.x < width) {
            player.position.x += movementMultiplier
        }
        player.rotation += movementMultiplier
    }
}

function updateEnemies() {
    const velocity = 3;

    for (const e in enemies) {
        enemies[e].x += enemies[e].velX
        enemies[e].y += enemies[e].velY

        if (enemies[e].x > width) {
            enemies[e].x = 0
            newTarget(enemies[e])
        } else if (enemies[e].x < 0) {
            enemies[e].x = width
            newTarget(enemies[e])
        } else if (enemies[e].y > height) {
            enemies[e].y = 0
            newTarget(enemies[e])
        } else if (enemies[e].y < 0) {
            enemies[e].y = height
            newTarget(enemies[e])
        }
    }

    function newTarget(e) {
        let opp = player.position.x - e.x
        let adj = player.position.y - e.y
        e.velX = (opp**2)/(opp**2+adj**2) * (opp/Math.abs(opp)) * (Math.random()*1.5 + velocity)
        e.velY = (adj**2)/(opp**2+adj**2) * (adj/Math.abs(adj)) * (Math.random()*1.5 + velocity)
    }

}

/* DRAW */
function draw() {
    ctx.clearRect(0, 0, width, height)

    drawPlayer()
    drawEnemies()

}

function drawPlayer() {
    const scale = 5

    ctx.save()
    ctx.translate(player.position.x, player.position.y)
    ctx.rotate((Math.PI / 180) * player.rotation)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 10

    ctx.beginPath()
    ctx.moveTo(-scale, -scale)
    ctx.lineTo(scale, -scale)
    ctx.lineTo(scale, scale)
    ctx.lineTo(-scale, scale)
    ctx.lineTo(-scale, -scale)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

function drawEnemies() {
    for (const e in enemies) {
        ctx.beginPath();
        ctx.arc(enemies[e].x, enemies[e].y, enemies[e].size, 0, 2 * Math.PI, false);
        ctx.fillStyle = enemies[e].color
        ctx.fill();
        ctx.closePath();
    }
}

/* LOOP */
function loop(timestamp) {
    var progress = timestamp - lastRender

    update(progress)
    draw()

    lastRender = timestamp
    window.requestAnimationFrame(loop)
}

/* SCREENS */
function titleScreen() {
    let startText = "START"
    ctx.font = "72px Impact"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.fillText(startText, width/2, height/2)
    
    // Clicking Start Button
    window.addEventListener('click', (e) => {
        const w = width/2
        const h = height/2
        if (e.clientX > w && e.clientX < w + 220 && e.clientY > h + 110 && e.clientY < h + 180) {
            music.play()
            window.requestAnimationFrame(loop)
            window.removeEventListener('click', arguments.callee)
        }
    })

}

/* MAIN CALL TO LOOP */
var lastRender = 0

titleScreen()

/* USER INPUT HANDLING EVENTS */
var keyMap = {
    68: 'right',
    65: 'left',
    87: 'up',
    83: 'down'
}
function keydown(event) {
    var key = keyMap[event.keyCode]
    player.pressedKeys[key] = true
}
function keyup(event) {
    var key = keyMap[event.keyCode]
    player.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)