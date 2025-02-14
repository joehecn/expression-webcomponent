import { Bounds, Container, Graphics } from 'pixi.js';
export type InputType = 'number' | 'string' | 'boolean';
export type ResultType = InputType;
export interface ParentAndPath {
    node: string;
    path: string | null;
    parent: string | null;
}
export interface ExpressionContainer extends Container {
    expression: string;
    resultType: ResultType;
    parentAndPaths: ParentAndPath[];
    isTemplate: boolean;
    isRoot: boolean;
    isLeaf: boolean;
    collisionDetectionGraphics?: Graphics;
    setCollisionDetectionGraphicsTint: (tint: number, alpha: number) => void;
    collisionDetectionGraphicsCheckArea?: Graphics;
    getCheckAreaBounds: () => Bounds | null;
    dragBackgroundGraphics?: Graphics;
    setDragBackgroundGraphicsTint: (tint: number) => void;
    dragCircleGraphics?: Graphics;
    setDragCircleGraphicsTint: (tint: number) => void;
}
