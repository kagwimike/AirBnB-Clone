import React, { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import api from "../../services/api";

function HostCalendarManager({ listings }) {
  const [propertyId, setPropertyId] = useState(listings[0]?.id || "");
  const [entries, setEntries] = useState([]);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!propertyId && listings[0]) setPropertyId(listings[0].id);
  }, [listings, propertyId]);
  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    api
      .get(`properties/${propertyId}/calendar/`)
      .then(({ data }) => {
        setEntries(data.entries || []);
        setBookedRanges(data.booked_ranges || []);
      })
      .catch(() => setMessage("Calendar data is temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [propertyId]);
  const save = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`properties/${propertyId}/calendar/`, {
        date,
        price: price || null,
        is_available: isAvailable,
      });
      setEntries((items) =>
        [...items.filter((item) => item.date !== data.date), data].sort(
          (a, b) => a.date.localeCompare(b.date),
        ),
      );
      setMessage("Calendar pricing saved.");
    } catch {
      setMessage("Enter a valid date and price before saving.");
    }
  };
  return (
    <section className="host-section calendar-manager">
      <div className="host-section-heading">
        <div>
          <h2>Calendar and pricing</h2>
          <p>
            Set custom nightly prices or close specific dates, like Airbnb
            hosting calendar controls.
          </p>
        </div>
        <CalendarMonthIcon />
      </div>
      {listings.length ? (
        <>
          <div className="calendar-controls">
            <label>
              Listing
              <select
                value={propertyId}
                onChange={(event) => setPropertyId(event.target.value)}
              >
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
            </label>
            <form onSubmit={save}>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>
              <label>
                Nightly price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Use listing price"
                />
              </label>
              <label className="calendar-checkbox">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                />{" "}
                Available
              </label>
              <button type="submit">Save date</button>
            </form>
          </div>
          {message && <p className="calendar-message">{message}</p>}
          {loading ? (
            <p>Loading calendar...</p>
          ) : (
            <div className="calendar-entry-list">
              {entries.length ? (
                entries.map((entry) => (
                  <div key={entry.id}>
                    <strong>{entry.date}</strong>
                    <span>
                      {entry.is_available
                        ? `KES ${entry.price || "listing price"}`
                        : "Closed"}
                    </span>
                  </div>
                ))
              ) : (
                <p>
                  No custom dates yet. Your listing price applies by default.
                </p>
              )}
              {bookedRanges.length > 0 && (
                <p className="calendar-booked">
                  Booked ranges:{" "}
                  {bookedRanges
                    .map((range) => `${range.check_in} to ${range.check_out}`)
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="host-state">
          Add a listing before managing availability.
        </div>
      )}
    </section>
  );
}
export default HostCalendarManager;
