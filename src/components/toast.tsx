import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { TIER_ORDER, useSettings } from '../app/settings';

interface ToastApi {
  showLocked: () => void;
}

const ToastContext = createContext<ToastApi>({ showLocked: () => undefined });

export const useToast = () => useContext(ToastContext);

/** Deep links to locked items land here. The URL and the item are never echoed back. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { tier, setTier } = useSettings();
  const showLocked = useCallback(() => setOpen(true), []);
  const api = useMemo(() => ({ showLocked }), [showLocked]);
  const next = TIER_ORDER[TIER_ORDER.indexOf(tier) + 1];

  return (
    <ToastContext.Provider value={api}>
      {children}
      {open && (
        <div className="toast" role="status">
          <p>This part is locked at your current spoiler level.</p>
          <div className="row">
            {next && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setTier(next);
                  setOpen(false);
                }}
              >
                Raise spoiler level
              </button>
            )}
            <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
