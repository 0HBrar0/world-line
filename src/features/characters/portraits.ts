// Images added to src/assets/characters are picked up by name: okabe.jpg belongs to the character with id okabe.
const files = import.meta.glob<string>('../../assets/characters/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' });

const portraits = new Map(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]));

export const portraitFor = (id: string) => portraits.get(id);
