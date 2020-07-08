import { ExtensionContext, workspace, commands, listManager } from 'coc.nvim';

import { utools } from './utools';
import { config } from './common/config';
import UtoolsCommands from './source/coc-list';
import { registerActions } from './actions';
import { ChangeCase } from './commands/changeCase';
import { logger, logLevel } from './common/logger';
import { UtoolsSource } from './utools/sources';

export async function activate(context: ExtensionContext): Promise<void> {
  const conf = workspace.getConfiguration('utools');
  const enable = conf.get<boolean>('enable', true);

  if (!enable) {
    return;
  }

  // init logger
  context.subscriptions.push(logger.init(conf.get<logLevel>('trace.server', 'off')));

  // init config
  context.subscriptions.push(await config.init(conf));

  // init utools
  context.subscriptions.push(utools);

  // register utools's commands List
  context.subscriptions.push(listManager.registerList(new UtoolsCommands()));

  // register utools's source
  context.subscriptions.push(new UtoolsSource());

  // register command
  context.subscriptions.push(
    commands.registerCommand('utools.open', async () => {
      await utools.show();
    }),
  );

  // register actions
  context.subscriptions.push(registerActions());

  // init change case command
  context.subscriptions.push(new ChangeCase());
}
