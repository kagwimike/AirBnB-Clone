import React from 'react';
import './GuestItinerary.css';

const format = (date) => new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

function GuestItinerary({ bookings }) {
  const upcoming = bookings.filter((item) => item.payment_status === 'CONFIRMED' && new Date(item.check_out_date) >= new Date()).slice(0, 2);
  if (!upcoming.length) return null;
  return <section className="guest-itinerary"><div className="dashboard-section-header"><div><h2>Stay itinerary</h2><p>Everything you need for a smooth check-in.</p></div></div>{upcoming.map((booking) => { const property = booking.property || {}; const host = property.host || {}; return <article key={booking.id} className="itinerary-card"><div><span className="itinerary-label">{property.location || 'Your destination'}</span><h3>{property.title || 'Your confirmed stay'}</h3><p><strong>Check-in:</strong> {format(booking.check_in_date)} &nbsp; <strong>Check-out:</strong> {format(booking.check_out_date)}</p><p><strong>Host:</strong> {host.first_name || 'Your host'} {host.last_name || ''} · <a href={`mailto:${host.email}`}>{host.email || 'Contact through messages'}</a></p></div><div className="itinerary-instructions"><strong>Check-in instructions</strong><p>{property.check_in_instructions || 'Your host will share check-in details in the booking conversation.'}</p>{property.latitude && property.longitude && <a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`}>Open directions</a>}</div></article>; })}</section>;
}
export default GuestItinerary;
