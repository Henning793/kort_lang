import { useEffect, useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useGameStore } from '../store/gameStore';

type Props = {
  open: boolean;
  playerId: string | null;
  playerName: string;
  round: number;
  onClose: () => void;
};

export function EditScoreDialog({ open, playerId, playerName, round, onClose }: Props) {
  const scores = useGameStore((s) => s.scores);
  const editScore = useGameStore((s) => s.editScore);
  const [pad, setPad] = useState('');

  useEffect(() => {
    if (open && playerId != null) {
      const existing = scores[playerId]?.[round];
      setPad(existing != null ? String(existing) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, playerId, round]);

  if (!open || playerId == null) return null;

  function pressDigit(d: number) {
    setPad((p) => (p.replace('-', '').length >= 4 ? p : p + String(d)));
  }
  function backspace() {
    setPad((p) => p.slice(0, -1));
  }
  function toggleSign() {
    setPad((p) => (p.startsWith('-') ? p.slice(1) : '-' + p));
  }

  const empty = pad === '' || pad === '-';

  function confirm() {
    if (empty || playerId == null) return;
    editScore(playerId, round, parseInt(pad, 10));
    onClose();
  }

  return (
    <Dialog
      open={open}
      title={`Rediger runde ${round + 1}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={confirm} disabled={empty}>
            Bekreft
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-85">{playerName}</div>
      <div className="bg-bg rounded-md p-3.5 text-center font-heading text-3xl">
        {pad === '' ? '0' : pad}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button key={n} variant="secondary" onClick={() => pressDigit(n)} className="text-lg py-3.5">
            {n}
          </Button>
        ))}
        <Button variant="secondary" onClick={toggleSign} className="text-lg py-3.5">
          ±
        </Button>
        <Button variant="secondary" onClick={() => pressDigit(0)} className="text-lg py-3.5">
          0
        </Button>
        <Button variant="secondary" onClick={backspace} className="text-lg py-3.5">
          ⌫
        </Button>
      </div>
    </Dialog>
  );
}
