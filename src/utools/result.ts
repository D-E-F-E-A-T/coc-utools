import { FloatWindow } from '../float-window';
import { Neovim, OutputChannel } from 'coc.nvim';
import { config } from '../config'
import { Input } from './input'

export class Result {
  private isInit: boolean = false
  private width: number = 0
  private row: number = 0
  private col: number = 0
  private floatWindow: FloatWindow

  constructor(
    private nvim: Neovim,
    private output: OutputChannel | undefined,
    private input: Input
  ) {
    this.floatWindow = new FloatWindow(nvim, output)
  }

  public async init (content: string[]) {
    if (this.isInit) {
      return
    }
    // create title window
    await this.initWin(content)
  }

  private async initWin (content: string[]) {
    if (!content || !content.length) {
      return
    }
    this.isInit = true
    const { nvim } = this
    const rows = await nvim.getOption('lines') as number
    const columns = await nvim.getOption('columns') as number
    this.width = config.width
    this.row = Math.floor(rows / 4)
    this.col = Math.floor((columns - this.width) / 2)
    await this.floatWindow.init({
      focusable: false,
      relative: 'editor',
      anchor: 'NW',
      height: content.length,
      width: this.width,
      row: this.row + this.input.winHeight,
      col: this.col,
    } as any)
    const { buffer } = this.floatWindow
    await buffer.setLines(content, { start: 0, end: -1 })
  }

  public async updateContent (content: string[]) {
    if (!this.isInit) {
      return await this.initWin(content)
    }
    await this.floatWindow.updateWin({
      relative: 'editor',
      height: content.length,
      width: this.width,
      row: this.row + this.input.winHeight,
      col: this.col,
    } as any)
    const { buffer } = this.floatWindow
    await buffer.setLines(content, { start: 0, end: -1 })
  }

  public async dispose () {
    await this.floatWindow.dispose()
    this.isInit = false
  }
}