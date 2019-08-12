import { Neovim, OutputChannel, Disposable, workspace } from 'coc.nvim'
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
  private subscriptions: Disposable[] = []
  private isVisible: boolean = false
  private input: Input
  private title: Title
  private result: Result
  private sources: Record<string, ISource> = {}
  private activeSource: string

  constructor(private nvim: Neovim, private output: OutputChannel | undefined) {
    this.input = new Input(nvim, output)
    this.title = new Title(nvim, output)
    this.result = new Result(nvim, output, this.input)
    this.input.onChange(async (input) => {
      this.output && this.output.appendLine(`source: ${input.join('')} ${this.sources.length}`)
      if (this.activeSource) {
        this.sources[this.activeSource].callback(input, this.result, output)
      } else {
        this.filter(input)
      }
    })
  }

  public async register(source: ISource) {
    this.sources[source.name] = source
  }

  public active(name: string) {
    this.activeSource = name
    this.title.setTitle(name)
  }

  public filter(input: string[]) {
    const names = Object.keys(this.sources)
    this.result.updateContent(names)
  }

  public async show () {
    if (this.isVisible) {
      return
    }
    this.isVisible = true
    await this.input.init()
    await this.title.init()
    this.subscriptions.push(
      workspace.registerLocalKeymap('n', '<Esc>', () => {
        this.hide()
      })
    )
  }

  public async hide () {
    if (!this.isVisible) {
      return
    }
    for (let idx = 0; idx < this.subscriptions.length; idx++) {
      const sub = this.subscriptions[idx];
      await sub.dispose()
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
    const sources = Object.values(this.sources)
    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      await source.dispose()
    }
    this.sources = {}
    await this.hide()
  }
}
