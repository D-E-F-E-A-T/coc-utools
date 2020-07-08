import { WorkspaceConfiguration, workspace } from 'coc.nvim';

import { Dispose } from './dispose';

class Config extends Dispose {
  width = 70;

  async init(config: WorkspaceConfiguration) {
    const { nvim } = workspace;
    const maxWidth = config.get<number>('maxWidth', 70);
    const columns = (await nvim.getOption('columns')) as number;
    this.width = columns > maxWidth ? maxWidth : columns - 4;
    return this;
  }
}

export const config = new Config();
