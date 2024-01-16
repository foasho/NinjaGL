import React from "react";
import { IUIManagement } from "../utils";
import { useNinjaEngine } from "../hooks";
import { convertCssProperties } from "../utils/Styling";
import { NinjaIcon } from "./NinjaIcons";

export const UILabels = () => {
  const { ums } = useNinjaEngine();

  const filteredUms = ums.filter((um: IUIManagement) => um.type === "label");

  return (
    <>
      {filteredUms.map((um: IUIManagement) => (
        <UILabel um={um} key={um.id} />
      ))}
    </>
  );
};

const UILabel = ({ um }: { um: IUIManagement }) => {
  const styles = um.styles ? convertCssProperties(um.styles) : {};
  const positionMergedStyles: React.CSSProperties = {
    ...styles,
    position: "absolute",
    zIndex: 10,
    top: `${um.position.y}%`,
    left: `${um.position.x}%`,
    translate: "transform(-50%, -50%)",
  };
  return (
    <>
      {um.args.href ? (
        <a
          id={um.id}
          href={um.args.href}
          style={positionMergedStyles}
          className={um.args.className || ""}
        >
          {um.startIcon && (
            <NinjaIcon type={um.startIcon} color={positionMergedStyles.color} />
          )}
          {um.args.text || ""}
          {um.endIcon && (
            <NinjaIcon type={um.endIcon} color={positionMergedStyles.color} />
          )}
        </a>
      ) : (
        <span
          id={um.id}
          style={positionMergedStyles}
          className={um.args.className || ""}
        >
          {um.startIcon && (
            <NinjaIcon type={um.startIcon} color={positionMergedStyles.color} />
          )}
          {um.args.text || ""}
          {um.endIcon && (
            <NinjaIcon type={um.endIcon} color={positionMergedStyles.color} />
          )}
        </span>
      )}
    </>
  );
};
