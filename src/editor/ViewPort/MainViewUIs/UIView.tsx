import { IUIManagement } from '@ninjagl/core';

export const UIViewer = ({ um }: { um: IUIManagement }) => {
  const applyStyle = (style: string): React.CSSProperties => {
    return {
      display: 'flex',
    };
  };

  return <div id={um.id} style={um.styles ? applyStyle(um.styles) : {}}>
    {um.name}
  </div>;
};
