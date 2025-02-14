import * as PIXI from 'pixi.js';
type UnderflowType = 'center' | 'top' | 'left' | 'right' | 'bottom' | string;
export type OverflowScrollType = 'none' | 'scroll' | 'hidden' | 'auto';
export interface ResizeOptions {
    boxWidth?: number;
    boxHeight?: number;
    scrollWidth?: number;
    scrollHeight?: number;
}
export interface ScrollBoxOptions {
    boxHeight?: number;
    boxWidth?: number;
    scrollbarSize?: number;
    scrollbarBackground?: number;
    scrollbarBackgroundAlpha?: number;
    scrollbarForeground?: number;
    scrollbarForegroundAlpha?: number;
    dragScroll?: boolean;
    stopPropagation?: boolean;
    scrollbarOffsetHorizontal?: number;
    scrollbarOffsetVertical?: number;
    underflow?: UnderflowType;
    fade?: boolean;
    fadeScrollbar?: boolean;
    fadeScrollbarTime?: number;
    fadeScrollboxWait?: number;
    fadeScrollboxEase?: string | Function;
    passiveWheel?: boolean;
    clampWheel?: boolean;
    overflowX?: OverflowScrollType;
    overflowY?: OverflowScrollType;
    overflow?: OverflowScrollType;
    noTicker?: boolean;
    ticker?: PIXI.Ticker;
    events: PIXI.EventSystem;
}
export {};
