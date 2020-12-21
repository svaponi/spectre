import * as THREE from 'three';
import {Euler} from 'three';

export function radians_to_degrees(radians) {
    return radians * (180 / Math.PI);
}

export function degrees_to_radians(degrees) {
    return degrees * (Math.PI / 180);
}

export function round(n: number, significativeDigits = 3) {
    const multiplier = Math.pow(10, significativeDigits);
    return Math.round(multiplier * n) / multiplier;
}

export function findDeltaXZ(rotation: Euler, delta: number) {

    const sin = Math.sin(rotation.y);
    const cos = Math.cos(rotation.y);
    const deltaX = sin * delta;
    const deltaZ = (rotation.x == 0 ? 1 : -1) * cos * delta;

    return new THREE.Vector3(-deltaX, 0, -deltaZ);
}

