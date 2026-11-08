import { characterById } from '../../data/selectors';

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

/** The photo slot of a character file, for anyone without a picture in src/assets/characters. */
export function Portrait({ id, className }: { id: string; className?: string }) {
  return (
    <span className={`file-photo ${className ?? ''}`} aria-hidden="true">
      <span className="file-mono">{initials(characterById(id)?.name ?? '')}</span>
      <span className="file-note">No photo on file</span>
    </span>
  );
}
