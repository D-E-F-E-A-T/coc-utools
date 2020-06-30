import { FloatWindow } from '../float-window';
import { Neovim, OutputChannel } from 'coc.nvim';
import { config } from '../config';

export class InputWidget {
  private changeCbs: Array<(input: string[]) => Promise<void>> = [];
  private input: string[] = [];
  private isAttached = false;
  private height = 0;
  private width = 0;
  private row = 0;
  private col = 0;
  private floatWindow: FloatWindow;
  constructor(private nvim: Neovim, private output: OutputChannel | undefined) {
    this.floatWindow = new FloatWindow(nvim, output);
  }

  public async init() {
    const { nvim } = this;

    // create input window
    await this.initInputWin();

    // enter insert mode
    const { window, buffer } = this.floatWindow;
    await nvim.setWindow(window);
    await nvim.feedKeys('i', 'in', false);

    // get buffer lines
    const lines = await buffer.lines;
    if (lines) {
      this.input = lines;
    }

    // attach buffer to listen for change
    this.isAttached = await buffer.attach(false);
    if (!this.isAttached) {
      this.output && this.output.appendLine(`Attach buffer error`);
    }
    buffer.listen('lines', this.onChangeInput);
    buffer.listen('detach', () => {
      if (this.isAttached) {
        this.output && this.output.appendLine(`Unexpected detach buffer`);
      }
    });
  }

  private async initInputWin() {
    const { nvim } = this;
    const columns = (await nvim.getOption('columns')) as number;
    const rows = (await nvim.getOption('lines')) as number;
    this.width = config.width;
    this.height = 1;
    this.row = Math.floor(rows / 4);
    this.col = Math.floor((columns - this.width) / 2);
    await this.floatWindow.init({
      focusable: true,
      relative: 'editor',
      anchor: 'NW',
      height: this.height,
      width: this.width,
      row: this.row,
      col: this.col,
    } as any);
  }

  private async resizeWin() {
    if (this.height !== this.input.length) {
      this.height = this.input.length;
      await this.floatWindow.updateWin({
        relative: 'editor',
        width: this.width,
        height: this.height,
        row: this.row,
        col: this.col,
      });
    }
  }

  private onChangeInput = async (
    _buf: Buffer,
    _tick: number,
    firstline: number,
    lastline: number,
    linedata: string[],
  ) => {
    const preInput = this.input.join('\n');
    this.input.splice(firstline, lastline - firstline, ...linedata);
    if (preInput === this.input.join('\n')) {
      return;
    }
    this.output && this.output.appendLine(`${firstline} ${lastline} ${linedata.join('-')} ${this.input.join('-')}`);
    await this.resizeWin();
    for (let idx = 0; idx < this.changeCbs.length; idx++) {
      const cb = this.changeCbs[idx];
      await cb(this.input);
    }
  };

  public onChange(cb: (input: string[]) => Promise<void>) {
    this.changeCbs.push(cb);
  }

  public get winId(): number {
    const { window } = this.floatWindow;
    return window && window.id;
  }

  public get winWidth(): number {
    return this.width;
  }

  public get winHeight(): number {
    return this.height;
  }

  public async dispose() {
    const { buffer } = this.floatWindow;
    this.isAttached = false;
    await buffer.detach();
    await this.floatWindow.dispose();
  }
}
