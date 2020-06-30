import { languages, workspace } from 'coc.nvim';
import {
  TextDocument,
  Range,
  CodeActionContext,
  CancellationToken,
  Command,
  CodeAction,
} from 'vscode-languageserver-protocol';

export const registerActions = () => {
  return languages.registerCodeActionProvider(
    null,
    {
      async provideCodeActions(
        document: TextDocument,
        range: Range,
        context: CodeActionContext,
        token: CancellationToken,
      ): Promise<(Command | CodeAction)[]> {
        workspace.showMessage(`${JSON.stringify(range)}`);
        return [];
      },
    },
    'Utools',
  );
};
