import React, { useEffect, useState } from 'react';
import messagingService from '../services/messagingService';
import './GuestCommunication.css';

const playSound = () => {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const tone = audio.createOscillator(); const gain = audio.createGain();
    tone.frequency.value = 880; gain.gain.setValueAtTime(.05, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .16);
    tone.connect(gain).connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .16);
  } catch { /* Browser may block audio until interaction. */ }
};

function GuestCommunication({ bookings }) {
  const [notifications, setNotifications] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ids = new Set();
    const load = async () => {
      try {
        const items = await messagingService.notifications();
        const incoming = items.filter((item) => !ids.has(item.id));
        if (ids.size && incoming.length) {
          playSound();
          if (window.Notification?.permission === 'granted') incoming.forEach((item) => new window.Notification(item.title, { body: item.body }));
        }
        ids = new Set(items.map((item) => item.id)); setNotifications(items);
      } catch { /* keep the trip page usable if notifications are unavailable */ }
    };
    load(); const timer = window.setInterval(load, 30000); return () => window.clearInterval(timer);
  }, []);

  const open = async (booking) => { try { setError(''); setConversation(await messagingService.conversation(booking.id)); } catch { setError('Conversation unavailable for this booking.'); } };
  const send = async (event) => { event.preventDefault(); try { const next = await messagingService.send(conversation.id, message, attachment); setConversation({ ...conversation, messages: [...conversation.messages, next] }); setMessage(''); setAttachment(null); } catch { setError('Enter a message or choose a file to send.'); } };
  const enable = async () => { if (window.Notification) await window.Notification.requestPermission(); playSound(); };

  return <section className="guest-communication"><div className="dashboard-section-header"><div><h2>Messages and notifications</h2><p>Contact a host about a booking and keep track of updates.</p></div><button className="notification-enable" onClick={enable}>Enable sound alerts</button></div><div className="communication-layout"><div className="conversation-list"><h3>Your bookings</h3>{bookings.length ? bookings.map((booking) => <button key={booking.id} onClick={() => open(booking)}>{booking.property?.title || 'Property booking'}<small>{booking.payment_status}</small></button>) : <p>No booking conversations yet.</p>}<h3>Notifications</h3>{notifications.slice(0, 4).map((item) => <button className={item.is_read ? '' : 'unread'} key={item.id} onClick={() => messagingService.markRead(item.id).then(() => setNotifications(notifications.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry)))}>{item.title}<small>{item.body}</small></button>)}</div><div className="chat-panel">{conversation ? <><h3>Conversation for booking #{conversation.booking_id}</h3><div className="chat-messages">{conversation.messages.map((item) => <div key={item.id} className="chat-message"><strong>{item.sender_name}</strong><span>{item.body}</span>{item.attachment && <a href={item.attachment} target="_blank" rel="noreferrer">Download attachment</a>}</div>)}</div><form onSubmit={send}><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message to your host" /><input type="file" onChange={(event) => setAttachment(event.target.files[0])} /><button type="submit">Send message</button></form></> : <p className="chat-empty">Select a booking to message its host. Check-in instructions are shown with your confirmed trip.</p>}{error && <p className="chat-error">{error}</p>}</div></div></section>;
}
export default GuestCommunication;
