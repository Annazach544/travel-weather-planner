export async function getPlaces(lat, lon) {

  const query = `
  [out:json];
  (
    node["tourism"](around:5000,${lat},${lon});
    node["historic"](around:5000,${lat},${lon});
    node["amenity"="museum"](around:5000,${lat},${lon});
  );
  out 10;
  `

  const url = "https://overpass-api.de/api/interpreter"

  try {

    const response = await fetch(url, {
      method: "POST",
      body: query
    })

    const data = await response.json()

    return data.elements

  } catch (error) {

    console.error("Kunde inte hämta sevärdheter:", error)
    return []

  }

}
