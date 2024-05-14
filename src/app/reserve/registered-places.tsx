import { PlaceInfo } from '@/api/crawler/type';
import { placesState } from '@/recoil/places';
import { List } from 'antd';
import { useRecoilState } from 'recoil';

export default function RegisteredPlaces() {
  const [places, setPlaces] = useRecoilState<PlaceInfo[]>(placesState);

  const renderPlace = (place: PlaceInfo) => <List.Item>{place.name}</List.Item>;

  return <List dataSource={places} renderItem={renderPlace}></List>;
}
