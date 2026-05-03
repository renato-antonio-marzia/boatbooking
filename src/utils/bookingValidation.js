/**
 * bookingValidation.js
 * ----------------------------------------------------------------------
 * Logica di validazione lato client per le prenotazioni.
 *
 * NOTA DI SICUREZZA:
 * Queste validazioni sono PRESENTAZIONALI - migliorano l'esperienza utente
 * fornendo feedback immediato. La validazione AUTORITATIVA è eseguita dalle
 * regole di sicurezza Firebase (file `firebase-rules.json`), che impediscono
 * scritture non valide anche se un utente bypassasse il client.
 * ----------------------------------------------------------------------
 */

import { compareDateKeys, todayKey } from './dateHelpers';

/**
 * Verifica se due intervalli di date si sovrappongono.
 * Due intervalli [a1, a2] e [b1, b2] si sovrappongono se a1 <= b2 e b1 <= a2.
 */
export function rangesOverlap(startA, endA, startB, endB) {
  return compareDateKeys(startA, endB) <= 0 && compareDateKeys(startB, endA) <= 0;
}

/**
 * Cerca conflitti tra una nuova prenotazione e quelle esistenti.
 * @param {string} startDate - Data inizio nuova prenotazione (YYYY-MM-DD)
 * @param {string} endDate - Data fine nuova prenotazione (YYYY-MM-DD)
 * @param {Array} existingBookings - Array di prenotazioni esistenti
 * @param {string|null} excludeId - ID di una prenotazione da escludere (utile per la modifica)
 * @returns {Array} Array di prenotazioni in conflitto (vuoto se nessun conflitto)
 */
export function findConflicts(startDate, endDate, existingBookings, excludeId = null) {
  return existingBookings.filter((booking) => {
    if (booking.id === excludeId) return false;
    return rangesOverlap(startDate, endDate, booking.startDate, booking.endDate);
  });
}

/**
 * Esegue tutte le validazioni su una richiesta di prenotazione.
 * @returns {Object} { valid: boolean, errors: Array<string>, conflicts: Array }
 */
export function validateBooking({
  startDate,
  endDate,
  existingBookings = [],
  excludeId = null,
  allowPastDates = false,
  maxDurationDays = 30,
}) {
  const errors = [];

  // 1. Campi obbligatori
  if (!startDate) errors.push('La data di inizio è obbligatoria.');
  if (!endDate) errors.push('La data di fine è obbligatoria.');
  if (errors.length > 0) {
    return { valid: false, errors, conflicts: [] };
  }

  // 2. Coerenza temporale
  if (compareDateKeys(startDate, endDate) > 0) {
    errors.push('La data di inizio deve essere uguale o precedente alla data di fine.');
  }

  // 3. Date passate
  if (!allowPastDates && compareDateKeys(startDate, todayKey()) < 0) {
    errors.push('Non è possibile prenotare date passate.');
  }

  // 4. Durata massima
  const today = todayKey();
  const start = startDate < today ? today : startDate;
  const durationMs = new Date(endDate) - new Date(start);
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1;
  if (durationDays > maxDurationDays) {
    errors.push(`La prenotazione non può superare ${maxDurationDays} giorni consecutivi.`);
  }

  // 5. Sovrapposizioni con altre prenotazioni
  const conflicts = findConflicts(startDate, endDate, existingBookings, excludeId);

  if (errors.length > 0) {
    return { valid: false, errors, conflicts };
  }

  if (conflicts.length > 0) {
    const conflictNames = conflicts.map((c) => c.userName).join(', ');
    errors.push(
      `Le date selezionate si sovrappongono con prenotazioni esistenti di: ${conflictNames}.`
    );
    return { valid: false, errors, conflicts };
  }

  return { valid: true, errors: [], conflicts: [] };
}
