import * as THREE from 'three';
import {findDeltaXZ, round} from '../utils/trigonometry';

export class Car extends THREE.Object3D {

    constructor() {

        super();

        const width = 0.5;
        const height1 = 0;
        const depth1 = 1;
        const height2 = 0.2;
        const depth2 = 0.2;
        const sport = 0.1;

        const widthSegments = 4;
        const heightSegments = 4;
        const depthSegments = 4;
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

    _calcDelta(speed: number) {

        let carCurrentAngle = round(this.rotation.y);
        const sign = this.rotation.x == 0 ? 1 : -1;

        const sin = Math.sin(carCurrentAngle);
        const cos = Math.cos(carCurrentAngle);
        const deltaX = sin * speed;
        const deltaZ = sign * cos * speed;

        // console.log('carCurrentAngle', {carCurrentAngle, sin, cos, deltaX, deltaZ});

        return new THREE.Vector3(-deltaX, 0, -deltaZ)
    }

    _align(camera: THREE.PerspectiveCamera) {
        const wd = camera.getWorldDirection(this.position);
        camera.position.set(wd.x, wd.y, wd.z);
    }
}
