import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardTopbar from '../components/dashboard/DashboardTopbar';
import StatCard from '../components/dashboard/StatCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
import reviewService from '../services/reviewService';
import messagingService from '../services/messagingService';
import GuestCommunication from '../components/GuestCommunication';
import GuestItinerary from '../components/GuestItinerary';
import './GuestDashboard.css';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Dates pending';
const titleOf = (booking) => booking?.property?.title || booking?.property?.name || 'Property booking';
const locationOf = (booking) => booking?.property?.location || booking?.property?.city || 'Kenya';
const imageOf = (property) => property?.image || property?.image_url || property?.images?.find((image) => image.is_primary)?.image_url || property?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80';
const statusClass = (status) => ({ CONFIRMED: 'status-confirmed', PENDING: 'status-pending', FAILED: 'status-failed', CANCELLED: 'status-cancelled' }[status] || 'status-pending');
const playNotificationSound = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.18);
  } catch { /* sound is unavailable in this browser */ }
};

function GuestDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [reviewBooking, setReviewBooking] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageFile, setMessageFile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchBookings = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get('bookings/'); setBookings(Array.isArray(data) ? data : data.results || []); }
    catch { setBookings([]); setNotice('We could not load your bookings. Please try again shortly.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { wishlistService.list().then((lists) => setFavorites(lists.flatMap((list) => list.properties))).catch(() => setFavorites([])); }, []);
  useEffect(() => {
    let previous = new Set();
    const loadNotifications = async () => {
      try {
        const items = await messagingService.notifications();
        const newItems = items.filter((item) => !previous.has(item.id));
        if (previous.size && newItems.length) {
          playNotificationSound();
          if (Notification.permission === 'granted') newItems.forEach((item) => new Notification(item.title, { body: item.body }));
        }
        previous = new Set(items.map((item) => item.id));
        setNotifications(items);
      } catch { /* notifications are optional when offline */ }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);
  const removeFavorite = async (item) => { try { const list = await wishlistService.toggleProperty(item); setFavorites(list.properties); } catch { setNotice('Could not update your wishlist.'); } };
  // Kept for the compact saved-stay card handler; server updates occur from listing cards.
  const saveFavorites = (next) => setFavorites(next);
  const cancelBooking = async (booking) => {
    if (!window.confirm(`Cancel your stay at ${titleOf(booking)}?`)) return;
    try { await api.post(`bookings/${booking.id}/cancel/`); setBookings((items) => items.map((item) => item.id === booking.id ? { ...item, payment_status: 'CANCELLED' } : item)); setNotice('Your booking has been cancelled. Any eligible refund will be processed by the payment provider.'); }
    catch { setNotice('Cancellation is not available yet. Please contact support or try again.'); }
  };
  const submitReview = async (event) => { event.preventDefault(); try { await reviewService.create(reviewBooking.property.id, { bookingId: reviewBooking.id, ...review, photos: reviewPhotos }); setReviewBooking(null); setReview({ rating: 5, comment: '' }); setReviewPhotos([]); setNotice('Thanks for sharing your experience. Your review has been published.'); } catch { setNotice('Your review could not be published. You can review only confirmed stays.'); } };
  const openConversation = async (booking) => { try { setConversation(await messagingService.conversation(booking.id)); } catch { setNotice('Unable to open this conversation.'); } };
  const sendMessage = async (event) => { event.preventDefault(); try { const message = await messagingService.send(conversation.id, messageText, messageFile); setConversation({ ...conversation, messages: [...conversation.messages, message] }); setMessageText(''); setMessageFile(null); } catch { setNotice('Write a message or attach a file before sending.'); } };
  const enableNotifications = async () => { if ('Notification' in window) await Notification.requestPermission(); };

  const confirmed = bookings.filter((item) => item.payment_status === 'CONFIRMED');
  const pending = bookings.filter((item) => item.payment_status === 'PENDING');
  const totalSpent = confirmed.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  const upcoming = useMemo(() => confirmed.filter((item) => new Date(item.check_in_date) >= new Date()).sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date)), [confirmed]);
  const completed = bookings.filter((item) => item.payment_status === 'CONFIRMED' && new Date(item.check_out_date) < new Date());

  return <div className="dashboard-layout"><DashboardSidebar role="GUEST" /><main className="dashboard-main"><DashboardTopbar title="My trips" subtitle="Plan, pay for, and manage every stay in one place" /><div className="guest-dashboard-content">
    <section className="dashboard-welcome"><div className="welcome-content"><p className="welcome-small-text">YOUR NEXT STAY STARTS HERE</p><h1>Hello, {user?.first_name || 'Guest'}</h1><p>Search stays, save the ones you love, and keep every trip detail close at hand.</p><Link className="guest-primary-action" to="/">Explore stays <ExploreOutlinedIcon /></Link></div><div className="welcome-decoration" aria-hidden="true">&#9992;</div></section>
    {notice && <div className="guest-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">&times;</button></div>}
    <section className="guest-journey" aria-label="Guest journey shortcuts"><button onClick={() => navigate('/')}><ExploreOutlinedIcon /><span><strong>Discover a stay</strong><small>Search homes and compare options</small></span></button><button onClick={() => document.getElementById('saved-stays')?.scrollIntoView({ behavior: 'smooth' })}><FavoriteBorderIcon /><span><strong>Saved stays</strong><small>{favorites.length} place{favorites.length === 1 ? '' : 's'} in your wishlist</small></span></button><button onClick={() => document.getElementById('booking-history')?.scrollIntoView({ behavior: 'smooth' })}><ReceiptLongOutlinedIcon /><span><strong>Manage bookings</strong><small>Pay, cancel, and view itineraries</small></span></button></section>
    <section className="dashboard-stats"><StatCard title="Total bookings" value={bookings.length} icon={<CalendarMonthIcon />} trendText="Your travel history" /><StatCard title="Confirmed trips" value={confirmed.length} icon={<CheckCircleIcon />} trendText="Ready for your stay" /><StatCard title="Payment due" value={pending.length} icon={<PendingActionsIcon />} trendText="Awaiting M-Pesa confirmation" /><StatCard title="Total spent" value={`KES ${totalSpent.toLocaleString()}`} icon={<AccountBalanceWalletIcon />} trendText="Confirmed bookings" /></section>
    <GuestCommunication bookings={bookings} />
    <GuestItinerary bookings={bookings} />
    <section className="dashboard-section" id="saved-stays"><div className="dashboard-section-header"><div><h2>Saved stays</h2><p>Your personal shortlist for the next trip</p></div><Link to="/">Browse all stays</Link></div>{favorites.length ? <div className="saved-stays-grid">{favorites.slice(0, 4).map((item) => <article className="saved-stay" key={item.id}><img src={imageOf(item)} alt="" /><div><strong>{item.title || 'Saved property'}</strong><span>{item.location || 'Location to be confirmed'}</span><button onClick={() => saveFavorites(favorites.filter((favorite) => favorite.id !== item.id))}>Remove</button></div></article>)}</div> : <div className="dashboard-empty-state compact"><FavoriteBorderIcon /><h3>No saved stays yet</h3><p>Tap the heart on any listing to build a wishlist you can compare later.</p><Link className="guest-secondary-action" to="/">Start exploring</Link></div>}</section>
    <section className="dashboard-section" id="booking-history"><div className="dashboard-section-header"><div><h2>Trips and bookings</h2><p>Payment status, itinerary information, and booking controls</p></div></div><div className="bookings-table-container">{loading ? <div className="dashboard-loading"><div className="dashboard-spinner" /><p>Loading your trips...</p></div> : !bookings.length ? <div className="dashboard-empty-state"><CalendarMonthIcon /><h3>No bookings yet</h3><p>When you reserve a stay, its itinerary and payment status will appear here.</p><Link className="guest-secondary-action" to="/">Find a place to stay</Link></div> : <table className="bookings-table"><thead><tr><th>Property</th><th>Stay dates</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><div className="table-property"><div className="table-property-image"><img src={imageOf(booking.property)} alt="" /></div><div><strong>{titleOf(booking)}</strong><span>{locationOf(booking)}</span></div></div></td><td>{formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}<br /><small>{booking.guests || 1} guest{booking.guests === 1 ? '' : 's'}</small></td><td>KES {Number(booking.total_price || 0).toLocaleString()}</td><td><span className={`booking-status ${statusClass(booking.payment_status)}`}>{booking.payment_status || 'PENDING'}</span></td><td className="booking-actions">{booking.payment_status === 'PENDING' && <button onClick={() => setNotice('Complete the M-Pesa prompt sent to your phone. This page will show Confirmed once the payment callback is received.')}>Payment help</button>}{['PENDING', 'CONFIRMED'].includes(booking.payment_status) && <button className="text-danger" onClick={() => cancelBooking(booking)}>Cancel</button>}{completed.includes(booking) && <button onClick={() => setReviewBooking(booking)}>Review</button>}</td></tr>)}</tbody></table>}</div></section>
    {upcoming.length > 0 && <section className="dashboard-section"><div className="dashboard-section-header"><div><h2>Upcoming stays</h2><p>Your check-in essentials</p></div></div><div className="upcoming-trips-grid">{upcoming.slice(0, 3).map((booking) => <article className="upcoming-trip-card" key={booking.id}><div className="trip-card-image"><img src={imageOf(booking.property)} alt="" /></div><div className="trip-card-content"><span className="trip-location">{locationOf(booking)}</span><h3>{titleOf(booking)}</h3><p className="trip-dates">{formatDate(booking.check_in_date)} to {formatDate(booking.check_out_date)}</p><span className="trip-status status-confirmed">Confirmed</span></div></article>)}</div></section>}
  </div></main>{reviewBooking && <div className="review-backdrop" role="presentation"><form className="review-dialog" onSubmit={submitReview}><button type="button" className="review-close" onClick={() => setReviewBooking(null)}>&times;</button><RateReviewOutlinedIcon /><h2>Review {titleOf(reviewBooking)}</h2><p>How was your stay?</p><label>Rating <select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>)}</select></label><textarea required value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} placeholder="Tell future guests about your stay" /><button className="guest-primary-action" type="submit">Submit review</button></form></div>}</div>;
}
export default GuestDashboard;
