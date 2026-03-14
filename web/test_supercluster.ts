import Supercluster from 'supercluster';

const index = new Supercluster({ radius: 40, maxZoom: 16 });
index.load([
    { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { category: 'shop' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { category: 'shop' } }
]);

const clusters = index.getClusters([-180, -85, 180, 85], 2);
console.log(clusters[0].properties);
