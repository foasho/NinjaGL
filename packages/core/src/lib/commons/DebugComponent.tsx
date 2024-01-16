import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ObjectInspector } from "react-inspector";
import { useNinjaEngine } from "../hooks";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DebugContext = React.createContext<{
  debugs: any[];
  addDebugLog: (value: any) => void;
}>({
  debugs: [],
  addDebugLog: () => {},
});

type DebugComponentProps = {
  margin?: [number, number];
  position?: "top-left" | "bottom-left" | "bottom-left" | "top-right";
  width?: number;
  maxHeight?: number;
};
export const DebugComponent = ({
  margin = [16, 16],
  position = "top-left",
  width = 250,
  maxHeight = 300,
}: DebugComponentProps) => {
  // positioの位置によって、top, left, bottom, rightを設定する
  const positionStyle: React.CSSProperties = {
    position: "absolute",
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    overflow: "auto",
    padding: "16px",
    zIndex: -1,
    borderRadius: "8px",
    background: "rgba(0, 0, 0, 0.8)",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.8)",
    pointerEvents: "auto",
    top: position.includes("top") ? `${margin[0]}px` : "auto",
    left: position.includes("left") ? `${margin[1]}px` : "auto",
    bottom: position.includes("bottom") ? `${margin[0]}px` : "auto",
    right: position.includes("right") ? `${margin[1]}px` : "auto",
  };

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [debugs, setDebugs] = useState<any[]>([]);

  const addDebugLog = (value: any) => {
    setDebugs([...debugs, value]);
  };

  return (
    <div style={positionStyle}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          color: "white",
        }}
      >
        <DebugContext.Provider value={{ debugs, addDebugLog }}>
          <div
            style={{ pointerEvents: "auto", width: "100%" }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span
              style={{
                fontWeight: "bold",
                width: "100%",
              }}
            >
              デバッグログ
            </span>
            <span
              style={{
                float: "right",
              }}
            >
              {isCollapsed ? (
                <FaChevronDown style={{ display: "inline" }} />
              ) : (
                <FaChevronUp style={{ display: "inline" }} />
              )}
            </span>
          </div>
          {!isCollapsed && (
            <>
              <DebugHistory />
            </>
          )}
        </DebugContext.Provider>
      </div>
    </div>
  );
};

const DebugHistory = () => {
  const ref = React.useRef<HTMLDivElement>(null!);
  const { debugs } = useContext<any>(DebugContext);

  useEffect(() => {
    // scrollを一番下にする
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [debugs]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        color: "white",
        paddingTop: "16px",
      }}
    >
      <div
        ref={ref}
        style={{
          minHeight: "100px",
          overflowY: "auto",
          maxHeight: "100px",
          marginBottom: "16px",
          borderRadius: "8px",
        }}
      >
        {debugs.map((debug: any, idx: number) => {
          return <ObjectInspector key={idx} theme="chromeDark" data={debug} />;
        })}
      </div>
      <DebugInputArea />
    </div>
  );
};

const DebugInputArea = () => {
  const engine = useNinjaEngine();
  const [isDetail, setIsDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const { addDebugLog } = useContext(DebugContext);

  const setLog = () => {
    if (selected) {
      addDebugLog(selected);
    }
  };

  return (
    <>
      <div>
        <select
          style={{
            background: "white",
            color: "black",
            fontWeight: "bold",
            padding: "7px 16px",
            borderRadius: "4px",
            outline: "none",
          }}
          onChange={(e) => {
            const selectKey = e.target.value;
            if (!selectKey || selectKey === "") {
              setSelected(null);
              return;
            }
            setSelected((engine as any)[`${selectKey}`]);
          }}
        >
          <option>選択してください</option>
          {Object.keys(engine).map((key) => {
            return (
              <option key={key} value={key}>
                {key}
              </option>
            );
          })}
        </select>
        <button
          style={{
            background: "#43D9D9",
            color: "white",
            fontWeight: "bold",
            padding: "6px 16px",
            borderRadius: "4px",
            display: "inline-block",
          }}
          onClick={() => {
            setLog();
          }}
        >
          ログ出力
        </button>
        <span style={{ paddingLeft: "12px" }}>
          {isDetail ? (
            <FaChevronDown
              style={{ display: "inline" }}
              onClick={() => setIsDetail(!isDetail)}
            />
          ) : (
            <FaChevronUp
              style={{ display: "inline" }}
              onClick={() => setIsDetail(!isDetail)}
            />
          )}
        </span>
      </div>
      {isDetail && <></>}
    </>
  );
};
