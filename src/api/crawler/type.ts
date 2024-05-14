import { URL } from 'url';

export interface Place {
  name: string;
  url: string | URL;
  photoUrl: string | URL;
  rooms: Room[];
}

export interface Room {
  name: string;
  url: string | URL;
  photoUrl: string | URL;
  price: number;
}

export interface PlaceInfo {
  name: string;
  id: string;
  photoUrl: string | URL;
}