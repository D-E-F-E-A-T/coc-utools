import { join } from 'path';
import { OutputChannel, ExtensionContext } from 'coc.nvim';
import { USource } from '../../utools';
import { Result } from '../../utools/result';
import { existsSync, readFileSync } from 'fs';
import { download } from './download';

let disable = false;
const ecdictName = 'ecdict.csv';
let list: string[][] = [];

export default async function activate(context: ExtensionContext): Promise<USource> {
  const ecdictPath = join(context.storagePath, ecdictName);
  if (!existsSync(ecdictPath)) {
    await download(ecdictPath);
  }
  list = readFileSync(ecdictPath, { encoding: 'utf-8' })
    .toString()
    .split('\n')
    .map(line => line.split(','));
  return {
    name: 'ECDICT',
    description: 'dictionary by ECDICT',
    callback: async (input: string[], result: Result, output: OutputChannel | undefined) => {
      if (disable) {
        return;
      }
      const query = input.join();
      try {
      } catch (error) {
        result.updateContent(['=']);
        output && output.appendLine(`Parse calculate error: ${error.stack || error.message || error}`);
      }
    },
    dispose: () => {
      disable = true;
    },
  };
}
