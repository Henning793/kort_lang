import { useState } from 'react';
import { Check, Undo2 } from 'lucide-react';
import { CardIcon } from '../components/ui/CardIcon';
import { Button } from '../components/ui/Button';
import { PlayingCard } from '../components/ui/PlayingCard';
import { Stepper } from '../components/ui/Stepper';
import { BackButton } from '../components/BackButton';
import { DealerMark } from '../components/DealerMark';
import { TabSwitcher } from '../components/TabSwitcher';
import { Dialog } from '../components/ui/Dialog';
import { dealerIndex, computeStandings } from '../game/logic';
import { useFemkampStore } from './store';
import { FEMKAMP_ROUNDS, FEMKAMP_NUM_ROUNDS, cardsPerPlayer } from './rules';
import { roundPoints, checkCount, kabalFinishers, femkampScores, fmtPoints } from './logic';
import { RulesSheet } from './RulesSheet';
import { FemkampTable } from './FemkampTable';

function pointsClass(p: number) {
  return p > 0 ? 'text-accent-600' : p < 0 ? 'text-accent2-700' : 'opacity-40';
}

function PlayerName({ name, dealer }: { name: string; dealer: boolean }) {
  return (
    <span className="relative self-start font-heading text-[15px]">
      {name}
      {dealer && <DealerMark size={14} style={{ top: -9, right: -12 }} />}
    </span>
  );
}

