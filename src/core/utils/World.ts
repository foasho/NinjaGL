import { Sphere } from "three";
import { IInputMovement } from "./NinjaProps";
import { Octree, uniqTrianglesFromNodes } from "./Octree";
import { AvatarController } from "./AvatarController";
import { Box3 } from "three/src/Three";

export class World {

  mode: "neighborhood"| "overall" = "neighborhood"; // 周辺のみの判定が全体かどうか
  octreePool: Octree[] = [];           // 8本木Box3
  avatarPool: AvatarController[] = []; // アバター
  sphere = new Sphere();               // 自身の物理判定
  aabbPool: Box3[] = [];               // AABB物理判定

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
  addOctree(octree: Octree) {
    this.octreePool.push(octree);
  }

  /**
   * 特定の8本木を削除
   * ※指定がなければデフォルトのOctreeInitを削除
   */
  removeOctreeByName(name: string="OctreeInit"){
    this.octreePool =this.octreePool.filter(octree => {
      if (octree.name !== name) return octree;
    })
  }

  /**
   * 特定のAABBを追加
   */
  addAABB(aabb: Box3){
    this.aabbPool.push(aabb);
  }

  /**
   * 特定の
   */

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