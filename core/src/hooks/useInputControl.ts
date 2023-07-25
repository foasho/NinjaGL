import * as React from "react";
import { Vector2 } from "three";
import { IInputMovement } from "../utils/NinjaProps";
import { detectDeviceType } from "./useNinjaEngine";

/**
 * ----------------
 * InputController
 * ----------------
 */

export enum EDeviceType {
  Unknown = 0,
  Desktop = 1,
  Tablet = 2,
  Mobile = 3,
}


/**
 * ActionキーのリストEnum
 */
interface IActionKey {
  KeyW: "forward";
  KeyS: "backward";
  KeyA: "left";
  KeyD: "right";
  Space: "jump";
  ShiftLeft: "dash";
  ShiftRight: "dash";
  Shift: "dash";
  [key: string]: any;
}
export const EActionKey: IActionKey = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  Shift: "dash"
}

const initialKeyState: IInputMovement = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  curDrag: null,
  speed: 0,
  pressedKeys: [],
  angleAxis: [0, 0],
};

export let manualKeyState: IInputMovement = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  curDrag: null,
  speed: 0,
  pressedKeys: [],
  angleAxis: [0, 0],
};

/**
 * 初期化
 */
export const initInput = () => {
  manualKeyState = { ...initialKeyState };
}

/**
 * 入力をセットする
 * @param names 
 * @param vals 
 */
export const setManualInputs = (names: string[], vals: boolean[]) => {
  names.map((name, idx) => {
    manualKeyState[name] = vals[idx];
  });
}
export const setManualInput = (key: string, val: boolean) => {
  if (manualKeyState[key] !== undefined) {
    manualKeyState[key] = val;
  }
}

/**
 * タッチ操作方式 * @returns 
 */
export const getManualState = (): IInputMovement => {
  return { ...manualKeyState }
}

/**
 * 十字のSVG
 */
