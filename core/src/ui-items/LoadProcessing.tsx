import { NinjaEngineContext } from "../utils/NinjaEngineManager"
import React, { useContext, useEffect, useMemo, useRef, useState } from "react"

const loadingText = "Loading...";

interface ILoadProcessingProps {
  loadingPercentages: number;
  nowLoading: boolean;
  loadCompleted: boolean;
}

export const LoadProcessing = (props: ILoadProcessingProps) => {
  const ref = useRef<HTMLDivElement>();
  const [per, setPer] = useState<number>(0);
  const engine = useContext(NinjaEngineContext);

  useEffect(() => {
    if (props.nowLoading) {
      setPer(props.loadingPercentages);
    }
    if (!props.loadCompleted){
      if (ref.current){
        ref.current.style.display = "block";
      }
    }
    else {
      if (ref.current){
        ref.current.style.display = "none";
      }
    }
  }, [props.loadCompleted, props.nowLoading, props.loadingPercentages]);

  return (
    <>
      {engine.nowLoading &&
        <>
          <div style={
            {
              zIndex: "99999",
              position: "absolute",
              height: `100%`,
              width: `100%`,
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
                サイズ: {props.loadingPercentages}
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