import {Euler, Vector3} from 'three';

export class TrigonometryUtils {
    static radians_to_degrees(radians: number) {
        return radians * (180 / Math.PI);
    }

    static degrees_to_radians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    static prettyRadians(radians: number) {
        return `${TrigonometryUtils.round(radians)} (${TrigonometryUtils.round(TrigonometryUtils.radians_to_degrees(radians))}°)`
    }

    static round(n: number, significativeDigits = 3) {
        const multiplier = Math.pow(10, significativeDigits);
        return Math.round(multiplier * n) / multiplier;
    }

    static findDeltaXZ(rotation: Euler, delta: number) {
        let forwardDirection = new Vector3(0, 0, -1); // z axis is negative relative to the camera
        return forwardDirection.applyEuler(rotation).multiplyScalar(delta).setY(0);
    }

    static findDeltaXYZ(rotation: Euler, delta: number) {
        let forwardDirection = new Vector3(0, 0, -1); // z axis is negative relative to the camera
        return forwardDirection.applyEuler(rotation).multiplyScalar(delta);
    }
}
