import * as THREE from 'three';
import {Car} from './car';
import {Refreshable} from '../model';
import {Game} from '../level/game';
import {TrigonometryUtils} from '../utils/TrigonometryUtils';

const START_COLOR = 0xff0000;

export class CarShot extends THREE.Object3D implements Refreshable {

    private timeStart;
    private geometry;
    private material;
    private disposeCallback;

    constructor(car: Car, level: Game, time: number, disposeCallback: (CarShot) => void) {
        super();

        this.parent = level;
        this.timeStart = time;
        this.disposeCallback = disposeCallback;
        this.geometry = new THREE.SphereBufferGeometry(0.1, 12, 12, 0, Math.PI * 2, 0, Math.PI);
        this.material = new THREE.MeshBasicMaterial({color: START_COLOR});

        const projectile = new THREE.Mesh(this.geometry, this.material);
        this.add(projectile);

        this.parent.add(this);
        this.position.add(car.position);
        this.setRotationFromEuler(car.rotation);
    }

    refresh(time: number) {
        if (Math.abs(this.timeStart - time) < 1000) {

            const delta = TrigonometryUtils.findDeltaXZ(this.rotation, 1);
            this.position.add(delta);

        } else {

            this.parent.remove(this);
            this.geometry.dispose();
            this.material.dispose();

            this.disposeCallback(this);
        }
    }
}
