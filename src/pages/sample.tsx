import React from 'react';
import { NinjaGL } from "ninja-core";

const SamlePage = () => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <NinjaGL njcPath='mytest.njc'/>
    </div>
  );
};

export default SamlePage;