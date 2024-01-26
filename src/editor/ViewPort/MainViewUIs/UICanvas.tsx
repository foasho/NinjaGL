import { memo, useEffect, useState } from "react";
import Moveable from "react-moveable";
import { useSnapshot } from "valtio";

import { globalEditorStore } from "@/editor/Store/editor";
import { globalUIStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

const _UICanvas = () => {
  const { uiGridNum, uiMode } = useSnapshot(globalEditorStore);
  const uistore = useSnapshot(globalUIStore);
  const { ums } = useNinjaEditor();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [elementGuidelines, setElementGuideliens] = useState<HTMLElement[]>([]);

  useEffect(() => {
    setElementGuideliens([].slice.call(document.querySelectorAll(".moveable")));
    return () => {
      setElementGuideliens([]);
    };
  }, [uiGridNum]);

  const onChangeSelectEle = (ele: HTMLElement) => {
    setTarget(ele);
  };

  useEffect(() => {
    if (uistore.currentId) {
      const ele = document.getElementById(uistore.currentId);
      if (ele) {
        onChangeSelectEle(ele);
      }
    }
  }, [uistore.currentId]);

  return (
    <div className='absolute top-0 z-20 h-full w-full bg-white/50' style={{ display: uiMode ? "block" : "none" }}>
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        {/* <div
      className={` target`}
      >
        Test
      </div> */}
        {/* {ums.map((um, idx) => {
        return <UIViewer um={um} key={`UIItem-${idx}`} />;
      })} */}
        {/** 補助線 */}
        <UICanvasHelper gridNum={uiGridNum} />
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
    </div>
  );
};
export const UICanvas = memo(_UICanvas);

interface IUICanvasHelper {
  gridNum: number;
}
const UICanvasHelper = (props: IUICanvasHelper) => {
  const rowHeight = 100 / props.gridNum;
  const gridwidth = 100 / props.gridNum;

  return (
    <>
      <div className='absolute left-1/2 top-1/2 z-[-1] h-full w-full -translate-x-1/2 -translate-y-1/2'>
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[50px] text-primary'>UI</div>
        <div className='flex h-full w-full flex-col flex-wrap'>
          {Array(props.gridNum)
            .fill(0)
            .map((_, i) => {
              return (
                <div key={i} className='flex w-full flex-nowrap' style={{ height: `${rowHeight}%` }}>
                  {Array(props.gridNum)
                    .fill(0)
                    .map((_, j) => {
                      return (
                        <div
                          // eslint-disable-next-line tailwindcss/no-custom-classname
                          className='relative z-10 box-border h-full border-[0.5px] border-dashed border-primary/75'
                          style={{ width: `${gridwidth}%` }}
                          key={j + "-ui-grid"}
                        ></div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};
