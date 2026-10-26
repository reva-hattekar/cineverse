import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Popcorn,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Building,
  Sparkles,
  Armchair,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import AuditoriumSeatMap from '../components/AuditoriumSeatMap';

export default function BookingFlowView({
  movie,
  currentCustomer,
  onBack,
  onBookingFinished
}) {
  const [step, setStep] = useState(2); // 2: Seats & Showtime, 3: Snacks, 4: Payment, 5: Confirmation
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('aarav.sharma@oksbi');
  const [cardData, setCardData] = useState({
    name: 'Aarav Sharma',
    number: '4532 •••• •••• 8892',
    expiry: '08/28',
    cvv: '342'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    loadMovieShowtimes();
    loadSnacks();
  }, [movie]);

  const loadMovieShowtimes = async () => {
    setLoading(true);
    try {
      const res = await api.getMovieShowtimes(movie.movie_id);
      if (res.success) {
        setShowtimes(res.data);
        if (res.data.length > 0) {
          handleSelectShowtime(res.data[0]);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load screening schedules.');
    } finally {
      setLoading(false);
    }
  };

  const loadSnacks = async () => {
    try {
      const res = await api.getSnacks();
      if (res.success) setSnacks(res.data);
    } catch {
      // Graceful fallback
    }
  };

  const handleSelectShowtime = async (st) => {
    setSelectedShowtime(st);
    setSelectedSeatIds([]);
    setErrorMsg('');
    try {
      const res = await api.getShowtimeSeats(st.show_id);
      if (res.success) {
        setSeatsData(res.data);
        setStep(2);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch seat layout.');
    }
  };

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    if (selectedSeatIds.includes(seat.seat_id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.seat_id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat.seat_id]);
    }
  };

  const updateSnackQty = (snackId, delta) => {
    setSelectedSnacks(prev => {
      const cur = prev[snackId] || 0;
      const next = Math.max(0, cur + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[snackId];
      else copy[snackId] = next;
      return copy;
    });
  };

  // Calculations
  const calculateTicketTotal = () => {
    if (!seatsData || selectedSeatIds.length === 0) return 0;
    return selectedSeatIds.reduce((sum, sId) => {
      const s = seatsData.seats.find(seat => seat.seat_id === sId);
      return sum + (s ? s.price : 0);
    }, 0);
  };

  const calculateSnackTotal = () => {
    return Object.entries(selectedSnacks).reduce((sum, [sId, qty]) => {
      const sn = snacks.find(s => s.snack_id === parseInt(sId, 10));
      return sum + (sn ? parseFloat(sn.price) * qty : 0);
    }, 0);
  };

  const grandTotal = calculateTicketTotal() + calculateSnackTotal();

  const getSelectedSeatObjects = () => {
    if (!seatsData) return [];
    return seatsData.seats.filter(s => selectedSeatIds.includes(s.seat_id));
  };

  // Payment Confirmation Submission
  const handleProcessPayment = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Please select at least one seat before paying.');
      setStep(2);
      return;
    }

    setSubmittingPayment(true);
    setErrorMsg('');

    const snacksPayload = Object.entries(selectedSnacks).map(([sId, qty]) => ({
      snack_id: parseInt(sId, 10),
      quantity: qty
    }));

    try {
      const payload = {
        customer_id: currentCustomer.customer_id,
        show_id: selectedShowtime.show_id,
        seat_ids: selectedSeatIds,
        payment_method: paymentMethod,
        snacks: snacksPayload
      };

      const res = await api.createBooking(payload);
      if (res.success) {
        setBookingResult({
          ...res.data,
          movie_title: movie.title,
          theater_name: selectedShowtime.theater_name,
          screen_number: selectedShowtime.screen_number,
          show_date: selectedShowtime.show_date,
          start_time: selectedShowtime.start_time,
          seats: getSelectedSeatObjects(),
          total_amount: grandTotal
        });
        setStep(5); // Confirmation
      }
    } catch (err) {
      const isConflict = err.status === 409 || err.message?.includes('already booked') || err.message?.includes('conflict');
      if (isConflict) {
        setErrorMsg('⚠️ Seat Conflict: One or more selected seats were just reserved by another customer. Please select alternative seats.');
        // Refresh seat layout and reset selected seats
        if (selectedShowtime) {
          await handleSelectShowtime(selectedShowtime);
        }
        setSelectedSeatIds([]);
        setStep(2); // Return to seat selection step so user can reselect
      } else {
        setErrorMsg(err.message || 'Payment processing failed. Please retry.');
      }
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 140px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        paddingBottom: '16px',
        borderBottom: '1px solid #1c2438',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Movies
        </button>

        {/* Step Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <span style={{ color: step === 2 ? '#f59e0b' : '#94a3b8', fontWeight: step === 2 ? 800 : 600 }}>
            1. Showtime & Seats
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span style={{ color: step === 3 ? '#f59e0b' : '#94a3b8', fontWeight: step === 3 ? 800 : 600 }}>
            2. Concessions
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span style={{ color: step === 4 ? '#f59e0b' : '#94a3b8', fontWeight: step === 4 ? 800 : 600 }}>
            3. Payment
          </span>
          <span style={{ color: '#64748b' }}>›</span>
          <span style={{ color: step === 5 ? '#f59e0b' : '#94a3b8', fontWeight: step === 5 ? 800 : 600 }}>
            4. Confirmation
          </span>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#f87171',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', color: 'inherit', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
            ✕
          </button>
        </div>
      )}

      {/* STEP 1 & 2: MOVIE, SHOWTIME & AUDITORIUM SEAT PICKER */}
      {step <= 2 && (
        <>
          <div style={{
            background: '#121829',
            border: '1px solid #1c2438',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '90px',
              height: '125px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#182035',
              flexShrink: 0
            }}>
              <img
                src={movie.poster_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{movie.title}</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                {movie.genre} • {movie.language} • {movie.duration} mins • ⭐ {movie.rating}
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Select Screening Slot:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {showtimes.map(st => {
                    const isSelected = selectedShowtime?.show_id === st.show_id;
                    return (
                      <button
                        key={st.show_id}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 14px', fontSize: '0.82rem', textAlign: 'left' }}
                        onClick={() => handleSelectShowtime(st)}
                      >
                        <div>
                          <strong>{st.show_date}</strong> @ {st.start_time}
                        </div>
                        <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                          {st.theater_name} (Screen {st.screen_number}) • ₹{st.base_price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {selectedShowtime && seatsData && (
            <div className="auditorium-container">
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Auditorium Seat Selection</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                  Select your seats below. Warm amber marks selected seats.
                </p>
              </div>

              <AuditoriumSeatMap
                showtime={selectedShowtime}
                seats={seatsData.seats}
                selectedSeatIds={selectedSeatIds}
                onToggleSeat={toggleSeat}
                interactive={true}
              />
            </div>
          )}
        </>
      )}

      {/* STEP 3: CONCESSIONS & SNACKS */}
      {step === 3 && (
        <div style={{
          background: '#121829',
          border: '1px solid #1c2438',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '800px',
          margin: '0 auto 36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Popcorn size={24} color="#f59e0b" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Add Concession Combos</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
            Elevate your cinematic experience with popcorn and drinks delivered to your seat.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {snacks.map(sn => {
              const qty = selectedSnacks[sn.snack_id] || 0;
              return (
                <div key={sn.snack_id} style={{
                  background: '#0c101d',
                  border: '1px solid #1c2438',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{sn.snack_name}</div>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>₹{sn.price}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={() => updateSnackQty(sn.snack_id, -1)}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={() => updateSnackQty(sn.snack_id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid #1c2438', paddingTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              ← Back to Seats
            </button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>
              Proceed to Payment (₹{grandTotal}) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT CHECKOUT */}
      {step === 4 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Complete Your Booking</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Select your payment method below to finalize ticket reservation
            </p>
          </div>

          <div className="payment-grid">
            {/* Payment Method Selector */}
            <div className="payment-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#f59e0b" /> Choose Payment Method
              </h3>

              {/* UPI Option */}
              <div
                className={`method-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'UPI' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Instant UPI (GPay, PhonePe, Paytm)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero gateway charges • Instant confirmation</div>
                </div>
                <QrCode size={20} color="#f59e0b" />
              </div>

              {/* Card Option */}
              <div
                className={`method-option ${paymentMethod === 'Credit Card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Credit Card')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'Credit Card' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Credit or Debit Card</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Visa, MasterCard, RuPay</div>
                </div>
                <CreditCard size={20} color="#38bdf8" />
              </div>

              {/* Net Banking Option */}
              <div
                className={`method-option ${paymentMethod === 'Net Banking' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Net Banking')}
              >
                <div className="radio-indicator">
                  {paymentMethod === 'Net Banking' && <div className="radio-inner-dot" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Net Banking</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>HDFC, SBI, ICICI, Axis & all Indian banks</div>
                </div>
                <Building size={20} color="#10b981" />
              </div>

              {/* Payment Details Form based on selected method */}
              <div style={{ marginTop: '20px', padding: '16px', background: '#0b101d', borderRadius: '10px', border: '1px solid #1c2438' }}>
                {paymentMethod === 'UPI' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                      Enter VPA / UPI ID:
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                      Demo Mode: Instant auto-verification enabled.
                    </div>
                  </div>
                )}

                {paymentMethod === 'Credit Card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                        Cardholder Name:
                      </label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                        Card Number:
                      </label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                          Expiry (MM/YY):
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                          CVV:
                        </label>
                        <input
                          type="password"
                          maxLength="4"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                      Select Your Bank:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Final Confirmation Button */}
            <div className="payment-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
                  Booking Ledger Summary
                </h3>

                <div className="summary-item">
                  <span>Movie Title:</span>
                  <strong>{movie.title}</strong>
                </div>

                <div className="summary-item">
                  <span>Screening Slot:</span>
                  <span>{selectedShowtime.show_date} @ {selectedShowtime.start_time}</span>
                </div>

                <div className="summary-item">
                  <span>Venue Auditorium:</span>
                  <span>{selectedShowtime.theater_name} (Screen {selectedShowtime.screen_number})</span>
                </div>

                <div className="summary-item">
                  <span>Selected Seats:</span>
                  <strong style={{ color: '#f59e0b' }}>
                    {getSelectedSeatObjects().map(s => s.seat_number).join(', ')} ({selectedSeatIds.length})
                  </strong>
                </div>

                <div className="summary-item">
                  <span>Ticket Subtotal:</span>
                  <span>₹{calculateTicketTotal()}</span>
                </div>

                {calculateSnackTotal() > 0 && (
                  <div className="summary-item">
                    <span>F&B Concessions:</span>
                    <span>₹{calculateSnackTotal()}</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Grand Total:</span>
                  <span style={{ color: '#f59e0b' }}>₹{grandTotal}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                  onClick={handleProcessPayment}
                  disabled={submittingPayment}
                >
                  {submittingPayment ? 'Processing Transaction...' : `Confirm & Pay ₹${grandTotal} →`}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setStep(3)}
                >
                  ← Back to Concessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: BOOKING CONFIRMATION & TICKET SLIP */}
      {step === 5 && bookingResult && (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={36} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Booking Confirmed!</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '28px' }}>
            Your tickets have been registered in the database under Booking #{bookingResult.booking_id}.
          </p>

          <div className="ticket-slip" style={{ textAlign: 'left', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #23304c', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                  Booking Reference
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  #{bookingResult.booking_id}
                </div>
              </div>
              <QrCode size={36} color="#94a3b8" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{currentCustomer.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Movie:</span>
                <strong style={{ color: '#fff' }}>{bookingResult.movie_title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Screening:</span>
                <span>{bookingResult.show_date} @ {bookingResult.start_time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Cinema Auditorium:</span>
                <span>{bookingResult.theater_name} (Screen {bookingResult.screen_number})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Reserved Seats:</span>
                <strong style={{ color: '#f59e0b' }}>
                  {bookingResult.seats.map(s => s.seat_number).join(', ')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1c2438', paddingTop: '8px' }}>
                <span style={{ color: '#64748b' }}>Total Paid:</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{bookingResult.total_amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span>{bookingResult.payment_method}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => onBookingFinished('bookings')}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => onBookingFinished('home')}
              >
                Book More Tickets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM SUMMARY BAR FOR SEAT SELECTION STEP */}
      {step <= 2 && selectedShowtime && seatsData && (
        <div className="sticky-bar">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {selectedSeatIds.length > 0 ? (
                <>
                  Selected ({selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''}):{' '}
                  <strong style={{ color: '#f59e0b', fontWeight: 800 }}>
                    {getSelectedSeatObjects().map(s => s.seat_number).join(', ')}
                  </strong>{' '}
                  • Screen {selectedShowtime.screen_number}
                </>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  No seats selected • Click available seats on the map
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: selectedSeatIds.length > 0 ? '#f59e0b' : '#64748b' }}>
              ₹{calculateTicketTotal()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {selectedSeatIds.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Select at least 1 seat
              </span>
            )}
            <button
              className="btn btn-primary"
              disabled={selectedSeatIds.length === 0}
              onClick={() => setStep(3)}
              style={{
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: 800,
                opacity: selectedSeatIds.length === 0 ? 0.45 : 1,
                cursor: selectedSeatIds.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Continue to Concessions & Payment →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
