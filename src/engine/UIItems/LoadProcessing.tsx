import { loadingText, loadPer, NaniwaEngineContext, totalFileSize } from "@/engine/core/NaniwaEngineManager"
import { useContext, useEffect, useMemo, useRef, useState } from "react"

export const LoadProcessing = () => {
  const [per, setPer] = useState<number>(0);
  const engine = useContext(NaniwaEngineContext);
  const [timer, setTimer] = useState<NodeJS.Timer>()

  const setPercentage = () => {
    if (engine.nowLoading) {
      setPer(loadPer);
    }
    else {
      clearInterval(timer)
      setTimer(null);
    }
  }

  useEffect(() => {
    const _timer = setInterval(() => { setPercentage() }, 100)
    setTimer(_timer)
  }, [])

  return (
    <>
      {engine.nowLoading &&
        <>
          <div style={
            {
              zIndex: "99999",
              position: "fixed",
              height: "100vh",
              width: "100vw",
              top: "0",
              left: "0",
              background: "#000000"
            }
          }>
            <div style={
              {
                position: "absolute",
                maxHeight: "80vh",
                maxWidth: "75vw",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                textAlign: "center",
                color: "#ffffff"
              }
            }>
              <div>
                test
                {per}
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