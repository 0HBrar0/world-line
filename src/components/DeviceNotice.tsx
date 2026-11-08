import { useRef, useState } from 'react';
import { readStore, writeStore } from '../app/storage';
import { useFocusTrap } from './useFocusTrap';

const SEEN = 'wl.deviceNotice';
const SMALL_SCREEN = 768;

const isTouch = () => window.innerWidth < SMALL_SCREEN || !!window.matchMedia?.('(pointer: coarse)').matches;

/** Told once, on the first visit, and only on phones and tablets, which miss the charts. */
export function DeviceNotice() {
  const [show, setShow] = useState(() => !readStore(SEEN, false) && isTouch());
  if (!show) return null;
  const close = () => {
    writeStore(SEEN, true);
    setShow(false);
  };
  return <NoticeBox onClose={close} />;
}

function NoticeBox({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, onClose);
  return (
    <div className="device-notice-back">
      <div ref={box} className="device-notice" role="dialog" aria-modal="true" aria-labelledby="device-notice-title">
        <h2 id="device-notice-title">World Line is made for a computer</h2>
        <p>You can read the whole story here, but the world-line chart and the zoomable map need a bigger screen and a mouse. For the full thing, open it on a laptop or desktop.</p>
        <button type="button" className="btn" onClick={onClose}>
          Continue anyway
        </button>
      </div>
    </div>
  );
}
