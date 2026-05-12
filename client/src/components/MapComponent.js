import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#E63946;border:3px solid white;
    box-shadow:0 0 0 5px rgba(230,57,70,0.25);
  "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
  popupAnchor:[0, -12]
});

const colorIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:26px;height:26px;border-radius:50% 50% 50% 0;
    background:${color};border:3px solid white;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize:   [26, 26],
  iconAnchor: [13, 26],
  popupAnchor:[0, -28]
});

const MapComponent = ({
  latitude,
  longitude,
  markers = [],
  height = '400px',
  accuracy,
  showAccuracy = true
}) => {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const mainMarker   = useRef(null);
  const accCircle    = useRef(null);
  const extraMarkers = useRef([]);
  const roRef        = useRef(null);
  const initDone     = useRef(false);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  // Consider valid if parseable numbers — 0,0 is technically valid but practically means "no data"
  const valid = !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);

  // ── Initialize map once we have a valid container + valid coords ──
  useEffect(() => {
    if (!mapRef.current || !valid || initDone.current) return;

    initDone.current = true;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    mainMarker.current = L.marker([lat, lng], { icon: userIcon })
      .addTo(mapInstance.current)
      .bindPopup('<b>📍 Location</b>')
      .openPopup();

    // ResizeObserver keeps tiles full-width
    roRef.current = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize(true);
    });
    roRef.current.observe(mapRef.current);

    // Aggressive invalidateSize — overflow:hidden wrapper needs multiple calls
    // to ensure all tiles load after the container is fully painted
    requestAnimationFrame(() => {
      mapInstance.current?.invalidateSize(true);
      setTimeout(() => mapInstance.current?.invalidateSize(true), 100);
      setTimeout(() => mapInstance.current?.invalidateSize(true), 300);
      setTimeout(() => mapInstance.current?.invalidateSize(true), 600);
      setTimeout(() => mapInstance.current?.invalidateSize(true), 1200);
    });

  }, [valid]); // eslint-disable-line

  // ── Update marker + pan when coords change ──
  useEffect(() => {
    if (!mapInstance.current || !valid) return;

    const latlng = [lat, lng];
    mainMarker.current?.setLatLng(latlng);
    mainMarker.current?.setPopupContent(
      `<b>📍 Location</b><br/>${lat.toFixed(5)}, ${lng.toFixed(5)}`
    );
    mapInstance.current.setView(latlng, mapInstance.current.getZoom(), {
      animate: true,
      duration: 0.5,
    });

    // Accuracy circle
    if (showAccuracy && accuracy && accuracy < 5000) {
      if (accCircle.current) {
        accCircle.current.setLatLng(latlng).setRadius(accuracy);
      } else {
        accCircle.current = L.circle(latlng, {
          radius: accuracy,
          color: '#E63946',
          fillColor: '#E63946',
          fillOpacity: 0.07,
          weight: 1,
        }).addTo(mapInstance.current);
      }
    }
  }, [lat, lng, accuracy, showAccuracy, valid]); // eslint-disable-line

  // ── Extra markers ──
  useEffect(() => {
    if (!mapInstance.current) return;
    extraMarkers.current.forEach(m => m.remove());
    extraMarkers.current = [];

    markers.forEach(m => {
      const mLat = parseFloat(m.latitude);
      const mLng = parseFloat(m.longitude);
      if (isNaN(mLat) || isNaN(mLng)) return;

      const color = m.type === 'police'    ? '#457B9D'
                  : m.type === 'ambulance' ? '#E63946'
                  : m.type === 'fire'      ? '#FB8500'
                  : '#06D6A0';

      const mk = L.marker([mLat, mLng], { icon: colorIcon(color) })
        .addTo(mapInstance.current)
        .bindPopup(m.popup || 'Location');
      extraMarkers.current.push(mk);
    });
  }, [markers]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      roRef.current?.disconnect();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        initDone.current = false;
      }
    };
  }, []);

  return (
    <div className="map-wrapper" style={{ height, width: '100%' }}>
      {!valid && (
        <div className="map-no-location">
          <i className="fas fa-satellite-dish"></i>
          <p>Acquiring location...</p>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          display: valid ? 'block' : 'none'
        }}
      />
    </div>
  );
};

export default MapComponent;
