import './styles/main.scss'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import { getCoordinates } from './api/geocoding.js'
import { getWeather } from './api/weather.js'
import { getWeatherIcon } from './utils/weatherIcons.js'

const searchBtn = document.getElementById('search-btn')
const cityInput = document.getElementById('city-input')
const weatherContainer = document.getElementById('weather-container')

let map
let marker

function getTempClass(temp) {
  if (temp >= 25) return 'hot'
  if (temp <= 10) return 'cold'
  return 'mild'
}

async function searchCity() {

  const city = cityInput.value.trim()

  if (!city) {
    alert("Skriv in en stad!")
    return
  }

  const coords = await getCoordinates(city)

  if (!coords) {
    weatherContainer.innerHTML = "<p>Kunde inte hitta staden.</p>"
    return
  }

  const weatherData = await getWeather(coords.lat, coords.lon)

  if (!weatherData) return

  if (!map) {

    map = L.map('map-container').setView([coords.lat, coords.lon], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

  } else {

    map.setView([coords.lat, coords.lon], 10)

  }

  if (marker) marker.remove()

  marker = L.marker([coords.lat, coords.lon])
    .addTo(map)
    .bindPopup(coords.name)
    .openPopup()

  const days = weatherData.daily

  let html = `<h2>Väder i ${coords.name}</h2>
  <div class="forecast-grid">`

  for (let i = 0; i < 3; i++) {

    const date = new Date(days.time[i]).toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    })

    const icon = getWeatherIcon(days.weathercode[i])

    const maxClass = getTempClass(days.temperature_2m_max[i])
    const minClass = getTempClass(days.temperature_2m_min[i])

    const weatherCode = days.weathercode[i]

    let weatherClass = "cloudy"

    if (weatherCode === 0) weatherClass = "sunny"
    if (weatherCode >= 61 && weatherCode <= 82) weatherClass = "rainy"
    if (weatherCode >= 71 && weatherCode <= 77) weatherClass = "snowy"

    html += `
      <div class="day ${weatherClass}">
        <p class="date">${date}</p>
        <p class="icon">${icon}</p>
        <p class="temp ${maxClass}">Max: ${days.temperature_2m_max[i]}°C</p>
        <p class="temp ${minClass}">Min: ${days.temperature_2m_min[i]}°C</p>
      </div>
    `
  }

  html += "</div>"

  weatherContainer.innerHTML = html
}

searchBtn.addEventListener("click", searchCity)

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchCity()
  }
})
