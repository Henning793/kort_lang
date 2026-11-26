import { DiceGame } from '../dice/DiceGame';
import { DYREYATZY } from './rules';
import { useDyreyatzyStore } from './store';

export function DyreyatzyGame() {
  return <DiceGame def={DYREYATZY} useStore={useDyreyatzyStore} />;
}
