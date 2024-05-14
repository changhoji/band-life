import { getPlaceInfo, searchPlaceInNaverMap } from '@/api/crawler/crawl';
import { placesState } from '@/recoil/places';
import { PlusOutlined } from '@ant-design/icons';
import { Button, List, Spin } from 'antd';
import Search from 'antd/es/input/Search';
import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

export default function SearchPlace() {
  const [searchWord, setSearchWord] = useState('');
  const [placeNames, setPlaceNames] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [addingPlaces, setAddingPlaces] = useState<string[]>([]);

  const [places, setPlaces] = useRecoilState(placesState);

  const setPlaceUrls = useSetRecoilState(placesState);

  const onSearch = async () => {
    setIsSearching((v) => !v);
    const result = await searchPlaceInNaverMap(searchWord);
    setIsSearching((v) => !v);
    if (result === undefined) return;

    setPlaceNames(result);
    console.log(`places = ${placeNames.toString()}`);
  };

  const onClick = async (name: string) => {
    setAddingPlaces((value) => [...value, name]);
    const placeInfo = await getPlaceInfo(name);
    setAddingPlaces((value) => {
      const index = value.indexOf(name);
      if (index > -1) {
        value.splice(index, 1);
      }
      return value;
    });

    setPlaceUrls((e) => [...e, placeInfo!]);
  };

  const renderItem = (item: string) => {
    console.log(item);
    return (
      <List.Item>
        <div className='text-xs'>{item}</div>
        <Button
          icon={<PlusOutlined />}
          disabled={Array.from(places.map((e) => e.name)).includes(item)}
          onClick={() => onClick(item)}
          loading={addingPlaces.includes(item)}
          size='small'
        ></Button>
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
        loading={isSearching}
        itemLayout='horizontal'
        dataSource={placeNames}
        renderItem={renderItem}
        locale={{ emptyText: '' }}
      />
    </div>
  );
}
