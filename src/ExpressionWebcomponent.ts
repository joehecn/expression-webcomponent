
import { html, css, LitElement } from 'lit'
import { property, query } from 'lit/decorators.js'
import { init } from './pixi/index.js'

export class ExpressionWebcomponent extends LitElement {
  static styles = css`
    :host {
      box-sizing: border-box;
    }
    #pixi-container {
      width: 100%;
      height: 100%;
    }
  `

  @property() expression = ''

  @query('#pixi-container')
  _pixiContainer!: HTMLDivElement

  async firstUpdated() {
    await init(this._pixiContainer)
  }

  render() {
    return html`
      <div id="pixi-container"></div>
    `
  }
}
