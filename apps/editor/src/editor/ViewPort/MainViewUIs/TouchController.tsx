import { useRef, useState } from "react";

/**
 * タッチコントローラ
 */
export const TouchController = () => {
  const joystickRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [outerCircleStyle, setOuterCircleStyle] = useState<any>({});
  const [innerCircleStyle, setInnerCircleStyle] = useState<any>({});

  /**
   * 開始
   * @param e
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!e.touches[0]) return;
    const { clientX, clientY } = e.touches[0];

    setOuterCircleStyle({
      display: "block",
      left: `${clientX}px`,
      top: `${clientY}px`,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    });

    setInnerCircleStyle({
      display: "block",
      left: `${clientX}px`,
      top: `${clientY}px`,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    });

    setDragging(true);
    onDrag({ startX: clientX, startY: clientY, endX: clientX, endY: clientY });
  };

  /**
   * 移動
   * @param e
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!dragging) return;
    if (!e.touches[0]) return;
    const { clientX, clientY } = e.touches[0];

    setInnerCircleStyle({
      display: "block",
      left: `${clientX}px`,
      top: `${clientY}px`,
    });

    onDrag({
      startX: parseFloat(outerCircleStyle.left),
      startY: parseFloat(outerCircleStyle.top),
      endX: clientX,
      endY: clientY,
    });
  };

  /**
   * 終了
   */
  const handleTouchEnd = () => {
    setDragging(false);
    setOuterCircleStyle({ display: "none" });
    setInnerCircleStyle({ display: "none" });
  };

  const onDrag = (e: any) => {
    console.log("Check Touch Controler");
    console.log(e);
  };

  /**
   * スタイルを定義
   */

  return (
    <>
      <div
        ref={joystickRef}
        className="joystick"
        style={{ position: "relative", width: "100%", height: "100%" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="outer-circle" style={outerCircleStyle}></div>
        <div className="inner-circle" style={innerCircleStyle}></div>
      </div>
    </>
  );
};
