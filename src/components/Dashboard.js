import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { database } from '../firebaseConfig';
import { validateBooking } from '../utils/bookingValidation';
import { todayKey } from '../utils/dateHelpers';
import { sendBookingNotifications } from '../utils/notifications';
import Calendar from './Calendar';
import BookingForm from './BookingForm';
import BookingList from './BookingList';
import { ToastContainer } from './Toast';
import './Dashboard.css';

function Dashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [toasts, setToasts] = useState([]);

  const knownBookingIdsRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((message) => {
    setToasts((curr) => [
      ...curr,
      { id: `${Date.now()}-${Math.random()}`, message },
    ]);
  }, []);

  useEffect(() => {
    const bookingsRef = ref(database, 'bookings');
    const unsubscribe = onValue(
      bookingsRef,
      (snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : {};
        const list = Object.entries(data).map(([id, booking]) => ({
          id,
          ...booking,
        }));

        if (knownBookingIdsRef.current === null) {
          knownBookingIdsRef.current = new Set(list.map((b) => b.id));
        } else {
          const newOnes = list.filter(
            (b) =>
              !knownBookingIdsRef.current.has(b.id) && b.userId !== user.uid
          );
          newOnes.forEach((b) => {
            pushToast(
              `${b.userName} ha prenotato dal ${b.startDate} al ${b.endDate}`
            );
          });
          knownBookingIdsRef.current = new Set(list.map((b) => b.id));
        }

        setBookings(list);
        setPermissionError('');
        setLoading(false);
      },
      (error) => {
        console.error('Errore lettura prenotazioni:', error);
        setPermissionError(
          'Impossibile leggere le prenotazioni. Il tuo account non è ancora autorizzato. ' +
            `Comunica al gestore il tuo UID: ${user.uid}`
        );
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user.uid, pushToast]);

  useEffect(() => {
    const recipientsRef = ref(database, 'notification_recipients');
    const unsubscribe = onValue(
      recipientsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRecipients([]);
          return;
        }
        const list = Object.values(snapshot.val()).filter(
          (r) => r && r.email
        );
        setRecipients(list);
      },
      () => setRecipients([])
    );
    return () => unsubscribe();
  }, []);

  const handleAddBooking = async (bookingData) => {
    const validation = validateBooking({
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      existingBookings: bookings,
    });

    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    const bookingsRef = ref(database, 'bookings');
    const newBooking = {
      boatId: bookingData.boatId || 'barca',
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      notes: bookingData.notes || '',
      userId: user.uid,
      userName: user.displayName || user.email,
      createdAt: new Date().toISOString(),
    };
    await push(bookingsRef, newBooking);
    setShowForm(false);

    sendBookingNotifications({
      booking: newBooking,
      recipients,
      authorEmail: user.email,
    }).then((result) => {
      if (result?.sent > 0) {
        pushToast(`Email inviata a ${result.sent} destinatari`);
      }
    });
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await remove(ref(database, `bookings/${bookingId}`));
    } catch (error) {
      console.error('Errore cancellazione:', error);
      alert('Impossibile cancellare la prenotazione: ' + error.message);
    }
  };

  const handleEditBooking = async (bookingId, updatedData) => {
    try {
      if (updatedData.startDate || updatedData.endDate) {
        const current = bookings.find((b) => b.id === bookingId);
        const startDate = updatedData.startDate || current.startDate;
        const endDate = updatedData.endDate || current.endDate;
        const validation = validateBooking({
          startDate,
          endDate,
          existingBookings: bookings,
          excludeId: bookingId,
        });
        if (!validation.valid) {
          throw new Error(validation.errors.join(' '));
        }
      }
      await update(ref(database, `bookings/${bookingId}`), updatedData);
    } catch (error) {
      console.error('Errore modifica:', error);
      alert('Impossibile modificare: ' + error.message);
    }
  };

  if (permissionError) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="permission-error-card">
            <h2>Accesso non autorizzato</h2>
            <p>{permissionError}</p>
            <p className="uid-display">
              <strong>Il tuo UID:</strong>
              <code>{user.uid}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const myBookings = bookings.filter((b) => b.userId === user.uid).length;
  const upcomingBookings = bookings.filter(
    (b) => b.endDate >= todayKey()
  ).length;

  return (
    <div className="dashboard">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="dashboard-container">
        <div className="dashboard-grid">
          <section className="calendar-section">
            <h2>Calendario</h2>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              bookings={bookings}
              currentUserId={user.uid}
            />
          </section>

          <section className="bookings-section">
            <div className="bookings-header">
              <h2>Prenotazioni</h2>
              <button
                className="btn-add"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Chiudi' : 'Nuova prenotazione'}
              </button>
            </div>

            {showForm && (
              <BookingForm
                onSubmit={handleAddBooking}
                selectedDateKey={selectedDate}
                existingBookings={bookings}
                currentUserId={user.uid}
              />
            )}

            <div className="bookings-list-container">
              {loading ? (
                <p className="loading">Caricamento prenotazioni...</p>
              ) : bookings.length === 0 ? (
                <p className="no-bookings">
                  Nessuna prenotazione presente. Crea la prima!
                </p>
              ) : (
                <BookingList
                  bookings={bookings}
                  currentUser={user}
                  onDelete={handleDeleteBooking}
                  onEdit={handleEditBooking}
                />
              )}
            </div>
          </section>
        </div>

        <section className="stats-section">
          <h3>Statistiche</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Prenotazioni totali</p>
              <p className="stat-value">{bookings.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Prenotazioni future</p>
              <p className="stat-value">{upcomingBookings}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Le tue prenotazioni</p>
              <p className="stat-value">{myBookings}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
