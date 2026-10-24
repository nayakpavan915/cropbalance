// PLACEHOLDER "safe levels": the acres of a crop, in one state, harvesting within
// the chosen time window, that the local market can absorb without a price crash.
// Replace these with real figures (agriculture department data, past market
// arrivals). Crop ids must match src/utils/crops.js.
export const SAFE_ACRES = {
  rice: 200,
  wheat: 200,
  maize: 150,
  ragi: 100,
  jowar: 100,
  sugarcane: 150,
  cotton: 150,
  soybean: 150,
  groundnut: 100,
  tur: 100,
  tomato: 40,
  onion: 40,
  potato: 40,
  chilli: 40,
  banana: 60,
  turmeric: 40,
};

export const DEFAULT_SAFE_ACRES = 100;

export function getSafeAcres(cropId) {
  return SAFE_ACRES[cropId] ?? DEFAULT_SAFE_ACRES;
}