// Jokes for the things floating around Earth. None of this is story content: canon.json stays out of it.

export type OddityId = 'lamp' | 'garbageBag' | 'chair' | 'trafficCone' | 'television' | 'rubberDuck' | 'sofa' | 'football' | 'rocket' | 'elon';

export const ODDITIES: Record<OddityId, { name: string; lines: string[] }> = {
  lamp: {
    name: 'Floor lamp',
    lines: [
      'It had one bright idea and left.',
      'Someone said "lights out" and it took that personally.',
      'It went looking for a socket with better prospects.',
      'It was tired of standing in the corner.',
      'Grounded for years. Not any more.',
    ],
  },
  garbageBag: {
    name: 'Garbage bag',
    lines: [
      'Collection day was Tuesday. It did not wait.',
      'Someone finally took it out. Really far out.',
      'Sent to space because the bin was full.',
      'It has more ambition than the rest of the kitchen.',
      'Nobody knows what is inside. Nobody is going to check.',
    ],
  },
  chair: {
    name: 'Chair',
    lines: [
      'It stood up for itself.',
      'Thrown in a heated meeting about the budget.',
      'It was promised a seat at the table. It is still looking.',
      'Four legs, and it still ran away.',
      'It got tired of being sat on.',
    ],
  },
  trafficCone: {
    name: 'Traffic cone',
    lines: [
      'It closed the last lane on Earth and moved on.',
      'Roadworks here are expected to finish in 4 billion years.',
      'A student put it on a statue. It kept climbing.',
      'It is on its way to divert a comet.',
      'Nobody remembers what it was guarding.',
    ],
  },
  television: {
    name: 'Old television',
    lines: [
      'There was nothing on, so it went looking for a better signal.',
      'Its remote is still on the sofa, wondering.',
      'It has been showing static since 1994 and has finally had enough.',
      'Someone hit it to fix the picture. It hit back by leaving.',
      'Now showing: space. Reviews are mixed.',
    ],
  },
  rubberDuck: {
    name: 'Rubber duck',
    lines: [
      'It swam out of the Earth.',
      'The bathtub was never going to be enough.',
      'It heard there was water on Mars.',
      'Squeaked once, and left the atmosphere.',
      'It has seen what you do in the bath. It had to leave.',
    ],
  },
  sofa: {
    name: 'Sofa',
    lines: [
      '"Pivot," they said. They pivoted too hard.',
      'It would not fit through the door, so it took the other exit.',
      'Coins found in its cushions: 41. Crumbs: all of them.',
      'It has been watching space documentaries for years.',
      'Free to a good home. Collection only.',
    ],
  },
  football: {
    name: 'Football',
    lines: [
      'Messi kicked it a bit too high.',
      'The referee still says it was in.',
      'A penalty, taken with confidence and no aim at all.',
      'It is due back on Earth for extra time in 2091.',
      'Whoever goes to get it is in goal.',
    ],
  },
  rocket: {
    name: 'Rocket',
    lines: [
      'A very expensive way to look at the Earth from further away.',
      'Going straight up. Nobody has explained the plan past that.',
      'Reusable, according to the brochure.',
      'Its cargo is one sports car and a lot of optimism.',
      'Whatever you do, please leave this one alone.',
    ],
  },
  elon: {
    name: 'Elon, on Mars',
    lines: [
      'He said he would get here first. He brought a hammer and nobody to tell.',
      'Fixing the rocket. Also posting about fixing the rocket.',
      'Digging a tunnel. Mars did not ask for one.',
      'He promised a city. So far: one man, one shed, one very large vision.',
      'The Curiosity rover drove past and did not say hello.',
      'Mars is now a premium planet. The blue tick costs extra.',
    ],
  },
};

export type MarsTaskId = 'dig' | 'blunt' | 'stack' | 'rename';

/** What he is up to when you scroll in on Mars. Each has its own drawn scene in MarsCloseUp.tsx. */
export const MARS_TASKS: Array<{ id: MarsTaskId; title: string; line: string }> = [
  { id: 'dig', title: 'Digging a hole for his money', line: 'The bags go in faster than he can dig. He has not thought about how to get them out.' },
  { id: 'blunt', title: 'Rolling one on Mars', line: 'A flawless roll. He has forgotten he is wearing a helmet.' },
  { id: 'stack', title: 'Stacking cash', line: 'He wants to see it reach the sky. Mars has wind.' },
  { id: 'rename', title: 'Renaming the planet', line: 'Mars has been Mars for a long time. He feels it could be shorter.' },
];

export const pickLine = (id: OddityId) => {
  const { lines } = ODDITIES[id];
  return lines[Math.floor(Math.random() * lines.length)];
};

export const BROKEN_LINES = [
  'You blew up a rocket, and history could not take the hit.',
  'The universe has encountered a problem and needs to close.',
  'That rocket was load-bearing.',
  'Reality has stopped responding.',
];
