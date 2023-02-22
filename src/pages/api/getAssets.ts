import type { NextApiRequest, NextApiResponse } from 'next'
import { stat } from "fs/promises";
import path from "path";

type Data = {
    files  : any[];
    error? : string;
    name?  : string;
}

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    res.status(200).json({ files: [] });
};