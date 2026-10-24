// The crop dropdown list. The "id" is what gets stored in the database,
// so don't rename existing ids later. You can add more crops freely.
export const CROPS = [
  { id: "rice", name: "Rice (Paddy)" },
  { id: "wheat", name: "Wheat" },
  { id: "maize", name: "Maize" },
  { id: "ragi", name: "Ragi (Finger millet)" },
  { id: "jowar", name: "Jowar (Sorghum)" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "cotton", name: "Cotton" },
  { id: "soybean", name: "Soybean" },
  { id: "groundnut", name: "Groundnut" },
  { id: "tur", name: "Tur (Pigeon pea)" },
  { id: "tomato", name: "Tomato" },
  { id: "onion", name: "Onion" },
  { id: "potato", name: "Potato" },
  { id: "chilli", name: "Chilli" },
  { id: "banana", name: "Banana" },
  { id: "turmeric", name: "Turmeric" },
];

export function getCropName(id) {
  return CROPS.find((crop) => crop.id === id)?.name ?? id;
}