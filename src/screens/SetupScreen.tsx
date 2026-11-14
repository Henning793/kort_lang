import { useGameStore } from '../store/gameStore';
import { SetupHero, PlayerSetupList, StartButton, SectionLabel } from '../components/game/SetupParts';
import { playerColor } from '../components/game/colors';
import { ROUNDS } from '../game/rounds';

/** Små søyler for kort (lav) og lang (høy). */
function Bars({ combo, scale = 1, light = false }: { combo: number[]; scale?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-end gap-[3px]" style={{ height: 44 * scale }}>
      {combo.map((h, i) => (
        <i
          key={i}
          className={`block rounded-[3px] border-[1.5px] ${light ? 'bg-white/85 border-white' : 'bg-accent-200 border-accent'}`}
          style={{ height: h * scale, width: 14 * scale }}
        />
      ))}
    </span>
  );
}

export function SetupScreen() {
  const s = useGameStore();
  const n = s.players.length;

  return (
    <div className="px-5 pt-3 pb-10 flex flex-col gap-5">
      <SetupHero
        color={playerColor(0)}
        title="Kort og lang"
        tagline="Sju runder. Færrest poeng vinner."
        art={
          <span className="yz-roll inline-block" style={{ ['--r' as string]: '-8deg' }}>
            <Bars combo={[26, 44, 44]} scale={1.15} light />
          </span>
        }
      />

      <PlayerSetupList
        players={s.players}
        onName={s.updateName}
        onRemove={s.removePlayer}
        onAdd={s.addPlayer}
        canAdd={n < 8}
        canRemove={n > 2}
        firstLabel="Stokker i runde 1"
      />
      <p className="m-0 -mt-2 px-1 text-sm opacity-60">Du kan endre navn senere, men ikke antall spillere.</p>

      <StartButton players={s.players} onClick={s.startGame} />

      <div className="flex flex-col gap-2">
        <SectionLabel>Rundene</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {ROUNDS.map((r, k) => (
            <div key={r.label} className="rounded-card bg-surface flex flex-col items-center gap-1 py-2" title={r.label}>
              <Bars combo={r.combo} scale={0.55} />
              <span className="font-heading text-sm opacity-55">{k + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
