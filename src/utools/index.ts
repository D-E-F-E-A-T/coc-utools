import { Neovim, OutputChannel } from 'coc.nvim'
import { Input } from './input'
import { Title } from './title';
import { Result } from './result'

export interface ISource {
  name: string
  description: string
  callback: (input: string[], result: Result, output: OutputChannel | undefined) => Promise<any> | any
  dispose: () => Promise<any> | any
}

export class UTools {
  private isVisible: boolean = false
  private input: Input
  private title: Title
  private result: Result
  private sources: ISource[] = []

  constructor(private nvim: Neovim, private output: OutputChannel | undefined) {
    this.input = new Input(nvim, output)
    this.title = new Title(nvim, output)
    this.result = new Result(nvim, output, this.input)
    this.input.onChange(async (input) => {
      this.output && this.output.appendLine(`source: ${input.join('')} ${this.sources.length}`)
      for (let idx = 0; idx < this.sources.length; idx++) {
        const source = this.sources[idx];
        await source.callback(input, this.result, output)
      }
    })
  }

  public async register(source: ISource) {
    this.sources.push(source)
  }

  public async show () {
    if (this.isVisible) {
      return
    }
    this.isVisible = true
    await this.input.init()
    await this.title.init()
  }

  public async hide () {
    if (!this.isVisible) {
      return
    }
    await this.input.dispose()
    await this.title.dispose()
    await this.result.dispose()
    this.isVisible = false
  }

  public async hideIfBlur() {
    if (!this.isVisible) {
      return
    }
    const { nvim, input } = this
    const win = await nvim.window
    if (win.id !== input.winId) {
      await this.hide()
    }
  }

  public async dispose() {
    for (let index = 0; index < this.sources.length; index++) {
      const source = this.sources[index];
      await source.dispose()
    }
    this.sources = []
    await this.hide()
  }
}
