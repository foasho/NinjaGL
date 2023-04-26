
import React from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { NinjaGL } from "@ninjagl/core";

const BuildPlay = () => {
  
  const router = useRouter();
  const { njcPath } = router.query as { njcPath: string };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {njcPath ? (
        <NinjaGL njcPath={njcPath} />
      ) : (
        <p>Not Found NjcPath</p>
      )}
    </div>
  );
};

export default BuildPlay;