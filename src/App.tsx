import { useGameStore } from './store/gameStore';
import { useAppStore } from './store/appStore';
import { SetupScreen } from './screens/SetupScreen';
import { PlayScreen } from './screens/PlayScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HubScreen } from './screens/HubScreen';
import { FemkampGame } from './femkamp/FemkampGame';

function KortOgLang() {
  const screen = useGameStore((s) => s.screen);
  return (
    <>
      {screen === 'setup' && <SetupScreen />}
      {screen === 'play' && <PlayScreen />}
      {screen === 'result' && <ResultScreen />}
    </>
  );
}

export default function App() {
  const view = useAppStore((s) => s.view);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <div className="max-w-[480px] w-full mx-auto flex-1 flex flex-col min-h-screen">
        {view === 'hub' && <HubScreen />}
        {view === 'kortlang' && <KortOgLang />}
        {view === 'femkamp' && <FemkampGame />}
      </div>
    </div>
  );
}
