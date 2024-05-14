'use client';

import { Button, ConfigProvider } from 'antd';
import TimeSelector from './time-selector';
import { useRecoilState } from 'recoil';
import { reserveTimeState } from '@/recoil/reserve-time';
import { findEmptyRooms, getBookingUrl } from '@/api/crawler/crawl';
import SearchPlace from './search-place';
import { placesState } from '@/recoil/places';
import EmptyRooms from './empty-rooms';
import { emptyPlacesState } from '@/recoil/empty-places';
import RegisteredPlaces from './registered-places';
import { useState } from 'react';

export default function ReserveHome() {
  const [isSearching, setIsSearching] = useState(false);

  const [reserveTime, _] = useRecoilState(reserveTimeState); // time that wnat to search
  const [places, setPlaces] = useRecoilState(placesState);
  const [emptyPlaces, setEmptyPlaces] = useRecoilState(emptyPlacesState);

  const onSearch = async () => {
    setIsSearching((v) => !v);

    const urls = [];
    for (let i = 0; i < places.length; i++) {
      urls.push(await getBookingUrl(places[i].id));
    }

    console.log(urls);

    const ret = await findEmptyRooms({
      reserveTime: reserveTime,
      urls: urls,
    });

    if (ret !== null) {
      setEmptyPlaces(ret);
    }

    setIsSearching((v) => !v);
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <ConfigProvider renderEmpty={() => <div></div>}>
        <div className='flex'>
          <div className='flex flex-col pr-4'>
            <SearchPlace />
          </div>
          <div className='flex flex-col items-center pr-4'>
            <RegisteredPlaces />
            <TimeSelector />
          </div>
          <div className='flex flex-col'>
            <Button
              onClick={onSearch}
              disabled={
                reserveTime.date === null ||
                reserveTime.from === null ||
                reserveTime.to === null
              }
              loading={isSearching}
            >
              검색!
            </Button>
            <EmptyRooms />
          </div>
        </div>
      </ConfigProvider>
    </main>
  );
}
