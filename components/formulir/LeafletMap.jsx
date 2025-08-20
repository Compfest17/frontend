'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, CircleMarker, GeoJSON } from 'react-leaflet';

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
  className = '',
  coverage = null,
  boundaryGeoJSON = null,
  boundaryStyle = { color: '#DD761C', weight: 2, fillColor: '#DD761C', fillOpacity: 0.15 }
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
        
        {markers.map((marker, index) => {
          const status = marker.status || null;
          const color = status === 'resolved' ? '#22c55e' : status === 'in_progress' ? '#f59e0b' : status === 'open' ? '#ef4444' : '#3b82f6';
          if (status) {
            return (
              <CircleMarker key={index} center={[marker.lat, marker.lng]} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}>
                {marker.popup && (
                  <Popup>
                    <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
                  </Popup>
                )}
              </CircleMarker>
            );
          }
          return (
            <Marker key={index} position={[marker.lat, marker.lng]}>
              {marker.popup && (
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
                </Popup>
              )}
            </Marker>
          );
        })}

        {coverage && coverage.lat && coverage.lng && (
          <Circle
            center={[coverage.lat, coverage.lng]}
            radius={coverage.radius || 5000}
            pathOptions={{ color: coverage.color || '#2563eb', fillColor: coverage.fillColor || '#93c5fd', fillOpacity: coverage.fillOpacity ?? 0.2 }}
          />
        )}

        {boundaryGeoJSON && (
          <GeoJSON data={boundaryGeoJSON} style={boundaryStyle} />
        )}
      </MapContainer>
    </div>
  );
}
