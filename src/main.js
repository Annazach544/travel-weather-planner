import './styles/main.scss'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getCoordinates } from './api/geocoding.js'
import { getWeather } from './api/weather.js'
import { getWeatherIcon } from './utils/weatherIcons.js'
import { getPlaces } from './api/places.js'

const searchBtn = document.getElementById('search-btn')
const cityInput = document.getElementById('city-input')
const mapContainer = document.getElementById('map-container')

// Initiera Leaflet-karta
let map = L.map('map-container').setView([59.3293, 18.0686], 5)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

let marker

/**
 * Returnerar CSS-klass för temperatur.
 * @param {number} temp - Temperatur i Celsius.
 * @returns {string} - 'hot', 'cold' eller 'mild'.
 */
function getTempClass(temp) {
  if (temp >= 25) return 'hot'
  if (temp <= 10) return 'cold'
  return 'mild'
}

/**
 * Huvudfunktion som söker efter en stad och uppdaterar sidan.
 * Den hämtar koordinater, väderdata och sevärdheter, uppdaterar kartan
 * och genererar dynamiskt väder- och sevärdhetskort.
 * 
 * @async
 * @function
 */
async function searchCity() {
  const city = cityInput.value.trim()
  if (!city) return alert("Skriv in en stad!")

  // Hämta koordinater via geokodnings-API
  const coords = await getCoordinates(city)
  if (!coords) {
    alert("Kunde inte hitta staden.")
    return
  }

  // Hämta väderdata via väder-API
  const weatherData = await getWeather(coords.lat, coords.lon)
  if (!weatherData) return

  // Uppdatera kartan med ny position
  map.setView([coords.lat, coords.lon], 10)
  if (marker) marker.remove()
  marker = L.marker([coords.lat, coords.lon])
    .addTo(map)
    .bindPopup(coords.name)
    .openPopup()

  // Skapa väderkort dynamiskt
  let weatherContainer = document.getElementById('weather-container')
  if (!weatherContainer) {
    weatherContainer = document.createElement('section')
    weatherContainer.id = 'weather-container'
    mapContainer.after(weatherContainer)
  }

  const days = weatherData.daily
  let html = `<h2>Väder i ${coords.name}</h2><div class="forecast-grid">`
  for (let i = 0; i < 3; i++) {
    const date = new Date(days.time[i]).toLocaleDateString('sv-SE',{
      weekday:'short', day:'numeric', month:'numeric'
    })
    const icon = getWeatherIcon(days.weathercode[i])
    const maxClass = getTempClass(days.temperature_2m_max[i])
    const minClass = getTempClass(days.temperature_2m_min[i])
    let weatherClass = "cloudy"
    const code = days.weathercode[i]
    if(code===0) weatherClass="sunny"
    if(code>=61&&code<=82) weatherClass="rainy"
    if(code>=71&&code<=77) weatherClass="snowy"

    html += `<div class="day ${weatherClass}">
      <p class="date">${date}</p>
      <p class="icon">${icon}</p>
      <p class="temp ${maxClass}">Max: ${days.temperature_2m_max[i]}°C</p>
      <p class="temp ${minClass}">Min: ${days.temperature_2m_min[i]}°C</p>
    </div>`
  }
  html += "</div>"
  weatherContainer.innerHTML = html

  // Skapa sevärdhetskort dynamiskt
  let placesContainer = document.getElementById('places-container')
  if (!placesContainer) {
    placesContainer = document.createElement('section')
    placesContainer.id = 'places-container'
    weatherContainer.after(placesContainer)
  }

  const places = await getPlaces(coords.lat, coords.lon)
  let placesHTML = `<h2>Sevärdheter</h2><ul>`
  places.forEach(p=>{
    const placeName = p.name || (p.tags && p.tags.name)
    if(placeName) placesHTML += `
<li class="place-card">
  <span class="place-icon">📍</span>
  <span class="place-name">${placeName}</span>
</li>`
  })
  placesHTML += "</ul>"
  placesContainer.innerHTML = placesHTML
}

/**
 * Eventlistener för klick på sökknappen.
 * @listens click
 */
searchBtn.addEventListener("click", searchCity)

/**
 * Eventlistener för Enter-knappen i inputfältet.
 * @listens keypress
 */
cityInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") searchCity()
})

/**
 * Dokumentation för externa API-funktioner:
 *
 * @function getCoordinates
 * @param {string} city - Namn på staden
 * @returns {Promise<{lat: number, lon: number, name: string}>} - Koordinater för staden
 *
 * @function getWeather
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - Väderdata
 *
 * @function getPlaces
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Array>} - Lista med sevärdheter i närheten
 *
 * @function getWeatherIcon
 * @param {number} code - Väderkod
 * @returns {string} - Emoji eller SVG för angivet väder
 */
