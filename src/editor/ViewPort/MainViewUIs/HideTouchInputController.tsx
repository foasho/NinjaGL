import styles from "@/App.module.scss";
import { useEffect, useState, useRef } from "react";
import { MathUtils } from "three";

interface IHideTouchInputController {
  onChangeSelectEle: (ele: HTMLElement) => void;
}
export const HideTouchInputController = (props: IHideTouchInputController) => {
  const ref = useRef(null);

  const handleOuterCircleClick = () => {
    props.onChangeSelectEle(ref.current);
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