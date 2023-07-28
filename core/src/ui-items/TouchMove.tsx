import { useNinjaEngine } from "hooks/useNinjaEngine";
import { initInput, manualKeyState, setManualInput } from "../hooks/useInputControl";
import * as React from "react";
import { MdOutlineGames } from "react-icons/md";
import { Vector2 } from "three";

export const TouchMove = () => {
  const [isOrientation, setOrientation] = React.useState<boolean>((window.innerHeight < window.innerWidth) ? true : false);
  let currentTouch: Vector2 = new Vector2(0, 0);
  let currentTouchCamera: Vector2 = new Vector2(0, 0);
  const engine = useNinjaEngine();

  const touchStart = (e) => {
    // initInput(engine.deviceType);
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      currentTouch.set(x, y);
    }
  }

  const touchEnd = () => {
    // initInput(engine.deviceType);
    currentTouch = new Vector2(0, 0);
  }

  /**
   * アバタ移動の操作
   * @param e 
   */
  const touchMove = (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      const move = currentTouch.clone().sub(new Vector2(x, y)).normalize();
      move.set(move.x * -1, move.y);// Xは判定が逆
      if (move.x > 0) {
        setManualInput("right", true);
        setManualInput("left", false);
      }
      else {
        setManualInput("right", false);
        setManualInput("left", true);
      }
      if (move.y > 0) {
        setManualInput("forward", true);
        setManualInput("backward", false);
      }
      else {
        setManualInput("forward", false);
        setManualInput("backward", true);
      }
    }
  }

  const touchCancel = () => {
    // initInput(engine.deviceType);
  }

  const changeOrient = () => {
    const isOrient = (window.innerHeight < window.innerWidth) ? true : false;
    setOrientation(isOrient);
  }

  /**
   * カメラ移動の操作
   */
  const touchCameraStart = () => { }
  const touchCameraMove = () => { }
  const touchCameraEnd = () => {
    currentTouchCamera = new Vector2(0, 0);
  }
  const touchCameraCancel = () => {
    currentTouchCamera = new Vector2(0, 0);
  }


  React.useEffect(() => {
    // initInput(engine.deviceType);
    const element = document.getElementById("touchmovepad") as  any;
    element.addEventListener("touchstart", touchStart);
    element.addEventListener("touchend", touchEnd);
    element.addEventListener("touchmove", touchMove);
    element.addEventListener("touchcancel", touchCancel);
    const cameraele = document.getElementById("touchcamerapad") as any;
    cameraele.addEventListener("touchstart", touchCameraStart);
    cameraele.addEventListener("touchmove", touchCameraMove);
    cameraele.addEventListener("touchend", touchCameraEnd);
    cameraele.addEventListener("touchcancel", touchCameraCancel);
    window.addEventListener("resize", changeOrient);
    return () => {
      element.removeEventListener("touchstart", touchStart);
      element.removeEventListener("touchend", touchEnd);
      element.removeEventListener("touchmove", touchMove);
      element.removeEventListener("touchcancel", touchCancel);
      window.removeEventListener("resize", changeOrient);
    }
  }, [])

  let size = "30vw";
  if (isOrientation) {
    size = "30vh";
  }

  return (
    <>
      <div id="touchmovepad" style={{ position: "fixed", left: "7vw", bottom: "7vh", width: "50vw", zIndex: 998 }}>
        <>
          <div id="touchCircle" style={{ width: size, height: size, border: "solid 5px rgba(0, 0, 0, 0.3)", borderRadius: "16vh", position: "relative" }}>
            <a style={{ border: "solid 2px rgba(0, 0, 0, 0.3)", borderRadius: "20px", padding: "6px 6px 0px 6px", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <MdOutlineGames />
            </a>
          </div>
        </>
      </div>
      <div id="touchColor" style={{ position: "fixed", left: "7vw", bottom: "7vh", width: "50vw", zIndex: 999 }}>
        {/* <div id="touchCircleColor" style={{ width: "30vh", height: "30vh", border: "solid 5px #25BCFF", borderRadius: "52%", position: "relative"}}></div> */}
      </div>
      <div id="touchcamerapad" style={{ position: "fixed", top: "0", right: "0", width: "50vw", zIndex: 999 }}>

      </div>
    </>
  )
}