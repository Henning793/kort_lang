import { createDiceStore } from '../dice/store';
import { DYREYATZY } from './rules';

export const useDyreyatzyStore = createDiceStore(DYREYATZY, 'dyreyatzy_state');
