import { MathUtils } from "three";
import { IUIManagement } from "../../utils";

export const initTpUMs = (): IUIManagement[] => {
  return [
    {
      id: MathUtils.generateUUID(),
      styles:
        `
        {
          "font-size": "24px",
          "color": "#ffffff"
        }
        `,
      type: "label",
      name: "label01",
      args: {
        text: "Hello World!",
      },
      position: {
        x: 30,
        y: 0,
      },
      visible: true,
    },
  ];
};
