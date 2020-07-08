import { Neovim, Window, Buffer, workspace } from 'coc.nvim';
import { FloatOptions } from '@chemzqm/neovim/lib/api/types';

import { logger } from './logger';

const log = logger.getLog('FloatWindow');

export class FloatWindow {
  private buf: Buffer | undefined;
  private win: Window | undefined;
  private nvim: Neovim;

  constructor() {
    this.nvim = workspace.nvim;
  }

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

    const isSupportWinblend = await this.nvim.call('exists', '+winblend');
    this.nvim.pauseNotification();
    if (isSupportWinblend) {
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
      log(`Update window error: window ${(win && win!.id) || win} is invalid`);
      return;
    }

    this.nvim.call('nvim_win_set_config', [win!.id, option]);
  }

  public async updateBuf(content: string) {
    const { buf } = this;
    const isValid = buf !== undefined ? await buf.valid : false;
    if (!isValid) {
      log(`Update buffer error: window ${(buf && buf.id) || buf} is invalid`);
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
    if (this.win) {
      try {
        await this.win.close(true);
      } catch (error) {
        log(`Close window error: ${error}`);
      }
    }
  }

  /*
   * clear buf
   */
  private async clearBuf() {
    if (this.buf) {
      try {
        await this.buf!.remove(0, -1);
      } catch (error) {
        log(`Clear buffer error: ${error}`);
      }
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
