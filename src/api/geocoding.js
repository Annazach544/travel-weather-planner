// src/api/geocoding.js
export async function getCoordinates(city) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return {
      name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error("Fel vid geocoding:", error);
    return null;
  }
}
