/**
 * Definizione delle imbarcazioni di famiglia.
 *
 * NOTA SUL MODELLO:
 * `boatId` su una prenotazione è puramente INFORMATIVO ("quale stai usando?").
 * NON allarga la disponibilità: due prenotazioni nello stesso giorno restano
 * comunque vietate (overlap globale), perché la decisione famiglia è
 * "o prendi la barca o il gommone" — una sola uscita per slot.
 *
 * Per aggiungere un terzo natante: estendere BOATS qui + aggiornare la
 * validazione `boatId` in firebase-rules.json + ripubblicare le regole.
 */

export const BOATS = {
  barca: {
    id: 'barca',
    label: 'Barca',
    icon: '⛵',
    color: '#1e3a8a',
  },
  gommone: {
    id: 'gommone',
    label: 'Gommone',
    icon: '🚤',
    color: '#0891b2',
  },
};

export const BOAT_LIST = Object.values(BOATS);

export const DEFAULT_BOAT_ID = 'barca';

/**
 * Lookup safe: ritorna sempre un oggetto barca valido.
 * Le prenotazioni create prima dell'upgrade C non hanno boatId — fallback su default.
 */
export function getBoat(boatId) {
  return BOATS[boatId] || BOATS[DEFAULT_BOAT_ID];
}

export function isValidBoatId(boatId) {
  return typeof boatId === 'string' && boatId in BOATS;
}
