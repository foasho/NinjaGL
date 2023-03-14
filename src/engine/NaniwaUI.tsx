import { useContext, useEffect, useState } from "react";
import { LoadProcessing } from "./UIItems/LoadProcessing";
// Icons
import { BsHandbagFill } from "react-icons/bs";
import { TouchMove } from "./UIItems/TouchMove";
import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { NaniwaIcons } from "./uis/NaniwaIcons";

export const NaniwaUI = () => {
  const [ready, setReady] = useState<boolean>(false);
  const engine = useContext(NaniwaEngineContext);

  const ui = engine.ui;
  console.log(ui.icons);

  return (
    <>
      <div style={{ position: "fixed", zIndex: 99999 }}>
        {engine.deviceType == "mobile" || engine.deviceType == "tablet" &&
          <TouchMove />
        }
        {ui.icons &&
          <>
            {ui.icons.length > 0 &&
              <NaniwaIcons icons={ui.icons} />
            }
          </>
        }
      </div>
    </>
  )
}

`
.naniwaui {
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
