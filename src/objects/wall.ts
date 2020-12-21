import * as THREE from 'three';

export class Wall extends THREE.Object3D {

    constructor(width: number, height: number, params: THREE.MeshBasicMaterialParameters) {

        super();

        const front = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height, 1, 1),
            new THREE.MeshBasicMaterial(params)
        );

        const back = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height, 1, 1),
            new THREE.MeshBasicMaterial(params)
        );

        back.rotateY(Math.PI);

        this.add(front);
        this.add(back);
    }
}
