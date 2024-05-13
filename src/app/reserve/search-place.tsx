import { getBookingUrl, searchPlaceInNaverMap } from '@/api/crawler/crawl';
import { SearchedPlace } from '@/api/crawler/type';
import { Button, List } from 'antd';
import Search from 'antd/es/input/Search';
import { useState } from 'react';

export default function SearchPlace() {
  const [searchWord, setSearchWord] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const onSearch = async () => {
    const result = await searchPlaceInNaverMap(searchWord);
    if (result === undefined) return;

    setPlaces(result);
    console.log(`places = ${places.toString()}`);
  };

  const onClick = async (name: string) => {
    const url = await getBookingUrl(name);
    console.log(url);
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
