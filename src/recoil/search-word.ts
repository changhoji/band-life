import { atom } from 'recoil';

export const searchWord = atom<string | null>({
  key: 'searchWord',
  default: null,
});
