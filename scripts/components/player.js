function Player(scene) {
    this.isAlive = true;
    const cubesize = 15
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("imgs/player-face.png");
    const geometry = new THREE.BoxGeometry(cubesize, cubesize, cubesize);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // collision config
    cube.geometry.computeBoundingBox();
    const hitBox = new THREE.Box3();
    hitBox.copy(cube.geometry.boundingBox);

    // initial cube settings
    const initialScale = 60;
    cube.scale.set(initialScale, initialScale, initialScale);

    // scale down
    this.init = () => {
        // scale down
        const duration = 1000;
        const step = duration / initialScale;
        const id = setInterval(() => {
            if (cube.scale.x > 1) {
                cube.rotation.y += 0.1;
                cube.scale.addScalar(-1);
            } else if (cube.scale.x <= 1) {
                cube.scale.set(1, 1, 1);
                clearInterval(id);
            }
        }, step);

        // set position
        cube.position.set(0, 0, 0);
    };

    this.getPosition = () => cube.position;

    this.hitBox = () => hitBox;

    // debug
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    this.handleInput = (movement, camera) => {
        const minDistance = Math.min(window.innerWidth, window.innerHeight) / 6;
        const xMove = Math.abs(movement.x) / minDistance < 1 ? movement.x / minDistance : movement.x / Math.abs(movement.x);
        const yMove = Math.abs(movement.y) / minDistance < 1 ? movement.y / minDistance : movement.y / Math.abs(movement.y);

        const maxSpeed = 6;
        const x = xMove * maxSpeed;
        const y = yMove * maxSpeed;

        // X-axis movement
        if (cube.position.x + x > camera.left && cube.position.x + x < camera.right) {
            cube.position.x += x;
        }

        // Y-axis movement
        if (cube.position.y - y > camera.position.y + camera.bottom && cube.position.y - y < camera.position.y + camera.top) {
            cube.position.y -= y;
        }
    }

    this.getDeathAnimation = () => new Death(cube.position.x, cube.position.y);

    class Death {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.init();
        }

        init() {
            this.particleCount = 50;
            this.explosiveForce = 10;
            this.particleSize = 20;
            this.particleColors = 0xff0000;
            this.directions = [];
            this.points = [];

            for (let i = 0; i < this.particleCount; i++) {
                this.points.push(new THREE.Vector3(this.x, this.y, 0));

                let xforce = (Math.random() * this.explosiveForce) - (this.explosiveForce / 2);
                let yforce = (Math.random() * this.explosiveForce) - (this.explosiveForce / 2);
                xforce *= (Math.random() > 0.8) ? 5 : 1;
                yforce *= (Math.random() > 0.8) ? 5 : 1;
                this.directions.push({ x: xforce, y: yforce });
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
            const material = new THREE.PointsMaterial({ size: this.particleSize, color: this.particleColors });
            this.particles = new THREE.Points(geometry, material);
            scene.add(this.particles);
        }

        remove() {
            scene.remove(this.particles);
        }

        update() {
            // outward projectile logic
            let positions = this.particles.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                let x = positions.getX(i);
                let y = positions.getY(i);

                x += this.directions[i].x;
                y += this.directions[i].y;

                this.directions[i].x *= 0.95;
                this.directions[i].y *= 0.95;

                positions.setXY(i, x, y);

            }
            positions.needsUpdate = true;

            // shrinking shrapnel logic
            let materials = this.particles.material;
            if (materials.size > 1) {
                materials.size *= 0.95;
            }
        }
    }

    this.update = () => {

        if (this.isAlive) {
            // collision hit box update
            const collisionCenter = cube.position;
            const collisionSize = new THREE.Vector3(cubesize, cubesize, cubesize);
            hitBox.setFromCenterAndSize(collisionCenter, collisionSize);
        } else {
            // shrink player cube on death
            cube.scale.multiplyScalar(0.975);
        }

        // random rotation effect
        // TODO https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733

        cube.rotation.y += 0.01;
        cube.rotation.x += 0.0001;
        cube.rotation.z += 0.001;
    }

}

/* TEMPORARY GRAVEYARD */

/*
    this.handleInput = function (keyMap, camera) {
        if (keyMap[65] && (cube.position.x > camera.left)) {
            cube.rotation.y -= 0.1;
            cube.position.x -= 3;
        }
        if (keyMap[68] && (cube.position.x < camera.right)) {
            cube.rotation.y += 0.1;
            cube.position.x += 3;
        }
        if (keyMap[83] && (cube.position.y > camera.position.y + camera.bottom)) {
            cube.rotation.x -= 0.1;
            cube.position.y -= 3;
        }
        if (keyMap[87] && (cube.position.y < camera.position.y + camera.top)) {
            cube.rotation.x += 0.1;
            cube.position.y += 3;
        }
    }
*/