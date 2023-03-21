import { NinjaEngine, NinjaEngineContext } from "@/engine/Core/NinjaEngineManager";
import { NinjaCanvas } from "@/engine/NinjaCanvas";
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { NinjaEditorContext } from "../NinjaEditorManager"

/**
* OMとUIから一時的なJSONデータを生成し、
* NinjaEngineを実行する
*/
export const DebugPlay = () => {
  const editor = useContext(NinjaEditorContext);
  const [engine, setEngine] = useState<NinjaEngine>();
  const { t } = useTranslation();
  useEffect(() => {
    // EditorからOMを取得してJSON化する
    const oms = editor.oms;
    const uis = editor.uis;
    // まずは直接いれてみる
    const _engine = new NinjaEngine();
    const avatar = editor.getAvatar();
    const terrain = editor.getTerrain();
    const objects = editor.getStaticObjects();
    const sky = editor.getSky();
    const lights = editor.getLights();
    if (!avatar || !terrain){
      Swal.fire({
        icon: "error",
        title: t("errorDebugPlay")
      });
    }
    else {
      const jsonData = {
        "init": {
          "physics": {
            "octree": "auto"
          },
          "mapSize": 128,
          "backmusics": [
            {
              "key": "backmusic",
              "filePath": "mp3/background.mp3",
              "volume": 0.02,
              "loop": true
            }
          ]
        },
        avatar: avatar,
        terrain: terrain,
        staticObjects: objects,
        sky: sky,
        lights: lights
      }
      _engine.setJsonData(jsonData);
      setEngine(_engine);
    }
    return () => {
    }
  }, []);

  return (
    <>
      <div id="Ninjaviewer" style={{ height: "100%" }}>
        {engine &&
          <NinjaEngineContext.Provider value={engine}>
            <NinjaCanvas />
          </NinjaEngineContext.Provider>
        }
      </div>
    </>
  )
}

// temp
const jsonData = {
  "init": {
    "physics": {
      "octree": "auto"
    },
    "mapSize": 128,
    "backmusics": [
      {
        "key": "backmusic",
        "filePath": "mp3/background.mp3",
        "volume": 0.02,
        "loop": true
      }
    ]
  },
  "avatar": {
    "id": "avatar",
    "filePath": "assets/defaults/default-man.glb",
    "args": {
      "initPosition": [30, 10, -30],
      "initRotateDegY": -50,
      "height": 1.7,
      "isCenter": true,
      "animMapper": {
        "idle": "Idle",
        "run": "Run",
        "walk": "Walk",
        "jump": "Jump",
        "action": "Kick"
      },
      "sounds": [
        {
          "key": "grassWalk",
          "filePath": "mp3/grassWalk.mp3",
          "volume": 0.5,
          "loop": true,
          "trigAnim": "walk",
          "stopAnim": "walk"
        },
        {
          "key": "grassRun",
          "filePath": "mp3/grassRun.mp3",
          "volume": 0.5,
          "loop": true,
          "trigAnim": "run",
          "stopAnim": "run"
        }
      ]
    }
  },
  "terrain": {
    "id": "terrain",
    "filePath": "assets/defaults/myterrain.ter",
    "visibleType": "force",
    "physics": "along"
  },
  "staticObjects": [
    {
      "id": "so1",
      "visiableType": "auto",
      "filePath": "assets/free/space/Pickup_Bullets.gltf",
      "physics": "none"
    }
  ],
  "sky": {
    "id": "sky1",
    "args": {
      "distance": 450000,
      "inclination": 0,
      "subPosition": [0, 1, 0],
      "azimuth": 0.25
    },
    "physics": "none",
    "visiableType": "force"
  },
  "lights": [
    {
      "id": "l1",
      "args": {
        "name": "光源1",
        "type": "ambient",
        "color": "#ffffff",
        "castShadow": true
      }
    },
    {
      "id": "l2",
      "name": "光源2",
      "args": {
        "type": "point",
        "color": "#ffffff",
        "distance": 100,
        "intensity": 0.8,
        "position": [0, 50, 0],
        "castShadow": true
      }
    },
    {
      "id": "l3",
      "name": "光源3",
      "args": {
        "type": "spot",
        "color": "#ffffff",
        "angle": 45,
        "distance": 100,
        "intensity": 0.8,
        "position": [64, 32, 64],
        "castShadow": true
      }
    }
  ]
}