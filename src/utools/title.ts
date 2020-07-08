import { workspace } from 'coc.nvim';

import { FloatWindow } from '../common/float-window';
import { config } from '../common/config';

export class Title {
  private width = 0;
  private row = 0;
  private col = 0;
  private floatWindow: FloatWindow;
  constructor() {
    this.floatWindow = new FloatWindow();
  }

  public async init() {
    // create title window
    await this.initTitleWin('UTools');
  }

  private async initTitleWin(title: string) {
    const { nvim } = workspace;
    const width = (await nvim.call('strdisplaywidth', [title])) as number;
    this.width = width + 2; // foldColumn + end empty char = 2
    const rows = (await nvim.getOption('lines')) as number;
    const columns = (await nvim.getOption('columns')) as number;
    this.row = Math.floor(rows / 4);
    this.col = Math.floor((columns - config.width) / 2);
    await this.floatWindow.init({
      focusable: false,
      relative: 'editor',
      anchor: 'NW',
      height: 1,
      width: this.width,
      row: this.row - 1,
      col: this.col,
    } as any);
    const { buffer } = this.floatWindow;
    await buffer.setLines(title, { start: 0, end: -1 });
  }

  public async setTitle(title: string) {
    const { nvim } = workspace;
    const width = (await nvim.call('strdisplaywidth', [title])) as number;
    await this.floatWindow.updateWin({
      relative: 'editor',
      height: 1,
      width: width + 2, // foldColumn + end empty char = 2
      row: this.row - 1,
      col: this.col,
    } as any);
    const { buffer } = this.floatWindow;
    await buffer.setLines(title, { start: 0, end: -1 });
  }

  public async dispose() {
    await this.floatWindow.dispose();
  }
}
