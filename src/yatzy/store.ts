import { createDiceStore } from '../dice/store';
import { YATZY } from './rules';

export const useYatzyStore = createDiceStore(YATZY, 'yatzy_state');
