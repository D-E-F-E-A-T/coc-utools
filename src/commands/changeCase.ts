import * as changeCase from 'change-case';
import { commands, workspace, Document } from 'coc.nvim';
import { Range } from 'vscode-languageserver-protocol';
import { Dispose } from '../common/dispose';
import { extensionId } from '../common/constant';

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
  private name = 'changeCase';

  constructor() {
    super();
    this.registerAllCases();
    this.registerToggle();
  }

  async getRange(doc: Document) {
    const position = await workspace.getCursorPosition();
    if (!position) {
      return;
    }
    return doc.getWordRangeAtPosition(position);
  }

  async getWord(doc: Document, range: Range): Promise<string | undefined> {
    return doc.textDocument.getText(range);
  }

  registerToggle() {
    this.push(
      commands.registerCommand(`${extensionId}.${this.name}.toggle`, async (range?: Range) => {
        const doc = await workspace.document;
        if (!doc) {
          return;
        }
        if (!range) {
          range = await this.getRange(doc);
          if (!range) {
            return;
          }
        }
        const word = await this.getWord(doc, range);
        if (!word) {
          return;
        }
        const config = workspace.getConfiguration(extensionId);
        const toggleCases = config.get<string[]>(`${this.name}.toggle`, []);
        if (!toggleCases.length) {
          return;
        }
        const idx = toggleCases.findIndex(v => !!changeCase[v] && changeCase[v](word) === word);
        const nextCase = toggleCases[idx + 1] || toggleCases[0];
        const newWord = changeCase[nextCase] ? changeCase[nextCase](word) : word;
        if (newWord !== word) {
          doc.applyEdits([
            {
              range,
              newText: newWord,
            },
          ]);
          const diffLen = word.length - newWord.length;
          if (diffLen > 0) {
            const cursor = await workspace.getCursorPosition();
            // make cursor on the word
            if (cursor.character > range.end.character - 1 - diffLen) {
              const win = await workspace.nvim.window;
              await win.setCursor([cursor.line + 1, range.end.character - 1 - diffLen]);
            }
          }
        }
      }),
    );
  }

  registerAllCases() {
    cases.forEach(funcName => {
      if (changeCase[funcName]) {
        this.push(
          commands.registerCommand(
            `${extensionId}.${this.name}.${funcName}`,
            async (range: Range | undefined) => {
              const doc = await workspace.document;
              if (!doc) {
                return;
              }
              if (!range) {
                range = await this.getRange(doc);
                if (!range) {
                  return;
                }
              }
              const word = await this.getWord(doc, range);
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
