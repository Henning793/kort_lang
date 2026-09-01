import { useGameStore } from './store/gameStore';
import { SetupScreen } from './screens/SetupScreen';
import { PlayScreen } from './screens/PlayScreen';
import { ResultScreen } from './screens/ResultScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <div className="max-w-[480px] w-full mx-auto flex-1 flex flex-col min-h-screen">
        {screen === 'setup' && <SetupScreen />}
        {screen === 'play' && <PlayScreen />}
        {screen === 'result' && <ResultScreen />}
      </div>
    </div>
  );
}
