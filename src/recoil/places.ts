import { PlaceInfo } from '@/api/crawler/type';
import { atom } from 'recoil';

export const placesState = atom<PlaceInfo[]>({
  key: 'placesState',
  default: [],
});
