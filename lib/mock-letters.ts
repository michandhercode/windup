import { Letter } from '@/types/letter';

export const MOCK_JAR_LETTERS: Letter[] = [
  {
    id: '1',
    title: 'A quiet Tuesday night',
    content: 'Today felt slow in a good way. I sat by the window and watched the rain for a bit...',
    mood: 'peaceful',
    status: 'kept',
    visibility: 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'To my 2027 self',
    content: 'I hope you are taking things easier now. Remember to breathe when things get overwhelming.',
    mood: 'hopeful',
    status: 'sealed',
    visibility: 'sealed',
    sealUntil: '2027-01-01T00:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_SKY_LETTERS: Letter[] = [
  {
    id: 'sky-1',
    content: 'To whoever is reading this: I hope you find the peace you are quietly searching for today.',
    mood: 'quiet',
    status: 'released',
    visibility: 'anonymous_public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sky-2',
    content: 'Leaving a piece of my heavy heart here so I do not have to carry it alone tonight.',
    mood: 'heavy',
    status: 'released',
    visibility: 'anonymous_public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];