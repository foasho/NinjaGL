import React from "react";
import { useNinjaEngine, useNinjaWorker } from "../hooks";
import { IUIManagement } from "../utils";
import { convertCssProperties } from "../utils/Styling";
import { MdSend } from "react-icons/md";

export const UITextInputs = () => {
  const { ums } = useNinjaEngine();
  const filteredUms = ums.filter((um) => um.type === "textinput");
  return (
    <>
      {filteredUms.map((um) => (
        <UITextInput key={um.id} um={um} />
      ))}
    </>
  );
};

const UITextInput = ({ um }: { um: IUIManagement }) => {
  const { worker } = useNinjaWorker();
  const [message, setMessage] = React.useState("");
  const styles = um.args.styles ? convertCssProperties(um.args.styles) : {};
  const positionMergedStyles: React.CSSProperties = {
    ...styles,
    position: "absolute",
    zIndex: 10,
    top: `${um.position.y}%`,
    left: `${um.position.x}%`,
    translate: "transform(-50%, -50%)",
  };

  return (
    <div
      style={positionMergedStyles}
      className={um.args.className || ""}
      id={um.id}
    >
      <textarea
        value={message}
        onChange={(e) => {
          // 最後の改行を削除
          if (e.target.value.slice(-1) === "\n") {
            setMessage(e.target.value.slice(0, -1));
          } else {
            setMessage(e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Shift + Enter で改行
            if (e.shiftKey) {
              setMessage(message + "\n");
            } else {
              // worker
              if (worker.current) {
                worker.current.postMessage({
                  id: um.id,
                  type: "sendtext",
                  message: message,
                });
              }
            }
          }
        }}
        style={{
          flexBasis: "100%",
          height: "44px",
          margin: "0 22px",
          padding: "0 11px",
          border: "none",
          borderRadius: "11px",
          fontSize: "12px",
        }}
      />
      <a
        style={{
          color: um.args.color || "#43D9D9",
          cursor: "pointer",
        }}
        onClick={() => {
          // worker
          if (worker.current) {
            worker.current.postMessage({
              id: um.id,
              type: "sendtext",
              message: message,
            });
          }
        }}
      >
        <MdSend style={{ display: "inline" }} />
      </a>
    </div>
  );
};
