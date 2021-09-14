var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width
var height

var resize = function () {
    width = window.innerWidth * 2
    height = window.innerHeight * 1.5
    canvas.width = width
    canvas.height = height
}
window.onresize = resize
resize()

var state = {
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

var enemy = function(x, y, size) {
    this.x = x
    this.y = y
    this.size = size
    this.update = function() {
        this.x++
        this.y++
        fill(255, 0, 0)
        ellipse(this.x, this.y, this.size, this.size)

    }
}

var e1 = new enemy(100, 100, 10)

/* UPDATE */
function update(progress) {
    var p = progress / 16

    updatePlayer(p)
    e1.update

}

function updatePlayer(p) {

    // Player
    var movementMultiplier = 10;

    if (state.pressedKeys.up) {
        if (state.position.y > 0) {
            state.position.y -= p * movementMultiplier
        }         
    }    
    if (state.pressedKeys.down) {
        if (state.position.y < height) {
            state.position.y += p * movementMultiplier
        }        
    }
    if (state.pressedKeys.left) {
        if (state.position.x > 0) {
            state.position.x -= p * movementMultiplier
        }
        state.rotation -= p * movementMultiplier
    }    
    if (state.pressedKeys.right) {
        if (state.position.x < width) {
            state.position.x += p * movementMultiplier
        }
        state.rotation += p * movementMultiplier
    }
}

/* DRAW */
function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.save()

    drawPlayer()

    ctx.restore()
}

function drawPlayer() {
    ctx.translate(state.position.x, state.position.y)
    ctx.rotate((Math.PI / 180) * state.rotation)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 10

    ctx.beginPath()
    ctx.moveTo(-20, -20)
    ctx.lineTo(20, -20)
    ctx.lineTo(20, 20)
    ctx.lineTo(-20, 20)
    ctx.lineTo(-20, -20)
    ctx.closePath()
    ctx.stroke()
}

/* LOOP */
function loop(timestamp) {
    var progress = timestamp - lastRender

    update(progress)
    draw()

    lastRender = timestamp
    window.requestAnimationFrame(loop)
}

/* MAIN CALL TO LOOP */
var lastRender = 0
window.requestAnimationFrame(loop)

/* USER INPUT HANDLING EVENTS */
var keyMap = {
    68: 'right',
    65: 'left',
    87: 'up',
    83: 'down'
}
function keydown(event) {
    var key = keyMap[event.keyCode]
    state.pressedKeys[key] = true
}
function keyup(event) {
    var key = keyMap[event.keyCode]
    state.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)