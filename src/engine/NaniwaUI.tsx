import { useContext, useEffect, useState } from "react";
import { LoadProcessing } from "./UIItems/LoadProcessing";
// Icons
import { BsHandbagFill } from "react-icons/bs";
import { TouchMove } from "./UIItems/TouchMove";
import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { NaniwaIcons } from "./uis/NaniwaIcons";
import { isCanvasSetup } from "./NaniwaCanvas";

export const NaniwaUI = () => {
    const [ready, setReady] = useState<boolean>(false);
    const engine = useContext(NaniwaEngineContext);
    const [ui, setUI] = useState(engine.ui);
    
    useEffect(() => {
        console.log("Iconsをセットするよん");
        console.log(engine.ui);
        console.log(engine.loadCompleted);
        if (engine && engine.loadCompleted){
            setUI(engine.ui);
        }
        setReady(engine.loadCompleted)
        return () => {
            if (ready){
                setReady(false);
            }
        }
    }, [isCanvasSetup]);

    return (
        <>
            <LoadProcessing/>
            {ready &&
                <>
                {engine.deviceType == "mobile" || engine.deviceType == "tablet" &&
                    <TouchMove/>
                }
                {ui &&
                    <>
                        {ui.icons && 
                            <NaniwaIcons {...ui.icons} />
                        }
                    </>
                }
                </>
            }
            
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
