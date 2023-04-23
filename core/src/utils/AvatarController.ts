import { AnimationClip, AnimationMixer, Audio, AudioListener, AudioLoader, LoopOnce, MathUtils, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import { IInputMovement, ISetSoundOption, ISoundProps, IUpdateSoundOption } from "./NinjaProps";
import { detectSegmentTriangle, IIntersectProps, isIntersectTriSphere } from "./Intersects";
import { Face } from "./Octree";
import { World } from "./World";
import { NinjaEngine } from "./NinjaEngineManager";

/**
 * ベース: https://github.com/yomotsu/meshwalk
 */
const FALL_VELOCITY = - 10;
const JUMP_DURATION = 1000;
const PI_HALF = Math.PI * 0.5;
const PI_ONE_HALF = Math.PI * 1.5;

let direction2D = new Vector2();
let wallNormal2D = new Vector2();
let groundingHead = new Vector3();
let groundingTo = new Vector3();
let point1 = new Vector3();
let point2 = new Vector3();
let direction = new Vector3();
let translateScoped = new Vector3();
let translate = new Vector3();

interface IOffsetParams {
  tp: {
    offset: Vector3,
    lookAt: Vector3,
  },
  fp: {
    offset: Vector3,
    lookAt: Vector3,
  },
}

interface IAnimStateProps {
  Name: string;
  Enter: any;
  Exit: any;
  Update: any;
  CleanUp?: any;
  Finished?: any;
}

export class AvatarController {
  /**
   * 初期値
   */
  parent: NinjaEngine;
  isCharacterController: boolean = true;
  object: Object3D;
  objectUUIDs: string[] = [];
  center: Vector3;
  radius: number;
  world: World | undefined;
  groundPadding: number = .05;// 接地距離 デフォルト.5
  maxSlopeGradient: number = Math.cos(50 * MathUtils.DEG2RAD);
  // direction  = 0;     // ラジアン値(0~2π) => Degree * Math.PI/180
  moveDirection: Vector3 = new Vector3(0, 0, 0);
  moveScaler = 0;     // 移動値(0 ~ 1)
  movementSpeed = 5; // 秒あたりの最大移動値
  velocity = new Vector3(0, -10, 0);
  jumpPower = 0.5;
  currentJumpPower = 0;
  jumpStartTime = 0;
  groundHeight = 0;
  groundNormal = new Vector3();
  collisionCandidate: Face[] = [];
  contactInfo: IIntersectProps[] = [];
  /**
   * 状態管理フラグ
   */
  isGrounded: boolean = false;
  isOnSlope: boolean = false;
  isIdling: boolean = false;
  isWalking: boolean = false; // 歩いているか
  isRunning: boolean = false;
  isJumping: boolean = false;
  /**
 * キーボード入力用変数
 */
  isMoveKeyHolding: boolean = false;
  frontAngle: -1 | 0 | 1 = 0; // (-1 or 1  or 1)
  prevAngle: -1 | 0 | 1 = 0; // (-1 or 1  or 1)
  frontQuatanion: Quaternion = new Quaternion;

  // 過去動作入力データ
  isFirstUpdate: boolean = true;
  wasGrounded: boolean = false; // 着地していたか
  wasOnSlope: boolean = false;; // 減衰中か
  wasWalking: boolean = false;; // 歩いていたか
  wasRunning: boolean = false;; // 走っていたか
  wasJumping: boolean = false;; // ジャンプしていたか

  // カメラ情報
  cameraMode: "tp" | "fp" = "tp";// tp: third person, fp: first person
  camera: PerspectiveCamera | OrthographicCamera | undefined;
  offsetParams: IOffsetParams = {
    tp: {
      offset: new Vector3(-1, 1, -4.5),
      lookAt: new Vector3(0, 1.5, 4),
    },
    fp: {
      offset: new Vector3(0, 1.7, 0),
      lookAt: new Vector3(0, 1.7, 1),
    },
  }
  raycaster: Raycaster = new Raycaster();

  // アニメーション情報
  isAnimation: boolean = false;
  animations: AnimationClip[] = [];
  animMapper: { [key: string]: string } = {};
  mixer: AnimationMixer | undefined;
  states: { [key: string]: IAnimStateProps } = {};
  currentState: IAnimStateProps | undefined;

  /**
   * サウンド
   */
  sounds: ISoundProps[] = [];

  _events: () => void;

  constructor(
    parent: NinjaEngine,
    object3d: Object3D,
    radius: number,
    animations?: AnimationClip[],
    mixer?: AnimationMixer,
    animMapper?: { [key: string]: string },
    sounds?: ISoundProps[],
  ) {
    this.isCharacterController = true;
    this.object = object3d;
    this.center = this.object.position.clone();
    this.radius = radius;
    this.maxSlopeGradient = Math.cos(50 * MathUtils.DEG2RAD);
    this.isGrounded = false;
    this.isOnSlope = false;
    this.isIdling = false;
    this.isRunning = false;
    this.isJumping = false;
    this.velocity = new Vector3(0, - 10, 0);
    this.currentJumpPower = 0;
    this.jumpStartTime = 0;
    this.groundHeight = 0;
    this.groundNormal = new Vector3();
    this.contactInfo = [];
    let isFirstUpdate = true;
    let wasGrounded: boolean;

    // Animationがあればセットする
    if (animations && animMapper && animations.length > 0) {
      console.log("animationsをセットしようとしてる")
      this.animations = animations;
      this.animMapper = animMapper;
      this.mixer = mixer;
      this.AddState(this.animMapper.idle, this.idleState());
      this.AddState(this.animMapper.walk, this.walkState());
      this.AddState(this.animMapper.run, this.runState());
      this.AddState(this.animMapper.jump, this.jumpState());
      if (this.animMapper.action) this.AddState(this.animMapper.action, this.actionState());
      // 初期はIdleに設定
      this.SetState(this.animMapper.idle);
      this.isAnimation = true;
    }
    else {
      console.info("animationsデータがありません");
    }

    // Soundsをセットする
    if (sounds && sounds.length > 0) {
      sounds.map((sd) => {
        this.setSound({
          id: sd.id,
          key: sd.key,
          filePath: sd.filePath,
          volume: sd.volume,
          loop: sd.loop,
          trigAnim: sd.trigAnim,
          stopAnim: sd.stopAnim
        });
      });
    }

    this.object.traverse((node: Object3D) => {
      if (node.uuid) {
        this.objectUUIDs.push(node.uuid);
      }
    })

    // 親の依存関係も保持しておく
    this.parent = parent;

    this._events = () => {

      // 初回のみ、過去状態を作るだけで終わり
      if (isFirstUpdate) {
        isFirstUpdate = false;
        wasGrounded = this.isGrounded;
        return;
      }

      if (!wasGrounded && this.isGrounded) {
        // startIdlingが先に発生している問題がある
        // TODO このイベントのn秒後にstartIdlingを始めるように変更する
        // this.dispatchEvent( { type: 'endJumping' } );
      }

      wasGrounded = this.isGrounded;
    };
  }


  /**
   * カメラ情報をセットする
   * @param camera 
   * @param offset 
   * @param lookAtOffset 
   */
  setCamera(camera: PerspectiveCamera | OrthographicCamera, offset?: Vector3, lookAtOffset?: Vector3) {
    this.camera = camera;
    if (offset) this.offsetParams[this.cameraMode].offset.copy(offset);
    if (lookAtOffset) this.offsetParams[this.cameraMode].lookAt.copy(lookAtOffset);
  }

  /**
   * カメラOffsetパラメータをセットする
   */
  setOffsetParams(params: IOffsetParams) {
    this.offsetParams = params;
    this.offsetParams.tp.offset.setZ(-15);
  }

  /**
   * カメラモードを変更
   */
  changeCameraMode(mode: 'tp' | 'fp') {
    this.cameraMode = mode;
  }
  

  /**
   * 更新処理
   */
  /**
 * アップデート処理
 * @param timeDelta  TimeDelta
 * @param input      IInputMovement
 */
  update(timeDelta: number, input: IInputMovement) {
    // Step0: 状態をリセット
    this.isGrounded = false;
    this.isOnSlope = false;
    this.groundHeight = - Infinity;
    this.groundNormal.set(0, 1, 0);

    // Step0: 入力による状態変更
    this.inputStatusChange();

    // Step1: 着地の更新
    this._updateGrounding();
    // ジャンプ時の更新
    this._updateJumping();
    // 位置の更新
    this._updatePosition(timeDelta);
    this._collisionDetection();
    this._solvePosition();
    // 速度の更新
    this._updateVelocity();

    // 入力に対応する処理
    if (input.jump) this.jump();
    this._updateFrontData(timeDelta, input);
  }


  /**
 * 入力変更
   */
  inputStatusChange() {

    // 初回のみ、過去状態を作るだけで終わり
    if (this.isFirstUpdate) {
      this.isFirstUpdate = false;
      this.wasGrounded = this.isGrounded;
      this.wasOnSlope = this.isOnSlope;
      this.wasRunning = this.isRunning;
      this.wasWalking = this.isWalking;
      this.wasJumping = this.isJumping;
      return;
    }

    // 着地している状態で、入力がない場合はIdleにセットする
    if (!this.wasWalking && !this.isWalking && this.isGrounded && !this.isIdling) {
      this.isIdling = true;
    } else if ( // 歩きはじめたか、着地直後か、
      (!this.wasWalking && this.isWalking && !this.isJumping && this.isGrounded) ||
      (!this.wasGrounded && this.isGrounded && this.isWalking) ||
      (this.wasOnSlope && !this.isOnSlope && this.isWalking && this.isGrounded)
    ) {
      this.isIdling = false;
    } else if (!this.wasJumping && this.isJumping) {
      this.isIdling = false;
    } else if (!this.wasOnSlope && this.isOnSlope) {
    } else if (this.wasGrounded && !this.isGrounded && !this.isJumping) {
    }
    if (!this.wasGrounded && this.isGrounded) {
      // startIdlingが先に発生している問題がある
      // TODO このイベントのn秒後にstartIdlingを始めるように変更する
      // this.dispatchEvent( { type: 'endJumping' } );
    }

    this.wasGrounded = this.isGrounded;
    this.wasOnSlope = this.isOnSlope;
    this.wasRunning = this.isRunning;
    this.wasWalking = this.isWalking;
    this.wasJumping = this.isJumping;
  }

  /**
   * 速度更新
   */
  _updateVelocity() {
    const frontDirection = this.moveDirection.z;
    const rightDirection = this.moveDirection.x;
    let isHittingCeiling = false;
    this.velocity.set(
      rightDirection * this.movementSpeed * this.moveScaler, // #
      FALL_VELOCITY,
      frontDirection * this.movementSpeed * this.moveScaler
    );
    // 急勾配や自由落下など、自動で付与される速度の処理
    if (this.contactInfo.length === 0 && !this.isJumping) {
      // 何とも衝突していないので、自由落下
      return;
    } else if (this.isGrounded && !this.isOnSlope && !this.isJumping) {
      // 通常の地面上にいる場合、ただしジャンプ開始時は除く
      this.velocity.y = 0;
    } else if (this.isOnSlope) {
      // TODO 0.2 はマジックナンバーなので、幾何学的な求め方を考える
      const slidingDownVelocity = FALL_VELOCITY;
      const horizontalSpeed = - slidingDownVelocity / (1 - this.groundNormal.y) * 0.2;
      this.velocity.x = this.groundNormal.x * horizontalSpeed;
      this.velocity.y = FALL_VELOCITY;
      this.velocity.z = this.groundNormal.z * horizontalSpeed;
    } else if (!this.isGrounded && !this.isOnSlope && this.isJumping) {
      // ジャンプの処理
      this.velocity.y = this.currentJumpPower * - FALL_VELOCITY;
    }

    // 壁に向かった場合、壁方向の速度を0にする処理
    direction2D.set(0, frontDirection);
    const negativeFrontAngle = Math.atan2(- direction2D.y, - direction2D.x);
    for (let i = 0, l = this.contactInfo.length; i < l; i++) {
      const normal = this.contactInfo[i].face?.normal;
      if (!normal) continue;
      if (this.maxSlopeGradient < normal.y || this.isOnSlope) {
        // フェイスは地面なので、壁としての衝突の可能性はない。
        // 速度の減衰はしないでいい
        continue;
      }

      if (!isHittingCeiling && normal.y < 0) {
        isHittingCeiling = true;
      }

      wallNormal2D.set(normal.x, normal.z).normalize();
      const wallAngle = Math.atan2(wallNormal2D.y, wallNormal2D.x);
      if (
        Math.abs(negativeFrontAngle - wallAngle) >= PI_HALF &&  //  90deg
        Math.abs(negativeFrontAngle - wallAngle) <= PI_ONE_HALF // 270deg
      ) {
        // フェイスは進行方向とは逆方向、要は背中側の壁なので
        // 速度の減衰はしないでいい
        continue;
      }
      // 上記までの条件に一致しなければ、フェイスは壁
      // 壁の法線を求めて、その逆方向に向いている速度ベクトルを0にする
      wallNormal2D.set(
        direction2D.dot(wallNormal2D) * wallNormal2D.x,
        direction2D.dot(wallNormal2D) * wallNormal2D.y
      );
      direction2D.sub(wallNormal2D);
      this.velocity.x = direction2D.x * this.movementSpeed * (this.isWalking ? 1 : 0);
      this.velocity.z = direction2D.y * this.movementSpeed * (this.isWalking ? 1 : 0);
    }

    // ジャンプ中に天井にぶつかったら、ジャンプを中断する
    if (isHittingCeiling) {
      this.velocity.y = Math.min(0, this.velocity.y);
      this.isJumping = false;
    }

  }

  /**
   * 地面の衝突更新
   */
  _updateGrounding() {
    // "頭上からほぼ無限に下方向までの線 (segment)" vs "フェイス (triangle)" の
    // 交差判定を行う
    // もし、フェイスとの交差点が「頭上」から「下groundPadding」までの間だったら
    // 地面上 (isGrounded) にいることとみなす
    //
    //   ___
    //  / | \
    // |  |  | player sphere
    //  \_|_/
    //    |
    //---[+]---- ground
    //    |
    //    |
    //    | segment (player's head to almost -infinity)
    let groundContactInfoTmp: Vector3 | null;
    let groundContactInfo: IIntersectProps = {
      contactPoint: undefined as any,
      distance: undefined
    };
    const faces = this.collisionCandidate;

    groundingHead.set(
      this.center.x,
      this.center.y + this.radius,
      this.center.z
    );

    groundingTo.set(
      this.center.x,
      this.center.y - 1e10,
      this.center.z
    );

    for (let i = 0, l = faces.length; i < l; i++) {
      groundContactInfoTmp = detectSegmentTriangle(
        groundingHead,
        groundingTo,
        faces[i].a,
        faces[i].b,
        faces[i].c
      );

      if (groundContactInfoTmp && !groundContactInfo.contactPoint) {
        groundContactInfo.contactPoint = groundContactInfoTmp;
        groundContactInfo.face = faces[i];
      } else if (
        groundContactInfoTmp &&
        groundContactInfoTmp.y > groundContactInfo.contactPoint.y
      ) {
        groundContactInfo.contactPoint = groundContactInfoTmp;
        groundContactInfo.face = faces[i];
      }

    }

    if (!groundContactInfo.contactPoint) {
      return;
    }

    this.groundHeight = groundContactInfo.contactPoint.y;
    if (groundContactInfo.face){
      this.groundNormal.copy(groundContactInfo.face.normal);
    }

    const top = groundingHead.y;
    const bottom = this.center.y - this.radius - this.groundPadding;

    // ジャンプ中、かつ上方向に移動中だったら、強制接地しない
    if (this.isJumping && 0 < this.currentJumpPower) {
      this.isOnSlope = false;
      this.isGrounded = false;
      return;
    }

    this.isGrounded = (bottom <= this.groundHeight && this.groundHeight <= top);
    this.isOnSlope = (this.groundNormal.y <= this.maxSlopeGradient);

    // 着地していたらジャンプフラグをオフにする
    if (this.isGrounded) {
      this.isJumping = false;
    }
  }

  /**
   * 暫定の位置の更新
   * @param timeDelta
   */
  _updatePosition(timeDelta: number) {
    // 壁などを無視してひとまず(速度 * 時間)だけ
    // centerの座標を進める
    // 壁との衝突判定はこのこの後のステップで行うのでここではやらない
    // もしisGrounded状態なら、強制的にyの値を地面に合わせる
    const groundedY = this.groundHeight + this.radius;
    const x = this.center.x + this.velocity.x * timeDelta;
    const y = this.center.y + this.velocity.y * timeDelta;
    const z = this.center.z + this.velocity.z * timeDelta;

    this.center.set(
      x,
      (this.isGrounded ? groundedY : y),
      z
    );
  }

  /**
   * 衝突を検出して、リストに格納
   */
  _collisionDetection() {
    // 交差していそうなフェイス (collisionCandidate) のリストから、
    // 実際に交差している壁フェイスを抜き出して
    // this.contactInfoに追加する
    const faces = this.collisionCandidate;
    this.contactInfo.length = 0;
    for (let i = 0, l = faces.length; i < l; i++) {
      const contactInfo = isIntersectTriSphere(
        this,
        faces[i].a,
        faces[i].b,
        faces[i].c,
        faces[i].normal
      );
      if (!contactInfo) continue;
      contactInfo.face = faces[i];
      this.contactInfo.push(contactInfo);
    }
  }

  /**
   * 衝突判定等から位置を修正する
   */
  _solvePosition() {
    // updatePosition() で center を動かした後
    // 壁と衝突し食い込んでいる場合、
    // ここで壁の外への押し出しをする

    let face;
    let normal;
    // let distance;

    if (this.contactInfo.length === 0) {
      // 何とも衝突していない
      // centerの値をそのままつかって終了
      this.object.position.copy(this.center);
      return;
    }

    //
    // vs walls and sliding on the wall
    translate.set(0, 0, 0);
    for (let i = 0, l = this.contactInfo.length; i < l; i++) {

      face = this.contactInfo[i].face;
      normal = this.contactInfo[i].face?.normal;
      if (!normal || !face) continue;

      // distance = this.contactInfo[ i ].distance;
      // if ( 0 <= distance ) {
      //   // 交差点までの距離が 0 以上ならこのフェイスとは衝突していない
      //   // 無視する
      //   continue;
      // }

      if (this.maxSlopeGradient < normal.y) {
        // this triangle is a ground or slope, not a wall or ceil
        // フェイスは急勾配でない坂、つまり地面。
        // 接地の処理は updatePosition() 内で解決しているので無視する
        continue;
      }

      // フェイスは急勾配な坂か否か
      const isSlopeFace = (this.maxSlopeGradient <= face.normal.y && face.normal.y < 1);

      // ジャンプ降下中に、急勾配な坂に衝突したらジャンプ終わり
      if (this.isJumping && 0 >= this.currentJumpPower && isSlopeFace) {

        this.isJumping = false;
        this.isGrounded = true;

      }

      if (this.isGrounded || this.isOnSlope) {

        // 地面の上にいる場合はy(縦)方向は同一のまま
        // x, z (横) 方向だけを変更して押し出す
        // http://gamedev.stackexchange.com/questions/80293/how-do-i-resolve-a-sphere-triangle-collision-in-a-given-direction
        point1.copy(normal).multiplyScalar(- this.radius).add(this.center);
        direction.set(normal.x, 0, normal.z).normalize();
        const plainD = face.a.dot(normal);
        const t = (plainD - (normal.x * point1.x + normal.y * point1.y + normal.z * point1.z)) / (normal.x * direction.x + normal.y * direction.y + normal.z * direction.z);
        point2.copy(direction).multiplyScalar(t).add(point1);
        translateScoped.subVectors(point2, point1);

        if (Math.abs(translate.x) > Math.abs(translateScoped.x)) {
          translate.x += translateScoped.x;
        }

        if (Math.abs(translate.z) > Math.abs(translateScoped.z)) {
          translate.z += translateScoped.z;
        }

        // break;
        continue;

      }

    }

    this.center.add(translate);
    this.object.position.copy(this.center);

  }

  /**
   * ジャンプ処理 
   */
  jump() {
    if (this.isJumping || !this.isGrounded || this.isOnSlope) return;
    /**
     * ・ジャンプ時の記録を保持
     * ・現在のジャンプ時の力を1に戻す
     * ・ジャンプフラグを立てる
     */
    this.jumpStartTime = performance.now();// ジャンプ時の時刻を記録
    this.currentJumpPower = this.jumpPower;
    this.isJumping = true;
  }

  /**
   * ジャンプ情報を更新
   */
  _updateJumping() {
    if (!this.isJumping) return; // Jump中でないならそのまま返す
    /**
     * ・ジャンプ時からの差分を取得
     * ・
     */
    const elapsed = performance.now() - this.jumpStartTime;
    const progress = elapsed / JUMP_DURATION;
    this.currentJumpPower = Math.cos(Math.min(progress, 1) * Math.PI);
  }

  /**
 * 入力に応じて移動方向を変更
 * @param input 
 */
  _updateFrontData(timeDelta: number, input: IInputMovement) {
    const horizVec = new Vector3(0, 0, 0);
    const _acceleration = new Vector3(1, 0.25, 50.0);

    // 前方向の移動値
    if (input.forward && !input.backward) {
      this.moveScaler = 0.5;
      horizVec.setZ(1);
    }
    else if (!input.forward && input.backward) {
      this.moveScaler = 0.5;
      horizVec.setZ(-1);
    }
    else {
      this.moveScaler = 0;
    }
    if (input.dash) {
      this.moveScaler = 1.;
    }


    // 横方向の回転
    const _a = new Vector3()
    const _q = new Quaternion();
    const _r = this.object.quaternion.clone();
    if (input.right && !input.left) {
      _a.set(0, 1, 0);
      _q.setFromAxisAngle(_a, -4.0 * Math.PI * timeDelta * _acceleration.y);
      _r.multiply(_q);
    }
    else if (!input.right && input.left) {
      _a.set(0, 1, 0);
      _q.setFromAxisAngle(_a, 4.0 * Math.PI * timeDelta * _acceleration.y);
      _r.multiply(_q);
    }
    this.object.quaternion.copy(_r);
    this.moveDirection = horizVec.applyQuaternion(_r);

    // カメラがついてる場合は、理想位置に更新する
    if (this.camera) {
      // OrbitCameraと同期する予定
      const idealOffset = this._CalculateIdealOffset();
      const idealLookat = this._CalculateIdealLookat();
      const t = 1.0 - Math.pow(0.001, timeDelta);
      const newPosition = this.camera.position.clone().lerp(idealOffset, t);
      /**
       * カメラを移動させる前に、カメラとアバターの間に衝突物を確認し、
       * - 衝突していれば、カメラを衝突物の前まで移動させる。
       * - 衝突してなければ、そのままカメラを移動する。
       */
      const cameraPosition = newPosition.clone();
      const objectPosition = this.object.position.clone();
      const direction = objectPosition.clone().sub(cameraPosition.clone()).normalize();
      const distance = cameraPosition.distanceTo(objectPosition);
      const om = this.parent.getAvatar();
      const targetAvatarObject = om?.object? om.object : null;
      if (targetAvatarObject) {
        this.raycaster.set(newPosition, direction);
        this.raycaster.far = distance - (this.radius * 1.2);// ある程度バッファを持たせる
        this.raycaster.near = 0.1;
        const intersects = this.raycaster.intersectObject(targetAvatarObject, true);
        if (intersects.length > 0) {
          const intersect = intersects[0];
          this.camera.position.copy(intersect.point);
          this.camera.lookAt(idealLookat);
        }
        else {
          this.camera.position.copy(newPosition);
          this.camera.lookAt(idealLookat);
        }
      }
      else {
        this.camera.position.copy(newPosition);
        this.camera.lookAt(idealLookat);
      }
    }

    // アニメーションが有効であれば更新
    if (this.isAnimation) {
      if (this.currentState && this.mixer) {
        this.currentState.Update(timeDelta, input);
        this.mixer.update(timeDelta);
      }
    }
  }

  /**
   * カメラの理想OffsetとLookAt
   * ベース:https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera
   */
  _CalculateIdealOffset() {
    const idealOffset = new Vector3().copy(this.offsetParams[this.cameraMode].offset);
    idealOffset.applyQuaternion(this.object.quaternion.clone());
    idealOffset.add(this.object.position.clone());
    return idealOffset;
  }
  _CalculateIdealLookat() {
    const idealLookat = new Vector3().copy(this.offsetParams[this.cameraMode].lookAt);
    idealLookat.applyQuaternion(this.object.quaternion.clone());
    idealLookat.add(this.object.position.clone());
    return idealLookat;
  }


  /**
   * Animation処理
   * ベース: [Mr.SimonDev] https://www.youtube.com/watch?v=UuNPHOJ_V5o
   */
  // AnimationMapper分だけ作成して、Statesにセットする
  AddState(name: string, state: IAnimStateProps) {
    this.states[name] = state;
  }
  SetState(name: string) {
    const prevState = this.currentState;
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }
    const state = this.states[name];
    if (state) {
      this.currentState = state;
      state.Enter(prevState);
    }
  }
  getState(actionName: string) {
    if (actionName == "idle") { }
    if (actionName == "run") { }
    if (actionName == "walk") { }
    if (actionName == "jump") { }
    return null;
  }
  idleState(): IAnimStateProps {
    return {
      Name: this.animMapper.idle,
      Enter: (prevState: IAnimStateProps) => {
        const animation = this.animations.find(a => a.name == this.animMapper.idle);
        if (!animation) {
          throw `${this.animMapper.idle}というアニメーションが見つかりません`;
        }
        if (!this.mixer) {
          throw `mixerが見つかりません`;
        }
        const idleAction = this.mixer.clipAction(animation);
        if (prevState) {
          const prevAnimation = this.animations.find(a => a.name == prevState.Name);
          const prevAction = this.mixer.clipAction(prevAnimation!);
          idleAction.time = 0.0;
          idleAction.enabled = true;
          idleAction.setEffectiveTimeScale(1.0);
          idleAction.setEffectiveWeight(1.0);
          idleAction.crossFadeFrom(prevAction, 0.5, true);
          idleAction.play();
        }
        else {
          idleAction.play();
        }
      },
      Exit: () => { },
      Update: (timeDelta: number, input: IInputMovement) => {
        if (input.forward || input.backward) {
          this.SetState(this.animMapper.walk);
        }
        else if (input.jump) {
          this.SetState(this.animMapper.jump);
        }
        else if (input.action) {
          this.SetState(this.animMapper.action);
        }
      },
    };
  }
  /**
   * [歩くAnimation]
   */
  walkState(): IAnimStateProps {
    const actType = "walk";
    return {
      Name: this.animMapper[actType],
      Enter: (prevState: IAnimStateProps) => {
        this.playSoundByAnim(actType);
        const animation = this.animations.find(a => a.name == this.animMapper.walk);
        if (!animation) {
          throw `${this.animMapper.idle}というアニメーションが見つかりません`;
        }
        if (!this.mixer) {
          throw `mixerが見つかりません`;
        }
        const curAction = this.mixer.clipAction(animation);
        if (prevState) {
          const prevAnimation = this.animations.find(a => a.name == prevState.Name);
          const prevAction = this.mixer.clipAction(prevAnimation!);
          curAction.enabled = true;
          if (prevState.Name == this.animMapper.run) {
            const ratio = curAction.getClip().duration / prevAction.getClip().duration;
            curAction.time = prevAction.time * ratio;
          } else {
            curAction.time = 0.0;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);
          }
          curAction.crossFadeFrom(prevAction, 0.5, true);
          curAction.play();
        } else {
          curAction.play();
        }
      },
      Exit: () => {
        this.stopSoundByAnim(actType);
      },
      Update: (timeDelta: number, input: IInputMovement) => {
        if (input.forward || input.backward) {
          if (input.dash) {
            this.SetState(this.animMapper.run);
          }
          return;
        }
        this.SetState(this.animMapper.idle);
      }
    }
  }
  /**
   * [走るAnimation]
   */
  runState(): IAnimStateProps {
    const actType = "run";
    return {
      Name: this.animMapper.run,
      Enter: (prevState: IAnimStateProps) => {
        this.playSoundByAnim(actType);
        const animation = this.animations.find(a => a.name == this.animMapper.run);
        if (!animation) {
          throw `${this.animMapper.idle}というアニメーションが見つかりません`;
        }
        if (!this.mixer) {
          throw `mixerが見つかりません`;
        }
        const curAction = this.mixer.clipAction(animation);
        if (prevState) {
          const prevAnimation = this.animations.find(a => a.name == prevState.Name);
          const prevAction = this.mixer.clipAction(prevAnimation!);
          curAction.enabled = true;
          if (prevState.Name == this.animMapper.walk) {
            const ratio = curAction.getClip().duration / prevAction.getClip().duration;
            curAction.time = prevAction.time * ratio;
          } else {
            curAction.time = 0.0;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);
          }
          curAction.crossFadeFrom(prevAction, 0.5, true);
          curAction.play();
        } else {
          curAction.play();
        }
      },
      Exit: () => {
        this.stopSoundByAnim(actType);
      },
      Update: (delta: number, input: IInputMovement) => {
        if (input.forward || input.backward) {
          if (!input.dash) {
            this.SetState(this.animMapper.walk);
          }
          return;
        }
        this.SetState(this.animMapper.idle);
      }
    }
  }
  /**
   * [ジャンプAnimation]調整中
   * @returns 
   */
  jumpState(): IAnimStateProps {
    return {
      Name: this.animMapper.jump,
      Enter: (prevState: IAnimStateProps) => {
        const animation = this.animations.find(a => a.name == this.animMapper.jump);
        if (!animation) {
          throw `${this.animMapper.idle}というアニメーションが見つかりません`;
        }
        const curAction = this.mixer!.clipAction(animation);
        const cleanup = () => {
          this.currentState!.Finished = true;
          curAction.getMixer().removeEventListener("finished", cleanup);
          this.SetState(this.animMapper.idle);
        }
        curAction.getMixer().addEventListener('finished', cleanup);
        if (prevState) {
          const prevAnimation = this.animations.find(a => a.name == prevState.Name);
          const prevAction = this.mixer!.clipAction(prevAnimation!);
          curAction.reset();
          curAction.setLoop(LoopOnce, 1);
          curAction.clampWhenFinished = true;
          curAction.crossFadeFrom(prevAction, 0.2, true);
          curAction.play();
        } else {
          curAction.play();
        }
      },
      Exit: () => { },
      Update: (delta: number,  input: IInputMovement) => {
        if (this.isJumping) {
          console.log("check");
        }
        else {
          this.SetState(this.animMapper.idle);
        }
      }
    }
  }

  /**
   * クリック時のアクション
   */
  actionState(): IAnimStateProps {
    return {
      Name: this.animMapper.action,
      Enter: (prevState: IAnimStateProps) => {
        const animation = this.animations.find(a => a.name == this.animMapper.action);
        if (!animation) {
          throw `${this.animMapper.idle}というアニメーションが見つかりません`;
        }
        const curAction = this.mixer!.clipAction(animation);
        const cleanup = () => {
          this.currentState!.Finished = true;
          curAction.getMixer().removeEventListener("finished", cleanup);
          this.SetState(this.animMapper.idle);
        }
        curAction.getMixer().addEventListener('finished', cleanup);
        if (prevState) {
          const prevAnimation = this.animations.find(a => a.name == prevState.Name);
          const prevAction = this.mixer!.clipAction(prevAnimation!);
          curAction.reset();
          curAction.setLoop(LoopOnce, 1);
          curAction.clampWhenFinished = true;
          curAction.crossFadeFrom(prevAction, 0.2, true);
          curAction.play();
        } else {
          curAction.play();
        }
      },
      CleanUp: () => { },
      Exit: () => {
        if (this.currentState?.CleanUp) {
          this.currentState.CleanUp();
        }
      },
      Update: (delta: number, input: IInputMovement) => {
      },
      Finished: false
    }
  }

  /**
   * サウンドをセットする
   */
  async setSound(params: ISetSoundOption) {
    if (!this.sounds.find(s => s.key == params.key)) {
      const listener = new AudioListener();
      const sound = new Audio(listener);
      const audioLoader = new AudioLoader();
      audioLoader.load(
        params.filePath,
        (buffer) => {
          sound.setBuffer(buffer);
          sound.setLoop(params.loop);
          sound.setVolume(params.volume);
          sound.pause();
        }
      )
      this.sounds.push({
        id: params.id,
        key: params.key,
        sound: sound,
        loop: params.loop,
        filePath: params.filePath,
        volume: params.volume,
        trigAnim: params.trigAnim,
        stopAnim: params.stopAnim
      })
    }
  }

  /**
   * サウンドを更新
   */
  updateSound(params: IUpdateSoundOption) {
    const sound = this.sounds.find(s => s.key == params.key);
    if (sound) {
      if (params.volume) {
        sound.sound.setVolume(params.volume);
      }
      if (params.loop !== undefined) {
        sound.sound.setLoop(params.loop);
      }
    }
  }

  /**
   * 特定のサウンドを鳴らせる
   */
  playSound(key: string) {
    const sound = this.sounds.find(s => s.key == key);
    if (sound && !sound.sound.isPlaying) {
      sound.sound.play();
    }
  }

  /**
   * 特定のサウンドを止める
   */
  stopSound(key: string) {
    const sound = this.sounds.find(s => s.key == key);
    if (sound) {
      sound.sound.pause();
    }
  }

  /**
   * 特定のAnimのサウンドをONにする
   */
  playSoundByAnim(anim: string) {
    const sounds = this.sounds.filter(s => s.trigAnim == anim);
    sounds.map((sound) => {
      this.playSound(sound.key);
    });
  }

  /**
   * 特定のAnimのサウンドをOFFにする
   */
  stopSoundByAnim(anim: string) {
    const sounds = this.sounds.filter(s => s.stopAnim == anim);
    sounds.map((sound) => {
      this.stopSound(sound.key);
    });
  }

}