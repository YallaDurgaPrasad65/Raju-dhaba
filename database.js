/* ============================================
   RAJU DHABA — Database Module (JSON file store)
   No native binaries needed — pure Node.js fs
   ============================================ */

'use strict';

const fs   = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const DB_FILE = isVercel ? path.join('/tmp', 'bookings.json') : path.join(__dirname, 'bookings.json');

// ── Bootstrap ────────────────────────────────────────────────────────────────
// Create the DB file with an empty structure if it doesn't exist yet
function _ensureDb() {
  if (!fs.existsSync(DB_FILE)) {
    if (isVercel) {
      const initialDb = path.join(__dirname, 'bookings.json');
      if (fs.existsSync(initialDb)) {
        try {
          fs.copyFileSync(initialDb, DB_FILE);
          return;
        } catch (e) {
          console.error('Could not copy initial bookings.json to /tmp:', e.message);
        }
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify({ nextId: 1, bookings: [] }, null, 2), 'utf-8');
  }
}

// ── Low-level read/write ─────────────────────────────────────────────────────
function _read() {
  _ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    // Corrupt file — reset gracefully
    console.error('bookings.json is corrupt, resetting:', e.message);
    const fresh = { nextId: 1, bookings: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
    return fresh;
  }
}

function _write(data) {
  // Atomic write: write to a temp file then rename to avoid corruption
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

// ── CRUD helpers ─────────────────────────────────────────────────────────────

/**
 * Create a new booking.
 * @param {{ fname, lname, phone, date, time, guests, special }} data
 * @returns {object} the saved booking record
 */
function createBooking(data) {
  const store = _read();

  const booking = {
    id:         store.nextId,
    fname:      data.fname,
    lname:      data.lname,
    phone:      data.phone,
    date:       data.date,
    time:       data.time,
    guests:     data.guests,
    special:    data.special || '',
    status:     'confirmed',
    created_at: new Date().toISOString()
  };

  store.bookings.push(booking);
  store.nextId += 1;
  _write(store);

  return booking;
}

/**
 * Return all bookings, newest first.
 */
function getAllBookings() {
  const { bookings } = _read();
  return [...bookings].sort((a, b) => {
    // Sort by date DESC, then time DESC
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });
}

/**
 * Return a single booking by numeric id, or null.
 */
function getBookingById(id) {
  const { bookings } = _read();
  return bookings.find(b => b.id === id) || null;
}

/**
 * Return bookings for a specific date (YYYY-MM-DD), sorted by time ASC.
 */
function getBookingsByDate(date) {
  const { bookings } = _read();
  return bookings
    .filter(b => b.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Update a booking's status.
 * Valid values: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
 * Returns updated booking or null if not found.
 */
function updateBookingStatus(id, status) {
  const VALID = ['confirmed', 'cancelled', 'completed', 'no-show'];
  if (!VALID.includes(status)) throw new Error(`Invalid status: ${status}`);

  const store = _read();
  const idx   = store.bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;

  store.bookings[idx].status = status;
  _write(store);
  return store.bookings[idx];
}

/**
 * Permanently delete a booking.
 * Returns the deleted booking, or null if not found.
 */
function deleteBooking(id) {
  const store = _read();
  const idx   = store.bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;

  const [deleted] = store.bookings.splice(idx, 1);
  _write(store);
  return deleted;
}

/**
 * Return aggregate stats for the admin dashboard.
 */
function getStats() {
  const { bookings } = _read();
  const today = new Date().toISOString().split('T')[0];

  const total_bookings = bookings.length;
  const confirmed      = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled      = bookings.filter(b => b.status === 'cancelled').length;

  const todayConfirmed = bookings.filter(b => b.date === today && b.status === 'confirmed');
  const today_bookings = todayConfirmed.length;
  const today_guests   = todayConfirmed.reduce((sum, b) => {
    const n = b.guests === '7+' ? 7 : parseInt(b.guests, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return { total_bookings, confirmed, cancelled, today_bookings, today_guests };
}

// ── Init on require ───────────────────────────────────────────────────────────
_ensureDb();

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByDate,
  updateBookingStatus,
  deleteBooking,
  getStats
};
