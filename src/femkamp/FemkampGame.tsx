import { useFemkampStore } from './store';
import { FemkampSetup } from './FemkampSetup';
import { FemkampPlay } from './FemkampPlay';
import { FemkampResult } from './FemkampResult';

export function FemkampGame() {
  const screen = useFemkampStore((s) => s.screen);
  if (screen === 'play') return <FemkampPlay />;
  if (screen === 'result') return <FemkampResult />;
  return <FemkampSetup />;
}
