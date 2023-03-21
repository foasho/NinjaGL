import { Sphere } from "three";
import { IInputMovement } from "./NinjaProps";
import { Octree, uniqTrianglesFromNodes } from "./Octree";
import { AvatarController } from "./AvatarController";

export class World {

  octreePool: Octree[] = [];           // 8本木Box3
  avatarPool: AvatarController[] = []; // アバター
  sphere = new Sphere();

  constructor() { }

  /**
   * アバターの追加
   * @param avatarControl
   */
  addAvatar(avatarControl: AvatarController) {
    this.avatarPool.push(avatarControl);
    avatarControl.world = this;
  }

  /**
   * 8本木(Box3)を追加
   */
  addOctree(object: Octree) {
    this.octreePool.push(object);
  }

  /**
   * 物理世界の時間をすすめる
   * ※ 物理
   * @param timeDelta 
   */
  step(timeDelta: number, input: IInputMovement) {
    for (var i = 0, l = this.avatarPool.length; i < l; i++) {
      var chara = this.avatarPool[i];
      var faces = void 0;
      // octree で絞られた node に含まれる face だけを
      // character に渡して判定する
      for (var ii = 0, ll = this.octreePool.length; ii < ll; ii++) {
        var octree: Octree = this.octreePool[ii];
        this.sphere.set(
          chara.center,
          chara.radius + chara.groundPadding
        );
        var intersectedNodes = octree.getIntersectedNodes(this.sphere, octree.maxDepth);
        faces = uniqTrianglesFromNodes(intersectedNodes);
      }
      // Avatarの更新をする
      chara.collisionCandidate = faces;
      chara.update(timeDelta, input);
    }
  }
}