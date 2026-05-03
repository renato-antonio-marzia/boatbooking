import React, { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  format,
} from 'date-fns';
import { it } from 'date-fns/locale';
import {
  formatDateKey,
  todayKey,
  parseLocalDate,
  expandDateRange,
} from '../utils/dateHelpers';
import './Calendar.css';

/**
 * Calendar - calendario mensile con griglia completa.
 *
 * CORREZIONE rispetto a Copilot:
 * Il codice originale usava `eachDayOfInterval(monthStart, monthEnd)` che
 * produce solo i giorni del mese corrente. Questo rompe la griglia visuale
 * perché i primi giorni del mese non appaiono nella colonna corretta del
 * giorno della settimana.
 *
 * Soluzione: estendiamo l'intervallo all'inizio della settimana del primo
 * giorno e alla fine della settimana dell'ultimo giorno.
 */
function Calendar({ selectedDate, onDateSelect, bookings, currentUserId }) {
  // selectedDate è una stringa YYYY-MM-DD; manteniamo internamente un Date per la navigazione
  const [viewDate, setViewDate] = useState(parseLocalDate(selectedDate));

  // Mappa: dataKey -> array di prenotazioni che la coprono
  const bookingsByDate = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const dates = expandDateRange(booking.startDate, booking.endDate);
      dates.forEach((dateKey) => {
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey).push(booking);
      });
    });
    return map;
  }, [bookings]);

  // Griglia completa: dal primo giorno della prima settimana, all'ultimo dell'ultima
  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    // weekStartsOn: 1 = lunedì (calendario italiano)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewDate]);

  const today = todayKey();

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));
  const handleToday = () => {
    setViewDate(new Date());
    onDateSelect(today);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn" aria-label="Mese precedente">
          ‹
        </button>
        <h3 className="calendar-month">
          {format(viewDate, 'MMMM yyyy', { locale: it })}
        </h3>
        <button onClick={handleNextMonth} className="nav-btn" aria-label="Mese successivo">
          ›
        </button>
        <button onClick={handleToday} className="today-btn">
          Oggi
        </button>
      </div>

      <div className="calendar-weekdays">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Gio</div>
        <div>Ven</div>
        <div>Sab</div>
        <div>Dom</div>
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const dayKey = formatDateKey(day);
          const dayBookings = bookingsByDate.get(dayKey) || [];
          const isSelected = dayKey === selectedDate;
          const isTodayDate = dayKey === today;
          const isCurrentMonth = isSameMonth(day, viewDate);
          const hasMyBooking = dayBookings.some((b) => b.userId === currentUserId);
          const hasOthersBooking = dayBookings.some((b) => b.userId !== currentUserId);

          let bookingClass = '';
          if (hasMyBooking && hasOthersBooking) bookingClass = 'has-mixed';
          else if (hasMyBooking) bookingClass = 'has-mine';
          else if (hasOthersBooking) bookingClass = 'has-others';

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onDateSelect(dayKey)}
              className={`calendar-day ${isCurrentMonth ? 'active' : 'inactive'} ${
                isSelected ? 'selected' : ''
              } ${isTodayDate ? 'today' : ''} ${bookingClass}`}
              title={
                dayBookings.length > 0
                  ? dayBookings.map((b) => b.userName).join(', ')
                  : ''
              }
            >
              <span className="day-number">{format(day, 'd')}</span>
              {dayBookings.length > 0 && (
                <span className="booking-dot" aria-hidden="true"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot today-dot"></span>
          <span>Oggi</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot mine-dot"></span>
          <span>Tue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot others-dot"></span>
          <span>Altri</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot mixed-dot"></span>
          <span>Sovrapp.</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
