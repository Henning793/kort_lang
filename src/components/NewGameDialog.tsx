import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useGameStore } from '../store/gameStore';

type Props = { open: boolean; onClose: () => void };

export function NewGameDialog({ open, onClose }: Props) {
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <Dialog
      open={open}
      title="Start nytt spill?"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              resetGame();
              onClose();
            }}
          >
            Start nytt
          </Button>
        </>
      }
    >
      <div className="text-sm opacity-85">
        Dette nullstiller alle spillere og poeng. Du kan ikke angre dette.
      </div>
    </Dialog>
  );
}
