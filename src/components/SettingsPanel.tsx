import type { ReactNode } from 'react';
import { DEFAULT_PREFS, useSettings, type MotionPref } from '../app/settings';

function Field({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <label className="set-row">
      <span>
        {title}
        {note && <small>{note}</small>}
      </span>
      {children}
    </label>
  );
}

function Switch({ name, title, note }: { name: 'showSources' | 'autoplayMechanics' | 'largeText'; title: string; note?: string }) {
  const { prefs, setPref } = useSettings();
  return (
    <Field title={title} note={note}>
      <input type="checkbox" role="switch" className="set-switch" checked={prefs[name]} onChange={(e) => setPref(name, e.target.checked)} />
    </Field>
  );
}

/** Personal options, saved on this device. */
export function SettingsPanel() {
  const { prefs, resetPrefs, motionPref, setMotionPref } = useSettings();
  return (
    <div className="settings-panel" role="group" aria-label="Settings">
      <h2>Settings</h2>
      <section>
        <h3>Reading</h3>
        <Switch name="showSources" title="Source notes" note="How sure each fact is and where it comes from" />
        <Switch name="autoplayMechanics" title="Play mechanics automatically" />
        <Switch name="largeText" title="Larger text" />
        <Field title="Motion">
          <select value={motionPref} onChange={(e) => setMotionPref(e.target.value as MotionPref)}>
            <option value="system">Match this device</option>
            <option value="reduce">Reduced</option>
            <option value="full">Full</option>
          </select>
        </Field>
      </section>
      <button type="button" className="btn btn-quiet" disabled={JSON.stringify(prefs) === JSON.stringify(DEFAULT_PREFS)} onClick={resetPrefs}>
        Reset to defaults
      </button>
    </div>
  );
}
