import { OutputChannel } from 'coc.nvim';
import { ISource } from '../../utools'
import { Result } from '../../utools/result'
import { calc } from './parser';

let disable = false

const calculate: ISource = {
  name: 'Calculate',
  description: 'Calculate of utools',
  callback: async (input: string[], result: Result, output: OutputChannel | undefined) => {
    if (disable) {
      return
    }
    try {
      const res = calc(input.join(' '))
      result.updateContent([`= ${res}`])
    } catch (error) {
      result.updateContent(['='])
      output && output.appendLine(`Parse calculate error: ${error.stack || error.message || error}`)
    }
  },
  dispose: () => {
    disable = true
  }
}

export default calculate
