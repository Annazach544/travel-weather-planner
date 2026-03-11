// src/api/weather.js
export async function getWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data) return null;
    return data;
  } catch (error) {
    console.error("Fel vid hämtning av väder:", error);
    return null;
  }
}
