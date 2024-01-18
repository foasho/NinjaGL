"use client";
import React from "react";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";

import { NinjaEditorProvider } from "@/hooks/useNinjaEditor";

const NinjaEditor = dynamic(() => import("@/editor/NinjaEditor").then((mod) => mod.NinjaEditor), {
  ssr: false,
  loading: () => (
    <div className='absolute left-0 top-0 size-full bg-white'>
      <svg
        style={{
          marginLeft: "-0.25rem",
          marginRight: "0.75rem",
          height: "1.25rem",
          width: "1.25rem",
          animation: "spin 1s linear infinite",
          color: "black",
        }}
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle style={{ opacity: "0.25", stroke: "currentColor", strokeWidth: "4" }} />
        <path
          style={{ opacity: "0.75" }}
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
});

const EditorPage = () => {
  return (
    <div>
      <NinjaEditorProvider>
        <NinjaEditor />
      </NinjaEditorProvider>
      <ToastContainer position='top-right' autoClose={5000} style={{ zIndex: 99999 }} />
    </div>
  );
};

export default EditorPage;
