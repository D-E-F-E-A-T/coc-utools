import * as changeCase from 'change-case'
import {Disposable, commands} from 'coc.nvim'
import {Range} from 'vscode-languageserver-protocol'

const cases = [
  'camelCase',
  'capitalCase',
  'constantCase',
  'dotCase',
  'headerCase',
  'noCase',
  'paramCase',
  'pascalCase',
  'pathCase',
  'sentenceCase',
  'snakeCase',
  'titleCase',
  'swapCase',
  'isLowerCase',
  'isUpperCase',
  'lowerCase',
  'lowerCaseFirst',
  'upperCase',
  'upperCaseFirst',
  'spongeCase',
]

export const registerChangeCase = (): Disposable[] => {
  let subscriptions: Disposable[] = []
  Disposable.create(() => {
    subscriptions.forEach(f => f.dispose())
    subscriptions = []
  })
  cases.forEach(funcName => {
    if (changeCase[funcName]) {
      commands.registerCommand(`utools.changeCase.${funcName}`, (range: Range) => {
      }, null, true)
    }
  })
  return subscriptions
}
