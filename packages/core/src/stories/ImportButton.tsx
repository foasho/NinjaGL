import React from "react";
import { NJCFile, loadNJCFileFromURL, NinjaGL } from "../lib";

export const ImportButton = () => {
  const [njcFile, setNjcFile] = React.useState<NJCFile | null>(null);
  const importNjc = async () => {
    const testingNjcPath = `/njcs/testing.njc`;
    const _njcFile = await loadNJCFileFromURL(testingNjcPath);
    setNjcFile(_njcFile);
  };

  return (
    <>
      <div style={{ width: "90vw", height: "90vh", position: "relative" }}>
        {!njcFile ? (
          <button
            onClick={() => importNjc()}
            style={{
              position: "absolute",
              top: "10px",
              zIndex: 100,
              fontSize: "30px",
              outline: "none",
              border: "none",
              backgroundColor: "#BA68C8",
              color: "white",
              fontWeight: "bold",
              borderRadius: "5px",
              padding: "10px 15px",
              cursor: "pointer",
            }}
          >
            Import NJC
          </button>
        ) : (
          <NinjaGL njc={njcFile} apiEndpoint="http://localhost:5174" />
        )}
      </div>
    </>
  );
};
