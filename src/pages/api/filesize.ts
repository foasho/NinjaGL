import type { NextApiRequest, NextApiResponse } from "next";
import { stat, readFile, readdir } from "fs/promises";
import path from "path";
import fs from 'fs';

type Data = {
    size   : number;
    isFile : boolean;
    isDirectory: boolean;
    name   : string;
}

type FileList = {
    files: Data[];
    error? : string;
}

// ストレージパス
const STORAGE_PATH = "./public";

export default async (req: NextApiRequest, res: NextApiResponse<FileList>) => {
    const { routePath } = req.query;
    console.log("routePath");
    console.log(routePath);
    if (routePath){
        const files = await readdir(`${STORAGE_PATH}${routePath}`);
        const fileList = files.map((fileName) => {
            const filePath = path.join(STORAGE_PATH+routePath, fileName);
            const fileStat = fs.statSync(filePath);
            return {
                size: fileStat.size,
                name: fileName,
                isFile: fileStat.isFile(),
                isDirectory: fileStat.isDirectory(),
            };
        })
        res.status(200).json({ files: fileList, error: null });
    }
    else {
        res.status(400).json({ error: 'JsonPath Error', files: [] });
    }
};