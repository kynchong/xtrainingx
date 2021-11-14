// GLOBAL INIT
const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

/* ------------------------------------------------- UI ------------------------------------------------- */
// END SCREEN
const endScreenEl = document.createElement("div");
endScreenEl.id = "end-screen";

const gameOverEl = document.createElement("span");
gameOverEl.id = "game-over-text";
gameOverEl.className = "top-text";
gameOverEl.innerText = "GAME OVER!";
endScreenEl.append(gameOverEl);

const gameStatsEl = document.createElement("span");
gameStatsEl.id = "game-stats";
endScreenEl.append(gameStatsEl);

const playAgainBtnEl = document.createElement("button");
playAgainBtnEl.id = "play-again-btn";
playAgainBtnEl.innerText = "PLAY";
endScreenEl.append(playAgainBtnEl);
document.body.prepend(endScreenEl);

// TITLE SCREEN
const titleScreenEl = document.createElement("div");
titleScreenEl.id = "title-screen";

const titleEl = document.createElement("span");
titleEl.id = "title-text-content";
titleEl.className = "top-text";
titleEl.innerText = "X-TRAINING X";
titleScreenEl.append(titleEl);

const playBtnEl = document.createElement("button");
playBtnEl.id = "play-btn";
playBtnEl.innerText = "PLAY";
titleScreenEl.append(playBtnEl);
document.body.prepend(titleScreenEl);
/* ----------------------------------------------- RESIZE ----------------------------------------------- */
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    sceneManager.onWindowResize();
})

/* ---------------------------------------------- BINDINGS ---------------------------------------------- */

function handleTouchStart(event) {
    event.preventDefault();
    let touchStart = event.currentTarget.touchStart;
    touchStart.x = event.touches[0].clientX;
    touchStart.y = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
    let touchStart = event.currentTarget.touchStart;
    let touchMove = event.currentTarget.touchMove;
    touchMove.x = event.touches[0].clientX;
    touchMove.y = event.touches[0].clientY;
    sceneManager.handleInput(touchStart, touchMove);
}

function handleTouchEnd(event) {
    let touchStart = event.currentTarget.touchStart;
    let touchMove = event.currentTarget.touchMove;
    touchStart = { x: 0, y: 0 };
    touchMove = { x: 0, y: 0 };
    sceneManager.handleInput(touchStart, touchMove);
}

/* -------------------------------------------- GAME STATES --------------------------------------------- */
function gameLoad() {
    // connect with scene manager
    sceneManager.gameLoad();

    // title screen ui elements
    const titleScreenElement = document.getElementById('title-screen');
    const titleElement = document.getElementById('title-text-content');
    const playBtn = document.getElementById('play-btn');

    // play button clicked
    playBtn.addEventListener('click', () => {
        playBtn.disabled = true;

        // play/stop for safari audio restrictions
        sceneManager.iOSAudioInit();

        // transition texts out of title screen
        titleElement.style.transform = "translate(-50%, -50vh)";
        playBtn.style.transform = "translate(-50%, 150vh)";

        // timeout for css animation to complete before stepping into next state in game
        setTimeout(() => {
            titleScreenElement.style.display = 'none';
            sceneManager.gameState = sceneManager.STATES.RUNNING;
        }, 1000);
    });
}

function gameRunning() {

    // connect with scene manager
    sceneManager.gameRunning();

    // handling user touch control
    let touchStart = { x: 0, y: 0 };
    let touchMove = { x: 0, y: 0 };

    window.touchStart = touchStart;
    window.touchMove = touchMove;
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function gameOver() {
    // handle controls
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);

    // connect with scene manager
    sceneManager.gameOver();

    // display end-screen information
    const endScreenElement = document.getElementById('end-screen');
    const gameOverElement = document.getElementById('game-over-text');
    const gameStatsElement = document.getElementById('game-stats');
    const playAgainBtn = document.getElementById('play-again-btn');

    endScreenElement.style.display = "block";
    setTimeout(() => {
        gameOverElement.style.transform = "translate(-50%, -50%)";
        gameStatsElement.style.opacity = "1.0";
        playAgainBtn.style.transform = "translate(-50%, -50%)";
    }, 50);

    // handle play again button
    playAgainBtn.addEventListener('click', function playAgain(event) {
        event.preventDefault();

        // successful double tap
        if (playAgainBtn.style.background == "red") {
            // block excessive clicks
            playAgainBtn.disabled = true;
            playAgainBtn.removeEventListener('click', arguments.callee);

            // animate out ui elements
            gameOverElement.style.transform = "translate(-50%, -150vh)";
            gameStatsElement.style.opacity = "0.0";
            playAgainBtn.style.transform = "translate(-50%, 150vh)";

            // restore button text
            playAgainBtn.style.background = "darkred";

            // hide end screen
            setTimeout(() => {
                endScreenElement.style.display = "none";
                playAgainBtn.disabled = false;
            }, 500);

            // set next gamestate
            sceneManager.gameState = sceneManager.STATES.RUNNING;
        } else {
            // single tap
            playAgainBtn.style.background = "red";

            // back to zero taps if time elapses
            setTimeout(() => {
                playAgainBtn.style.background = "darkred";
            }, 1000);
        }
    }, { passive: false });

}

/* ----------------------------------------------- RENDER ----------------------------------------------- */
function render() {

    switch (sceneManager.gameState) {
        case sceneManager.STATES.IDLE:
            break;
        case sceneManager.STATES.NEWGAME:
            gameLoad();
            break;
        case sceneManager.STATES.RUNNING:
            gameRunning();
            break;
        case sceneManager.STATES.GAMEOVER:
            gameOver();
            break;
    }
    sceneManager.gameState = sceneManager.STATES.IDLE;

    requestAnimationFrame(render);
    sceneManager.update();
}

/* --------------------------------------------- MAIN ENTRY --------------------------------------------- */

window.addEventListener('DOMContentLoaded', () => {
    render();
  });

/* TEMPORARY GRAVEYARD */

/*
// handle DOM events
bindEventListeners();

// BINDINGS
function bindEventListeners() {
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

// INPUT
function handleKeyDown(event) {
    let keyCode = event.which;
    sceneManager.handleInput(keyCode, true);
}

function handleKeyUp(event) {
    let keyCode = event.which;
    sceneManager.handleInput(keyCode, false);
}
 */