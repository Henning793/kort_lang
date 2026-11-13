import { useYatzyStore } from './store';
import { YatzySetup } from './YatzySetup';
import { YatzyPlay } from './YatzyPlay';
import { YatzyResult } from './YatzyResult';

export function YatzyGame() {
  const screen = useYatzyStore((s) => s.screen);
  if (screen === 'play') return <YatzyPlay />;
  if (screen === 'result') return <YatzyResult />;
  return <YatzySetup />;
}
