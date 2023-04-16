import React from 'react';
import { NinjaGL } from "../core/NinjaGL";

const SamlePage = () => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <NinjaGL njcPath='mytest.njc'/>
    </div>
  );
};

export default SamlePage;