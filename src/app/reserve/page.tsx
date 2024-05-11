'use client';

import React, { useState } from 'react';
import { Button, DatePicker, TimePicker } from 'antd';
import TimeSelector from './time-selector';
import { useRecoilState } from 'recoil';
import { reserveTimeState } from '@/recoil/reserve-time';
import { findEmptyRooms } from '@/api/crawler/crawl';
import { Place } from '@/api/crawler/type';
import Link from 'next/link';

const placeUrls = [
  'https://pcmap.place.naver.com/place/1683336842/ticket?entry=pll&from=nx&fromNxList=true&from=map&fromPanelNum=2&timestamp=202405110407',
];

export default function ReserveHome() {
  const [text, setText] = useState('');
  const [reserveTime, _] = useRecoilState(reserveTimeState);
  const [places, setPlaces] = useState<Place[]>([]);

  const onClick = async () => {
    if (reserveTime == null) {
      alert('시간을 선택해주세요!');
      return;
    }

    const ret = await findEmptyRooms({
      reserveTime: reserveTime,
      urls: placeUrls,
    });
    if (ret != undefined) {
      setPlaces(ret);
    }

    console.log(places);
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <TimeSelector />
      {places.map((place) => (
        <div>
          <div>{place.name}</div>
          <ul>
            {place.rooms.map((room) => (
              <Link href={room.url}>
                <div>{room.name}</div>
              </Link>
            ))}
          </ul>
        </div>
      ))}
      <Button onClick={onClick}>find empty rooms</Button>
      <div>{text}</div>
    </main>
  );
}
