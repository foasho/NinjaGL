
import React from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const BuildPlay = () => {
  
  const router = useRouter();
  const { njcPath } = router.query;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {njcPath ? (
        <img src={njcPath as string} alt="Loaded from njcPath" />
      ) : (
        <p>Not Found NjcPath</p>
      )}
    </div>
  );
};

export default BuildPlay;