// GLOBAL INIT
const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

// MOBILE DEVICE CHECK
const isMobile = navigator.userAgentData.mobile;

/* ------------------------------------------------ HTML ------------------------------------------------ */
// END SCREEN
const endScreenHTML = document.createElement("div");
endScreenHTML.id = "end-screen";

const gameOverHTML = document.createElement("span");
gameOverHTML.id = "game-over-text";
gameOverHTML.className = "top-text";
gameOverHTML.innerText = "GAME OVER!";
endScreenHTML.append(gameOverHTML);

const gameStatsHTML = document.createElement("span");
gameStatsHTML.id = "game-stats";
endScreenHTML.append(gameStatsHTML);

const playAgainBtnHTML = document.createElement("button");
playAgainBtnHTML.id = "play-again-btn";
playAgainBtnHTML.innerText = "PLAY";
endScreenHTML.append(playAgainBtnHTML);
document.body.prepend(endScreenHTML);

// TITLE SCREEN
const titleScreenHTML = document.createElement("div");
titleScreenHTML.id = "title-screen";

const titleHTML = document.createElement("span");
titleHTML.id = "title-text-content";
titleHTML.className = "top-text";
titleHTML.innerText = "X-TRAINING X";
titleScreenHTML.append(titleHTML);

const playBtnHTML = document.createElement("button");
playBtnHTML.id = "play-btn";
playBtnHTML.innerText = "PLAY";
titleScreenHTML.append(playBtnHTML);

if (!isMobile) {
    const warnHTML = document.createElement("div");
    warnHTML.id = 'warn-text';
    warnHTML.innerText = "Designed for mobile smart devices. Desktop experience may differ.";
    titleScreenHTML.append(warnHTML);
};

document.body.prepend(titleScreenHTML);

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

// KEYBOARD INPUT
function handleKeyDown(event) {
    let keyCode = event.which;
    sceneManager.handleKeyInput(keyCode, true);
}

function handleKeyUp(event) {
    let keyCode = event.which;
    sceneManager.handleKeyInput(keyCode, false);
}

/* -------------------------------------------- GAME STATES --------------------------------------------- */
function gameLoad() {
    // connect with scene manager
    sceneManager.gameLoad();

    // play button clicked
    playBtnHTML.addEventListener('click', () => {
        playBtnHTML.disabled = true;

        // play/stop for safari audio restrictions
        sceneManager.iOSAudioInit();

        // transition texts out of title screen
        titleHTML.style.transform = "translate(-50%, -50vh)";
        playBtnHTML.style.transform = "translate(-50%, 150vh)";

        // timeout for css animation to complete before stepping into next state in game
        setTimeout(() => {
            titleScreenHTML.style.display = 'none';
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

    // keyboard input
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

function gameOver() {
    // handle controls
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);

    // connect with scene manager
    sceneManager.gameOver();

    // display end-screen information
    endScreenHTML.style.display = "block";
    setTimeout(() => {
        gameOverHTML.style.transform = "translate(-50%, -50%)";
        gameStatsHTML.style.opacity = "1.0";
        playAgainBtnHTML.style.transform = "translate(-50%, -50%)";
    }, 50);

    // handle play again button
    playAgainBtnHTML.addEventListener('click', function playAgain(event) {
        event.preventDefault();

        // successful double tap
        if (playAgainBtnHTML.style.background == "red") {
            // block excessive clicks
            playAgainBtnHTML.disabled = true;
            playAgainBtnHTML.removeEventListener('click', arguments.callee);

            // animate out ui elements
            gameOverHTML.style.transform = "translate(-50%, -150vh)";
            gameStatsHTML.style.opacity = "0.0";
            playAgainBtnHTML.style.transform = "translate(-50%, 150vh)";

            // restore button text
            playAgainBtnHTML.style.background = "darkred";

            // hide end screen
            setTimeout(() => {
                endScreenHTML.style.display = "none";
                playAgainBtnHTML.disabled = false;
            }, 500);

            // set next gamestate
            sceneManager.gameState = sceneManager.STATES.RUNNING;
        } else {
            // single tap
            playAgainBtnHTML.style.background = "red";

            // back to zero taps if time elapses
            setTimeout(() => {
                playAgainBtnHTML.style.background = "darkred";
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
