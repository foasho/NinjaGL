import { useEffect, useState } from "react";

import { IShaderManagement } from "@ninjagl/core";
import { useTranslation } from "react-i18next";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const ShaderNavigation = () => {
  const editor = useNinjaEditor();
  const [shaders, setShaders] = useState<IShaderManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    // setShaders(editor.getShaders());
  }, []);
  return (
    <>
      <div>
        <div>
          {shaders.map((shader, idx) => {
            return <ShaderItem shader={shader} index={idx} key={idx} />;
          })}
        </div>
      </div>
    </>
  );
};

const ShaderItem = (prop: { index: number; shader: IShaderManagement }) => {
  const { t } = useTranslation();
  // let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    // lineStyle = styles.darkLine;
  }
  return (
    <div>
      <div></div>
      <div>
        <div>{prop.shader.name}</div>
      </div>
    </div>
  );
};