const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- 上向き三角形 -->
    <path
      d="M50 22.5 L55 30 H45 Z"
      fill="rgba(255, 255, 255, 1)"
    />
    <!-- 右向き三角形 -->
    <path
      d="M77.5 50 L70 55 V45 Z"
      fill="rgba(255, 255, 255, 1)"
    />
    <!-- 下向き三角形 -->
    <path
      d="M50 77.5 L45 70 H55 Z"
      fill="rgba(255, 255, 255, 1)"
    />
    <!-- 左向き三角形 -->
    <path
      d="M22.5 50 L30 55 V45 Z"
      fill="rgba(255, 255, 255, 1)"
    />
    <!-- 中央の円のボーダー線 -->
    <circle
      cx="50"
      cy="50"
      r="15"
      fill="transparent"
      stroke="rgba(255, 255, 255, 1)"
      strokeWidth="2"
    />
  </svg>
  `;

interface IInputControl {
  device?: EDeviceType;
  targetId?: string;
  ratio?: number;
  margin?: number | [number, number];
  joyColor?: string;
  enabled?: boolean;
}
export const useInputControl = (
  {
    device = EDeviceType.Unknown,
    targetId = "target",
    ratio = 0.375,// 0 ~ 1: 画面の何割をジョイスティックにするか
    margin = [48, 64],// 画面の端から何pxMarginをとるか
    joyColor = "rgba(255, 242, 189, 0.8)",
    enabled = true,
  }
    : IInputControl
) => {
  const [enabledFlag, setEnabledFlag] = React.useState<boolean>(enabled);
  const [setupCount, setSetupCount] = React.useState<number>(1);
  // タッチ発火フラグ(入力が競合しないように)
  // Touch操作中はCallbackでisTouchフラグを持ちたい
  const [touchFlag, setTouchFlag] = React.useState<boolean>(false);
  const keyboardFlag = React.useRef<boolean>(false);
  const gamepadFlag = React.useRef<boolean>(false);
  const [runId, setRunId] = React.useState<string | undefined>(undefined);
  const [jumpId, setJumpId] = React.useState<string | undefined>(undefined);
  // -------------------------------------------------
  // ジョイスティックのRef
  const joystick = React.useRef<HTMLDivElement | undefined>();
  const joystickOuter = React.useRef<HTMLDivElement | undefined>();
  const joystickInner = React.useRef<HTMLDivElement | undefined>();
  const canvas = React.useRef<HTMLCanvasElement | undefined>();
  const joyRadius = React.useRef<number>(0);
  const outerLineWidth = 5;

  const setup = () => {
    if (enabled === false) {
      return;
    }
    let target = document.getElementById(targetId);
    if (!target) {
      // targetがない場合はbodyに追加
      target = document.body;
    }
    // すでにJoyStickのIDがある場合は追加しない
    if (document.getElementById("joystick")) {
      return;
    }
    joystick.current = document.createElement("div");
    joystick.current.id = "joystick";
    joystickOuter.current = document.createElement("div");
    joystickOuter.current.className = "input-joystick";
    joystickInner.current = document.createElement("div");
    canvas.current = document.createElement("canvas");
    // 追加: ジョイスティックのスタイル設定
    joystickOuter.current.style.outlineOffset = `-${outerLineWidth}px`;
    joystickOuter.current.style.outline = `${outerLineWidth}px solid rgba(16, 16, 16, 0)`;
    joystickOuter.current.style.borderRadius = "50%";
    joystickInner.current.style.position = "absolute";
    const zIndex = 100 + setupCount;
    joystickOuter.current.style.zIndex = `${zIndex}`;
    joystickInner.current.style.left = "50%";
    joystickInner.current.style.top = "50%";
    joystickInner.current.style.transform = "translate(-50%, -50%)";
    joystickInner.current.style.borderRadius = "50%";
    joystickInner.current.style.pointerEvents = "none";
    joystickOuter.current.style.position = "absolute";
    // Outer/Innerのデザインを非表示にする
    joystickInner.current.style.visibility = "hidden";
    // JoyStickをtargetのidをもつ子要素として追加
    target.appendChild(joystick.current);
    const rect = target.getBoundingClientRect();
    // 画面が縦長のときは、中央下部に配置、横長のときは左下部に配置
    if (rect.width < rect.height) {
      const mg = Array.isArray(margin) ? margin[1] : margin;
      joystickOuter.current.style.bottom = `${mg}px`;
      joystickOuter.current.style.left = "50%";
      joystickOuter.current.style.transform = "translateX(-50%)";
    } else {
      const mg_x = Array.isArray(margin) ? margin[0] : margin;
      const mg_y = Array.isArray(margin) ? margin[1] : margin;
      joystickOuter.current.style.bottom = `${mg_x}px`;
      joystickOuter.current.style.left = `${mg_y}px`;
    }
    // 追加: ジョイスティックのサイズ設定
    joyRadius.current = Math.min(rect.width, rect.height) * ratio;
    joystickOuter.current.style.width = `${joyRadius.current}px`;
    joystickOuter.current.style.height = `${joyRadius.current}px`;
    joystickInner.current.style.width = `${joyRadius.current * 0.5}px`;
    joystickInner.current.style.height = `${joyRadius.current * 0.5}px`;

    // 追加: Canvas要素の作成
    canvas.current.style.position = "absolute";
    canvas.current.style.width = "100%";
    canvas.current.style.height = "100%";
    canvas.current.width = joyRadius.current;
    canvas.current.height = joyRadius.current;

    // 追加: ジョイスティック要素をまとめる
    joystick.current.appendChild(joystickOuter.current);
    joystickOuter.current.appendChild(canvas.current); // Canvasを追加
    joystickOuter.current.appendChild(joystickInner.current);

    const utf8_to_b64 = (str) => {
      return window.btoa(unescape(encodeURIComponent(str)));
    }

    const svgBase64 = `data:image/svg+xml;base64,${utf8_to_b64(svgString)}`;
    const img = new Image();
    img.src = svgBase64;
    img.onload = () => {
      // 十字キーを生成し、joyStickOuterに追加
      const cross = document.createElement("div");
      cross.id = "cross";
      cross.style.position = "absolute";
      cross.style.width = "50%";
      cross.style.height = "50%";
      cross.style.left = "25%";
      cross.style.top = "25%";
      cross.style.backgroundImage = `url(${svgBase64})`;
      cross.style.backgroundSize = "100% 100%";
      cross.style.backgroundRepeat = "no-repeat";
      cross.style.backgroundPosition = "center";
      cross.className = "move-svg";
      joystickOuter.current!.appendChild(cross);
    };
    if (isDesktop()) {
      joystick.current.style.display = "none";
      canvas.current.style.display = "none";
    }
  };

  // デスクトップ表示のときは、ジョイスティックを非表示にする
  const isDesktop = () => {
    const deviceType = !device ? detectDeviceType() : device;
    return deviceType === EDeviceType.Desktop;
  };

  // 描画関数
  const drawArc = (angle: number) => {
    const ctx = canvas.current!.getContext("2d");
    const range = 0.17;// 弧の範囲を円の1/6に変更
    const innerRange = range / 1.5; // さらに内側の弧の範囲を円の1/2に変更
    if (ctx) {
      // 外周に弧を描画
      ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
      ctx.beginPath();
      ctx.arc(
        joyRadius.current * 0.5,
        joyRadius.current * 0.5,
        joyRadius.current * 0.5 - outerLineWidth / 2, // 線の中心がOuterの外周になるように調整
        angle - Math.PI * range,
        angle + Math.PI * range,
        false
      );
      ctx.lineWidth = outerLineWidth; // 線の太さを設定
      ctx.strokeStyle = joyColor;
      ctx.stroke();

      // さらに内側に弧を描画
      ctx.beginPath();
      ctx.arc(
        joyRadius.current * 0.5,
        joyRadius.current * 0.5,
        joyRadius.current * 0.5 - outerLineWidth * 3,
        angle - Math.PI * innerRange,
        angle + Math.PI * innerRange,
        false
      );
      ctx.lineWidth = outerLineWidth; // 線の太さを設定
      ctx.strokeStyle = joyColor;
      ctx.stroke();
    }
  };

  const moveKeyFromCode = (key: string) => {
    if (EActionKey[key] === undefined) {
      return "action";
    }
    return EActionKey[key];
  };

  /**
   * キーボード対応
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = moveKeyFromCode(e.code);
    movement.current[key] = key === "action" ? true : 1;
    movement.current.speed = 1;
    //  movement.currentが移動系の入力がされた場合にフラグを発火
    if (movement.current[key]) {
      keyboardFlag.current = true;
      gamepadFlag.current = false;
    }
    if (!movement.current.pressedKeys.includes(e.code)) {
      movement.current.pressedKeys.push(e.code);
    }
  }
  const handleKeyUp = (e: KeyboardEvent) => {
    const key = moveKeyFromCode(e.code);
    movement.current[key] = key === "action" ? false : 0;
    const index = movement.current.pressedKeys.indexOf(e.code);
    if (index > -1) {
      movement.current.pressedKeys.splice(index, 1);
    }
  };
  const handleClickDown = () => {
    movement.current.action = true;
  }
  const handleClickUp = () => {
    movement.current.action = false;
  }

  /**
  * スマホ対応
  */
  let movementTouchId: null | number = null;
  const handleTouchStart = (e: TouchEvent) => {
    // 上位のイベントをキャンセル
    e.stopPropagation();
    e.preventDefault();// イベントの発火をキャンセル
    if (movementTouchId === null) {
      // Touchは最後に発火したタッチのみを取得する
      const targetTouch = e.touches[e.touches.length - 1];
      movementTouchId = targetTouch.identifier;
      movement.current.prevDrag = new Vector2(targetTouch.clientX, targetTouch.clientY);
      canvas.current!.style.visibility = "visible";
      joystickOuter.current!.style.outline = `${outerLineWidth}px solid rgba(16, 16, 16, 0.1)`;
      // setTouchFlag(true);
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();// イベントの発火をキャンセル
    e.stopPropagation();
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === movementTouchId) {
        const targetTouch = e.touches[i];
        if (movement.current.prevDrag === null) {
          movement.current.prevDrag = new Vector2(targetTouch.clientX, targetTouch.clientY);
        }
        movement.current.curDrag = new Vector2(targetTouch.clientX, targetTouch.clientY);
        const deltaX = movement.current.curDrag.x - movement.current.prevDrag.x;
        const deltaY = movement.current.curDrag.y - movement.current.prevDrag.y;

        const initialPosition = new Vector2(joystickInner.current!.offsetLeft, joystickInner.current!.offsetTop);
        // Innerをドラッグした分だけ移動
        const newLeft = initialPosition.x + deltaX;
        const newTop = initialPosition.y + deltaY;

        // InnerがOuter範囲内にあるかどうかをチェック
        const distanceFromCenter = Math.sqrt(Math.pow(newLeft - joyRadius.current * 0.5, 2) + Math.pow(newTop - joyRadius.current * 0.5, 2));
        if (distanceFromCenter <= joyRadius.current * 0.5) {
          joystickInner.current!.style.left = `${newLeft}px`;
          joystickInner.current!.style.top = `${newTop}px`;
        }

        // 中心からの距離と角度を計算
        const angle = Math.atan2(newTop - joyRadius.current * 0.5, newLeft - joyRadius.current * 0.5);
        const forwardAmount = Math.sin(angle) * movement.current.speed;
        const rightAmount = Math.cos(angle) * movement.current.speed;

        movement.current.forward = Math.max(0, -forwardAmount);
        movement.current.backward = Math.max(0, forwardAmount);
        movement.current.left = Math.max(0, -rightAmount);
        movement.current.right = Math.max(0, rightAmount);

        // スピードの更新
        movement.current.speed = distanceFromCenter / (joyRadius.current * 0.5);
        movement.current.prevDrag = movement.current.curDrag.clone();

        // 描画の更新
        drawArc(angle);
      }
    }
  };


  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {  // 変更: すべての終了したタッチイベントをループ処理
      if (e.changedTouches[i].identifier === movementTouchId) {
        // Inner Reset
        joystickInner.current!.style.left = "50%";
        joystickInner.current!.style.top = "50%";
        // Canvas Reset
        canvas.current!.style.visibility = "hidden";
        joystickOuter.current!.style.outline = `${outerLineWidth}px solid rgba(16, 16, 16, 0)`;

        // Reset movement states
        movement.current.prevDrag = null;
        movement.current.curDrag = null;
        movement.current.forward = 0;
        movement.current.backward = 0;
        movement.current.left = 0;
        movement.current.right = 0;
        movement.current.speed = 0; // タッチ終了時にスピードをリセット
        setTouchFlag(false);
        movementTouchId = null;
      }
    }
  };

  // attachRunBtn
  const attachRunBtn = (runBtnId: string) => {
    setRunId(runBtnId);
  }

  // attachJumpBtn
  const attachJumpBtn = (jumpBtnId: string) => {
    setJumpId(jumpBtnId);
  }


  /**
   * ゲームパッド対応
   */
  const handleGamepadInput = () => {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        // キーボード入力をさせない
        keyboardFlag.current = false;
        // ゲームパッドのボタンと軸に対応した操作をここで定義
        const forward = gamepad.buttons[12]?.pressed || gamepad.axes[1] < -0.1 ? Math.abs(gamepad.axes[1]) : 0;
        const backward = gamepad.buttons[13]?.pressed || gamepad.axes[1] > 0.1 ? Math.abs(gamepad.axes[1]) : 0;
        const left = gamepad.buttons[14]?.pressed || gamepad.axes[0] < -0.1 ? Math.abs(gamepad.axes[0]) : 0;
        const right = gamepad.buttons[15]?.pressed || gamepad.axes[0] > 0.1 ? Math.abs(gamepad.axes[0]) : 0;
        const jump = gamepad.buttons[0]?.pressed;
        // const dash = gamepad.buttons[2]?.pressed;
        const dash = gamepad.buttons[5]?.pressed;//RBに変更
        const action = gamepad.buttons[1]?.pressed;
        let angleX = gamepad.axes[2].toFixed(2);
        let angleY = gamepad.axes[3].toFixed(2);
        if (Math.abs(Number(angleX)) > 0.1 || Math.abs(Number(angleY)) > 0.1) {
          keyboardFlag.current = false;
          gamepadFlag.current = true;
        }
        else {
          angleX = "0";
          angleY = "0";
        }
        // どれかが入力されていればキーボード入力をさせない
        if (forward || backward || left || right || jump || dash || action) {
          keyboardFlag.current = false;
          gamepadFlag.current = true;
        }
        if (gamepadFlag.current) {
          movement.current.forward = forward;
          movement.current.backward = backward;
          movement.current.left = left;
          movement.current.right = right;
          movement.current.jump = jump;
          movement.current.dash = dash;
          movement.current.action = action;
          movement.current.speed = Math.max(forward, backward, left, right);
          movement.current.angleAxis = [Number(angleX), Number(angleY)];
        }
      }
    }
  };

  let movement = React.useRef<IInputMovement>({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    jump: false,
    dash: false,
    action: false,
    prevDrag: null,
    curDrag: null,
    speed: 0,
    pressedKeys: [],
    angleAxis: [0, 0],
  });

  React.useEffect(() => {
    if (enabled) {
      setup();
    }
    else {
      return;
    }
    setEnabledFlag(enabled);
    setSetupCount(setupCount + 1);

    const deviceType = device === EDeviceType.Unknown ? detectDeviceType() : device;

    // デスクトップ対応
    if (deviceType == EDeviceType.Desktop) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      document.addEventListener("mousedown", handleClickDown);
      document.addEventListener("mouseup", handleClickUp);
    }

    // スマホ / タブレット対応
    if (deviceType == EDeviceType.Mobile || deviceType == EDeviceType.Tablet) {
      // setup();
      if (!joystickOuter.current) {
        return;
      }
      // 発火はOuter範囲内のみ
      joystickOuter.current!.addEventListener("touchstart", handleTouchStart);
      // document.addEventListener("touchmove", handleTouchMove, { passive: false });
      joystickOuter.current!.addEventListener("touchmove", handleTouchMove, { passive: false });
      joystickOuter.current!.addEventListener("touchend", handleTouchEnd);
      if (runId) {
        const runBtn = document.getElementById(runId);
        if (runBtn) {
          // タッチされたときにmovement.current.dashをtrueにする
          runBtn.addEventListener("touchstart", () => {
            movement.current.dash = true;
          });
          // タッチが離されたときにmovement.current.dashをfalseにする
          runBtn.addEventListener("touchend", () => {
            movement.current.dash = false;
          });
        }
      }
      if (jumpId) {
        const jumpBtn = document.getElementById(jumpId);
        if (jumpBtn) {
          // タッチされたときにmovement.current.jumpをtrueにする
          jumpBtn.addEventListener("touchstart", () => {
            movement.current.jump = true;
          });
          // タッチが離されたときにmovement.current.jumpをfalseにする
          jumpBtn.addEventListener("touchend", () => {
            movement.current.jump = false;
          });
        }
      }
      // waves
      if (joystickOuter.current) {
        joystickOuter.current.id = "joystick-outer";
        const color1 = document.createElement("div");
        color1.className = "outer-color move1";
        const color2 = document.createElement("div");
        color2.className = "outer-color move2";
        // joyStickOuterに追加
        joystickOuter.current.appendChild(color1);
        joystickOuter.current.appendChild(color2);
      }
    }

    // ゲームパッド対応
    const gamepadInterval = setInterval(() => {
      handleGamepadInput();
    }, 100); // 100msごとにゲームパッドの入力をチェック

    return () => {
      if (deviceType == EDeviceType.Desktop) {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleClickDown);
        document.removeEventListener("mouseup", handleClickUp);
      }
      if (deviceType === EDeviceType.Mobile || deviceType === EDeviceType.Tablet && joystickOuter.current) {
        joystickOuter.current!.removeEventListener("touchstart", handleTouchStart);
        joystickOuter.current!.removeEventListener("touchmove", handleTouchMove);
        joystickOuter.current!.removeEventListener("touchend", handleTouchEnd);
        if (runId) {
          const runBtn = document.getElementById(runId);
          if (runBtn) {
            runBtn.removeEventListener("touchstart", () => {
              movement.current.dash = true;
            });
            runBtn.removeEventListener("touchend", () => {
              movement.current.dash = false;
            });
          }
        }
        // wavesの削除
        if (joystickOuter.current) {
          joystickOuter.current.id = "";
          const colors = document.getElementsByClassName("outer-color");
          for (let i = 0; i < colors.length; i++) {
            try {
              joystickOuter.current.removeChild(colors[i]);
            }
            catch (e) {
              // console.log(e);
            }
          }
        }
      }
      // ゲームパッド対応
      clearInterval(gamepadInterval);

    }
  }, [runId, jumpId, enabled]);

  return {
    runId: runId,
    input: movement.current,
    attachRunBtn: attachRunBtn,
    attachJumpBtn: attachJumpBtn,
    touchFlag: touchFlag,
  };
}


