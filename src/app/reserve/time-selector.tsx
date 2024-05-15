'use client';

import React, { useState } from 'react';
import { Button, DatePicker, Space, TimePicker } from 'antd';
import { useSetRecoilState } from 'recoil';
import { reserveTimeState } from '@/recoil/reserve-time';
import dayjs, { Dayjs } from 'dayjs';

export default function TimeSelector() {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);

  const setReserveTime = useSetRecoilState(reserveTimeState);

  const disabledToHours = () => {
    return Array.from({ length: (from ?? 0) + 1 }, (_, i) => i);
  };

  const disabledMinutes = () => {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  };

  const disabledSeconds = () => {
    return Array.from({ length: 59 }, (_, i) => i + 1);
  };

  const onDateChange = (value: Dayjs) => {
    if (value === null) return;
    setReserveTime((cur) => {
      return {
        date: value,
        from: cur.from,
        to: cur.to,
      };
    });
  };

  const onFromChange = (value: Dayjs) => {
    setFrom(value.hour());
    if (value === null) return;
    setReserveTime((cur) => {
      return {
        date: cur.date,
        from: value.hour(),
        to: cur.to,
      };
    });
  };

  const onToChange = (value: Dayjs) => {
    if (value === null) return;
    setReserveTime((cur) => {
      return {
        date: cur.date,
        from: cur.from,
        to: value.hour(),
      };
    });
  };

  return (
    <div className='flex'>
      <Space direction='vertical'>
        <DatePicker
          placeholder='날짜'
          onChange={onDateChange}
          minDate={dayjs().add(1, 'day')}
        />
        <TimePicker
          placeholder='시작'
          onChange={onFromChange}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
        />
        <TimePicker
          placeholder='끝'
          onChange={onToChange}
          disabledHours={disabledToHours}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
          disabled={from == null}
        />
      </Space>
    </div>
  );
}
