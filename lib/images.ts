/**
 * Site photo library: verified Unsplash ids, served via `next/image`
 * (see `images.remotePatterns` in next.config.ts).
 *
 * `photo()` builds a URL cropped to the requested width; next/image then
 * handles responsiveness and the modern format.
 */
export function photo(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;
}

/** Fixed hero visuals for pages. */
export const VISUELS = {
  accueilHero:     "photo-1631217868264-e5b90bb7e133", // consultation, pediatrician and family
  accueilSecours:  "photo-1581056771107-24ca5f033842", // bedside visit
  services:        "photo-1538108149393-fbbd81895907", // hospital rooms
  medecins:        "photo-1542884748-2b87b36c6b90",    // caregiver taking blood pressure
  activites:       "photo-1503454537195-1dcabb73ffb9", // child at the painting workshop
  actualites:      "photo-1588776814546-1ffcf47267a5", // reading a medical scan
  infosPratiques:  "photo-1519494026892-80bbd2d6fd0d", // reception hall
  contact:         "photo-1587351021759-3e566b6af7cc", // building facade
  dons:            "photo-1476703993599-0035a21b17a9", // a family
  espaceEnfants:   "photo-1535572290543-960a8046f5af", // wooden blocks
  rendezVous:      "photo-1576091160550-2173dba999ef", // booking an appointment
  suiviRdv:        "photo-1526256262350-7da7584cf5eb", // stethoscope and notebook
} as const;

/** Fallback photo for a department, when the database doesn't provide one. */
export const PHOTOS_SERVICES: Record<string, string> = {
  urgences:           "photo-1516549655169-df83a0774514",
  neonatologie:       "photo-1522771930-78848d9293e8",
  cardiologie:        "photo-1505751172876-fa1923c5c528",
  chirurgie:          "photo-1550831107-1553da8c8464",
  "hemato-oncologie": "photo-1579684385127-1ef15d508118",
  neurologie:         "photo-1559757148-5c350d0d3c56",
  pneumologie:        "photo-1584820927498-cfe5211fd8bf",
  pedopsychiatrie:    "photo-1559839734-2b71ea197ec2",
};

const PORTRAITS = [
  "photo-1594824476967-48c8b964273f",
  "photo-1582750433449-648ed127bb54",
  "photo-1612349317150-e413f6a5b16d",
  "photo-1622253692010-333f2da6031d",
  "photo-1651008376811-b90baee60c1f",
  "photo-1607746882042-944635dfe10e",
  "photo-1537511446984-935f663eb1f4",
];

/** Fallback portrait, stable for a given doctor. */
export function portraitParDefaut(id: number): string {
  return PORTRAITS[id % PORTRAITS.length];
}

export const ACTUALITE_PAR_DEFAUT = "photo-1587351021759-3e566b6af7cc";

/**
 * Accepts an Unsplash id stored in the database (`photo-…`), a path on this site
 * (`/img/…`) or an https URL, and falls back to `repli` for anything else.
 *
 * The fallback is the point: this value ends up in the `src` of an image on a public page.
 * `startsWith("http")` also matched "httpfoo" (a relative path), and a protocol-relative
 * "//host/x.png" passed as a local path, so a stored value could aim the page at another
 * host. Unknown shapes now render the default photo instead.
 */
export function src(valeur: string | null | undefined, repli: string, w = 1600): string {
  const v = valeur?.trim();
  if (!v) return photo(repli, w);
  if (v.startsWith("//")) return photo(repli, w);
  if (v.startsWith("/")) return v;
  if (/^https:\/\//i.test(v)) return v;
  return /^[\w-]+$/.test(v) ? photo(v, w) : photo(repli, w);
}
