import { ExtensionContext, workspace, commands, listManager } from 'coc.nvim'
import { UTools } from './utools';
import { config } from './config';
import calculate from './source/calculate';
import UtoolsCommands from './source/coc-list';
import {registerActions} from './actions';

type Trace = 'off' | 'message' | 'verbose'

export async function activate(context: ExtensionContext): Promise<void> {
  let conf = workspace.getConfiguration('utools')
  let enable = conf.get<boolean>('enable', true)

  if (!enable) {
    return
  }

  const trace = conf.get<Trace>('trace.server', 'off')
  const output = trace !== 'off' ? workspace.createOutputChannel('coc-utools') : undefined

  // init configuration
  await config.init(workspace.nvim, conf)

  // init utools
  const utools = new UTools(workspace.nvim, output)
  context.subscriptions.push(utools)

  // register utools's commands List
  context.subscriptions.push(
    listManager.registerList(new UtoolsCommands(utools))
  )

  // register sources
  utools.register(calculate(context))

  // register command
  context.subscriptions.push(
    commands.registerCommand('utools.open', async () => {
      await utools.show()
    })
  )

  Object.values(utools.sources).forEach(source => {
    context.subscriptions.push(
      commands.registerCommand(`utools.${source.name}`, async () => {
        await utools.active(source.name)
      })
    )
  })

  // hide utools when blur
  context.subscriptions.push(
    workspace.registerAutocmd({
      event: 'WinEnter',
      arglist: [],
      request: true,
      callback: async () => {
        await utools.hideIfBlur()
      }
    })
  )

  context.subscriptions.push(
    registerActions()
  )
}
