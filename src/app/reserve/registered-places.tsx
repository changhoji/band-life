import { PlaceInfo } from '@/api/crawler/type';
import { placesState } from '@/recoil/places';
import { CloseOutlined } from '@ant-design/icons';
import { Button, List } from 'antd';
import { useRecoilState } from 'recoil';

export default function RegisteredPlaces() {
  const [places, setPlaces] = useRecoilState<PlaceInfo[]>(placesState);

  const removePlace = (name: string) => {
    setPlaces((cur) => cur.filter((value) => value.name !== name));
  };

  const renderPlace = (place: PlaceInfo) => (
    <List.Item>
      <div>{place.name}</div>
      <Button
        icon={<CloseOutlined />}
        size='small'
        onClick={() => removePlace(place.name)}
      />
    </List.Item>
  );

  return (
    <div>
      <h3 className='mb-4 text-blue-700'>추가된 장소</h3>
      <List dataSource={places} renderItem={renderPlace}></List>
    </div>
  );
}
