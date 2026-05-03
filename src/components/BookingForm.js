import React, { useState, useEffect } from 'react';
import { validateBooking } from '../utils/bookingValidation';
import { todayKey } from '../utils/dateHelpers';
import './BookingForm.css';

/**
 * BookingForm - form per creazione di una nuova prenotazione.
 *
 * MIGLIORAMENTI rispetto a Copilot:
 * - Validazione in tempo reale della sovrapposizione con altre prenotazioni
 * - Blocco delle date passate tramite attributo `min`
 * - Mostra elenco dei conflitti con il nome del prenotatore
 * - Anteprima della durata in giorni
 * - Limite massimo a 30 giorni consecutivi
 */
function BookingForm({ onSubmit, selectedDateKey, existingBookings }) {
  const today = todayKey();
  const initialDate = selectedDateKey && selectedDateKey >= today ? selectedDateKey : today;

  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Aggiorna la data inizio quando l'utente clicca su un giorno del calendario
  useEffect(() => {
    if (selectedDateKey && selectedDateKey >= today) {
      setStartDate(selectedDateKey);
      if (selectedDateKey > endDate) {
        setEndDate(selectedDateKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateKey]);

  // Validazione live (preview dei conflitti)
  useEffect(() => {
    if (!startDate || !endDate) {
      setConflicts([]);
      return;
    }
    const validation = validateBooking({
      startDate,
      endDate,
      existingBookings,
    });
    setConflicts(validation.conflicts);
  }, [startDate, endDate, existingBookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ startDate, endDate, notes: notes.trim() });
      // Reset
      setStartDate(today);
      setEndDate(today);
      setNotes('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Calcolo durata
  const durationDays = (() => {
    if (!startDate || !endDate || startDate > endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.round(diff) + 1;
  })();

  const hasConflicts = conflicts.length > 0;

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Data inizio</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value > endDate) setEndDate(e.target.value);
            }}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Data fine</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {durationDays > 0 && (
        <div className="duration-info">
          Durata: <strong>{durationDays}</strong> {durationDays === 1 ? 'giorno' : 'giorni'}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="notes">Note (opzionale)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Es. Gita con amici, manutenzione, weekend in famiglia..."
          rows="2"
          maxLength="200"
        />
        <small className="char-count">{notes.length}/200</small>
      </div>

      {hasConflicts && (
        <div className="conflicts-box">
          <strong>Attenzione - sovrapposizione con prenotazioni esistenti:</strong>
          <ul>
            {conflicts.map((c) => (
              <li key={c.id}>
                <strong>{c.userName}</strong> ({c.startDate} → {c.endDate})
                {c.notes && <span className="conflict-notes"> - {c.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        disabled={loading || hasConflicts}
        className="submit-btn"
      >
        {loading ? 'Salvataggio...' : 'Conferma prenotazione'}
      </button>
    </form>
  );
}

export default BookingForm;
