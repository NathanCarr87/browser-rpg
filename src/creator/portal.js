import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export class Portal {
    // These constants maybe replaced later on
    _portalMaterial = new THREE.MeshBasicMaterial({ color: 0xaabfab });
    _portalSide = new THREE.BoxBufferGeometry(0.2, 1, 0.2);
    _portalTop = new THREE.BoxBufferGeometry(1, 0.2, 0.2);
    _yPosition = 0.5;

    createRightMesh(x, z) {
        const portalMesh = new THREE.Mesh(this._portalSide, this._portalMaterial);
        portalMesh.position.z = z;
        portalMesh.position.y = this._yPosition;
        portalMesh.position.x = x - 0.3;
        return portalMesh;
    }

    createLeftMesh(x, z) {
        const portalMesh = new THREE.Mesh(this._portalSide, this._portalMaterial);
        portalMesh.position.z = z;
        portalMesh.position.y = this._yPosition;
        portalMesh.position.x = x + 0.3;
        return portalMesh;
    }

    createTopMesh(x, z) {
        const portalMesh = new THREE.Mesh(this._portalTop, this._portalMaterial);
        portalMesh.position.z = z;
        portalMesh.position.y = this._yPosition + 0.5;
        portalMesh.position.x = x;
        return portalMesh;
    }
}