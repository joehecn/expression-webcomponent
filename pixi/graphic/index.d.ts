import { ExpressionContainer, ParentAndPath } from '../define.js';
export declare const staticTint = 16777215;
export declare const dragingTint = 14540253;
export declare const differTint = 16084076;
export declare const hitTint = 6799930;
export declare function generateContainer(expression: string): {
    rootContainer: ExpressionContainer;
    leafSet: Set<ExpressionContainer>;
    branchSet: Set<ExpressionContainer>;
};
export declare function transformExpression(expression: string, parentAndPaths: ParentAndPath[], replace: string): string;
