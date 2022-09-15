import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export class Ground {
    createPlane() {
        const planeWidth = 15;
        const planeDepth = 15;
        const geometry = new THREE.PlaneGeometry(planeWidth, planeDepth, 40);
        const material = new THREE.MeshBasicMaterial({
            color: 0x34c237,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        return plane;
    }

    randomIntFromInterval(min, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}