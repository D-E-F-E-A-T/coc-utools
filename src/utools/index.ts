import { workspace, commands } from 'coc.nvim';

import { InputWidget } from './input';
import { Title } from './title';
import { Result } from './result';
import { logger } from '../common/logger';
import { fuzzy } from '../common/fuzzy';
import { Dispose } from '../common/dispose';
import { extensionId } from '../common/constant';

const log = logger.getLog('utools');

export interface USource {
  name: string;
  description: string;
  resolve: (input: string[], result: Result) => Promise<any> | any;
  dispose: () => Promise<any> | any;
}

class UTools extends Dispose {
  private isVisible = false;
  private input: InputWidget;
  private title: Title;
  private result: Result;

  public activeSource: string | undefined;
  public sources: USource[] = [];

  constructor() {
    super();
    this.input = new InputWidget();
    this.title = new Title();
    this.result = new Result(this.input);
    this.input.onChange(this.onInputChange);

    // register command
    this.push(
      commands.registerCommand(`${extensionId}.open`, async () => {
        await this.show();
      }),
    );
    // hide utools when blur
    this.push(
      workspace.registerAutocmd({
        event: 'WinEnter',
        arglist: [],
        request: true,
        callback: async () => {
          await this.hideIfBlur();
        },
      }),
    );
  }

  private onInputChange = async (input: string[]) => {
    if (this.activeSource) {
      this.sources.some(s => {
        if (this.activeSource === s.name) {
          s.resolve(input, this.result);
          return true;
        }
        return false;
      });
    } else {
      this.filter(input);
    }
  };

  public async register(source: USource) {
    log(`register source: ${source.name}`);
    this.sources.push(source);
    this.push(
      commands.registerCommand(`utools.${source.name}`, async () => {
        await this.active(source.name);
      }),
    );
  }

  public async active(name: string) {
    await this.show();
    this.activeSource = name;
    await this.title.setTitle(name);
  }

  public filter(input: string[]) {
    let names = this.sources.map(s => s.name);
    if (input.length > 0 && input[0].trim().length > 0) {
      names = names.filter(name => {
        const query = input.join().trim();
        const score = fuzzy(name, query);
        return score >= query.length;
      });
    }
    this.result.updateContent(names);
  }

  public async show() {
    if (this.isVisible) {
      return;
    }
    const { nvim } = workspace;
    this.isVisible = true;
    await this.title.init();
    await this.input.init();
    this.onInputChange([]);
    this.push(
      workspace.registerLocalKeymap('n', '<Esc>', () => {
        this.hide();
      }),
    );
    this.push(
      workspace.registerExprKeymap(
        'i',
        '<c-o>',
        async () => {
          await nvim.command('stopinsert');
          await nvim.setWindow(this.result.window);
        },
        true,
      ),
    );
  }

  public async hideIfBlur() {
    if (!this.isVisible) {
      return;
    }
    const { nvim } = workspace;
    const { input, result } = this;
    const win = await nvim.window;
    if ([input.winId, result.winId].indexOf(win.id) === -1) {
      await this.hide();
    }
  }

  public async hide() {
    if (!this.isVisible) {
      return;
    }
    await this.input.dispose();
    await this.title.dispose();
    await this.result.dispose();
    this.activeSource = '';
    this.isVisible = false;
  }

  public async dispose() {
    super.dispose();
    for (const source of this.sources) {
      await source.dispose();
    }
    this.sources = [];
    await this.hide();
  }
}

export const utools = new UTools();
