import {Box3, Matrix4, Vector3} from 'three';
import {Euler} from 'three/src/math/Euler';

export interface LevelParams {
    levelName: string;
    levelSize: number;
    levelTime: number;
    noOfWalls: number;
    noOfFlags: number;
    pointsPerFlag: number;
    carSpeed: number;
    carSteerAngle: number;
}

export interface Pr {
    position: Vector3;
    rotation: Euler;
}

export interface Interceptable {
    boundaries: Box3
    position: Vector3
    matrixWorld: Matrix4
}

export function isInterceptable(object: any): object is Interceptable {
    const boundaries = (object as Interceptable).boundaries;
    return !!(boundaries) && (boundaries instanceof Box3);
}

export interface Interception {
    source: Interceptable;
    target: Interceptable;
    rotation: Euler;
}

export interface Refreshable {
    refresh(_time: number)
}

export function isRefreshable(object: any): object is Refreshable {
    const refreshFun = (object as Refreshable).refresh;
    return !!(refreshFun) && typeof refreshFun === 'function';
}

export enum LevelStatus {
    YOU_WIN, YOU_LOSE, IN_PROGRESS, PAUSE
}

export interface GameData {
    ranking: Rank[]
}

export interface Rank {
    name: string;
    score: number;
    date: string;
}

export enum Keys {
    PAUSE = 'Space',
    SHOOT = 'KeyS',
    STOP_CAMERA = 'KeyA',
    RESET = 'KeyR',
    TOGGLE_CONTROLS = 'KeyC',
    MOVE_FORWARD = 'ArrowUp',
    MOVE_BACKWARD = 'ArrowDown',
    TURN_RIGHT = 'ArrowRight',
    TURN_LEFT = 'ArrowLeft',

    YOU_LOSE = 'KeyK',

    CAMERA_HEIGHT_UP = 'KeyQ',
    CAMERA_HEIGHT_DOWN = 'KeyZ',
    CAMERA_DISTANCE_UP = 'KeyW',
    CAMERA_DISTANCE_DOWN = 'KeyX',
}
