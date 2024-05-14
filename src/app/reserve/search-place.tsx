import { getPlaceInfo, searchPlaceInNaverMap } from '@/api/crawler/crawl';
import { PlaceInfo } from '@/api/crawler/type';
import { placesState } from '@/recoil/places';
import { Button, List } from 'antd';
import Search from 'antd/es/input/Search';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';

export default function SearchPlace() {
  const [searchWord, setSearchWord] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const setPlaceUrls = useSetRecoilState(placesState);

  const onSearch = async () => {
    const result = await searchPlaceInNaverMap(searchWord);
    if (result === undefined) return;

    setPlaces(result);
    console.log(`places = ${places.toString()}`);
  };

  const onClick = async (name: string) => {
    const placeInfo = await getPlaceInfo(name);
    setPlaceUrls((e) => [...e, placeInfo!]);
  };

  const renderItem = (item: string) => {
    console.log(item);
    return (
      <List.Item>
        <div>{item}</div>
        <Button onClick={() => onClick(item)}>추가</Button>
      </List.Item>
    );
  };

  return (
    <div>
      <Search
        placeholder='장소 검색'
        value={searchWord}
        onChange={(e) => {
          setSearchWord(e.target.value);
        }}
        onSearch={onSearch}
      />
      <List
        itemLayout='horizontal'
        dataSource={places}
        renderItem={renderItem}
      />
    </div>
  );
}
