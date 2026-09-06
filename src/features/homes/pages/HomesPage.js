import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyDetailModal from '../../../components/PropertyDetailModal';
import PropertyGrid from '../components/PropertyGrid';
import HomesEmptyState from '../components/HomesEmptyState';
import useHomes from '../hooks/useHomes';
import '../homes.css';

const today = new Date().toISOString().slice(0, 10);
const queryFilters = (params) => Object.fromEntries([...params.entries()].filter(([, value]) => value));

function HomesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filters = useMemo(() => queryFilters(searchParams), [searchParams]);
  const [draft, setDraft] = useState({ location: filters.location || '', checkin: filters.checkin || '', checkout: filters.checkout || '', guests: filters.guests || '1', min_price: filters.min_price || '', max_price: filters.max_price || '', bedrooms: filters.bedrooms || '', property_type: filters.property_type || '' });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { homes, loading, error } = useHomes(filters);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => { event.preventDefault(); if (draft.checkout && draft.checkin && draft.checkout <= draft.checkin) return; setSearchParams(queryFilters(new URLSearchParams(draft))); };
  const clear = () => { const next = { location: '', checkin: '', checkout: '', guests: '1', min_price: '', max_price: '', bedrooms: '', property_type: '' }; setDraft(next); setSearchParams({}); };
  const openProperty = (property) => { setSelectedProperty(property); setIsModalOpen(true); };

  return <main className="home"><section className="home__heading"><h1>{filters.location ? `Stays in ${filters.location}` : 'Find your next stay'}</h1><p>Search by destination, dates, guests, and budget.</p></section>
    <form className="home-search" onSubmit={submit}><label>Destination<input value={draft.location} onChange={(e) => update('location', e.target.value)} placeholder="City or neighbourhood" /></label><label>Check in<input type="date" min={today} value={draft.checkin} onChange={(e) => update('checkin', e.target.value)} /></label><label>Check out<input type="date" min={draft.checkin || today} value={draft.checkout} onChange={(e) => update('checkout', e.target.value)} /></label><label>Guests<input type="number" min="1" value={draft.guests} onChange={(e) => update('guests', e.target.value)} /></label><button type="submit">Search</button></form>
    <div className="home-tools"><div className="home-filters"><label>Min KES<input type="number" min="0" value={draft.min_price} onChange={(e) => update('min_price', e.target.value)} /></label><label>Max KES<input type="number" min="0" value={draft.max_price} onChange={(e) => update('max_price', e.target.value)} /></label><label>Bedrooms<select value={draft.bedrooms} onChange={(e) => update('bedrooms', e.target.value)}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label><label>Type<select value={draft.property_type} onChange={(e) => update('property_type', e.target.value)}><option value="">Any type</option><option value="APARTMENT">Apartment</option><option value="HOUSE">House</option><option value="VILLA">Villa</option><option value="CABIN">Cabin</option></select></label><button type="button" onClick={submit}>Apply filters</button><button type="button" className="plain-button" onClick={clear}>Clear</button></div><button className="map-toggle" type="button" onClick={() => setMapOpen(!mapOpen)}>{mapOpen ? 'Hide map' : 'Show map'}</button></div>
    {draft.checkout && draft.checkin && draft.checkout <= draft.checkin && <p className="search-error">Check-out must be after check-in.</p>}
    {mapOpen && <section className="map-panel"><iframe title="Property search map" src={`https://www.openstreetmap.org/export/embed.html?bbox=36.75%2C-1.35%2C36.95%2C-1.15&layer=mapnik`} /><p>Map view is centred on Nairobi. Select a property to see its exact location.</p></section>}
    {!loading && !error && <p className="result-count">{homes.length} stay{homes.length === 1 ? '' : 's'} available{filters.checkin ? ' for your selected dates' : ''}</p>}
    {loading ? <div className="home__loading"><div className="home__spinner" /><p>Finding stays...</p></div> : error ? <div className="home__message"><h2>Something went wrong</h2><p>{error}</p></div> : homes.length === 0 ? <HomesEmptyState onAddProperty={() => navigate('/add-property')} /> : <PropertyGrid properties={homes} onSelectProperty={openProperty} />}
    <PropertyDetailModal property={selectedProperty} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
  </main>;
}
export default HomesPage;
