const flagCodeMap: Record<string, string> = {
  "germany": "de",
  "argentina": "ar",
  "spain": "es",
  "france": "fr",
  "japan": "jp",
  "south korea": "kr",
  "mexico": "mx",
  "united states": "us",
  "canada": "ca",
  "brazil": "br",
  "colombia": "co",
  "uruguay": "uy",
  "portugal": "pt",
  "switzerland": "ch",
  "sweden": "se",
  "netherlands": "nl",
  "england": "gb-eng",
  "senegal": "sn",
  "croatia": "hr",
  "grecia": "gr",
  "belgica": "be",
  "morocco":"ma",
  "haiti": "ht",
  "south africa": "za",
  "turkey": "tr",
  "scotland": "gb-sct",
  "bosnia-herzegovina" :"ba",
  "cape verde islands": "cv",
  "curacao":"cw",
  "tunisia":"tn",
  "ivory coast": "ci",
  "algeria":"dz",
  "austia":"at",
  "uzbekistan": "uz",
  "congo dr": "cd",
  "iran": "ir",
  "iraq":"iq",
  "new zealand":"nz",
  "jordan": "jo",
  "ghana":"gh",
  "panama":"pa",
  "norway":"no",
  "saudi arabia":"sa",
  "belgium":"be",
  "czech republic": "cz",
  "qatar":"qa",
  "ecuador": "ec",
  "egypt":"eg",
  "paraguay":"py",
  "australia":"au",
  "austria": "at"
}

function normalizeCountryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

export function getFlagCode(countryName: string) {
  const normalized = normalizeCountryName(countryName)
  return flagCodeMap[normalized] || normalized.slice(0, 2)
}

export function getFlagUrl(countryName: string) {
  const flagCode = getFlagCode(countryName)
  return `https://flagcdn.com/w320/${flagCode}.png`
}
