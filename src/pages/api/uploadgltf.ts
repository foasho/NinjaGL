import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
      bodyParser: false,
    },
  }

type Data = {
    size   : number;
    error? : string;
    name?  : string;
}

export default async (req: NextApiRequest, res: NextApiResponse<string>) => {
    if (req.method === 'POST') {
        console.log("ここまでは来ていますよ");
        const form = new formidable.IncomingForm();
        form.uploadDir = './public/assets' // ファイルを保存するディレクトリを指定します
        form.keepExtensions = true
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err.message)
                res.status(500).send('Internal server error')
                return
            }
            console.log("filesの確認");
            console.log(files);
            res.status(200).send('File uploaded successfully')
        })
    } else {
        res.status(405).send('Method not allowed')
    }
};