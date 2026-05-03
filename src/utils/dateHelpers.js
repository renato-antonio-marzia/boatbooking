/**
 * dateHelpers.js
 * ----------------------------------------------------------------------
 * Utility per la gestione delle date timezone-safe.
 *
 * MOTIVAZIONE TECNICA:
 * Il codice originale di Copilot usava `new Date('YYYY-MM-DD').toISOString()`,
 * che interpreta la stringa come UTC e poi la converte in stringa ISO con
 * fuso orario. Questo introduce errori di un giorno quando l'utente è in
 * un fuso orario diverso da UTC (come l'Italia, che è UTC+1 o UTC+2).
 *
 * Esempio del problema:
 *   - Utente in Italia (UTC+2) seleziona "2026-07-15"
 *   - new Date('2026-07-15') => 2026-07-15T00:00:00Z (UTC)
 *   - In Italia diventa: 2026-07-15T02:00:00+02:00
 *   - Salvato come ISO: "2026-07-14T22:00:00.000Z"  <-- giorno sbagliato!
 *
 * SOLUZIONE:
 * Lavoriamo sempre con stringhe nel formato 'YYYY-MM-DD' come "chiave"
 * della prenotazione, e usiamo Date solo per visualizzazione/confronti
 * con normalizzazione esplicita a mezzogiorno locale.
 * ----------------------------------------------------------------------
 */

/**
 * Converte una stringa 'YYYY-MM-DD' in un oggetto Date locale a mezzogiorno.
 * Usare mezzogiorno evita problemi di timezone (mai a cavallo di mezzanotte).
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Converte un oggetto Date in stringa 'YYYY-MM-DD' usando il fuso locale.
 */
export function formatDateKey(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Restituisce la data odierna in formato 'YYYY-MM-DD' (fuso locale).
 */
export function todayKey() {
  return formatDateKey(new Date());
}

/**
 * Confronta due stringhe 'YYYY-MM-DD' come date.
 * Restituisce: -1 se a < b, 0 se uguali, 1 se a > b.
 */
export function compareDateKeys(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Calcola il numero di giorni inclusivi tra due date (entrambe incluse).
 */
export function daysBetween(startKey, endKey) {
  const start = parseLocalDate(startKey);
  const end = parseLocalDate(endKey);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Genera tutti i giorni tra startKey ed endKey (inclusi), in formato YYYY-MM-DD.
 */
export function expandDateRange(startKey, endKey) {
  const result = [];
  const current = parseLocalDate(startKey);
  const end = parseLocalDate(endKey);
  while (current <= end) {
    result.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return result;
}
