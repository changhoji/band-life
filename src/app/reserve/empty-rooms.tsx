import { Place, Room } from '@/api/crawler/type';
import { emptyPlacesState } from '@/recoil/empty-places';
import { List } from 'antd';
import { useRecoilState } from 'recoil';

export default function EmptyRooms() {
  const [emptyPlaces, setEmptyPlaces] = useRecoilState(emptyPlacesState);

  const renderRoomList = (room: Room) => <List.Item>{room.name}</List.Item>;

  const renderPlaceList = (place: Place) => (
    <List.Item>
      <div>{place.name}</div>
      <List dataSource={place.rooms} renderItem={renderRoomList} />
    </List.Item>
  );

  return <List dataSource={emptyPlaces} renderItem={renderPlaceList} />;
}
