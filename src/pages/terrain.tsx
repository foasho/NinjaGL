import { useEffect, useState } from "react";
import { reqApi } from "../services/ServciceApi";

const TerrainMakeComponent = () => {
    const [data, setData] = useState<any>();
    useEffect(() => {
        reqApi({route: "/api/hello"}).then((data) => {
            console.log("data check");
            console.log(data);
            if (data.status == 200){
                setData(data.data.message);
            }
        })
    }, [])

    return (
        <>
            <div>
            <h1>Hello, Next.js!</h1>
            <p>Data: {data}</p>
            </div>
        </>
    )
}

export default TerrainMakeComponent;