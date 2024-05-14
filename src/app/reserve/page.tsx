'use client';

import { Button, List } from 'antd';
import TimeSelector from './time-selector';
import { useRecoilState } from 'recoil';
import { reserveTimeState } from '@/recoil/reserve-time';
import { findEmptyRooms, getBookingUrl } from '@/api/crawler/crawl';
import SearchPlace from './search-place';
import { placesState } from '@/recoil/places';
import EmptyRooms from './empty-rooms';
import { emptyPlacesState } from '@/recoil/empty-places';
import RegisteredPlaces from './registered-places';

const placeUrls = [
  'https://pcmap.place.naver.com/place/1683336842/ticket?entry=pll&from=nx&fromNxList=true&from=map&fromPanelNum=2&timestamp=202405110407',
];

export default function ReserveHome() {
  const [reserveTime, _] = useRecoilState(reserveTimeState); // time that wnat to search
  const [places, setPlaces] = useRecoilState(placesState);
  const [emptyPlaces, setEmptyPlaces] = useRecoilState(emptyPlacesState);

  const onClick = async () => {
    if (reserveTime == null) {
      alert('시간을 선택해주세요!');
      return;
    }

    const urls = [];
    for (let i = 0; i < places.length; i++) {
      urls.push(await getBookingUrl(places[i].id));
    }

    console.log(urls);

    const ret = await findEmptyRooms({
      reserveTime: reserveTime,
      urls: urls,
    });

    if (ret != undefined) {
      setEmptyPlaces(ret);
    }

    console.log(places);
  };

  const renderItem = (item: string) => {
    return <List.Item>{item}</List.Item>;
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <SearchPlace />
      <RegisteredPlaces />
      <TimeSelector />
      <Button onClick={onClick}>find empty rooms</Button>
      <EmptyRooms />
    </main>
  );
}
