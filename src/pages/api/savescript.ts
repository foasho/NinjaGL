import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import path from 'path';

export const config = {
  api: {
    bodyParser: true,
  },
}

const uploadDir = `${process.env.PUBLIC_DIR}/scripts`;

export default async (req: NextApiRequest, res: NextApiResponse<string>) => {
  if (req.method === 'POST') {
    const { filename, script } = req.body;
    try {
      const filePath = path.join(process.cwd(), uploadDir, filename);
      await fs.promises.writeFile(filePath, script, 'utf8');
      res.status(200).json('Text saved successfully.');
    } catch (error) {
      res.status(500).json('Error saving the text.');
    }
  } else {
    res.status(405).send('Method not allowed')
  }
};