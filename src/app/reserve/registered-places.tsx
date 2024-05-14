import { PlaceInfo } from '@/api/crawler/type';
import { placesState } from '@/recoil/places';
import { CloseOutlined } from '@ant-design/icons';
import { Button, List } from 'antd';
import { useRecoilState } from 'recoil';

export default function RegisteredPlaces() {
  const [places, setPlaces] = useRecoilState<PlaceInfo[]>(placesState);

  const removePlace = () => {};

  const renderPlace = (place: PlaceInfo) => (
    <List.Item>
      <div>{place.name}</div>
      <Button icon={<CloseOutlined />} size='small' />
    </List.Item>
  );

  return <List dataSource={places} renderItem={renderPlace}></List>;
}
