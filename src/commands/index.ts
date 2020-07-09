import { Dispose } from '../common/dispose';
import { ChangeCase } from './changeCase';

export class Commands extends Dispose {
  constructor() {
    super();
    this.push(new ChangeCase());
  }
}
