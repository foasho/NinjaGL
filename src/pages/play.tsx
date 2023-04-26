import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NinjaGL } from "@ninjagl/core";

const BuildPlay = () => {
  const router = useRouter();
  const [decodedNjcPath, setDecodedNjcPath] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.njcPath) {
      const decodedPath = decodeURIComponent(router.query.njcPath as string);
      setDecodedNjcPath(decodedPath);
    }
  }, [router.query]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {decodedNjcPath ? (
        <NinjaGL njcPath={decodedNjcPath} />
      ) : (
        <p>Not Found NjcPath</p>
      )}
    </div>
  );
};
export default BuildPlay;