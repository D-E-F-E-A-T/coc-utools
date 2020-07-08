import { Dispose } from '../../common/dispose';
import { Mathjs } from './mathjs';
import { utools } from '../';

export class UtoolsSource extends Dispose {
  constructor() {
    super();
    utools.register(new Mathjs());
  }
}
