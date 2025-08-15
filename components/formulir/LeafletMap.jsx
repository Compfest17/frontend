'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';

function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });
  return null;
}

function MapCenterUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.0 
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function LeafletMap({
  center = [-6.208763, 106.845599], 
  zoom = 13,
  markers = [],
  onMapClick,
  height = '400px',
  className = ''
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        document.head.appendChild(link);
      }
      
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%', 
          cursor: 'crosshair',
          position: 'relative',
          zIndex: 1
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        dragging={true}
        touchZoom={true}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterUpdater center={center} zoom={zoom} />
        
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popup && (
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
