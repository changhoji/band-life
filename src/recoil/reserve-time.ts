import { Dayjs } from 'dayjs';
import { atom } from 'recoil';

export interface ReserveTime {
  date: Dayjs | null;
  from: number | null;
  to: number | null;
}

export const reserveTimeState = atom<ReserveTime>({
  key: 'reserveTimeState',
  default: {
    date: null,
    from: null,
    to: null,
  },
});
