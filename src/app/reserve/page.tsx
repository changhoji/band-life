'use client';

import { Button, ConfigProvider, Progress } from 'antd';
import TimeSelector from './time-selector';
import { useRecoilState } from 'recoil';
import { reserveTimeState } from '@/recoil/reserve-time';
import {
  findEmptyRooms,
  findEmptyRooms2,
  getBookingUrl,
  getPlaceData,
  getRoomData,
} from '@/api/crawler/crawl';
import SearchPlace from './search-place';
import { placesState } from '@/recoil/places';
import EmptyRooms from './empty-rooms';
import { emptyPlacesState } from '@/recoil/empty-places';
import RegisteredPlaces from './registered-places';
import { useState } from 'react';
import { Place } from '@/api/crawler/type';

export default function ReserveHome() {
  const [isSearching, setIsSearching] = useState(false);
  const [roomCount, setRoomCount] = useState(0);
  const [searchedRoomCount, setSearchedRoomCount] = useState(0);

  const [reserveTime, _] = useRecoilState(reserveTimeState); // time that wnat to search
  const [places, setPlaces] = useRecoilState(placesState);
  const [emptyPlaces, setEmptyPlaces] = useRecoilState(emptyPlacesState);

  const onSearch = async () => {
    setIsSearching((v) => !v);

    const placeUrls = [];
    for (let i = 0; i < places.length; i++) {
      placeUrls.push(await getBookingUrl(places[i].id));
    }

    const emptyRooms = await findEmptyRooms2(placeUrls, reserveTime);

    // let placeDatas: { place: Place; roomUrls: string[] }[] = [];
    // await Promise.all(
    //   Array.from(
    //     placeUrls.map((placeUrl) =>
    //       getPlaceData(placeUrl, reserveTime).then((value) => {
    //         if (value === null) return;
    //         placeDatas.push(value);
    //         setRoomCount((cur) => cur + value.roomUrls.length);
    //       })
    //     )
    //   )
    // );

    // await Promise.all(
    //   Array.from(
    //     placeDatas.map((placeData) =>
    //       Promise.all(
    //         Array.from(
    //           placeData.roomUrls.map((roomUrl) =>
    //             getRoomData(roomUrl, reserveTime).then((value) => {
    //               setSearchedRoomCount((cur) => cur + 1);
    //               if (value === null) return;
    //             })
    //           )
    //         )
    //       )
    //     )
    //   )
    // );

    setEmptyPlaces(emptyRooms);
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
