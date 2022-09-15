// These are ES6 import statements
// THREE js is the library that creates 3D models in the browser
// https://threejs.org/
console.log('pooooo')
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

// These are scripts I import from other files, it is not required but
// seperating code helps to keep you
import { Portal } from './src/creator/portal.js';
import { Ground } from './src/creator/ground.js';
import { CollisionDetection } from './src/collision/collision-detection.js';
import { Player } from './src/creator/player.js';
// These are commented out for now, but I know I need them both in the future
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field

// Variables
var camera, scene, renderer, mesh, goal, keys, follow;

const player = new Player();
const ground = new Ground();
const collisionDetection = new CollisionDetection();
const portal = new Portal();

var dir = new THREE.Vector3();
var a = new THREE.Vector3();
var b = new THREE.Vector3();
var coronaSafetyDistance = 0.3;
var velocity = 0.0;
var speed = 0.0;

// An array to put meshes in so we can check for collisions later
const treasureCollisionBoxes = [];
const enemyCollisionBoxes = [];
let plane;
const COLLECTABLE = 'COLLECTABLE';
const ENEMY = 'ENEMY';
let score = 0;
let controls;
let treasureMesh;

const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const textures = [];

// Calling the functions to run the game
init();
animate();

function init() {
    // Renderer from three js. This will render all the graphics
    // https://threejs.org/docs/#api/en/renderers/WebGLRenderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // window.addEventListener("click", onMouseClick, false);

    // Perspective Camera, there are multiple cameras
    // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        10
    );

    document.getElementById('score').innerText = score;
    document.getElementById(
        'character-health'
    ).innerText = `HP: ${player.currentHeath}/ ${player.maxHealth}`;

    // Setting the position far enough behind the player to see the whole scene
    camera.position.set(0, 0.3, -1.5);

    // Scene: the object that holds all the meshes
    // https://threejs.org/docs/#api/en/scenes/Scene
    scene = new THREE.Scene();

    // aiming the camera
    camera.lookAt(scene.position);

    // Adding a plane | START
    plane = ground.createPlane();
    scene.add(plane);
    // | END

    mesh = player.createPlayer();
    scene.add(mesh);
    // createEnemyCube();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 2.0;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.enableDamping = true;

    // Create Portal | START

    const zPosition = 1.9;
    const xPosition = 3.5;
    const rightMesh = portal.createRightMesh(xPosition, zPosition);
    const leftMesh = portal.createLeftMesh(xPosition, zPosition);
    const topMesh = portal.createTopMesh(xPosition, zPosition);
    // | END

    // only adding the right and left sides to the collition check... no flying!
    collisionDetection.addEnvironmentCollisionBox(rightMesh);
    collisionDetection.addEnvironmentCollisionBox(leftMesh);
    spawnRandomTreasure();
    scene.add(rightMesh);
    scene.add(leftMesh);
    scene.add(topMesh);

    goal = new THREE.Object3D();
    follow = new THREE.Object3D();
    goal.position.z = -coronaSafetyDistance;
    goal.add(camera);

    renderer.setClearColor(0x567ebf);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    keys = {
        a: false,
        s: false,
        d: false,
        w: false,
    };
    document.body.addEventListener('keydown', function(e) {
        var key = e.code.replace('Key', '').toLowerCase();
        if (keys[key] !== undefined) keys[key] = true;
    });
    document.body.addEventListener('keyup', function(e) {
        var key = e.code.replace('Key', '').toLowerCase();
        if (keys[key] !== undefined) keys[key] = false;
    });
}

