import { useRef, useState } from 'react';
import { readStore, writeStore } from '../app/storage';
import { supportsWebGL } from '../features/follow/spaceStops';
import { useFocusTrap } from './useFocusTrap';

const SEEN = 'wl.deviceNotice';
const SMALL_SCREEN = 768;

type Limit = 'touch' | 'graphics';

function deviceLimit(): Limit | null {
  if (window.innerWidth < SMALL_SCREEN || window.matchMedia?.('(pointer: coarse)').matches) return 'touch';
  return supportsWebGL() ? null : 'graphics';
}

const WORDS: Record<Limit, { title: string; body: string }> = {
  touch: {
    title: 'World Line is made for a computer',
    body: 'You can read the whole story here, but the 3D space scenes may run slowly or look wrong on this device, and the zoomable map, Mars and the clickable objects need a mouse. For the full thing, open it on a laptop or desktop.',
  },
  graphics: {
    title: 'The 3D scenes can’t run here',
    body: 'This browser isn’t using a graphics chip, so space is replaced by a flat chart. Everything in the story still works. For the full thing, turn on hardware acceleration in your browser or use a computer that has it.',
  },
};

/** Told once, on the first visit, and only on devices that would miss part of the site. */
export function DeviceNotice() {
  const [limit, setLimit] = useState<Limit | null>(() => (readStore(SEEN, false) ? null : deviceLimit()));
  if (!limit) return null;
  const close = () => {
    writeStore(SEEN, true);
    setLimit(null);
  };
  return <NoticeBox limit={limit} onClose={close} />;
}

function NoticeBox({ limit, onClose }: { limit: Limit; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, onClose);
  const words = WORDS[limit];
  return (
    <div className="device-notice-back">
      <div ref={box} className="device-notice" role="dialog" aria-modal="true" aria-labelledby="device-notice-title">
        <h2 id="device-notice-title">{words.title}</h2>
        <p>{words.body}</p>
        <button type="button" className="btn" onClick={onClose}>
          Continue anyway
        </button>
      </div>
    </div>
  );
}
