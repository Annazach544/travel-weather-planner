import './styles/main.scss'

// --- DOM-element ---
const cityInput = document.getElementById('city-input')
const searchBtn = document.getElementById('search-btn')
const weatherContainer = document.getElementById('weather-container')
const mapContainer = document.getElementById('map-container')
const placesContainer = document.getElementById('places-container')

// Event Listener för sökknappen
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim()
  if (!city) {
    alert('Skriv in en stad först!')
    return
  }

  weatherContainer.innerHTML = `<p>Hämtar väder för <strong>${city}</strong>...</p>`
  mapContainer.innerHTML = `<p>Laddar karta...</p>`
  placesContainer.innerHTML = `<p>Laddar sevärdheter...</p>`
})
