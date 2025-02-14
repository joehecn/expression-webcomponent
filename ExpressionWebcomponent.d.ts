import { LitElement } from 'lit';
export declare class ExpressionWebcomponent extends LitElement {
    static styles: import('lit').CSSResult;
    expression: string;
    _pixiContainer: HTMLDivElement;
    firstUpdated(): Promise<void>;
    render(): import('lit-html').TemplateResult<1>;
}
