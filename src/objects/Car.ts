import * as THREE from 'three';
import {Box3, BufferGeometry, Euler, Line, LineBasicMaterial, Vector3} from 'three';
import {CarShot} from './carShot';
import {Interceptable, Refreshable} from '../model';
import {Game} from '../level/game';
import {TrigonometryUtils} from '../utils/TrigonometryUtils';

const MAX_SHOTS = 5;
const MIN_SHOT_INTERVAL = 200;

// const BOUNCE_BACK = 1;

export class Car extends THREE.Object3D implements Refreshable, Interceptable {

    width = 1;
    height = 0.5;
    depth = 2;

    vSport = 0.4;

    width1 = this.width;
    height1 = this.height * this.vSport;
    depth1 = this.depth;

    width2 = this.width;
    height2 = this.height;
    depth2 = 0.5;

    decenterBackwards = 0.25;
    boundaries: Box3;

    game: Game;

    private shots: CarShot[] = [];
    private lastShotTime = -1;

    private refreshActions: ((time: number) => boolean)[] = [];
    private movementEnabled = true;

    constructor(game: Game) {

        super();

        this.name = 'car';
        this.game = game;
        this.parent = game;

        const boundaryGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        boundaryGeometry.computeBoundingBox();
        this.boundaries = boundaryGeometry.boundingBox;

        this.draw();

        this.parent.add(this);
    }

    private draw() {

        const width_2 = this.width / 2;
        const depth1_2 = this.depth1 / 2;
        const depth2_2 = this.depth2 / 2;

        const material = new LineBasicMaterial({color: 0x0066ff, linewidth: 5, side: THREE.DoubleSide});

        const pointFront = new Vector3(0, 0, -depth1_2);
        const pointFrontTopLeft = new Vector3(-width_2, this.height2, -depth2_2 + this.decenterBackwards);
        const pointFrontTopRight = new Vector3(width_2, this.height2, -depth2_2 + this.decenterBackwards);
        const pointFrontBottomLeft = new Vector3(-width_2, 0, -depth2_2 + this.decenterBackwards);
        const pointFrontBottomRight = new Vector3(width_2, 0, -depth2_2 + this.decenterBackwards);
        const pointBackTopLeft = new Vector3(-width_2, this.height2, depth2_2 + this.decenterBackwards);
        const pointBackTopRight = new Vector3(width_2, this.height2, depth2_2 + this.decenterBackwards);
        const pointBackBottomLeft = new Vector3(-width_2, 0, depth2_2 + this.decenterBackwards);
        const pointBackBottomRight = new Vector3(width_2, 0, depth2_2 + this.decenterBackwards);
        const pointBack = new Vector3(0, 0, depth1_2);

        // bottom
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointFront, pointFrontBottomLeft, pointBackBottomLeft, pointBack, pointBackBottomRight, pointFrontBottomRight, pointFront
        ]), material));

        // front
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointFront, pointFrontTopLeft, pointFrontTopRight, pointFront
        ]), material));

        // back
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointBack, pointBackTopLeft, pointBackTopRight, pointBack
        ]), material));

        // top
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointBackTopLeft, pointBackTopRight, pointFrontTopRight, pointFrontTopLeft
        ]), material));

        // left size
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointBackTopLeft, pointFrontTopLeft, pointFrontBottomLeft, pointBackBottomLeft, pointBackTopLeft
        ]), material));

        // right size
        this.add(new Line(new BufferGeometry().setFromPoints([
            pointBackTopRight, pointFrontTopRight, pointFrontBottomRight, pointBackBottomRight, pointBackTopRight
        ]), material));

    }

    _moveForward(speed: number) {
        if (this.movementEnabled) {
            let deltaPosition = this.calcDeltaPosition(speed);
            this.game.moveCar(deltaPosition);
        }
    }

    _moveBackward(speed: number) {
        if (this.movementEnabled) {
            let deltaPosition = this.calcDeltaPosition(speed).multiplyScalar(-1);
            this.game.moveCar(deltaPosition);
        }
    }

    _steerRight(radians: number) {
        if (this.movementEnabled) {
            const euler = new Euler().set(0, -radians, 0);
            this.game.turnCar(euler);
        }
    }

    _steerLeft(radians: number) {
        if (this.movementEnabled) {
            const euler = new Euler().set(0, radians, 0);
            this.game.turnCar(euler);
        }
    }

    private calcDeltaPosition(speed: number) {
        return TrigonometryUtils.findDeltaXZ(this.rotation, speed);
    }

    _shoot(time: number) {
        if (this.shots.length < MAX_SHOTS) {
            if (Math.abs(this.lastShotTime - time) > MIN_SHOT_INTERVAL) {
                const shot = new CarShot(this, this.game, time, (shot) => {
                    this.shots.splice(this.shots.indexOf(shot), 1);
                });
                this.shots.push(shot);
                this.lastShotTime = time;
            }
        }
    }

    refresh(time: number) {
        if (this.refreshActions.length) {
            for (let refreshAction of this.refreshActions) {
                if (!refreshAction(time)) {
                    this.refreshActions.splice(this.refreshActions.indexOf(refreshAction), 1);
                }
            }
        }
    }

    dropIn() {
        let dropInHeight = 20;
        this.position.setX(0);
        this.position.setZ(0);
        this.setRotationFromEuler(new Euler());
        this.refreshActions.push((_time) => {
            dropInHeight -= 0.5;
            if (dropInHeight >= 0) {
                this.position.setY(dropInHeight);
                this.movementEnabled = false;
                return true;
            } else {
                this.position.setY(0);
                this.movementEnabled = true;
                return false;
            }
        });
    }

    fallDown() {
        this.detachCamera();
        this.refreshActions.push((_time) => {
            this.scale.multiplyScalar(0.95);
            this.movementEnabled = false;
            return true;
        });
    }

    detachCamera() {
        this.remove(this.game.camera);
        this.game.camera.lookAt(this.position);
        this.game.camera.position.x = this.position.x;
        this.game.camera.position.z = this.position.z;
        const delta = TrigonometryUtils.findDeltaXZ(this.rotation, this.game.context.cameraPositionDistance);
        this.game.camera.position.sub(delta);
    }

    attachCamera() {
        this.add(this.game.camera);
        this.game.resetCamera();
    }

    hide() {
        this.visible = false;
    }

    show() {
        this.visible = true;
    }
}

