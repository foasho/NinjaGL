import React from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
import {
  NJCFile,
  NinjaGL,
  ExportNjcFile,
  initTpOMs,
  initTpConfig,
  initTpSMs,
  initTpUMs,
} from "./lib";

export const App = () => {
  const [ready, setReady] = React.useState(false);
  const [njcFile, setNJCFile] = React.useState<NJCFile | null>(null);
  React.useEffect(() => {
    const _njcFile = ExportNjcFile(
      initTpOMs(),
      initTpUMs(),
      [],
      initTpSMs(),
      initTpConfig(),
      {}
    );
    setNJCFile(_njcFile);
    setReady(true);
    return () => {
      setReady(false);
    };
  }, []);

  const apiEndpoint = process.env.VITE_API_ENDPOINT || "";

  return (
    <div style={{ position: "absolute", height: "100dvh", width: "100dvw" }}>
      {ready && (
        <div style={{ height: "100%", paddingTop: "64px" }}>
          {njcFile && (
            <NinjaGL apiEndpoint={apiEndpoint} njc={njcFile}></NinjaGL>
          )}
        </div>
      )}
      <div>
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            fontSize: "30px",
            cursor: "pointer",
            zIndex: 100,
          }}
          onClick={() => {
            setReady(!ready);
          }}
        >
          {ready ? <HiEye /> : <HiEyeSlash />}
        </div>
      </div>
    </div>
  );
};
