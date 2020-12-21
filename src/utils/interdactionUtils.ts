import * as THREE from 'three';
import {Vector3} from 'three';
import * as _ from 'lodash';
import {Intersection} from 'three/src/core/Raycaster';
import {Utils} from './utils';

export class IntersectionUtils {

    static findIntersectingObjects<T extends THREE.Object3D>(target: THREE.Object3D, objs: T[]): T[] {
        const intersectingObjs = [];
        for (let i = 0; i < objs.length; i++) {
            if (IntersectionUtils.intersectWithOne(target, objs[i])) {
                intersectingObjs.push(objs[i]);
            }
        }
        return intersectingObjs;
    }

    static findIntersectingObjectsNoTarget<T extends THREE.Object3D>(objs: T[]): T[] {
        const intersectingObjs = [];
        for (let i = 0; i < objs.length; i++) {
            for (let j = i + 1; j < objs.length; j++) {
                if (IntersectionUtils.intersectWithOne(objs[i], objs[j])) {
                    if (!intersectingObjs.includes(objs[i]))
                        intersectingObjs.push(objs[i]);
                    if (!intersectingObjs.includes(objs[j]))
                        intersectingObjs.push(objs[j]);
                }
            }
        }
        return intersectingObjs;
    }

    static intersectWithOne(source: THREE.Object3D, target: THREE.Object3D) {
        return IntersectionUtils.findIntersectionsWithOne(source, target).length > 0;
    }

    static findIntersectionsWithOne(source: THREE.Object3D, target: THREE.Object3D): Intersection[] {
        const dis = target.position.distanceTo(source.position);
        if (dis < 4) {
            const obj1ChildrenGeo = Utils.extractChildrenGeometry(source);
            var originPoint = source.position.clone();
            for (let obj1ChildGeo of obj1ChildrenGeo) {
                for (let vertice of obj1ChildGeo.vertices) {
                    var localVertex = vertice.clone();
                    var globalVertex = localVertex.applyMatrix4(source.matrix);
                    var directionVector = globalVertex.sub(source.position);
                    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                    var collisionResults = ray.intersectObject(target, true);
                    if (collisionResults.length > 0) {
                        return _.filter(collisionResults, (collisionResult) => collisionResult.distance < directionVector.length());
                    }
                }
            }
        }
        return [];
    }

    static findIntersectionsWithMany(source: THREE.Object3D, targets: THREE.Object3D[]): Intersection[] {
        return IntersectionUtils.findIntersectionsWithManyFromPosition(source, targets, source.position);
    }

    // see https://stackoverflow.com/questions/51032542/collision-walls-in-three-js
    static findIntersectionsWithManyFromPosition(source: THREE.Object3D, targets: THREE.Object3D[], otherPosition: Vector3): Intersection[] {
        const intersections = [];
        const obj1ChildrenGeo = Utils.extractChildrenGeometry(source);
        for (let obj1ChildGeo of obj1ChildrenGeo) {
            for (let vertice of obj1ChildGeo.vertices) {
                var localVertex = vertice.clone();
                var globalVertex = localVertex.applyMatrix4(source.matrix.multiplyScalar(2));
                var directionVector = globalVertex.sub(source.position);
                var ray = new THREE.Raycaster(otherPosition, directionVector.clone().normalize());
                var collisionResults = ray.intersectObjects(targets, true);
                if (collisionResults.length > 0) {
                    collisionResults = _.filter(collisionResults, (collisionResult) => collisionResult.distance < directionVector.length());
                    // intersections.push(collisionResults);
                    return collisionResults;
                }
            }
        }
        return intersections;
    }
}

