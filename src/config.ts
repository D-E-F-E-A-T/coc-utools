import { Neovim, WorkspaceConfiguration } from 'coc.nvim';

export const config = {
  width: 70,
  async init(nvim: Neovim, config: WorkspaceConfiguration) {
    const maxWidth = config.get<number>('maxWidth', 70)
    const columns = await nvim.getOption('columns') as number
    this.width = columns > maxWidth ? maxWidth : columns - 4
  }
}
