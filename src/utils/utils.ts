import * as THREE from 'three';
import {Geometry, Material, Object3D} from 'three';

export class Utils {

    static dispose(mesh: THREE.Mesh) {
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }
        Utils.disposeMaterial(mesh.material);
    }

    static disposeMaterial(material: Material | Material[]) {
        if (material instanceof Material) {
            material.dispose();
        } else if (material instanceof Array) {
            for (let i = 0; i < material.length; ++i) {
                material[i].dispose();
            }
        }
    }

    static consumeMaterial(material: Material | Material[], consumer: (mat: Material) => void) {
        if (material instanceof Material) {
            consumer(material);
        } else if (material instanceof Array) {
            for (let i = 0; i < material.length; ++i) {
                consumer(material[i]);
            }
        }
    }

    static toMaterialArray(material: Material | Material[]): Material[] {
        if (material instanceof Material) {
            return [material];
        } else if (material instanceof Array) {
            return material;
        } else {
            return [];
        }
    }

    static extractChildrenGeometry(obj: Object3D): Geometry[] {
        if (obj.userData.childrenGeometry) {
            return obj.userData.childrenGeometry;
        }
        let childrenGeometry: Geometry[] = [];
        Utils.recursiveConsumer(obj, (o) => {
            if (o && o.geometry && o.geometry instanceof Geometry) {
                childrenGeometry.push(o.geometry);
            }
        });
        childrenGeometry = childrenGeometry.filter((item) => !!item);
        obj.userData.childrenGeometry = childrenGeometry;
        console.log('childrenGeometry', obj.name, childrenGeometry);
        return childrenGeometry;
    }

    static recursiveConsumer(obj: any, consumer: (o: any) => void) {
        if (obj) {
            consumer(obj);
            if (obj.children) {
                for (const child of obj.children) {
                    Utils.recursiveConsumer(child, consumer);
                }
            }
        }
    }
}

