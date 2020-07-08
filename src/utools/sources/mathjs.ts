import { evaluate } from 'mathjs';

import { USource } from '..';
import { Result } from '../result';
import { logger } from '../../common/logger';
import { Dispose } from '../../common/dispose';

const log = logger.getLog('Mathjs');

export class Mathjs extends Dispose implements USource {
  isDisabled = false;
  name = 'Mathjs';
  description = 'Mathjs evaluate of utools';
  resolve = async (input: string[], result: Result) => {
    if (this.isDisabled) {
      return;
    }
    try {
      const res = evaluate(input.join(' '));
      result.updateContent([`= ${res}`]);
    } catch (error) {
      result.updateContent(['=']);
      log(`Parse calculate error: ${error.stack || error.message || error}`);
    }
  };
  dispose = () => {
    this.isDisabled = false;
  };
}
