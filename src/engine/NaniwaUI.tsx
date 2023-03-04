import { useContext } from "react";
import { LoadProcessing } from "./UIItems/LoadProcessing";
// Icons
import { BsHandbagFill } from "react-icons/bs";
import { TouchMove } from "./UIItems/TouchMove";
import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";

export const NaniwaUI = () => {
    const engine = useContext(NaniwaEngineContext);
    return (
        <>
            <LoadProcessing/>
            {engine.deviceType == "mobile" || engine.deviceType == "tablet" &&
                <TouchMove/>
            }
            <BsHandbagFill/>
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
