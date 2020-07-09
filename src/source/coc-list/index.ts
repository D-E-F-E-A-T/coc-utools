import { IList, ListAction, ListItem } from 'coc.nvim';
import colors from 'colors/safe';

import { utools } from '../../utools';

export class UtoolsSources implements IList {
  public readonly name = 'utools';
  public readonly description = "utools's sources list";
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];

  constructor() {
    this.actions.push({
      name: 'open',
      execute: async item => {
        const list: ListItem[] = ([] as ListItem[]).concat(item);
        if (list && list[0] && list[0].data) {
          utools.active(list[0].data.name);
        }
      },
    });
  }

  public async loadItems(): Promise<ListItem[]> {
    const list: ListItem[] = [];
    for (const source of Object.values(utools.sources)) {
      list.push({
        label: `${colors.yellow(source.name)} ${colors.grey(source.description)}`,
        data: {
          name: source.name,
        },
      });
    }
    return list;
  }
}
