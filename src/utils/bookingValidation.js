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

import { compareDateKeys, todayKey, parseLocalDate, addDaysKey, expandDateRange } from './dateHelpers';

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

/**
 * Restituisce la lista dei weekend (sabati) toccati dall'intervallo [start, end].
 * Un weekend è "toccato" se l'intervallo include almeno il sabato o la domenica.
 * Ogni weekend è identificato dalla data del suo SABATO (chiave canonica).
 *
 * @returns {Array<{sat: string, sun: string}>} ordinati cronologicamente
 */
export function getWeekendsInRange(startKey, endKey) {
  if (!startKey || !endKey || compareDateKeys(startKey, endKey) > 0) return [];

  const saturdaySet = new Set();
  for (const dateKey of expandDateRange(startKey, endKey)) {
    const d = parseLocalDate(dateKey);
    const dow = d.getDay(); // 0=Dom, 6=Sab
    if (dow === 6) {
      saturdaySet.add(dateKey);
    } else if (dow === 0) {
      saturdaySet.add(addDaysKey(dateKey, -1));
    }
  }

  return Array.from(saturdaySet)
    .sort()
    .map((sat) => ({ sat, sun: addDaysKey(sat, 1) }));
}

/**
 * Verifica la regola di equità: lo stesso utente non dovrebbe prenotare
 * due weekend consecutivi (per dare opportunità a tutti i fratelli).
 *
 * Trigger:
 * 1. Stesso utente ha un'altra prenotazione che tocca il weekend precedente
 *    a uno dei weekend toccati dalla nuova prenotazione.
 * 2. La nuova prenotazione stessa copre 2 weekend consecutivi (es. lunga
 *    prenotazione che attraversa due sab/dom adiacenti).
 *
 * @returns {Object} { hasConflict, reason, previousWeekend, currentWeekend, conflictingBooking }
 */
export function checkConsecutiveWeekends({
  startDate,
  endDate,
  userId,
  existingBookings = [],
  excludeId = null,
}) {
  const newWeekends = getWeekendsInRange(startDate, endDate);
  if (newWeekends.length === 0) {
    return { hasConflict: false };
  }

  // Caso 2 — stessa prenotazione copre 2 weekend consecutivi
  for (let i = 1; i < newWeekends.length; i++) {
    const prevSat = newWeekends[i - 1].sat;
    const currSat = newWeekends[i].sat;
    if (addDaysKey(prevSat, 7) === currSat) {
      return {
        hasConflict: true,
        reason: 'self',
        previousWeekend: newWeekends[i - 1],
        currentWeekend: newWeekends[i],
        conflictingBooking: null,
      };
    }
  }

  // Caso 1 — altra prenotazione dello stesso utente sul weekend precedente
  const myOtherBookings = existingBookings.filter(
    (b) => b.userId === userId && b.id !== excludeId
  );

  for (const w of newWeekends) {
    const prevSat = addDaysKey(w.sat, -7);
    const prevSun = addDaysKey(w.sat, -6);

    const conflictingBooking = myOtherBookings.find(
      (b) =>
        compareDateKeys(b.startDate, prevSun) <= 0 &&
        compareDateKeys(prevSat, b.endDate) <= 0
    );

    if (conflictingBooking) {
      return {
        hasConflict: true,
        reason: 'other',
        previousWeekend: { sat: prevSat, sun: prevSun },
        currentWeekend: w,
        conflictingBooking,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Formato leggibile di una coppia (sat, sun) tipo "10–11 maggio 2026".
 * Helper per messaggi UI.
 */
export function formatWeekendLabel(weekend) {
  if (!weekend) return '';
  const sat = parseLocalDate(weekend.sat);
  const sun = parseLocalDate(weekend.sun);
  const monthFmt = sat.toLocaleDateString('it-IT', { month: 'long' });
  const monthFmtSun = sun.toLocaleDateString('it-IT', { month: 'long' });
  if (monthFmt === monthFmtSun) {
    return `${sat.getDate()}–${sun.getDate()} ${monthFmt} ${sat.getFullYear()}`;
  }
  // Weekend a cavallo di due mesi (raro: ultimo sabato di un mese)
  const dayMonth = (d) =>
    d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  return `${dayMonth(sat)}–${dayMonth(sun)} ${sat.getFullYear()}`;
}

