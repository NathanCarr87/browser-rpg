import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export class CollisionDetection {
    // in memory environemnt collision
    _environmentCollisionBoxes = [];
    // creating a generic box to duplicate, saves on memory
    _genericCollisionBox = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
    );

    addEnvironmentCollisionBox(mesh) {
        this._environmentCollisionBoxes.push(mesh);
    }

    checkEnvironmentCollision(playerCollisionBox) {
        let environmentCollisionBox = this._genericCollisionBox.clone(); // clone the box
        let response = false; // default response
        this._environmentCollisionBoxes.forEach((box) => {
            environmentCollisionBox.setFromObject(box); // generate a box from the mesh
            if (playerCollisionBox.intersectsBox(environmentCollisionBox)) {
                // If we have collided we need to let the animate method know to stop movement
                response = true;
            }
        });
        return response;
    }
}