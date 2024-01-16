import React, { useEffect, useRef, useState } from "react";
import { EDeviceType, useMultiInputControl, useNinjaEngine } from "../hooks";
import { GiJumpAcross, GiRun } from "react-icons/gi";

export const TouchController = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { device, isVertical } = useNinjaEngine();
  const {
    attachJumpBtn,
    attachRunBtn,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    joyRadius,
  } = useMultiInputControl();

  useEffect(() => {
    if (device === EDeviceType.Mobile || device === EDeviceType.Tablet) {
      joyRadius.current = isVertical ? 100 : 50;
      attachRunBtn("run");
      attachJumpBtn("jump");
      // TouchEventを利用
      if (ref.current) {
        ref.current.addEventListener("touchstart", handleTouchStart);
        ref.current.addEventListener("touchmove", handleTouchMove);
        ref.current.addEventListener("touchend", handleTouchEnd);
      }
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener("touchstart", handleTouchStart);
        ref.current.removeEventListener("touchmove", handleTouchMove);
        ref.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, []);

  const setTouchPosition = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    // const { clientX, clientY } = e.touches[0];
    // // 画面のx,yは％でセット
    // const { left, top } = e.currentTarget.getBoundingClientRect();
    // const { width, height } = e.currentTarget.getBoundingClientRect();
    // const x = (clientX - left) / width;
    // const y = (clientY - top) / height;
    // setXY({ x, y });
    // handleTouchStart(e);
  };

  return (
    <>
      {(device === EDeviceType.Mobile || device === EDeviceType.Tablet) && (
        <>
          <div
            id="jump"
            style={{
              position: "absolute",
              fontSize: "32px",
              right: `${isVertical ? 32 : 48}px`,
              bottom: `${isVertical ? 182 : 148}px`,
              pointerEvents: "auto",
              zIndex: 2,
              backgroundColor: "#43D9D9",
              borderRadius: "50%",
              padding: "4px 12px",
            }}
          >
            <GiJumpAcross
              style={{
                display: "inline",
                color: "#fff",
                verticalAlign: "top",
                paddingTop: "7px",
              }}
            />
          </div>
          <div
            id="run"
            style={{
              position: "absolute",
              fontSize: "32px",
              right: `${isVertical ? 32 : 48}px`,
              bottom: `${isVertical ? 102 : 72}px`,
              pointerEvents: "auto",
              zIndex: 2,
              backgroundColor: "#43D9D9",
              borderRadius: "50%",
              padding: "4px 12px",
            }}
          >
            <GiRun
              style={{
                display: "inline",
                color: "#fff",
                verticalAlign: "top",
                paddingTop: "7px",
              }}
            />
          </div>
          <div
            id="mutable_controller"
            ref={ref}
            style={
              isVertical
                ? {
                    position: "absolute",
                    left: `0px`,
                    bottom: `0px`,
                    width: `100%`,
                    height: `50%`,
                    zIndex: 1,
                    pointerEvents: "auto",
                  }
                : {
                    position: "absolute",
                    left: `0px`,
                    bottom: `0px`,
                    width: `40%`,
                    height: `65%`,
                    zIndex: 1,
                    pointerEvents: "auto",
                  }
            }
          ></div>
          <JoyStick
            size={isVertical ? 200 : 100}
            joySize={isVertical ? 100 : 50}
          />
        </>
      )}
    </>
  );
};

type JoyStickProps = {
  size: number;
  joySize: number;
};
const JoyStick = ({ size, joySize }: JoyStickProps) => {
  const { joystickInner, joystickOuter } = useMultiInputControl();

  return (
    <>
      <div
        id="mutable_joystick"
        ref={joystickOuter}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          transform: "translate(-50%, -50%)",
          display: "none",
        }}
      ></div>
      <div
        ref={joystickInner}
        style={{
          position: "absolute",
          width: `${joySize}px`,
          height: `${joySize}px`,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          transform: "translate(-50%, -50%)",
          // 初期位置は中心
          left: "50%",
          top: "50%",
          display: "none",
        }}
      ></div>
    </>
  );
};
