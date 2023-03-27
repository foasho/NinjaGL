import { Box3 } from "three";

/**
 * 物理判定AABBのBox3
 */
export class PhyAABB extends Box3 {
    id: string;
    name: string;
    constructor(){
        super();
    }
}