import type { ReactNode } from 'react';
import { DEFAULT_PREFS, useSettings, type MotionPref, type Prefs } from '../app/settings';

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

function Switch({ name, title, note }: { name: 'satellites' | 'drifters' | 'lightRays' | 'autoplayMechanics' | 'largeText'; title: string; note?: string }) {
  const { prefs, setPref } = useSettings();
  return (
    <Field title={title} note={note}>
      <input type="checkbox" role="switch" className="set-switch" checked={prefs[name]} onChange={(e) => setPref(name, e.target.checked)} />
    </Field>
  );
}

function Choice<K extends 'driftPace' | 'quality'>({ name, title, options }: { name: K; title: string; options: Array<[Prefs[K], string]> }) {
  const { prefs, setPref } = useSettings();
  return (
    <Field title={title}>
      <select value={prefs[name]} onChange={(e) => setPref(name, e.target.value as Prefs[K])}>
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Personal options, saved on this device. Space options apply to the Observer and Flight views as you change them. */
export function SettingsPanel() {
  const { prefs, setPref, resetPrefs, motionPref, setMotionPref } = useSettings();
  return (
    <div className="settings-panel" role="group" aria-label="Settings">
      <h2>Settings</h2>
      <section>
        <h3>Space views</h3>
        <Switch name="satellites" title="Space station and satellites" />
        <Switch name="drifters" title="Things drifting off Earth" note="Prototype: lamps, chairs, bin bags and more" />
        {prefs.drifters && (
          <Choice
            name="driftPace"
            title="How often"
            options={[
              ['rare', 'Now and then'],
              ['normal', 'Regularly'],
              ['lots', 'A lot'],
            ]}
          />
        )}
        <Switch name="lightRays" title="Light rays" />
        <Field title="Sun brightness">
          <input type="range" min="0.4" max="1.3" step="0.1" value={prefs.sunBrightness} onChange={(e) => setPref('sunBrightness', Number(e.target.value))} />
        </Field>
        <Choice
          name="quality"
          title="Graphics quality"
          options={[
            ['auto', 'Automatic'],
            ['high', 'High'],
            ['low', 'Low (smoother)'],
          ]}
        />
      </section>
      <section>
        <h3>Reading</h3>
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
