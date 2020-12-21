import * as THREE from 'three';
import {Color} from 'three';
import {findDeltaXZ} from '../utils/trigonometry';
import {Refreshable} from './refreshable';
import {Car} from './car';
import {Level} from './level';

const START_COLOR = 0xff0000;
const MAX_SHOTS = 20;

export class CarShot extends THREE.Object3D implements Refreshable {

    private static shots = [];
    private static lastTimeStart = -9999;
    private timeStart;
    private geometry;
    private material;

    static init(car: Car, level: Level, time: number): void {
        if (CarShot.shots.length < MAX_SHOTS) {
            if (Math.abs(CarShot.lastTimeStart - time) > 100) {
                new CarShot(car, level, time);
            }
        }
    }

    private constructor(car: Car, level: Level, time: number) {
        super();
        this.parent = level;
        this.timeStart = time;
        CarShot.lastTimeStart = time;
        this.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        this.material = new THREE.MeshBasicMaterial({color: START_COLOR});
        const cone = new THREE.Mesh(this.geometry, this.material);
        this.add(cone);
        this.parent.add(this);
        this.position.add(car.position);
        this.setRotationFromEuler(car.rotation);

        CarShot.shots.push(this);
    }

    refresh(time: number) {
        if (Math.abs(this.timeStart - time) < 1000) {

            const delta = findDeltaXZ(this.rotation, 0.5);
            this.position.add(delta);
            this.material.color.set(new Color(START_COLOR).addScalar(-0.1));
            this.material.needsUpdate = true;

        } else {

            this.parent.remove(this);
            this.geometry.dispose();
            this.material.dispose();

            CarShot.shots.splice(CarShot.shots.indexOf(this), 1);
        }
    }
}
