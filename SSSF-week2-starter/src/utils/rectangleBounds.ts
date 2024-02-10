import {Polygon} from 'geojson';

type coordinates = {
  lat: number;
  lng: number;
};

export default (topRight: coordinates, bottomLeft: coordinates): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [bottomLeft.lng, bottomLeft.lat],
      [bottomLeft.lng, topRight.lat],
      [topRight.lng, topRight.lat],
      [topRight.lng, bottomLeft.lat],
      [bottomLeft.lng, bottomLeft.lat],
    ],
  ],
});
