"use client";
import * as React from "react";
import * as THREE from "three";

export type DragStartComponentProps = "Arrow" | "Slider" | "Rotator" | "Scale";
export type OnDragStartProps = {
  component: DragStartComponentProps;
  axis: 0 | 1 | 2;
  origin: THREE.Vector3;
  directions: THREE.Vector3[];
};

export type PivotContext = {
  onDragStart: (props: OnDragStartProps) => void;
  onDrag: (mdW: THREE.Matrix4) => void;
  onDragEnd: () => void;
  translation: { current: [number, number, number] };
  translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined];
  rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined];
  axisColors: [string | number, string | number, string | number];
  hoveredColor: string | number;
  opacity: number;
  scale: number;
  lineWidth: number;
  fixed: boolean;
  displayValues: boolean;
  depthTest: boolean;
  userData?: { [key: string]: any };
  annotationsClass?: string;
  object?: any;
};

export const context = React.createContext<PivotContext>(null!);

const isRef = (object: any): object is React.MutableRefObject<THREE.Object3D> => object && object.current;
export const resolveObject = (
  object?: THREE.Object3D | React.MutableRefObject<THREE.Object3D>,
  fallback?: THREE.Object3D | React.MutableRefObject<THREE.Object3D>,
) => (isRef(object) ? object.current : object ? object : fallback ? resolveObject(fallback) : undefined);
