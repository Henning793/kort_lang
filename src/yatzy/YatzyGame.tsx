import { DiceGame } from '../dice/DiceGame';
import { YATZY } from './rules';
import { useYatzyStore } from './store';

export function YatzyGame() {
  return <DiceGame def={YATZY} useStore={useYatzyStore} />;
}
