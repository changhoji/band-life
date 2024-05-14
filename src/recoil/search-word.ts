import { atom } from 'recoil';

export const searchWordState = atom<string | null>({
  key: 'searchWordState',
  default: null,
});
