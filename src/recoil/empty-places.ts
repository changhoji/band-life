import { Place } from '@/api/crawler/type';
import { atom } from 'recoil';

export const emptyPlacesState = atom<Place[]>({
  key: 'emptyPlacesState',
  default: [],
});