function onMouseClick(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function createEnemyCube() {
    // This is the enemy geometry
    // Will eventually be replaced by a loaded 3D model
    var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const enemyMesh = new THREE.Mesh(geometry, material);
    enemyMesh.position.y = 0.1;
    enemyMesh.position.z = 0.7;
    enemyMesh.position.x = 0.7;
    enemyMesh.name = ENEMY;
    enemyCollisionBoxes.push(enemyMesh);
    scene.add(enemyMesh);
}

function spawnRandomTreasure() {
    setTimeout(function() {
        createTreasure();
    }, 3000);
}

function createTreasure() {
    // This is the treasure geometry
    // Will eventually be replaced by a loaded 3D model
    var geometry = new THREE.BoxBufferGeometry(0.1, 0.1, 0.01);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    treasureMesh = new THREE.Mesh(geometry, material);
    treasureMesh.position.y = 0.2;
    treasureMesh.position.z = Math.random() * 5 + 0.1;
    treasureMesh.position.x = Math.random() * 5 + 0.1;
    treasureMesh.rotation.z = -Math.PI / 4;
    treasureMesh.name = COLLECTABLE;
    // console.log(treasureMesh);
    treasureCollisionBoxes.push(treasureMesh);
    scene.add(treasureMesh);
}

function animate() {
    requestAnimationFrame(animate);
    let playerCollisionBox = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
    );
    playerCollisionBox.setFromObject(mesh);

    let clickToPosition;
    // Raycasting for click to move and mobile move | START
    // if (mouse.x !== 0 || mouse.y !== 0) {
    //   raycaster.setFromCamera(mouse, camera);
    //   const intersects = raycaster.intersectObject(plane);

    //   intersects.forEach(intersect => {
    //     console.log("treasure!", intersect);
    //     mesh.lookAt(intersect.point.x, 0.1, intersect.point.z);
    //     goal.lookAt(intersect.point.x, 0.1, intersect.point.z);
    //     mouse = new THREE.Vector2();
    //     clickToPosition = new THREE.Vector3(
    //       intersect.point.x,
    //       intersect.point.y,
    //       intersect.point.z
    //     );
    //   });
    // }
    // | END

    speed = 0.0;

    if (keys.w) {
        speed = 0.02;
    } else if (keys.s) {
        speed = -0.02;
    }

    velocity += (speed - velocity) * 0.3;

    // Gonna check environment collisions to see if we need to stop player movement
    if (collisionDetection.checkEnvironmentCollision(playerCollisionBox)) {
        velocity = -1 * velocity;
    }

    enemyCollisionBoxes.forEach((enemyMeshBox) => {
        const detectionBox = new THREE.Box3(
            new THREE.Vector3(),
            new THREE.Vector3()
        );
        detectionBox.setFromObject(enemyMeshBox);
        detectionBox.expandByVector(new THREE.Vector3(1, 0, 1));
        const helper = new THREE.Box3Helper(detectionBox, 0xffff00);
        scene.add(helper);

        const collisionBox = new THREE.Box3(
            new THREE.Vector3(),
            new THREE.Vector3()
        );
        collisionBox.setFromObject(enemyMeshBox);
        const helper2 = new THREE.Box3Helper(collisionBox, 0xff00ff);
        // scene.add(helper2);
    });

    if (treasureCollisionBoxes.length > 0) {
        treasureCollisionBoxes.forEach((treasureMeshBox) => {
            const treasureCollisionBox = new THREE.Box3(
                new THREE.Vector3(),
                new THREE.Vector3()
            );
            treasureCollisionBox.setFromObject(treasureMeshBox);
            if (playerCollisionBox.intersectsBox(treasureCollisionBox)) {
                const removeMesh = scene.getObjectByProperty(
                    'uuid',
                    treasureMeshBox.uuid
                );
                treasureCollisionBoxes.pop();
                removeMesh.geometry.dispose();
                removeMesh.material.dispose();
                scene.remove(removeMesh);
                spawnRandomTreasure();
                score += 1;
                document.getElementById('score').innerText = score;
            }
        });
    }
    mesh.translateZ(velocity);
    // if (clickToPosition) {
    //   mesh.translateOnAxis(clickToPosition, velocity);
    //   clickToPosition = undefined;
    // }

    if (keys.a) {
        mesh.rotateY(0.05);
        // goal.rotateY(0.05);
    } else if (keys.d) {
        mesh.rotateY(-0.05);
        // goal.rotateY(-0.05);
    }
    if (treasureMesh !== undefined) {
        treasureMesh.rotateY(0.025);
        treasureMesh.rotateX(0.025);
        treasureMesh.rotateZ(0.025);
    }
    a.lerp(mesh.position, 0.4);
    b.copy(goal.position);

    dir.copy(a).sub(b).normalize();
    const dis = a.distanceTo(b) - coronaSafetyDistance;
    goal.position.addScaledVector(dir, dis);

    camera.lookAt(mesh.position);
    controls.update();

    renderer.render(scene, camera);
}