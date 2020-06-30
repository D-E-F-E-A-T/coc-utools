import { Neovim, Window, Buffer, OutputChannel } from 'coc.nvim';
import { FloatOptions } from '@chemzqm/neovim/lib/api/types';

export class FloatWindow {
  private buf: Buffer | undefined;
  private win: Window | undefined;

  constructor(private nvim: Neovim, private output: OutputChannel | undefined) {}

  private async createBuffer() {
    if (this.buf) {
      const isValid = await this.buf.valid;
      if (isValid) {
        return;
      }
    }
    this.buf = await this.nvim.createNewBuffer(false, true);
  }

  private async createWindow(options: FloatOptions): Promise<void> {
    const { nvim } = this;
    const win = await nvim.openFloatWindow(this.buf!, false, options);
    this.win = win;

    const isUpportWinblend = await this.nvim.call('exists', '+winblend');
    this.nvim.pauseNotification();
    if (isUpportWinblend) {
      win.setOption('winblend', 30, true);
    }
    win.setOption('number', false, true);
    win.setOption('relativenumber', false, true);
    win.setOption('cursorline', false, true);
    win.setOption('cursorcolumn', false, true);
    win.setOption('conceallevel', 2, true);
    win.setOption('signcolumn', 'no', true);
    win.setOption('foldcolumn', 1, true);
    win.setOption('winhighlight', 'FoldColumn:NormalFloat', true);
    await this.nvim.resumeNotification();
  }

  public get window(): Window | undefined {
    return this.win;
  }

  public get buffer(): Buffer | undefined {
    return this.buf;
  }

  public async init(options: FloatOptions) {
    await this.createBuffer();
    await this.createWindow(options);
  }

  public async updateWin(option: FloatOptions) {
    const { win } = this;
    const isValid = win !== undefined ? await win.valid : false;
    if (!isValid) {
      this.output && this.output!.appendLine(`Update window error: window ${(win && win!.id) || win} is invalid`);
      return;
    }

    this.nvim.call('nvim_win_set_config', [win!.id, option]);
  }

  public async updateBuf(content: string) {
    const { buf } = this;
    const isValid = buf !== undefined ? await buf.valid : false;
    if (!isValid) {
      this.output && this.output!.appendLine(`Update buffer error: window ${(buf && buf.id) || buf} is invalid`);
      return;
    }
    this.buf!.setLines(content, {
      start: 0,
      end: -1,
    });
  }

  /*
   * close win
   */
  private async closeWin() {
    const { win } = this;
    const isValid = win !== undefined ? await win.valid : false;
    if (isValid) {
      await win!.close(true);
    }
  }

  /*
   * clear buf
   */
  private async clearBuf() {
    const { buf } = this;
    const isValid = buf !== undefined ? await buf.valid : false;
    if (isValid) {
      await buf!.remove(0, -1);
    }
  }

  /*
   * dispose
   */
  public async dispose() {
    await this.closeWin();
    await this.clearBuf();
    this.win = undefined;
    this.buf = undefined;
  }
}
