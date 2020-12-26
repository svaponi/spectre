import * as THREE from 'three';
import {Box3, MeshBasicMaterial} from 'three';
import {MeshBasicMaterialParameters} from 'three/src/materials/MeshBasicMaterial';
import {Interceptable, Refreshable} from '../model';

export class Flag extends THREE.Object3D implements Interceptable, Refreshable {

    size: number;
    params: MeshBasicMaterialParameters;
    boundaries: Box3;
    dispose: () => void;

    private material: MeshBasicMaterial;
    private materialCylinder: MeshBasicMaterial;
    private lastRefresh = 0;

    constructor(size: number, params: MeshBasicMaterialParameters, name = 'flag') {

        super();

        this.size = size;
        this.name = name;
        this.params = params;

        const geo = new THREE.BoxBufferGeometry(size, size, size, 1, 1, 1);
        geo.computeBoundingBox();
        this.boundaries = geo.boundingBox;

        this.material = new THREE.MeshBasicMaterial(params);

        const geometrySphere = new THREE.SphereBufferGeometry(size / 2, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const sphere = new THREE.Mesh(geometrySphere, this.material);
        sphere.position.y += size * 0.75;
        this.add(sphere);

        const geometryCylinder = new THREE.CylinderBufferGeometry(0.1, 0.2, size * 0.8);
        this.materialCylinder = new THREE.MeshBasicMaterial(params);
        this.materialCylinder.color.offsetHSL(0.025, 0, -0.1);
        const cylinder = new THREE.Mesh(geometryCylinder, this.materialCylinder);
        cylinder.position.y += size * 0.4;
        this.add(cylinder);

        this.dispose = () => {
            geo.dispose();
            geometrySphere.dispose();
            geometryCylinder.dispose();
            this.material.dispose();
        };
    }

    refresh(_time: number) {
        if (Math.abs(this.lastRefresh - _time) > 50) {
            this.material.color.offsetHSL(0.01, 0, 0);
            this.materialCylinder.color.offsetHSL(0.01, 0, 0);
        }
    }
}
