import { NaniwaEngine, NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { InitNaniwa } from "@/engine/NaniwaInit";
import { INaniwaProps } from "@/engine/NaniwaProps";
import { useEffect, useState } from "react";
import { NaniwaCanvas } from "./NaniwaCanvas";
import { NaniwaUI } from "./NaniwaUI";

export const Main = () => {
    // const [jsonPath, setJsonPath] = useState<string>();
    const [state, setState] = useState<INaniwaProps>(InitNaniwa);
    const [engine, setEngine] = useState<NaniwaEngine>();

    useEffect(() => {
        setEngine(new NaniwaEngine());
    }, []);

    return (
        <>
            <div>
                {/* aaaa */}
            </div>
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