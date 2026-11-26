import type { ReactNode } from 'react';
import { Hand, Smartphone } from 'lucide-react';
import { SetupHero, PlayerSetupList, StartButton, SectionLabel } from '../components/game/SetupParts';
import { useDiceGame } from './context';
import { DiceFace } from './DiceFace';
import type { DiceMode, SheetMode } from './types';

const MODES: { id: SheetMode; label: string; text: string; faces: number[] }[] = [
  { id: 'fri', label: 'Fri', text: 'Velg selv hvilken rute du fyller ut.', faces: [6, 2, 4] },
  { id: 'tvungen', label: 'Tvungen', text: 'Fyll ut rutene ovenfra og ned.', faces: [1, 2, 3] },
];

function Choice({ on, onClick, icon, label, text }: { on: boolean; onClick: () => void; icon: ReactNode; label: string; text: string }) {
  return (
    <button
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`rounded-card p-3 flex flex-col items-start gap-1.5 text-left border-2 cursor-pointer transition-colors ${
        on ? 'bg-accent border-accent text-bg' : 'bg-surface border-transparent hover:bg-black/5'
      }`}
    >
      <span className="flex gap-1 h-[22px] items-center">{icon}</span>
      <span className="font-heading text-lg leading-tight">{label}</span>
      <span className={`text-[13px] leading-snug ${on ? 'opacity-90' : 'opacity-65'}`}>{text}</span>
    </button>
  );
}

export function DiceSetup() {
  const { def, useStore } = useDiceGame();
  const s = useStore();
  const n = s.players.length;
  const artFaces = def.kind === 'dyr' ? [1, 6] : [5, 3];

  const DICE: { id: DiceMode; label: string; text: string; icon: ReactNode }[] = [
    {
      id: 'fysisk',
      label: 'Egne terninger',
      text: 'Kast på bordet og før poengene her.',
      icon: <Hand size={20} strokeWidth={2.25} />,
    },
    {
      id: 'app',
      label: 'Trill i appen',
      text: 'Rist telefonen for å kaste terningene.',
      icon: <Smartphone size={20} strokeWidth={2.25} />,
    },
  ];

  return (
    <div className="px-5 pt-3 pb-10 flex flex-col gap-5">
      <SetupHero
        color={def.color}
        title={def.title}
        tagline={def.tagline}
        art={
          <div className="relative w-[64px] h-[56px]">
            <DiceFace kind={def.kind} face={artFaces[0]} size={36} className="absolute! left-0 top-0 yz-roll" style={{ ['--r' as string]: '-12deg' }} />
            <DiceFace
              kind={def.kind}
              face={artFaces[1]}
              size={32}
              className="absolute! right-0 bottom-0 yz-roll"
              style={{ ['--r' as string]: '10deg', animationDelay: '90ms' }}
            />
          </div>
        }
      />

      <div className="flex flex-col gap-2">
        <SectionLabel>Terninger</SectionLabel>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Terninger">
          {DICE.map((m) => (
            <Choice
              key={m.id}
              on={s.diceMode === m.id}
              onClick={() => s.setDiceMode(m.id)}
              icon={m.icon}
              label={m.label}
              text={m.text}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Spillmåte</SectionLabel>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Spillmåte">
          {MODES.map((m) => (
            <Choice
              key={m.id}
              on={s.mode === m.id}
              onClick={() => s.setMode(m.id)}
              icon={m.faces.map((f, i) => (
                <DiceFace key={i} kind={def.kind} face={f} size={22} />
              ))}
              label={m.label}
              text={m.text}
            />
          ))}
        </div>
      </div>

      <PlayerSetupList
        players={s.players}
        onName={s.updateName}
        onRemove={s.removePlayer}
        onAdd={s.addPlayer}
        canAdd={n < def.maxPlayers}
        canRemove={n > def.minPlayers}
        firstLabel="Starter"
      />

      <StartButton players={s.players} onClick={s.startGame} />

      <p className="m-0 px-1 text-sm opacity-65">
        {def.bonus} poeng i bonus hvis du får minst {def.bonusLimit} på{' '}
        {def.kind === 'dyr' ? 'dyrerutene' : 'enere til seksere'}.
      </p>
    </div>
  );
}
