import { Container, FederatedPointerEvent, Graphics, Point, TickerCallback } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { OverflowScrollType, ResizeOptions, ScrollBoxOptions } from './types.js';
/**
 * pixi.js scrollbox: a masked content box that can scroll vertically or horizontally with scrollbars
 */
export declare class Scrollbox extends Container {
    _maskContent: Graphics;
    _disabled: boolean;
    _isScrollbarVertical: boolean | null;
    _isScrollbarHorizontal: boolean;
    _scrollWidth: number | null;
    _scrollHeight: number | null;
    options: ScrollBoxOptions;
    content: Viewport;
    ease: Function;
    scrollbar: Graphics;
    tickerFunction: TickerCallback<any> | null;
    scrollbarTop: number;
    scrollbarHeight: number;
    scrollbarLeft: number;
    scrollbarWidth: number;
    fade: {
        wait: number;
        duration: number;
    } | null;
    pointerDown: {
        type: string;
        last: Point;
    } | null;
    /**
     * create a scrollbox
     * @param {object} options
     * @param {boolean} [options.dragScroll=true] user may drag the content area to scroll content
     * @param {string} [options.overflowX=auto] (none, scroll, hidden, auto) this changes whether the scrollbar is shown
     * @param {string} [options.overflowY=auto] (none, scroll, hidden, auto) this changes whether the scrollbar is shown
     * @param {string} [options.overflow] (none, scroll, hidden, auto) sets overflowX and overflowY to this value
     * @param {number} [options.boxWidth=100] width of scrollbox including scrollbar (in pixels)
     * @param {number} [options.boxHeight=100] height of scrollbox including scrollbar (in pixels)
     * @param {number} [options.scrollbarSize=10] size of scrollbar (in pixels)
     * @param {number} [options.scrollbarOffsetHorizontal=0] offset of horizontal scrollbar (in pixels)
     * @param {number} [options.scrollbarOffsetVertical=0] offset of vertical scrollbar (in pixels)
     * @param {boolean} [options.stopPropagation=true] call stopPropagation on any events that impact scrollbox
     * @param {number} [options.scrollbarBackground=0xdddddd] background color of scrollbar
     * @param {number} [options.scrollbarBackgroundAlpha=1] alpha of background of scrollbar
     * @param {number} [options.scrollbarForeground=0x888888] foreground color of scrollbar
     * @param {number} [options.scrollbarForegroundAlpha=1] alpha of foreground of scrollbar
     * @param {string} [options.underflow=top-left] what to do when content underflows the scrollbox size: none: do nothing; (left/right/center AND top/bottom/center); OR center (e.g., 'top-left', 'center', 'none', 'bottomright')
     * @param {boolean} [options.noTicker] do not use PIXI.Ticker (for fade to work properly you will need to manually call updateLoop(elapsed) on each frame)
     * @param {Ticker} [options.ticker=Ticker.shared] use this PIXI.Ticker for updates
     * @param {boolean} [options.fade] fade the scrollbar when not in use
     * @param {number} [options.fadeScrollbarTime=1000] time to fade scrollbar if options.fade is set
     * @param {number} [options.fadeScrollboxWait=3000] time to wait before fading the scrollbar if options.fade is set
     * @param {(string|function)} [options.fadeScrollboxEase=easeInOutSine] easing function to use for fading
     * @param {boolean} [options.passiveWheel=false] whether wheel events are propogated beyond the scrollbox (NOTE: default is now false)
     * @param {boolean} [options.clampWheel=true] wheel events should be clamped (to avoid weird bounce with mouse wheel)
     * @param {EventSystem} [options.events] EventSystem, available from instantiated app.renderer.events - used to calculate pointer postion relative to canvas location on screen
     * @param {HTMLElement} [options.divWheel] the HTMLElement to use for wheel interactions
     */
    constructor(options: ScrollBoxOptions);
    /**
     * offset of horizontal scrollbar (in pixels)
     * @type {number}
     */
    get scrollbarOffsetHorizontal(): number | undefined;
    set scrollbarOffsetHorizontal(value: number | undefined);
    /**
     * offset of vertical scrollbar (in pixels)
     * @type {number}
     */
    get scrollbarOffsetVertical(): number | undefined;
    set scrollbarOffsetVertical(value: number | undefined);
    /**
     * disable the scrollbox (if set to true this will also remove the mask)
     * @type {boolean}
     */
    get disable(): boolean;
    set disable(value: boolean);
    /**
     * call stopPropagation on any events that impact scrollbox
     * @type {boolean}
     */
    get stopPropagation(): boolean | undefined;
    set stopPropagation(value: boolean | undefined);
    /**
     * user may drag the content area to scroll content
     * @type {boolean}
     */
    get dragScroll(): boolean | undefined;
    set dragScroll(value: boolean | undefined);
    /**
     * width of scrollbox including the scrollbar (if visible)- this changes the size and not the scale of the box
     * @type {number}
     */
    get boxWidth(): number;
    set boxWidth(value: number);
    /**
     * sets overflowX and overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
     * scroll = always show scrollbar
     * hidden = hide overflow and do not show scrollbar
     * auto = if content is larger than box size, then show scrollbar
     * @type {string}
     */
    get overflow(): OverflowScrollType | undefined;
    set overflow(value: OverflowScrollType | undefined);
    /**
     * sets overflowX to (scroll, hidden, auto) changing whether the scrollbar is shown
     * scroll = always show scrollbar
     * hidden = hide overflow and do not show scrollbar
     * auto = if content is larger than box size, then show scrollbar
     * @type {string}
     */
    get overflowX(): OverflowScrollType;
    set overflowX(value: OverflowScrollType);
    /**
     * sets overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
     * scroll = always show scrollbar
     * hidden = hide overflow and do not show scrollbar
     * auto = if content is larger than box size, then show scrollbar
     * @type {string}
     */
    get overflowY(): OverflowScrollType;
    set overflowY(value: OverflowScrollType);
    /**
     * height of scrollbox including the scrollbar (if visible) - this changes the size and not the scale of the box
     * @type {number}
     */
    get boxHeight(): number;
    set boxHeight(value: number);
    /**
     * scrollbar size in pixels
     * @type {number}
     */
    get scrollbarSize(): number | undefined;
    set scrollbarSize(value: number | undefined);
    /**
     * width of scrollbox less the scrollbar (if visible)
     * @type {number}
     * @readonly
     */
    get contentWidth(): number;
    /**
     * height of scrollbox less the scrollbar (if visible)
     * @type {number}
     * @readonly
     */
    get contentHeight(): number;
    /**
     * is the vertical scrollbar visible
     * @type {boolean}
     * @readonly
     */
    get isScrollbarVertical(): boolean | null;
    /**
     * is the horizontal scrollbar visible
     * @type {boolean}
     * @readonly
     */
    get isScrollbarHorizontal(): boolean;
    /**
     * top coordinate of scrollbar
     */
    get scrollTop(): number;
    set scrollTop(top: number);
    /**
     * left coordinate of scrollbar
     */
    get scrollLeft(): number;
    set scrollLeft(left: number);
    /**
     * width of content area
     * if not set then it uses content.width to calculate width
     */
    get scrollWidth(): number;
    set scrollWidth(value: number);
    /**
     * height of content area
     * if not set then it uses content.height to calculate height
     */
    get scrollHeight(): number;
    set scrollHeight(value: number);
    /**
     * draws scrollbars
     * @private
     */
    _drawScrollbars(): void;
    /**
     * draws mask layer
     * @private
     */
    _drawMask(): void;
    /**
     * call when scrollbox content changes
     */
    update(): void;
    /**
     * called on each frame to update fade scrollbars (if enabled)
     * @param {number} elapsed since last frame in milliseconds (usually capped at 16.6667)
     */
    updateLoop(elapsed: number): void;
    /**
     * dirty value (used for optimizing draws) for underlying viewport (scrollbox.content)
     * @type {boolean}
     */
    get dirty(): boolean;
    set dirty(value: boolean);
    /**
     * show the scrollbar and restart the timer for fade if options.fade is set
     */
    activateFade(): void;
    /**
     * handle pointer down on scrollbar
     * @param {FederatedPointerEvent} e
     * @private
     */
    scrollbarDown(e: FederatedPointerEvent): void;
    /**
     * handle pointer move on scrollbar
     * @param {FederatedPointerEvent} e
     * @private
     */
    scrollbarMove(e: FederatedPointerEvent): void;
    /**
     * handle pointer down on scrollbar
     * @private
     */
    scrollbarUp(): void;
    /**
     * resize the mask for the container
     * @param {object} options
     * @param {number} [options.boxWidth] width of scrollbox including scrollbar (in pixels)
     * @param {number} [options.boxHeight] height of scrollbox including scrollbar (in pixels)
     * @param {number} [options.scrollWidth] set the width of the inside of the scrollbox (leave null to use content.width)
     * @param {number} [options.scrollHeight] set the height of the inside of the scrollbox (leave null to use content.height)
     */
    resize(options: ResizeOptions): void;
    /**
     * ensure that the bounding box is visible
     * @param {number} x - relative to content's coordinate system
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    ensureVisible(x: number, y: number, width: number, height: number): void;
}
