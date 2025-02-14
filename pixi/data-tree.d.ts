export interface OriginPoint {
    x: number;
    y: number;
}
export interface DataTree {
    originPoint: OriginPoint;
    expression: string;
}
export declare const setDataTreeList: (dataTreeList: DataTree[]) => void;
export declare const getDataTreeList: () => DataTree[];
export declare const addDataTree: (dataTree: DataTree) => void;
export declare const removeDataTree: (dataTree: DataTree) => void;
