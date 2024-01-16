import { MathUtils } from "three";
import { IScriptManagement } from "../../utils";

export const initTpSMs = (): IScriptManagement[] => {
  return [
    {
      id: MathUtils.generateUUID(),
      name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
      type: "script",
      script: `
      async function initialize() {
      }
      
      async function frameLoop(state, delta, input) {
        const om = await getOMByName({name: "movebox"});
        const pos = om.args.position? om.args.position : {x: 0, y: 0, z: 0};
        if (pos.x + 0.01 < 10){
          await setPosition({id: om.id, position: [pos.x+0.01, pos.y, pos.z]});
        }
      }    
      `,
    },
    // {
    //   id: MathUtils.generateUUID(),
    //   name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
    //   type: "script",
    //   script: `
    //   async function initialize() {
    //   }
      
    //   async function frameLoop(state, delta, input) {
    //     const om = await getOMByName({name: "movebox"});
    //     const rot = om.args.rotation? om.args.rotation : {x: 0, y: 0, z: 0};
    //     const time = state.elapsedTime;
    //     // Y軸を時間で回転
    //     await setRotation({id: om.id, rotation: [rot.x, Math.sin(time)* 2 * Math.PI, rot.z]});
    //   }
    //   `,
    // },
    {
      id: MathUtils.generateUUID(),
      name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
      type: "script",
      script: `
      async function initialize() {
      }
      
      async function frameLoop(state, delta, input) {
        const om = await getOMByName({name: "movebox"});
        const time = state.elapsedTime;
        // 0.5 ~ 1.5 倍の拡縮
        const s = 0.5 * Math.sin(time)
        await setScale({id: om.id, scale: [1 + s, 1 + s, 1 + s]});
      }
      `,
    },
    {
      id: MathUtils.generateUUID(),
      name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
      type: "script",
      script: `
      const onMyClick = (id) => {
        setArg({ id: id, key: "materialData", value: { type: "standard", "value": "#F1D353" } })
      }
      async function initialize() {
        const om = await getOMByName({name: "movebox"});
        useClickEvent(om.id, () => onMyClick(om.id))
      }
      
      async function frameLoop(state, delta, input) {
      }
      `,
    },
    {
      id: MathUtils.generateUUID(),
      name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
      type: "script",
      script: `
        const onMyDblclick = (id) => {
          setArg({ id: id, key: "materialData", value: { type: "reflection", "value": "#43D9D9" } })
        }
        async function initialize() {
          const om = await getOMByName({name: "movebox"});
          useDblclickEvent(om.id, () => onMyDblclick(om.id))
        }
        
        async function frameLoop(state, delta, input) {
        }
      `,
    },
  ];
};
