import { atom } from 'recoil';

export const placeUrls = atom<string[]>({
  key: 'placeUrls',
  default: [],
});
