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

  const onClick = () => {
    if (date == null) {
      alert('날짜를 선택해 주세요!');
      return;
    }
    if (from == null || to == null) {
      alert('시간을 선택해 주세요!');
      return;
    }

    setReserveTime({
      date: date,
      from: from,
      to: to,
    });
  };

  return (
    <div className='flex'>
      <Space direction='vertical'>
        <DatePicker
          onChange={(date) => setDate(date)}
          minDate={dayjs().add(1, 'day')}
        />
        <TimePicker
          onChange={(time) => setFrom(time.hour())}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
        />
        <TimePicker
          onChange={(time) => setTo(time.hour())}
          disabledHours={disabledToHours}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
          disabled={from == null}
        />
        <Button onClick={onClick}>완료</Button>
      </Space>
    </div>
  );
}
