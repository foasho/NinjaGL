import {
  BufferAttribute,
  CircleGeometry,
  Color,
  ColorRepresentation,
  GLBufferAttribute,
  type Intersection,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
} from "three";

/**
 * 範囲内の頂点を取得
 * @param intersects
 * @param radius
 * @returns
 */
const getVertexes = (intersects: Intersection[], radius: number): { vertexIndexes: number[]; values: number[] } => {
  const nearVertexIntexes: number[] = []; // 範囲内の頂点のIndex
  const values: number[] = []; // 中心からの距離
  if (intersects.length > 0 && intersects[0].object) {
    const object: Mesh = intersects[0].object as Mesh;
    const geometry = object.geometry;
    const stride = geometry.attributes.position.itemSize;
    let position: Vector3;
    if (intersects.length > 0) {
      position = intersects[0].point;
      if (position) {
        if (geometry.attributes.position instanceof GLBufferAttribute)
          return {
            vertexIndexes: [],
            values: [],
          };
        const vertices = geometry.attributes.position.array;
        const maxDistance = radius * radius; // 2乗距離
        for (let i = 0; i < vertices.length; i += stride) {
          const v = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
          // 回転を考慮する
          v.applyMatrix4(object.matrixWorld);
          if (v.distanceToSquared(position) < maxDistance) {
            nearVertexIntexes.push(i / stride);
            values.push(1 - v.distanceToSquared(position) / maxDistance);
          }
        }
      }
    }
  }
  return {
    vertexIndexes: nearVertexIntexes,
    values: values,
  };
};

/**
 * マウスを動かしたとき
 * @param event
 * @returns
 */
type onMouseMoveProps = {
  meshRef: React.MutableRefObject<Mesh>;
  cameraRef: React.MutableRefObject<PerspectiveCamera>;
  raycaster: Raycaster;
  mouse: Vector2;
  brush: string;
  isMouseDown: React.MutableRefObject<boolean>;
  radius: number;
  type: string;
  power: number;
  isReverse: React.MutableRefObject<boolean>;
  colorStr: ColorRepresentation;
  mouseCircleRef: React.MutableRefObject<Mesh>;
};
const onMouseMove = (
  { meshRef, cameraRef, raycaster, mouse, brush, isMouseDown, radius, type, power, isReverse, colorStr, mouseCircleRef }: onMouseMoveProps,
) => {
  if (!meshRef.current || !cameraRef.current) {
    return;
  }
  raycaster.setFromCamera(mouse, cameraRef.current);
  const intersects = raycaster.intersectObject(meshRef.current);
  if (isMouseDown.current) {
    if (brush == "normal" || brush == "flat") {
      const { vertexIndexes, values } = getVertexes(intersects, radius);
      if (intersects.length > 0 && intersects[0]) {
        const intersectPosition = intersects[0].point;
        const object: Mesh = intersects[0].object as Mesh;
        if (!object) return;
        vertexIndexes.map((index, i) => {
          const value = values[i];
          if (brush == "normal") {
            let position = object.geometry.attributes.position;
            if (position instanceof GLBufferAttribute) return;
            if (type == "create") {
              position.setZ(index, position.getZ(index) + power * value * (isReverse.current ? -1 : 1));
            } else {
              position.setY(index, position.getY(index) + power * value * (isReverse.current ? -1 : 1));
            }
            position.needsUpdate = true;
          } else if (brush == "flat") {
            let position = object.geometry.attributes.position;
            if (position instanceof GLBufferAttribute) return;
            if (type == "create") {
              position.setZ(index, intersectPosition.z);
            } else {
              position.setY(index, intersectPosition.y);
            }
            position.needsUpdate = true;
          }
        });
      }
    } else if (brush == "paint") {
      if (intersects.length > 0 && intersects[0]) {
        if (type == "create") {
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;
          const cloneGeometry = object.geometry.clone();
          if (!cloneGeometry.attributes.color) {
            const count = cloneGeometry.attributes.position.count;
            const buffer = new BufferAttribute(new Float32Array(count * 3), 3);
            cloneGeometry.setAttribute("color", buffer);
          }
          if (
            cloneGeometry.attributes.color instanceof GLBufferAttribute ||
            cloneGeometry.attributes.position instanceof GLBufferAttribute
          )
            return;
          const numVertices = cloneGeometry.attributes.color.array;
          let colors = new Float32Array(numVertices);
          const color = new Color(colorStr);
          const vertex = new Vector3();
          const positionArray = Array.from(cloneGeometry.attributes.position.array);
          for (let i = 0; i <= positionArray.length - 3; i += 3) {
            vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
            if (type == "create") vertex.applyMatrix4(meshRef.current.matrixWorld); // Consider rotation
            const distance = vertex.distanceTo(intersectPosition);
            if (distance <= radius) {
              colors.set(color.toArray(), i);
            }
          }
          cloneGeometry.setAttribute("color", new BufferAttribute(colors, 3));
          object.geometry.copy(cloneGeometry);
        } else {
          const intersectPosition = intersects[0].point;
          const object: Mesh = intersects[0].object as Mesh;
          if (!object) return;

          object.traverse((node: Object3D) => {
            if (node instanceof Mesh && node.isMesh) {
              if (node.geometry) {
                const geometry = node.geometry;

                if (!geometry.attributes.color) {
                  const count = geometry.attributes.position.count;
                  const buffer = new BufferAttribute(new Float32Array(count * 3), 3);
                  geometry.setAttribute("color", buffer);
                }

                const numVertices = geometry.attributes.color.array;
                let colors = new Float32Array(numVertices);
                let originalColors = Array.from(geometry.attributes.color.array) as number[];

                const color = new Color(colorStr);
                const vertex = new Vector3();
                const positionArray = Array.from(geometry.attributes.position.array) as number[];

                for (let i = 0; i <= positionArray.length - 3; i += 3) {
                  vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
                  vertex.applyMatrix4(meshRef.current.matrixWorld);
                  const distance = vertex.distanceTo(intersectPosition);

                  if (distance <= radius) {
                    const blendedColor = new Color()
                      .fromArray(originalColors.slice(i, i + 3))
                      .lerp(color, 1 - distance / radius);
                    colors.set(blendedColor.toArray(), i);
                  } else {
                    colors.set(originalColors.slice(i, i + 3), i);
                  }
                }

                geometry.setAttribute("color", new BufferAttribute(colors, 3));
                const newMaterial = node.material.clone() as MeshStandardMaterial;
                newMaterial.vertexColors = true;
                newMaterial.color.set(0xffffff); // Set material color to white
                node.material = newMaterial;
              }
            }
          });
        }
      }
    }
  }
  // Mouse circle
  if (intersects.length > 0 && mouseCircleRef.current) {
    mouseCircleRef.current.geometry = new CircleGeometry(radius);
    const intersectPosition = intersects[0].point;
    const mouseCirclePos = new Vector3().addVectors(intersectPosition, new Vector3(0, 0.01, 0));
    mouseCircleRef.current.position.copy(mouseCirclePos);
  }
};

export { getVertexes, onMouseMove };
