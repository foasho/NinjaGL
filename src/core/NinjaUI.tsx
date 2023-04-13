import { useContext, useEffect, useState } from "react";
import { LoadProcessing } from "./ui-items/LoadProcessing";
// Icons
import { TouchMove } from "./ui-items/TouchMove";
import { NinjaEngineContext } from "./NinjaEngineManager";
import { NinjaIcons } from "./uis/NinjaIcons";

export const NinjaUI = () => {
  const [ready, setReady] = useState<boolean>(false);
  const engine = useContext(NinjaEngineContext);

  const ui = engine.ui;

  return (
    <>
      <div style={{ position: "fixed", zIndex: 99999 }}>
        {engine.deviceType == "mobile" || engine.deviceType == "tablet" &&
          <TouchMove />
        }
        {(ui && ui.icons) &&
          <>
            {ui.icons.length > 0 &&
              <NinjaIcons icons={ui.icons} />
            }
          </>
        }
      </div>
    </>
  )
}

`
.Ninjaui {
    z-index: 9999;
    div {
        position: fixed;
        cursor: pointer;
    }
    .rightTop {
        top: 10px;
        right: 10px;
        .icon {
            color: #fff;
            font-size: 30px;
        }
    }
    .leftTop {
        left: 10px;
        top: 10px;
    }
    .rightBottom {
        right: 10px;
        bottom: 10px;
    }
    .leftBottom {
        left: 10px;
        bottom: 10px;
    }
}
`
