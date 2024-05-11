import { Dayjs } from 'dayjs';
import { atom } from 'recoil';

export interface ReserveTime {
  date: Dayjs;
  from: number;
  to: number;
}

export const reserveTimeState = atom<ReserveTime | null>({
  key: 'reserveTimeState',
  default: null,
});
