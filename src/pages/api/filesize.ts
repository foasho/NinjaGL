import type { NextApiRequest, NextApiResponse } from 'next'
import { statSync } from "fs";

type Data = {
    name: string
}

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { jsonPath } = req.query;
    console.log("jsonPath", jsonPath);
    const data: any = {
        message: "Hello, world!"
    };
    res.status(200).json(data);
};