import * as THREE from 'three';
import {Geometry, Object3D, Vector3} from 'three';
import * as _ from 'lodash';
import {Intersection} from 'three/src/core/Raycaster';
import {Utils} from './utils';

export class IntersectionUtils {

    static findIntersectingObjects<T extends THREE.Object3D>(target: THREE.Object3D, objs: T[]): T[] {
        const intersectingObjs = [];
        for (let i = 0; i < objs.length; i++) {
            if (IntersectionUtils.intersect(target, objs[i])) {
                intersectingObjs.push(objs[i]);
            }
        }
        return intersectingObjs;
    }

    static findIntersectingObjectsNoTarget<T extends THREE.Object3D>(objs: T[]): T[] {
        const intersectingObjs = [];
        for (let i = 0; i < objs.length; i++) {
            for (let j = i + 1; j < objs.length; j++) {
                if (IntersectionUtils.intersect(objs[i], objs[j])) {
                    if (!intersectingObjs.includes(objs[i]))
                        intersectingObjs.push(objs[i]);
                    if (!intersectingObjs.includes(objs[j]))
                        intersectingObjs.push(objs[j]);
                }
            }
        }
        return intersectingObjs;
    }

    static intersect(source: THREE.Object3D, target: THREE.Object3D) {
        return IntersectionUtils.findIntersectionsWithMany(source, [target]).length > 0;
    }

    static findIntersectionsWithMany(source: THREE.Object3D, targets: THREE.Object3D[]): Intersection[] {
        return IntersectionUtils.findIntersectionsWithManyFromPosition(source, targets, source.position);
    }

    // see https://stackoverflow.com/questions/51032542/collision-walls-in-three-js
    static findIntersectionsWithManyFromPosition(source: THREE.Object3D, targets: THREE.Object3D[], otherPosition: Vector3): Intersection[] {
        const sourceGeometries = IntersectionUtils._extractGeometry(source);
        for (let sourceGeometry of sourceGeometries) {
            for (let vertex of sourceGeometry.vertices) {
                const localVertex = vertex.clone();
                const globalVertex = localVertex.applyMatrix4(source.matrix);
                const directionVector = globalVertex.sub(source.position);
                const ray = new THREE.Raycaster(otherPosition, directionVector.clone().normalize());
                let collisionResults = ray.intersectObjects(targets, true);
                if (collisionResults.length > 0) {
                    collisionResults = _.filter(collisionResults, (collisionResult) => collisionResult.distance < directionVector.length());
                    if (collisionResults.length > 0) {
                        return collisionResults;
                    }
                }
            }
        }
        return [];
    }

    private static _extractGeometry(obj: Object3D): Geometry[] {
        if (obj.userData.geometries) {
            return obj.userData.geometries;
        }
        let geometries: Geometry[] = [];
        Utils.recursiveConsumer(obj, (o) => {
            if (o && o.geometry && o.geometry instanceof Geometry) {
                geometries.push(o.geometry);
            }
        });
        geometries = geometries.filter((item) => !!item);
        obj.userData.geometries = geometries;
        console.log('geometries', obj.name, geometries);
        return geometries;
    }
}
