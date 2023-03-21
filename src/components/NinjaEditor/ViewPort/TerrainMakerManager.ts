import { createContext } from "react";
import { Mesh, Object3D, PlaneGeometry, PerspectiveCamera, OrthographicCamera } from "three";
import { GLTFExporter, GLTFExporterOptions } from "three/examples/jsm/exporters/GLTFExporter";

export class TerrainMakerManager {
  mode: "edit" | "view" = "view";
  brush: "normal" | "flat" | "paint" = "normal";
  cache: Object3D;
  terrainMesh: Mesh;
  color: string = "#00ff00";
  isMouseDown: boolean = false;
  mapSize = 32;
  mapResolution = 64;
  power = 0.1;
  wireFrame = false;
  radius = 1.0;
  camera: PerspectiveCamera | OrthographicCamera;

  constructor() { }

  reset() {
    if (this.terrainMesh) {
      this.terrainMesh.geometry = new PlaneGeometry(this.mapSize, this.mapSize, this.mapResolution, this.mapResolution);
    }
    if (this.camera) {
      this.camera.position.set(
        this.mapSize / 2,
        this.mapSize / 2,
        -this.mapSize / 2
      );
    }
  }

  changeMode() {
    if (this.mode == "view") {
      this.mode = "edit";
    }
    else this.mode = "view";
  }

  setMode(mode: "view" | "edit") {
    this.mode = mode;
  }

  changeWireFrame() {
    this.wireFrame = !this.wireFrame;
  }

  changePower(power: number) {
    this.power = power;
  }

  changeRaduis(radius: number) {
    this.radius = radius;
  }

  changeMapSize(size: number) {
    this.mapSize = size;
  }

  changeMapResolution(resolution: number) {
    this.mapResolution = resolution;
  }

  changeColor(color: string) {
    this.color = color;
  }

  changeBrush(brush: "normal" | "flat" | "paint"){
    this.brush = brush;
  }

  /**
   * GLB出力 -> Glob
   * @param filename 
   */
  async exportTerrainMesh(filename?: string): Promise<Blob> {
    if (this.terrainMesh) {
      const obj3d = new Object3D();
      obj3d.add(this.terrainMesh.clone());

      return new Promise((resolve) => {
        var exporter = new GLTFExporter();
        const options: GLTFExporterOptions = {
          trs: false,
          onlyVisible: true,
          binary: true,
          maxTextureSize: 4096
        };
        exporter.parse(
          obj3d,
          (result) => {
            if (result instanceof ArrayBuffer) {
              return resolve(this.saveArrayBuffer(result, filename));
            }
            else {
              const output = JSON.stringify(result, null, 2);
              return resolve(this.saveString(output, filename));
            }
          },
          (error: ErrorEvent) => {
            console.log(`出力中エラー: ${error.toString()}`);
          }
        );
      });

    }
    else console.log("地形データが存在していません");
  }

  save(blob: Blob, filename: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
  }

  saveString(text: string, filename?: string): Blob {
    // this.save( new Blob( [ text ], { type: 'text/plain' } ), filename );
    return new Blob([text], { type: 'text/plain' });
  }

  saveArrayBuffer(buffer: ArrayBuffer, filename?: string): Blob {
    // this.save(new Blob([buffer], { type: "application/octet-stream" }), filename);
    return new Blob([buffer], { type: "application/octet-stream" });
  }
}

export const TerrainMakerContext = createContext<TerrainMakerManager>(null);