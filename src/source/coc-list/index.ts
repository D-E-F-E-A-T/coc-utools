import {
  IList,
  ListAction,
  ListContext,
  ListItem,
} from 'coc.nvim'
import colors from 'colors/safe';

import { UTools } from '../../utools';

export default class UtoolsCommands implements IList {
  public readonly name = 'utools'
  public readonly description = 'trigger utools\'s sources'
  public readonly defaultAction = 'trigger'
  public actions: ListAction[] = []

  constructor(private utools: UTools) {
    this.actions.push({
      name: 'trigger',
      execute: async item => {
        const list: ListItem[] = ([] as ListItem[]).concat(item)
        this.utools.active(list[0].filterText)
      }
    })
  }

  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    const list: ListItem[] = []
    for (const source of Object.values(this.utools.sources)) {
      list.push({
        label: `${colors.yellow(source.name)} ${colors.grey(source.description)}`,
        filterText: source.name
      })
    }
    return list
  }
}
