import { loadingText, loadPer, NinjaEngineContext, totalFileSize } from "@/core/utils/NinjaEngineManager"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Vector2 } from "three";

export const LoadProcessing = () => {
  const ref = useRef<HTMLDivElement>();
  const [per, setPer] = useState<number>(0);
  const engine = useContext(NinjaEngineContext);
  const [timer, setTimer] = useState<NodeJS.Timer>()

  const setPercentage = () => {
    if (engine.nowLoading) {
      setPer(loadPer);
    }
    else {
      clearInterval(timer)
      setTimer(null);
    }
    if (ref.current && engine.nowLoading){
      const size = engine.getCanvasSize();
      ref.current.style.width = size.x + "px";
      ref.current.style.height = size.y + "px";
    }
  }

  useEffect(() => {
    const _timer = setInterval(() => { setPercentage() }, 100)
    setTimer(_timer)
  }, []);

  const size = engine.getCanvasSize()? engine.getCanvasSize(): new Vector2(window.innerWidth, window.innerHeight);
  const pos = engine.getCanvasPos()? engine.getCanvasPos(): new Vector2(0, 0);
  
  return (
    <>
      {engine.nowLoading &&
        <>
          <div style={
            {
              zIndex: "99999",
              position: "fixed",
              top: `${pos.y}px`,
              left: `${pos.x}px`,
              height: `${size.y}px`,
              width: `${size.x}px`,
              background: "#000000"
            }}
            ref={ref}
            >
            <div style={
              {
                position: "absolute",
                maxHeight: "80%",
                maxWidth: "75%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                textAlign: "center",
                color: "#ffffff"
              }
            }>
              <div>
                {per}%
                <br/>
                サイズ: {totalFileSize}
              </div>
              <div>
                {loadingText}
              </div>
            </div>
          </div>
        </>
      }
    </>
  )
}