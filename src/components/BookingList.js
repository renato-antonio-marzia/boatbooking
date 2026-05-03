import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { parseLocalDate, daysBetween, todayKey } from '../utils/dateHelpers';
import './BookingList.css';

/**
 * BookingList - elenco delle prenotazioni con filtri e ordinamento.
 *
 * MIGLIORAMENTI rispetto a Copilot:
 * - Filtro per "tutte / future / passate"
 * - Ordinamento cronologico
 * - Distinzione visiva tra prenotazioni proprie e altrui
 * - Conferma esplicita per la cancellazione (no usando window.confirm grezzo)
 * - Modifica supporta anche le date, non solo le note
 */
function BookingList({ bookings, currentUser, onDelete, onEdit }) {
  const [filter, setFilter] = useState('upcoming'); // 'all' | 'upcoming' | 'past'
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const today = todayKey();

  const filtered = bookings.filter((booking) => {
    if (filter === 'upcoming') return booking.endDate >= today;
    if (filter === 'past') return booking.endDate < today;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const handleEditClick = (booking) => {
    setEditingId(booking.id);
    setEditForm({
      startDate: booking.startDate,
      endDate: booking.endDate,
      notes: booking.notes || '',
    });
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (bookingId) => {
    try {
      await onEdit(bookingId, {
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        notes: editForm.notes,
      });
      setEditingId(null);
    } catch (err) {
      // L'errore viene gestito dal genitore (Dashboard) tramite alert
    }
  };

  const handleDeleteClick = (bookingId) => {
    setConfirmDeleteId(bookingId);
    setEditingId(null);
  };

  const handleConfirmDelete = (bookingId) => {
    onDelete(bookingId);
    setConfirmDeleteId(null);
  };

  const formatDateLabel = (dateKey) => {
    return format(parseLocalDate(dateKey), 'EEEE d MMMM yyyy', { locale: it });
  };

  return (
    <div className="booking-list">
      <div className="filter-bar">
        <button
          className={filter === 'upcoming' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('upcoming')}
        >
          Future ({bookings.filter((b) => b.endDate >= today).length})
        </button>
        <button
          className={filter === 'past' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('past')}
        >
          Passate ({bookings.filter((b) => b.endDate < today).length})
        </button>
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Tutte ({bookings.length})
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-list">
          Nessuna prenotazione in questa categoria.
        </p>
      ) : (
        sorted.map((booking) => {
          const isOwner = booking.userId === currentUser.uid;
          const isEditing = editingId === booking.id;
          const isPast = booking.endDate < today;
          const days = daysBetween(booking.startDate, booking.endDate);

          return (
            <div
              key={booking.id}
              className={`booking-card ${isOwner ? 'owner' : ''} ${isPast ? 'past' : ''}`}
            >
              {!isEditing ? (
                <>
                  <div className="booking-card-header">
                    <div className="booking-info">
                      <h4>
                        {formatDateLabel(booking.startDate)}
                        {booking.startDate !== booking.endDate && (
                          <>
                            <span className="arrow"> → </span>
                            {formatDateLabel(booking.endDate)}
                          </>
                        )}
                      </h4>
                      <p className="booking-user">
                        Prenotato da: <strong>{booking.userName}</strong>
                        {isOwner && <span className="owner-badge">Tu</span>}
                      </p>
                    </div>
                    {isOwner && !isPast && (
                      <div className="booking-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditClick(booking)}
                          title="Modifica"
                        >
                          Modifica
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClick(booking.id)}
                          title="Elimina"
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="booking-notes">{booking.notes}</p>
                  )}

                  <div className="booking-meta">
                    <span className="meta-badge">
                      {days} {days === 1 ? 'giorno' : 'giorni'}
                    </span>
                    {booking.createdAt && (
                      <span className="meta-text">
                        Creato il{' '}
                        {format(parseISO(booking.createdAt), 'd MMM yyyy HH:mm', { locale: it })}
                      </span>
                    )}
                  </div>

                  {confirmDeleteId === booking.id && (
                    <div className="confirm-delete">
                      <p>Confermi la cancellazione?</p>
                      <button
                        className="btn-confirm-delete"
                        onClick={() => handleConfirmDelete(booking.id)}
                      >
                        Sì, elimina
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="edit-form">
                  <div className="edit-row">
                    <label>
                      Inizio
                      <input
                        type="date"
                        value={editForm.startDate}
                        min={today}
                        onChange={(e) =>
                          setEditForm({ ...editForm, startDate: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Fine
                      <input
                        type="date"
                        value={editForm.endDate}
                        min={editForm.startDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, endDate: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    placeholder="Note..."
                    rows="2"
                    maxLength="200"
                  />
                  <div className="edit-buttons">
                    <button
                      className="btn-save"
                      onClick={() => handleSaveEdit(booking.id)}
                    >
                      Salva
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default BookingList;
