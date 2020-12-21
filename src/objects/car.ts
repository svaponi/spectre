import * as THREE from 'three';
import {Intersection, Scene} from 'three';
import {findDeltaXZ} from '../utils/trigonometry';
import {Refreshable} from './refreshable';
import {Level} from './level';
import {IntersectionUtils} from '../utils/interdactionUtils';
import {CarShot} from './carShot';
import {Wall} from './wall';
import {ColorUtils} from '../utils/colorUtils';

export class Car extends THREE.Object3D implements Refreshable {

    width = 1;
    height = 0.5;
    depth = 2;

    vSport = 0.4;

    width1 = this.width;
    height1 = this.height * this.vSport;
    depth1 = this.depth;

    width2 = this.width;
    height2 = this.height;
    depth2 = 0.4;

    decenterBackwards = 0.2;

    level: Level;

    private refreshActions: ((time: number) => void)[] = [];

    constructor(scene: Scene, level: Level) {

        super();

        this.level = level;
        this.parent = scene;

        const widthSegments = 1;
        const heightSegments = 1;
        const depthSegments = 1;

        const outerBox = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth, widthSegments, heightSegments, depthSegments),
            new THREE.MeshBasicMaterial({
                transparent: true,
                wireframe: true
            })
        );
        outerBox.position.y += this.height / 2;
        this.add(outerBox);

        if (this.height1) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(this.width1, this.height1, this.depth1, widthSegments, heightSegments, depthSegments),
                new THREE.MeshBasicMaterial({
                    color: 0x0099ff
                })
            );
            box.position.y += this.height1 / 2;
            this.add(box);
        }

        const box2 = new THREE.Mesh(
            new THREE.BoxGeometry(this.width2, this.height2, this.depth2, widthSegments, heightSegments, depthSegments),
            new THREE.MeshBasicMaterial({
                color: 0x0099ff
            })
        );
        box2.position.y += this.height2 / 2;
        box2.position.z += this.decenterBackwards;
        this.add(box2);


        const geometry2 = new THREE.BufferGeometry();
        geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array([

            (this.width / 2), this.height2, -(this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, -(this.depth1 / 2),
            -(this.width / 2), this.height2, -(this.depth2 / 2) + this.decenterBackwards,

            (this.width / 2), this.height1, -(this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, -(this.depth1 / 2),
            (this.width / 2), this.height2, -(this.depth2 / 2) + this.decenterBackwards,

            -(this.width / 2), this.height2, -(this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, -(this.depth1 / 2),
            -(this.width / 2), this.height1, -(this.depth2 / 2) + this.decenterBackwards,

        ]), 3));
        const plane2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({
            color: 0x00ccff
        }));

        const geometry3 = new THREE.BufferGeometry();
        geometry3.setAttribute('position', new THREE.BufferAttribute(new Float32Array([

            -(this.width / 2), this.height2, (this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, (this.depth1 / 2),
            (this.width / 2), this.height2, (this.depth2 / 2) + this.decenterBackwards,

            (this.width / 2), this.height2, (this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, (this.depth1 / 2),
            (this.width / 2), this.height1, (this.depth2 / 2) + this.decenterBackwards,

            -(this.width / 2), this.height1, (this.depth2 / 2) + this.decenterBackwards,
            0, this.height1, (this.depth1 / 2),
            -(this.width / 2), this.height2, (this.depth2 / 2) + this.decenterBackwards,

        ]), 3));
        const plane3 = new THREE.Mesh(geometry3, new THREE.MeshBasicMaterial({
            color: 0x0066ff
        }));

        this.add(plane2);
        this.add(plane3);

        this.parent.add(this);
    }

    _moveForward(speed: number) {
        const delta = this.calcDeltaPosition(speed);
        const newPos = this.position.clone();
        const newDelta = delta.clone().multiplyScalar(3);
        newPos.add(newDelta);
        const ints = IntersectionUtils.findIntersectionsWithManyFromPosition(this, this.level.obstacles, newPos);
        if (ints.length) {
            delta.multiplyScalar(-1);
            this.handleIntersections(ints);
        }
        this.position.add(delta);
        return delta;
    }

    _moveBackward(speed: number) {
        const delta = this.calcDeltaPosition(speed);
        const newPos = this.position.clone();
        newPos.add(delta);
        const ints = IntersectionUtils.findIntersectionsWithManyFromPosition(this, this.level.obstacles, newPos);
        if (ints.length) {
            delta.multiplyScalar(-1);
            this.handleIntersections(ints);
        }
        this.position.sub(delta);
        return delta;
    }

    _steerRight(radians: number) {
        this.rotateY(-radians);
        const ints = IntersectionUtils.findIntersectionsWithMany(this, this.level.obstacles);
        if (ints.length) {
            this.rotateY(radians);
            this.handleIntersections(ints);
        }
    }

    _steerLeft(radians: number) {
        this.rotateY(radians);
        const ints = IntersectionUtils.findIntersectionsWithMany(this, this.level.obstacles);
        if (ints.length) {
            this.rotateY(-radians);
            this.handleIntersections(ints);
        }
    }

    private calcDeltaPosition(speed: number) {
        return findDeltaXZ(this.rotation, speed);
    }

    _shoot(time: number) {
        CarShot.init(this, this.level, time);
    }

    refresh(time: number) {
        this.refreshActions.forEach(action => action(time));
    }

    private handleIntersections(intersections: Intersection[]) {
        if (intersections.length) {
            for (let intersection of intersections) {
                console.log('car collision', intersection);
                if (intersection.object instanceof Wall) {
                    intersection.object.changeColor(0xff0000);
                } else {
                    ColorUtils.setColor(intersection.object, 0xff0000, true)
                }
            }
        }
    }
}

