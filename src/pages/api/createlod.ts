import type { NextApiRequest, NextApiResponse } from "next";
import { NodeIO } from "@gltf-transform/core";
import { simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { basename, dirname } from "path";

/**
 * 自動LOD化API
 */
type FilePathList = {
  filePaths: { low: string, mid: string, high: string };
  error?: string;
}

const STORAGE_PATH = process.env.STORAGE_PATH;

// 指定ファイルをLODにする
export default async (req: NextApiRequest, res: NextApiResponse<FilePathList>) => {
  const { filePath } = req.query;
  if (req.method == "GET" && filePath) {
    const io = new NodeIO();
    const document = await io.read(
      `${STORAGE_PATH}/${filePath}`
    );
    const low = document.clone();
    const mid = document.clone();

    // 普通に削減
    await low.transform(
      weld({ tolerance: 0.01 }),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.01, error: 0.01 })
    );

    // 軽微な削減
    await mid.transform(
      weld({ tolerance: 0.0001 }),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.01, error: 0.0001 })
    );

    //保存
    const dirName = dirname(filePath as string);
    const fileName = basename(filePath as string).split(".")[0];
    const lowFileName = `${fileName}-low.glb`;
    await io.write(`${STORAGE_PATH}/${dirName}/${lowFileName}`, low);
    const midFileName = `${fileName}-mid.glb`;
    await io.write(`${STORAGE_PATH}/${dirName}/${midFileName}`, mid);

    res.status(200).json({ error: 'JsonPath Error', filePaths: { 
      low: `${dirName}/${lowFileName}`, 
      mid: `${dirName}/${lowFileName}`, 
      high: filePath.toString() 
    }});

  }
  else {
    res.status(400).json({ error: 'JsonPath Error', filePaths: null });
  }
};