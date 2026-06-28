/* ============================================
   RAJU DHABA — Express API Server
   ============================================ */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend (HTML, CSS, JS, images) as static files
app.use(express.static(path.join(__dirname)));

// ── Validation helper ────────────────────────────────────────────────────────
function validateBookingPayload(body) {
  const errors = [];
  const { fname, lname, phone, date, time, guests } = body;

  if (!fname || typeof fname !== 'string' || fname.trim().length < 1)
    errors.push('First name is required.');
  if (!lname || typeof lname !== 'string' || lname.trim().length < 1)
    errors.push('Last name is required.');

  if (!phone || typeof phone !== 'string')
    errors.push('Phone number is required.');
  else if (!/^[+\d\s\-().]{6,20}$/.test(phone.trim()))
    errors.push('Phone number format is invalid.');

  if (!date) {
    errors.push('Date is required.');
  } else {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(d.getTime()))       errors.push('Date is invalid.');
    else if (d < today)           errors.push('Date cannot be in the past.');
  }

  if (!time) {
    errors.push('Time is required.');
  } else if (!/^\d{2}:\d{2}$/.test(time)) {
    errors.push('Time format is invalid (expected HH:MM).');
  } else {
    const [h, m] = time.split(':').map(Number);
    if (h < 11 || (h === 22 && m > 30) || h > 22)
      errors.push('Reservation time must be between 11:00 and 22:30.');
  }

  const validGuests = ['1','2','3','4','5','6','7+'];
  if (!guests || !validGuests.includes(guests))
    errors.push(`Guests must be one of: ${validGuests.join(', ')}.`);

  return errors;
}

// Ensure compatibility if Vercel strips /api prefix when routing
app.use((req, res, next) => {
  if (req.url.startsWith('/bookings')) {
    req.url = '/api' + req.url;
  }
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Create a new table reservation
 */
app.post('/api/bookings', (req, res) => {
  const errors = validateBookingPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const booking = db.createBooking({
      fname:   req.body.fname.trim(),
      lname:   req.body.lname.trim(),
      phone:   req.body.phone.trim(),
      date:    req.body.date,
      time:    req.body.time,
      guests:  req.body.guests,
      special: (req.body.special || '').trim()
    });

    console.log(`[${new Date().toISOString()}] NEW BOOKING #${booking.id} — ${booking.fname} ${booking.lname} | ${booking.date} ${booking.time} | ${booking.guests} guest(s)`);

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed!',
      booking
    });
  } catch (err) {
    console.error('DB error on create:', err);
    res.status(500).json({ success: false, error: 'Database error. Please try again.' });
  }
});

/**
 * GET /api/bookings
 * List all bookings (admin use)
 * Supports optional ?date=YYYY-MM-DD filter
 */
app.get('/api/bookings', (req, res) => {
  try {
    let bookings;
    if (req.query.date) {
      bookings = db.getBookingsByDate(req.query.date);
    } else {
      bookings = db.getAllBookings();
    }
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('DB error on list:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

/**
 * GET /api/bookings/stats
 * Dashboard statistics
 */
app.get('/api/bookings/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('DB error on stats:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

/**
 * GET /api/bookings/:id
 * Get a single booking by ID
 */
app.get('/api/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID.' });

  try {
    const booking = db.getBookingById(id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
    res.json({ success: true, booking });
  } catch (err) {
    console.error('DB error on get:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

/**
 * PATCH /api/bookings/:id/status
 * Update booking status (confirm / cancel / complete / no-show)
 * Body: { status: "cancelled" }
 */
app.patch('/api/bookings/:id/status', (req, res) => {
  const id     = parseInt(req.params.id, 10);
  const status = req.body.status;

  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID.' });
  if (!status)   return res.status(400).json({ success: false, error: 'Status is required.' });

  try {
    const booking = db.updateBookingStatus(id, status);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });
    res.json({ success: true, message: `Status updated to "${status}".`, booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/bookings/:id
 * Permanently delete a booking
 */
app.delete('/api/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID.' });

  try {
    const booking = db.deleteBooking(id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    console.log(`[${new Date().toISOString()}] DELETED BOOKING #${id}`);
    res.json({ success: true, message: 'Booking deleted.', booking });
  } catch (err) {
    console.error('DB error on delete:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

// Serve index and admin dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('  🍛  Raju Dhaba — Booking Server');
    console.log('  ─────────────────────────────────────────');
    console.log(`  🌐  Website  →  http://localhost:${PORT}`);
    console.log(`  🔧  Admin    →  http://localhost:${PORT}/admin`);
    console.log(`  📡  API      →  http://localhost:${PORT}/api/bookings`);
    console.log('  ─────────────────────────────────────────');
    console.log('  Press Ctrl+C to stop.\n');
  });
}

module.exports = app;
