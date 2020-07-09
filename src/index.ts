import { ExtensionContext, workspace, listManager } from 'coc.nvim';

import { utools } from './utools';
import { config } from './common/config';
import { UtoolsSources } from './source/coc-list';
import { registerActions } from './actions';
import { logger, logLevel } from './common/logger';
import { UtoolsSource } from './utools/sources';
import { Commands } from './commands';

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

  // register sources List
  context.subscriptions.push(listManager.registerList(new UtoolsSources()));

  // register utools's sources
  context.subscriptions.push(new UtoolsSource());

  // init change case command
  context.subscriptions.push(new Commands());

  // register actions
  context.subscriptions.push(registerActions());
}
