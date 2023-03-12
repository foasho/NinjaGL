import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from "formidable";
import fs from "fs";
import path from 'path';
import multer from 'multer';

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

const uploadDir = `${process.env.PUBLIC_DIR}/assets`;
// multerの設定
const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
    })
});

interface IFileStream {
    filepath: string;
    originalFilename: string;
}

const ProcessFiles = (Files: any): IFileStream[] => {
    const data: IFileStream[] = [];
    let index = 0;
   
    while (Boolean(Files[`file${index}`])) {
     data.push(Files[`file${index}`] as IFileStream)
     index++;
    }
   
     return data;
}

export default async (req: NextApiRequest, res: NextApiResponse<string>) => {
    if (req.method === 'POST') {
        const tempFileName = "temp.glb"
        const form = formidable({
            multiples: true,
            defaultInvalidName: tempFileName
        });
        // const form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = uploadDir;
        form.keepExtensions = true;
        
        form.parse(req, async function (err, fields, files) {
            if (err) {
                console.error(err);
                res.status(500).json('Failed to parse form data');
                return;
            }
        
            const file = files.file;
        
            // ファイルを保存する
            const oldPath = `${uploadDir}/${tempFileName}`;
            const fileName = file.originalFilename;
            const newPath = `${uploadDir}/${fileName}`;
            try {
                await fs.promises.rename(oldPath, newPath);
                res.status(200).json(`${uploadDir}/${fileName}にアップロード完了しました。`);
            } catch (err) {
                console.error(err);
                res.status(500).json('Failed to save file');
            }
        });

    } else {
        res.status(405).send('Method not allowed')
    }
};