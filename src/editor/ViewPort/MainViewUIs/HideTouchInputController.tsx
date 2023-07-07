import styles from "@/App.module.scss";
import { useEffect, useState, useRef } from "react";
import { MathUtils } from "three";

interface IHideTouchInputController {
  onChangeSelectEle: (ele: HTMLDivElement) => void;
}
export const HideTouchInputController = (props: IHideTouchInputController) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleOuterCircleClick = () => {
    if (ref.current) props.onChangeSelectEle(ref.current);
  }

  return (
    <>
      <div 
        className={styles.hideTouchInputController}
        onClick={handleOuterCircleClick}
        ref={ref}
      >
        <div className={styles.outerCircle}>
          <div className={styles.innerCircle}></div>
        </div>
      </div>
    </>
  )
}