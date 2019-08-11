import { ExtensionContext, workspace, commands } from 'coc.nvim'
import { UTools } from './utools';
import { config } from './config';
import calculate from './source/calculate';

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

  // register sources
  utools.register(calculate)

  // register command
  context.subscriptions.push(
    commands.registerCommand('utools.open', async () => {
      await utools.show()
    })
  )

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
}
