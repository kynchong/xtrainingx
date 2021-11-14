class Enemy {
    constructor(scene) {
        this.scene = scene;
        this.buildEnemy();
        this.init();
    }

    init() {
        this.positionEnemy();
        this.heading = null;
    }

    buildEnemy() {
        this.segments = 8;
        this.size = 3;
        this.color = new THREE.Color("hsl(" + Math.random() * 360 + ", 100%, 50%)");
        this.dampener = 0.003;
        this.velocity = (window.innerWidth + window.innerHeight) * this.dampener;
        this.heading = null;

        const geometry = new THREE.SphereGeometry(this.size, this.segments);
        const material = new THREE.MeshPhongMaterial({ color: this.color });
        this.sphere = new THREE.Mesh(geometry, material);

        this.sphere.geometry.computeBoundingSphere();
        this.hitbox = new THREE.Sphere(this.sphere.position, this.size);
        this.hitbox.copy(this.sphere.geometry.boundingSphere);

        this.scene.add(this.sphere);
    }

    positionEnemy = () => {
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * window.innerWidth - (window.innerWidth / 2);
            y = Math.random() < 0.5 ? (-window.innerHeight / 2) - 10 : (window.innerHeight / 2) + 10;
        } else {
            x = Math.random() < 0.5 ? (-window.innerWidth / 2) - 10 : (window.innerWidth / 2) + 10;
            y = Math.random() * window.innerHeight - (window.innerHeight / 2);
        }

        this.sphere.position.set(x, y, 0);
    }

    acquirePlayerPos = (targetPosition) => {
        const combinedxy = Math.abs(targetPosition.x - this.sphere.position.x) + Math.abs(targetPosition.y - this.sphere.position.y);
        const x = (targetPosition.x - this.sphere.position.x) / combinedxy;
        const y = (targetPosition.y - this.sphere.position.y) / combinedxy;
        this.heading = { x: x, y: y };
    }

    isColliding = (target) => {
        return this.hitbox.intersectsBox(target.hitBox());
    }

    destroy = () => scene.remove(this.sphere);

    update = (playerPosition) => {

        if (this.heading) {
            // collision data update
            this.hitbox.set(this.sphere.position, this.size);

            //
            if (this.heading.x >= 0 && this.sphere.position.x > window.innerWidth / 2) {
                this.sphere.position.x = -window.innerWidth / 2;
                this.acquirePlayerPos(playerPosition);
            } else if (this.heading.x < 0 && this.sphere.position.x < -window.innerWidth / 2) {
                this.sphere.position.x = window.innerWidth / 2;
                this.acquirePlayerPos(playerPosition);
            }
            if (this.heading.y >= 0 && this.sphere.position.y > window.innerHeight / 2) {
                this.sphere.position.y = -window.innerHeight / 2;
                this.acquirePlayerPos(playerPosition);
            } else if (this.heading.y < 0 && this.sphere.position.y < -window.innerHeight / 2) {
                this.sphere.position.y = window.innerHeight / 2;
                this.acquirePlayerPos(playerPosition);
            }

            // move enemy
            this.sphere.position.x += this.heading.x * this.velocity;
            this.sphere.position.y += this.heading.y * this.velocity;
        }
    };

}




/*
function Enemy(scene) {

    // init enemy
    const sphereSegments = 8;
    const size = 3;
    const color = new THREE.Color("hsl(" + Math.random() * 360 + ", 100%, 50%)");
    const velocityDampener = 0.003;
    const geometry = new THREE.SphereGeometry(size, sphereSegments);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // collision config
    sphere.geometry.computeBoundingSphere();
    const collisionBound = new THREE.Sphere(sphere.position, size);
    collisionBound.copy(sphere.geometry.boundingSphere);

    // attributes
    sphere.position.set(...positionEnemy());
    let velocity = (window.innerWidth + window.innerHeight) * velocityDampener;
    let heading = acquirePlayerPos({ x: 0, y: 0 });

    this.destroy = () => scene.remove(sphere);

    function acquirePlayerPos(targetPosition) {
        const combinedxy = Math.abs(targetPosition.x - sphere.position.x) + Math.abs(targetPosition.y - sphere.position.y);
        const x = (targetPosition.x - sphere.position.x) / combinedxy;
        const y = (targetPosition.y - sphere.position.y) / combinedxy;
        return { x: x, y: y };
    }

    function positionEnemy() {
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * window.innerWidth - (window.innerWidth / 2);
            y = Math.random() < 0.5 ? -window.innerHeight / 2 : window.innerHeight / 2;
        } else {
            x = Math.random() < 0.5 ? -window.innerWidth / 2 : window.innerWidth / 2;
            y = Math.random() * window.innerHeight - (window.innerHeight / 2);
        }

        return (new THREE.Vector3(x, y, 0));
    }

    this.collisionCheck = (target) => collisionBound.intersectsBox(target.collisionBound());

    this.update = (playerPosition) => {
        // collision data update
        collisionBound.set(sphere.position, size);

        // boundary logic
        if (sphere.position.x > window.innerWidth / 2) {
            sphere.position.x = -window.innerWidth / 2;
            heading = acquirePlayerPos(playerPosition);
        } else if (sphere.position.x < -window.innerWidth / 2) {
            sphere.position.x = window.innerWidth / 2;
            heading = acquirePlayerPos(playerPosition);
        }
        if (sphere.position.y > window.innerHeight / 2) {
            sphere.position.y = -window.innerHeight / 2;
            heading = acquirePlayerPos(playerPosition);
        } else if (sphere.position.y < -window.innerHeight / 2) {
            sphere.position.y = window.innerHeight / 2;
            heading = acquirePlayerPos(playerPosition);
        }

        // move enemy
        sphere.position.x += heading.x * velocity;
        sphere.position.y += heading.y * velocity;
    }

} */