export function FemkampPlay() {
  const s = useFemkampStore();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const r = s.view;
  const def = FEMKAMP_ROUNDS[r];
  const editingPast = r < s.current;

  const tag =
    def.mult === -1 ? (
      <span className="text-[11px] font-body font-semibold px-2 py-0.5 rounded-pill bg-accent2-100 text-accent2-800">
        Nå er stikk bra
      </span>
    ) : def.mult === 4 ? (
      <span className="text-[11px] font-body font-semibold px-2 py-0.5 rounded-pill bg-accent-100 text-accent-800">
        4 p per dame
      </span>
    ) : null;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <BackButton />
        <div className="flex items-center gap-2 font-heading text-[17px] mr-auto">
          <CardIcon size={18} />
          Femkamp
        </div>
        <Button variant="ghost" onClick={() => setRulesOpen(true)}>
          Regler
        </Button>
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          Nytt spill
        </Button>
      </div>

      <div className="px-5 pt-1 pb-3.5 flex flex-col gap-3">
        <h2 className="m-0 text-[23px]">
          Runde {r + 1} <span className="font-body text-sm opacity-50">av {FEMKAMP_NUM_ROUNDS}</span>
          {editingPast && <span className="font-body text-sm opacity-50"> · retter tidligere runde</span>}
        </h2>
        <div className="flex gap-1.5">
          {FEMKAMP_ROUNDS.map((x, k) => {
            const color = s.saved[k]
              ? 'bg-accent2-500 border-accent2-500'
              : k === s.current
                ? 'bg-accent-500 border-accent-500'
                : 'border-neutral-300';
            return (
              <button
                key={k}
                onClick={() => s.setView(k)}
                disabled={k > s.current}
                aria-label={`Runde ${k + 1}: ${x.name}`}
                className={`flex-1 h-2 rounded-pill border-[1.5px] p-0 cursor-pointer disabled:cursor-default ${color} ${
                  k === r ? 'outline-2 outline-ink outline-offset-2' : ''
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3 bg-surface px-3.5 py-3 rounded-card">
          <PlayingCard glyph={def.glyph} red={def.red} size="md" />
          <div className="min-w-0">
            <div className="font-heading text-base flex items-center gap-2 flex-wrap">
              {def.name} {tag}
            </div>
            <p className="m-0 text-[13px] opacity-70">{def.desc}</p>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4">
        <TabSwitcher tab={s.tab} onChange={s.setTab} />
      </div>

      {s.tab === 'poeng' ? def.kind === 'kabal' ? <KabalEntry /> : <CountEntry /> : <StillingTab />}

      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <Dialog
        open={confirmOpen}
        title="Start ny Femkamp?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Avbryt
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                s.resetGame();
                setConfirmOpen(false);
              }}
            >
              Start nytt
            </Button>
          </>
        }
      >
        <div className="text-sm opacity-85">
          Dette nullstiller alle spillere og poeng i Femkamp. Du kan ikke angre dette.
        </div>
      </Dialog>
    </div>
  );
}

function saveLabel(view: number, current: number) {
  if (view < current) return 'Oppdater runde';
  return view === FEMKAMP_NUM_ROUNDS - 1 ? 'Se sluttresultat' : 'Lagre runde';
}

function CountEntry() {
  const s = useFemkampStore();
  const r = s.view;
  const def = FEMKAMP_ROUNDS[r];
  const counts = s.counts[r];
  const check = checkCount(r, counts, cardsPerPlayer(s.players.length));
  const dIdx = dealerIndex(r, s.players.length);

  return (
    <div className="px-5 pb-7 flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-2">
        {s.players.map((p, i) => {
          const pts = roundPoints(s, r, i);
          return (
            <div key={p.id} className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-card bg-surface">
              <div className="flex-1 min-w-0 flex flex-col">
                <PlayerName name={p.name} dealer={i === dIdx} />
                <span className="text-xs opacity-60">{def.unit}</span>
              </div>
              <Stepper value={counts[i]} onChange={(d) => s.adjustCount(r, i, d)} label={def.unit ?? ''} />
              <span className={`min-w-[46px] text-right font-bold text-sm tabular-nums ${pointsClass(pts)}`}>
                {pts > 0 ? '+' : ''}
                {fmtPoints(pts)} p
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`text-[13px] flex items-center gap-1.5 px-1 ${
          check.state === 'ok'
            ? 'text-accent2-700'
            : check.state === 'over'
              ? 'text-accent-700 font-semibold'
              : 'opacity-60'
        }`}
      >
        {check.state === 'ok' && <Check size={15} strokeWidth={3} />}
        {check.text}
      </div>

      <Button variant="primary" block onClick={s.saveRound} className="text-base p-3.5 mt-auto">
        {saveLabel(r, s.current)}
      </Button>
    </div>
  );
}

function KabalEntry() {
  const s = useFemkampStore();
  const r = s.view;
  const k = s.kabal;
  const live = k.phase === 'live';
  const dIdx = dealerIndex(r, s.players.length);
  const finishers = kabalFinishers(k.left);
  const canSave = finishers.length === 1;

  return (
    <div className="px-5 pb-7 flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-2">
        {s.players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-card bg-surface">
            <div className="flex-1 min-w-0 flex flex-col">
              <PlayerName name={p.name} dealer={i === dIdx} />
              <span className="text-xs opacity-60 tabular-nums">
                {live ? `${k.pass[i]} pass` : `${k.pass[i]} pass + ${k.left[i]} kort`}
              </span>
            </div>
            {live ? (
              <>
                <button
                  onClick={() => s.adjustPass(i, -1)}
                  disabled={k.pass[i] === 0}
                  aria-label={`Angre pass for ${p.name}`}
                  className="w-9 h-9 grid place-items-center rounded-full border border-divider opacity-70 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Undo2 size={15} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => s.adjustPass(i, 1)}
                  className="flex items-center gap-1.5 bg-accent text-bg rounded-pill px-3.5 py-2 font-heading text-sm active:scale-95 transition-transform cursor-pointer"
                >
                  Pass
                  <span className="bg-white/25 rounded-pill px-1.5 font-body font-bold text-[13px]">+1</span>
                </button>
              </>
            ) : (
              <>
                <Stepper value={k.left[i]} onChange={(d) => s.adjustLeft(i, d)} label="kort" />
                <span className="min-w-[46px] text-right font-bold text-sm tabular-nums text-accent-600">
                  +{roundPoints(s, r, i)} p
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {live ? (
        <>
          <div className="text-[13px] opacity-60 px-1">
            Hver gang noen ikke kan legge på, trykker de på knappen sin. Poengene telles fortløpende.
          </div>
          <button
            onClick={() => s.setKabalPhase('count')}
            className="w-full mt-auto bg-accent2 text-bg rounded-pill p-3.5 font-heading text-base hover:bg-accent2-600 cursor-pointer"
          >
            Noen er ferdig – tell kort
          </button>
        </>
      ) : (
        <>
          <div
            className={`text-[13px] flex items-center gap-1.5 px-1 ${
              canSave ? 'text-accent2-700' : 'text-accent-700 font-semibold'
            }`}
          >
            {canSave ? (
              <>
                <Check size={15} strokeWidth={3} />
                {s.players[finishers[0]].name} vant runden
              </>
            ) : finishers.length === 0 ? (
              'Den som ble ferdig skal ha 0 kort igjen'
            ) : (
              'Legg inn hvor mange kort de andre har igjen. Bare én kan ha 0.'
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            <Button variant="secondary" onClick={() => s.setKabalPhase('live')}>
              Tilbake
            </Button>
            <Button variant="primary" onClick={s.saveRound} disabled={!canSave} className="flex-1 text-base p-3.5">
              {saveLabel(r, s.current)}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function StillingTab() {
  const s = useFemkampStore();
  const scores = femkampScores(s.players, s);
  const standings = computeStandings(s.players, scores, s.current);
  return (
    <div className="px-5 pb-7 flex flex-col gap-3">
      <FemkampTable standings={standings} scores={scores} showDealer />
      <p className="m-0 text-xs opacity-60">Trykk på en fullført prikk over for å rette en tidligere runde.</p>
    </div>
  );
}
