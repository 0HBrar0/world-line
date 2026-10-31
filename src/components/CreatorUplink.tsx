import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useReduceMotion } from '../app/settings';
import { useFocusTrap } from './useFocusTrap';
import { CHECK_NEEDED, ERRORS, MAX_CONTACT, MAX_MESSAGE, isValid, loadTurnstile, transmit, type ContactMethod } from './uplink';

const METHODS: Array<{ id: Exclude<ContactMethod, 'none'>; label: string }> = [
  { id: 'email', label: 'Email' },
  { id: 'other', label: 'Other contact' },
];

/** A small floating signal button on every page. Its words stay in memory until they are delivered. */
export function CreatorUplink() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState<ContactMethod>('none');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const still = useReduceMotion();

  const close = useCallback(() => {
    setOpen(false);
    setSent(false);
    setError('');
    setChecking(false);
  }, []);

  const send = async (website: string, checkToken?: string) => {
    const draft = { message, contactMethod: method, contact, website };
    setError('');
    if (!isValid(draft)) {
      setError(ERRORS.validation);
      return;
    }
    setSending(true);
    setChecking(false);
    const failure = await transmit(draft, checkToken);
    setSending(false);
    if (failure === CHECK_NEEDED) {
      setChecking(true);
      return;
    }
    if (failure) {
      setError(failure);
      return;
    }
    setMessage('');
    setMethod('none');
    setContact('');
    setSent(true);
  };

  return (
    <div className={`uplink${still ? ' is-still' : ''}`}>
      <button
        ref={button}
        type="button"
        className="uplink-button"
        aria-label="Creator Uplink"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
          <path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 18.7a9.5 9.5 0 0 1 0-13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4" />
        </svg>
      </button>
      {!open && <span className="uplink-label" aria-hidden="true">Creator Uplink</span>}
      {open && (
        <UplinkPanel
          trigger={button}
          onClose={close}
          onSend={send}
          onCheckFailed={() => {
            setChecking(false);
            setError(ERRORS.rateLimit);
          }}
          {...{ message, setMessage, method, setMethod, contact, setContact, sending, sent, error, checking }}
        />
      )}
    </div>
  );
}

interface PanelProps {
  trigger: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSend: (website: string, checkToken?: string) => void;
  onCheckFailed: () => void;
  message: string;
  setMessage: (value: string) => void;
  method: ContactMethod;
  setMethod: (value: ContactMethod) => void;
  contact: string;
  setContact: (value: string) => void;
  sending: boolean;
  sent: boolean;
  error: string;
  checking: boolean;
}

/** The human check. It is usually invisible and sends the signal by itself once it passes. */
function HumanCheck({ onPass, onFail }: { onPass: (token: string) => void; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onPass, onFail });
  handlers.current = { onPass, onFail };

  useEffect(() => {
    let gone = false;
    let remove = () => {};
    loadTurnstile()
      .then((turnstile) => {
        if (gone || !host.current) return;
        const id = turnstile.render(host.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          theme: 'dark',
          appearance: 'interaction-only',
          callback: (token: string) => handlers.current.onPass(token),
          'error-callback': () => handlers.current.onFail(),
        });
        remove = () => turnstile.remove(id);
      })
      .catch(() => handlers.current.onFail());
    return () => {
      gone = true;
      remove();
    };
  }, []);

  return (
    <div className="uplink-check">
      <p>That’s a lot of signals. One quick check, then yours will go through.</p>
      <div ref={host} />
    </div>
  );
}

function UplinkPanel({ trigger, onClose, onSend, onCheckFailed, message, setMessage, method, setMethod, contact, setContact, sending, sent, error, checking }: PanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const supportUrl: string | undefined = import.meta.env.VITE_SUPPORT_URL;
  useFocusTrap(panel, onClose);

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) onClose();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [onClose, trigger]);

  // The send button leaves with the form, so focus needs somewhere to land.
  useEffect(() => {
    if (sent) closeButton.current?.focus();
  }, [sent]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!sending && !checking) onSend(trap.current?.value ?? '');
  };

  return (
    <div ref={panel} className="uplink-panel" role="dialog" aria-modal="true" aria-labelledby="uplink-title">
      <div className="uplink-head">
        <h2 id="uplink-title">CREATOR UPLINK</h2>
        <button ref={closeButton} type="button" className="uplink-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div role="status" className="uplink-sent">
        {sent && (
          <>
            <strong>SIGNAL TRANSMITTED</strong>
            <p>Your transmission has been delivered to the creator.</p>
          </>
        )}
      </div>
      {!sent && (
        <form onSubmit={submit} noValidate>
          <p>Have something to say? Send a signal to the person behind World Line.</p>
          <label htmlFor="uplink-message">Your message</label>
          <textarea id="uplink-message" rows={4} maxLength={MAX_MESSAGE} placeholder="Write something..." aria-describedby="uplink-limit" value={message} onChange={(e) => setMessage(e.target.value)} />
          <small id="uplink-limit">Maximum 500 characters.</small>

          <h3>Want to stay in touch?</h3>
          <p>Leave your contact information and I’ll get back to you if I can.</p>
          <div className="uplink-methods" role="group" aria-label="Contact method">
            {METHODS.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={method === id} onClick={() => setMethod(method === id ? 'none' : id)}>
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            aria-label="Your email or preferred contact"
            aria-describedby="uplink-anon"
            placeholder="Your email or preferred contact"
            autoComplete={method === 'email' ? 'email' : 'off'}
            inputMode={method === 'email' ? 'email' : 'text'}
            maxLength={MAX_CONTACT}
            disabled={method === 'none'}
            value={method === 'none' ? '' : contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <small id="uplink-anon">Leave this blank if you prefer to remain anonymous.</small>

          <div className="uplink-trap">
            <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" aria-hidden="true" />
          </div>

          {checking && <HumanCheck onPass={(token) => onSend(trap.current?.value ?? '', token)} onFail={onCheckFailed} />}
          <button type="submit" className="uplink-send" disabled={sending || checking}>
            {sending ? 'TRANSMITTING...' : 'TRANSMIT SIGNAL'}
          </button>
          <p role="alert" className="uplink-error">{error}</p>
          <small className="uplink-privacy">
            Your message and any contact information you provide will be sent to the website creator through a notification service. Contact information is optional and will only be used to respond to your message.
          </small>
        </form>
      )}
      {supportUrl && (
        <a className="uplink-support" href={supportUrl} target="_blank" rel="noopener noreferrer">
          Support World Line
        </a>
      )}
    </div>
  );
}
