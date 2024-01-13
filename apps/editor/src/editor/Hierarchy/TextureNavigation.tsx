import { useEffect, useState } from "react";

import { ITextureManagement } from "@ninjagl/core";
import { useTranslation } from "react-i18next";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const TextureNavigation = () => {
  const editor = useNinjaEditor();
  const [textures, setTextures] = useState<ITextureManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    // setTextures(editor.getTextures());
  }, []);
  return (
    <>
      <div>
        <div>
          {textures.map((texture, idx) => {
            return <TextureItem texture={texture} index={idx} key={idx} />;
          })}
        </div>
      </div>
    </>
  );
};

const TextureItem = (prop: { index: number; texture: ITextureManagement }) => {
  const { t } = useTranslation();
  // let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    // lineStyle = styles.darkLine;
  }
  return (
    <div>
      <div></div>
      <div>
        <div>{prop.texture.name}</div>
      </div>
    </div>
  );
};
