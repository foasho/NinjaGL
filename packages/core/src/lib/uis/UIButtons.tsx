import React from "react";
import { useNinjaEngine, useNinjaWorker } from "../hooks";
import { IUIManagement } from "../utils";
import { convertCssProperties } from "../utils/Styling";
import { NinjaIcon } from "./NinjaIcons";

export const UIButtons = () => {
  const { ums } = useNinjaEngine();

  const filteredUms = ums.filter((um:IUIManagement) => um.type === "button");

  return (
    <>
      {filteredUms.map((um: any) => (
        <UIButton um={um} key={um.id} />
      ))}
    </>
  );
};

const UIButton = ({ um }: { um: IUIManagement }) => {
  const { worker } = useNinjaWorker();

  const styles = um.styles ? convertCssProperties(um.styles) : {};
  const positionMergedStyles: React.CSSProperties = {
    ...styles,
    position: "absolute",
    zIndex: 10,
    top: `${um.position.y}%`,
    left: `${um.position.x}%`,
    translate: "transform(-50%, -50%)",
  };
  const text = um.args.text ? um.args.text : "";

  return (
    <button
      id={um.id}
      style={positionMergedStyles}
      className={um.args.className || ""}
      onClick={() => {
        if (worker.current) {
          worker.current.postMessage({ id: um.id, type: "click" });
        }
      }}
      // hover
      onMouseEnter={() => {
        if (worker.current) {
          worker.current.postMessage({ id: um.id, type: "mouseenter" });
        }
      }}
      onMouseLeave={() => {
        if (worker.current) {
          worker.current.postMessage({ id: um.id, type: "mouseleave" });
        }
      }}
    >
      {um.startIcon && <NinjaIcon type={um.startIcon} color={positionMergedStyles.color} />}
      {text}
      {um.endIcon && <NinjaIcon type={um.endIcon} color={positionMergedStyles.color} />}
    </button>
  );
};
