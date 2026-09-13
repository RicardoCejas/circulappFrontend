// Estilos de mapa: OpenStreetMap detallado estándar (calles, numeración, pasajes) + vectoriales OpenFreeMap
export const MAP_STYLES = {
  osm: {
    id: 'osm',
    name: 'Calles (OSM)',
    url: {
      version: 8,
      sources: {
        'osm-raster': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-raster-layer',
          type: 'raster',
          source: 'osm-raster',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  liberty: {
    id: 'liberty',
    name: 'Liberty (Vector)',
    url: 'https://tiles.openfreemap.org/styles/liberty'
  },
  positron: {
    id: 'positron',
    name: 'Positron',
    url: 'https://tiles.openfreemap.org/styles/positron'
  },
  bright: {
    id: 'bright',
    name: 'Bright',
    url: 'https://tiles.openfreemap.org/styles/bright'
  }
};
