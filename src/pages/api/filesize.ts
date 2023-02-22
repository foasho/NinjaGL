import type { NextApiRequest, NextApiResponse } from 'next'
import { stat, readFile } from "fs/promises";
import path from "path";

type Data = {
    size   : number;
    error? : string;
    name?  : string;
}

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { jsonPath } = req.query;
    let size: number = 0;
    if (jsonPath){
        let jsonData: string;
        const data = await readFile(`./public/${jsonPath}`);
        jsonData = data.toString();
        const jsonObj = JSON.parse(jsonData);
        const filePathes = [];
        Object.keys(jsonObj).map((key) => {
            const obj = jsonObj[key];
            if (obj instanceof Array){
                Object.keys(obj).map((k) => {
                    const o = obj[k];
                    if (o.filePath){
                        filePathes.push(o.filePath);
                    }
                })
            }
            else {
                if (obj.filePath){
                    filePathes.push(obj.filePath);
                }
            }
        });
        await Promise.all(filePathes.map(async (filePath: string) => {
            const file = await stat(`./public/assets/${filePath}`);
            size += file.size;
        }));
        res.status(200).json({ size: size });
    }
    else {
        res.status(400).json({ error: 'JsonPath Error', size: 0 });
    }
};