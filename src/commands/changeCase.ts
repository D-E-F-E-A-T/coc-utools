import * as changeCase from 'change-case';
import { commands, workspace } from 'coc.nvim';
import { Range } from 'vscode-languageserver-protocol';
import { Dispose } from '../common/dispose';

const cases: string[] = [
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
];

export class ChangeCase extends Dispose {
  constructor() {
    super();
    cases.forEach(funcName => {
      if (changeCase[funcName]) {
        this.push(
          commands.registerCommand(
            `utools.changeCase.${funcName}`,
            async (range: Range | undefined) => {
              const doc = await workspace.document;
              if (!doc) {
                return;
              }
              if (!range) {
                const position = await workspace.getCursorPosition();
                if (!position) {
                  return;
                }
                range = doc.getWordRangeAtPosition(position);
              }
              if (!range) {
                return;
              }
              const word = doc.textDocument.getText(range);
              if (!word) {
                return;
              }
              const newWord = changeCase[funcName](word);
              doc.applyEdits([
                {
                  range,
                  newText: newWord,
                },
              ]);
            },
            null,
          ),
        );
      }
    });
  }
}
