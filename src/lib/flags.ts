const flagCodeMap: Record<string, string> = {
  "alemania": "de",
  "argentina": "ar",
  "españa": "es",
  "espana": "es",
  "francia": "fr",
  "japón": "jp",
  "japon": "jp",
  "corea del norte": "kp",
  "corea del sur": "kr",
  "corea": "kr",
  "mexico": "mx",
  "méxico": "mx",
  "estados unidos": "us",
  "estados unidos de america": "us",
  "eeuu": "us",
  "canadá": "ca",
  "canada": "ca",
  "brasil": "br",
  "colombia": "co",
  "uruguay": "uy",
  "portugal": "pt",
  "italia": "it",
  "suiza": "ch",
  "dinamarca": "dk",
  "suecia": "se",
  "noruega": "no",
  "holanda": "nl",
  "países bajos": "nl",
  "paises bajos": "nl",
  "inglaterra": "gb-eng",
  "reino unido": "gb",
  "escocia": "gb-sct",
  "gales": "gb-wls",
  "irlanda del norte": "gb-nir",
  "polonia": "pl",
  "rusia": "ru",
  "china": "cn",
  "senegal": "sn",
  "nigeria": "ng",
  "croacia": "hr",
  "grecia": "gr",
  "belgica": "be",
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
