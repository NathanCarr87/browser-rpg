import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export class Player {
    currentHeath = 100;
    maxHealth = 100;
    createPlayer() {
        // This is the player geometry
        // Will eventually be replaced by a loaded 3D model
        var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
        var material = new THREE.MeshBasicMaterial({ color: 0xe8831e });

        const root = new THREE.Bone();
        const child = new THREE.Bone();

        root.add(child);
        child.position.y = 5;
        console.log(root);

        //   const helper = new THREE.SkeletonHelper( skinnedMesh );
        // scene.add( helper )

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.1;
        mesh.name = 'PLAYER';
        mesh.castShadow = true;
        // mesh.add(root);
        return mesh;
    }
}