import { Sphere } from "three";
import { IInputMovement } from "./NinjaProps";
import { Octree, uniqTrianglesFromNodes } from "./Octree";
import { AvatarController } from "./AvatarController";

export class World {

  mode: "neighborhood"| "overall" = "neighborhood"; // 周辺のみの判定が全体かどうか
  octreePool: Octree[] = [];           // 8本木Box3
  avatarPool: AvatarController[] = []; // アバター
  sphere = new Sphere();               // 自身の物理判定

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
        // 8本木の中に入っているものを取得する
        var intersectedNodes = octree.getIntersectedNodes(this.sphere, octree.maxDepth);
        // 重複を削除する
        faces = uniqTrianglesFromNodes(intersectedNodes);
      }
      // 重複を削除したものを渡す
      chara.collisionCandidate = faces;
      // キャラクターの更新
      chara.update(timeDelta, input);
    }
  }
}