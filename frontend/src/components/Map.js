import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icons
const propertyIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/64/684/684908.png", // House icon
  iconSize: [32, 32],
});

const poiIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/64/854/854894.png", // POI icon
  iconSize: [32, 32],
});

// Property location
const propertyLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco

// Nearby Points of Interest (Parks, Schools, Shopping Centers)
const pointsOfInterest = [
  {
    id: 1,
    name: "Golden Gate Park",
    lat: 37.7694,
    lng: -122.4862,
    type: "Park",
  },
  {
    id: 2,
    name: "San Francisco High School",
    lat: 37.7689,
    lng: -122.4312,
    type: "School",
  },
  {
    id: 3,
    name: "Westfield Shopping Center",
    lat: 37.784,
    lng: -122.4075,
    type: "Mall",
  },
];

const MapComponent = () => {
  return (
    <MapContainer
      center={propertyLocation}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* Map Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Property Marker */}
      <Marker position={propertyLocation} icon={propertyIcon}>
        <Popup>
          <b>Property Location</b>
          <br />
          Beautiful home in San Francisco!
        </Popup>
      </Marker>

      {/* Nearby Points of Interest */}
      {pointsOfInterest.map((poi) => (
        <Marker
          key={poi.id}
          position={{ lat: poi.lat, lng: poi.lng }}
          icon={poiIcon}
        >
          <Popup>
            <b>{poi.name}</b>
            <br />
            Type: {poi.type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
