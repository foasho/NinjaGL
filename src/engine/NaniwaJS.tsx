import { NaniwaEngine, NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { InitNaniwa } from "@/engine/core/NaniwaInit";
import { INaniwaProps } from "@/engine/core/NaniwaProps";
import { useEffect, useState } from "react";
import { NaniwaCanvas } from "./NaniwaCanvas";
import { NaniwaUI } from "./NaniwaUI";

export interface INaniwaJSProps {
    jsonPath?: string;
    canvasHeight?: any;
    canvasWidth?: any; 
}

export const NaniwaJS = (props: INaniwaJSProps) => {
    const [state, setState] = useState<INaniwaProps>(InitNaniwa);
    const [engine, setEngine] = useState<NaniwaEngine>();

    useEffect(() => {
        const _engine = new NaniwaEngine();
        if (props.jsonPath && props.jsonPath.length > 3){
            _engine.setJson(props.jsonPath);
        }
        setEngine(_engine);
        return () => {
            if (engine){
                engine.allClear();
                setEngine(null);
            }
        }
    }, []);

    console.log("再生成");

    return (
        <>
            {state.mode == "edit" &&
            <>
                <a>調整中</a>
            </>
            }
            {state.mode == "play" &&
            <div style={{ height: "100vh" }}>
                {engine &&
                    <NaniwaEngineContext.Provider value={engine}>
                        <NaniwaCanvas/>
                        <NaniwaUI/>
                    </NaniwaEngineContext.Provider>
                }
            </div>
            }
        </>
    )
}