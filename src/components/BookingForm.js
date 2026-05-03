import React, { useState, useEffect } from 'react';
import {
  validateBooking,
  checkConsecutiveWeekends,
  formatWeekendLabel,
} from '../utils/bookingValidation';
import { todayKey } from '../utils/dateHelpers';
import './BookingForm.css';

function BookingForm({ onSubmit, selectedDateKey, existingBookings, currentUserId }) {
  const today = todayKey();
  const initialDate =
    selectedDateKey && selectedDateKey >= today ? selectedDateKey : today;

  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [weekendWarning, setWeekendWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDateKey && selectedDateKey >= today) {
      setStartDate(selectedDateKey);
      if (selectedDateKey > endDate) {
        setEndDate(selectedDateKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateKey]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setConflicts([]);
      setWeekendWarning(null);
      return;
    }
    const validation = validateBooking({
      startDate,
      endDate,
      existingBookings,
    });
    setConflicts(validation.conflicts);

    if (currentUserId) {
      const w = checkConsecutiveWeekends({
        startDate,
        endDate,
        userId: currentUserId,
        existingBookings,
      });
      setWeekendWarning(w.hasConflict ? w : null);
    }
  }, [startDate, endDate, existingBookings, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ startDate, endDate, notes: notes.trim() });
      setStartDate(today);
      setEndDate(today);
      setNotes('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const durationDays = (() => {
    if (!startDate || !endDate || startDate > endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.round(diff) + 1;
  })();

  const hasConflicts = conflicts.length > 0;
  const hasWeekendWarning = weekendWarning !== null;

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
          Durata: <strong>{durationDays}</strong>{' '}
          {durationDays === 1 ? 'giorno' : 'giorni'}
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

      {hasWeekendWarning && !hasConflicts && (
        <div className="weekend-warning-box">
          <strong>⚠️ Attenzione: due weekend consecutivi</strong>
          <p>
            {weekendWarning.reason === 'self'
              ? `Questa prenotazione copre due weekend consecutivi (${formatWeekendLabel(
                  weekendWarning.previousWeekend
                )} e ${formatWeekendLabel(weekendWarning.currentWeekend)}).`
              : `Hai già una prenotazione sul weekend del ${formatWeekendLabel(
                  weekendWarning.previousWeekend
                )} e questa nuova ne tocca quello successivo (${formatWeekendLabel(
                  weekendWarning.currentWeekend
                )}).`}
          </p>
          <p className="weekend-warning-note">
            Per equità tra fratelli, evitiamo due weekend consecutivi. Puoi
            comunque procedere se è una scelta condivisa.
          </p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        disabled={loading || hasConflicts}
        className={`submit-btn ${hasWeekendWarning ? 'submit-btn-warning' : ''}`}
      >
        {loading
          ? 'Salvataggio...'
          : hasWeekendWarning
          ? 'Procedi nonostante l\'avviso ⚠️'
          : 'Conferma prenotazione'}
      </button>
    </form>
  );
}

export default BookingForm;
