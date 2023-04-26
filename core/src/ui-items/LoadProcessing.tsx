import { NinjaEngineContext } from "../utils/NinjaEngineManager"
import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import { ILoadingState } from "../utils/NinjaCanvas";

const loadingText = "Loading...";

export const LoadProcessing = (props: ILoadingState) => {
  const ref = useRef<HTMLDivElement>();
  const [per, setPer] = useState<number>(0);

  useEffect(() => {
    if (props.isNowLoading) {
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
  }, [props.loadCompleted, props.isNowLoading, props.loadingPercentages]);

  console.log("LoadProcessing", props);
  return (
    <>
      {(props.isNowLoading && !props.loadCompleted) &&
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