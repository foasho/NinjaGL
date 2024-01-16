import React from "react";
import { ThirdPersonTemplate, saveNJCBlob } from "../lib";

export const ExportButton = () => {
  const exportNjc = async () => {
    const filename = `testing-${Math.random().toString(32).substring(2)}.njc`;
    const njcFile = ThirdPersonTemplate();
    const blob = await saveNJCBlob(njcFile);
    const url = window.URL.createObjectURL(blob);
    // Download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportNjc}
      style={{
        fontSize: "30px",
        outline: "none",
        border: "none",
        backgroundColor: "#43D9D9",
        color: "white",
        fontWeight: "bold",
        borderRadius: "5px",
        padding: "10px 15px",
        cursor: "pointer",
      }}
    >
      Export NJC
    </button>
  );
};
