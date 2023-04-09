import { convertObjectToBlob } from "@/core/utils/NinjaFileControl";
import { createContext } from "react";
import { Mesh, Object3D, PlaneGeometry, PerspectiveCamera, OrthographicCamera } from "three";
import { GLTFExporter, GLTFExporterOptions } from "three-stdlib";

export class TerrainMakerManager {
  type: "create" | "edit" = "create";
  mode: "edit" | "view" = "view";
  brush: "normal" | "flat" | "paint" = "normal";
  cache: Object3D;
  terrainMesh: Mesh;
  color: string = "#00ff00";
  isMouseDown: boolean = false;
  mapSize = 32;
  mapResolution = 64;
  power = 0.1;
  wireFrame = true;
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

  setTerrain(terrainMesh){
    this.terrainMesh = terrainMesh;
    this.type = "edit";
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

  getWireFrame = () => {
    return this.wireFrame;
  }

  /**
   * GLB出力 -> Glob
   * @param filename 
   */
  async exportTerrainMesh(): Promise<Blob> {
    if (this.terrainMesh) {
      const obj3d = new Object3D();
      obj3d.add(this.terrainMesh.clone());

      const data = await convertObjectToBlob(obj3d);
      return data;
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
}

export const TerrainMakerContext = createContext<TerrainMakerManager>(null);