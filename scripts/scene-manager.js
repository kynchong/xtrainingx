function SceneManager(canvas) {

    /* ------------------------------------- SCENE / RENDERER / CAMERA -------------------------------------- */
    const screenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    const camera = buildCamera(screenDimensions);

    // BUILDERS
    function buildScene() {
        const scene = new THREE.Scene();
        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setClearColor("#000000");
        renderer.setSize(width, height);
        return renderer;
    }

    function buildCamera({ width, height }) {
        const nearPlane = 0.1;
        const farPlane = 1500;
        const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, nearPlane, farPlane);
        camera.position.z = 800;
        return camera;
    }

    /* ---------------------------------------------- LIGHTING ---------------------------------------------- */
    // light 1
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.x = 500;
    directionalLight.position.y = 200;
    directionalLight.position.z = 500;
    scene.add(directionalLight);

    // light 2
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.position.z = 500;
    scene.add(ambientLight);

    /* ----------------------------------------------- RESIZE ----------------------------------------------- */
    this.onWindowResize = () => {
        const { width, height } = canvas;
        screenDimensions.width = width;
        screenDimensions.height = height;
        renderer.setSize(width, height);
        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();
    }

    /* ----------------------------------------------- AUDIO ------------------------------------------------ */
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // bg music
    const music = new THREE.Audio(listener);
    const musicLoader = new THREE.AudioLoader();
    musicLoader.load(
        'audio/bg-music-night-crawler.mp3',
        function (audioBuffer) {
            music.setBuffer(audioBuffer);
            music.setLoop(true);
            music.setVolume(0.25);
        },
        (onProgressXHR) => null,
        (onErrorCallback) => console.log(onErrorCallback)
    )

    // sfx death
    const deathsfx = new THREE.Audio(listener);
    const deathsfxLoader = new THREE.AudioLoader();
    deathsfxLoader.load(
        'audio/death.mp3',
        function (audioBuffer) {
            deathsfx.setBuffer(audioBuffer);
            deathsfx.setLoop(false);
            deathsfx.setVolume(0.35);
        },
        (onProgressXHR) => null,
        (onErrorCallback) => console.log(onErrorCallback)
    )

    // safari audio callstack restriction
    this.iOSAudioInit = () => {
        music.play();
        music.stop();
    }

    /* ------------------------------------------- GAME VARIABLES ------------------------------------------- */
    let P1;
    const dynamicSubjects = [];
    let enemyAmount = 50;
    let playerTouchInput = { x: 0, y: 0 };
    let keyMap = [];
    let startTimer, timer;

    this.STATES = Object.freeze({
        NEWGAME: "isNewGame",
        RUNNING: "isRunning",
        GAMEOVER: "isGameOver",
        IDLE: "isIdling"
    })

    this.gameState = this.STATES.NEWGAME;

    

    /* ----------------------------------------------- INPUT ------------------------------------------------ */
    this.handleKeyInput = function (keyCode, isDown) {
            keyMap[keyCode] = isDown;
        }

    this.handleInput = (touchStart, touchMove) => {
        playerTouchInput.x = touchMove.x - touchStart.x;
        playerTouchInput.y = touchMove.y - touchStart.y;
    }

    /* -------------------------------------------- GAME STATES --------------------------------------------- */
    this.gameLoad = () => {
        P1 = new Player(scene);
        dynamicSubjects.push(P1);

        for (let i = 0; i < enemyAmount; i++) {
            dynamicSubjects.push(new Enemy(scene));
        }
    }

    this.gameRunning = () => {
        // music
        if (!music.isPlaying) {
            music.play();
        }

        // setup player
        if (P1.isAlive) {
            P1.init();
            P1.isAlive = true;

            // enemies
            setTimeout(() => {
                dynamicSubjects.forEach(child => {
                    if (child instanceof Enemy) {
                        child.init();
                        child.targetPlayer(P1.getPosition());
                    }
                })

                // start timer
                startTimer = Date.now();
            }, 1000);

        } else {
            P1.init();
            P1.isAlive = true;
            dynamicSubjects.forEach(child => {
                if (child instanceof Enemy) {
                    child.init();
                    child.targetPlayer(P1.getPosition());
                }
            })

            // start timer
            startTimer = Date.now();
        }

    }

    this.gameOver = () => {
        // handle controls
        playerTouchInput = { x: 0, y: 0 };
        // end timer
        timer = (Date.now() - startTimer) / 1000;
        formattedTime = new Date(timer * 1000).toISOString().substring(17, 22) + "s"

        // player status
        P1.isAlive = false;

        // death sound effect
        if (deathsfx.isPlaying) {
            deathsfx.stop();
        }
        deathsfx.play();

        // visual effect TODO
        const deathAnimation = P1.getDeathAnimation();
        dynamicSubjects.push(deathAnimation);
        setTimeout(() => {
            dynamicSubjects.pop(deathAnimation);
            deathAnimation.remove();
        }, 1250);

        // update score
        document.getElementById('game-stats').textContent = formattedTime;

    }
    /* ----------------------------------------------- UPDATE ----------------------------------------------- */
    this.update = () => {
        // update dynamic subjects
        dynamicSubjects.forEach((child) => {
            if (child instanceof Enemy) {
                if (P1.isAlive) {
                    child.update(P1.getPosition());
                    if (child.isColliding(P1)) {
                        this.gameState = this.STATES.GAMEOVER;
                    }
                } else {
                    child.update({ x: 0, y: 0 });
                }
            } else {
                child.update();
            }
        })

        P1.handleKeyInput(keyMap, camera);
        P1.handleInput(playerTouchInput, camera);


        renderer.render(scene, camera);
    }


}