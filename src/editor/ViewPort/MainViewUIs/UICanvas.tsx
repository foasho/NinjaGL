import { useEffect, useState } from 'react';

import Moveable from 'react-moveable';

interface IUICanvas {
  gridNum: number;
}
export const UICanvas = (props: IUICanvas) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [elementGuidelines, setElementGuideliens] = useState<HTMLElement[]>([]);
  useEffect(() => {
    setElementGuideliens([].slice.call(document.querySelectorAll('.moveable')));
  }, [props.gridNum]);

  const onChangeSelectEle = (ele: HTMLElement) => {
    setTarget(ele);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* <div 
        className={`${styles.selectUI} target`}
      >
        Test
      </div> */}
      <UICanvasHelper gridNum={props.gridNum} />
      <Moveable
        target={target}
        draggable={true}
        resizable={true}
        snappable={true}
        keepRatio={true}
        elementGuidelines={elementGuidelines}
        onRender={(e) => {
          e.target.style.cssText += e.cssText;
        }}
      />
    </div>
  );
};

interface IUICanvasHelper {
  gridNum: number;
}
const UICanvasHelper = (props: IUICanvasHelper) => {
  const rowHeight = 100 / props.gridNum;
  const gridwidth = 100 / props.gridNum;

  return (
    <>
      <div>
        <div>UI</div>
        <div>
          {Array(props.gridNum)
            .fill(0)
            .map((_, i) => {
              return (
                <div key={i} style={{ height: `${rowHeight}%` }}>
                  {Array(props.gridNum)
                    .fill(0)
                    .map((_, j) => {
                      return <div className={` target moveable`} style={{ width: `${gridwidth}%` }} key={j}></div>;
                    })}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};
