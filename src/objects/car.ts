import * as THREE from 'three';
import {Scene} from 'three';
import {findDeltaXZ} from '../utils/trigonometry';
import {Refreshable} from './refreshable';

const MAX_SHOTS = 50;

class Shot extends THREE.Object3D implements Refreshable {

    private counter = 0;
    private dispose: () => void;

    constructor(car: Car) {
        super();
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const colorGreen = 0x00ff00 * (1 - (car.shots.length / MAX_SHOTS));
        const material = new THREE.MeshBasicMaterial({color: 0xff0000 + colorGreen});
        const cone = new THREE.Mesh(geometry, material);
        this.add(cone);
        car.shots.push(this);
        car.parent.add(this);
        this.position.add(car.position);
        this.setRotationFromEuler(car.rotation);
        this.dispose = () => {
            car.parent.remove(this); // remove from scene -> shot no more visible
            car.shots.splice(car.shots.indexOf(this), 1);
            geometry.dispose();
            material.dispose();
        };
    }

    refresh() {
        if (this.counter < 100) {
            const delta = findDeltaXZ(this.rotation, 0.5);
            this.position.add(delta);
            this.counter++;
        } else {
            this.dispose();
        }
    }
}

export class Car extends THREE.Object3D implements Refreshable {

    shots: Shot[] = [];

    constructor(scene: Scene) {

        super();

        this.parent = scene;

        const width = 1;
        const height1 = 0;
        const depth1 = 2;
        const height2 = 0.4;
        const depth2 = 0.4;
        const sport = 0.2;

        const widthSegments = 1;
        const heightSegments = 1;
        const depthSegments = 1;
        // const box = new THREE.Mesh(
        //     new THREE.BoxGeometry(width, height1, depth1, widthSegments, heightSegments, depthSegments),
        //     new THREE.MeshBasicMaterial({
        //         color: 0x0099ff
        //     })
        // );
        // box.position.y += height1 / 2;
        // this.add(box);

        const box2 = new THREE.Mesh(
            new THREE.BoxGeometry(width, height2, depth2, widthSegments, heightSegments, depthSegments),
            new THREE.MeshBasicMaterial({
                color: 0x0099ff
            })
        );
        box2.position.y += height2 / 2;
        box2.position.z += sport;
        this.add(box2);


        const geometry2 = new THREE.BufferGeometry();
        geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array([

            (width / 2), height2, -(depth2 / 2) + sport,
            0, height1, -(depth1 / 2),
            -(width / 2), height2, -(depth2 / 2) + sport,

            (width / 2), height1, -(depth2 / 2) + sport,
            0, height1, -(depth1 / 2),
            (width / 2), height2, -(depth2 / 2) + sport,

            -(width / 2), height2, -(depth2 / 2) + sport,
            0, height1, -(depth1 / 2),
            -(width / 2), height1, -(depth2 / 2) + sport,

        ]), 3));
        const plane2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({
            color: 0x00ccff
        }));

        const geometry3 = new THREE.BufferGeometry();
        geometry3.setAttribute('position', new THREE.BufferAttribute(new Float32Array([

            -(width / 2), height2, (depth2 / 2) + sport,
            0, height1, (depth1 / 2),
            (width / 2), height2, (depth2 / 2) + sport,

            (width / 2), height2, (depth2 / 2) + sport,
            0, height1, (depth1 / 2),
            (width / 2), height1, (depth2 / 2) + sport,

            -(width / 2), height1, (depth2 / 2) + sport,
            0, height1, (depth1 / 2),
            -(width / 2), height2, (depth2 / 2) + sport,

        ]), 3));
        const plane3 = new THREE.Mesh(geometry3, new THREE.MeshBasicMaterial({
            color: 0x0066ff
        }));

        this.add(plane2);
        this.add(plane3);

        this.parent.add(this);
    }

    _moveForward(speed: number) {
        const delta = this.calcDelta(speed);
        this.position.add(delta);
        return delta;
    }

    _moveBackward(speed: number) {
        const delta = this.calcDelta(speed);
        this.position.sub(delta);
        return delta;
    }

    private calcDelta(speed: number) {
        return findDeltaXZ(this.rotation, speed);
    }

    _shoot() {
        if (this.shots.length <= MAX_SHOTS) {
            new Shot(this);
        }
    }

    refresh() {
        this.shots.forEach(shot => shot.refresh());
    }
}
