import React, { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PaymentsIcon from "@mui/icons-material/Payments";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import StatCard from "../components/dashboard/StatCard";
import GuestCommunication from "../components/GuestCommunication";
import HostCalendarManager from "../components/dashboard/HostCalendarManager";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/dashboardService";
import "./HostDashboard.css";

const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date pending";
const statusLabel = (status) =>
  status === "PENDING"
    ? "Pending request"
    : status === "CONFIRMED"
      ? "Confirmed"
      : status;

function HostDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [reservationStatus, setReservationStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [earningsError, setEarningsError] = useState("");
  const [issues, setIssues] = useState([]);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [nextSummary, nextListings, nextEarnings, nextIssues] =
          await Promise.all([
            dashboardService.hostSummary(),
            dashboardService.hostListings({ page_size: 50 }),
            dashboardService.hostEarnings({ page_size: 50 }),
            dashboardService.issues(),
          ]);
        if (!active) return;
        setSummary(nextSummary);
        setListings(nextListings.results || []);
        setEarnings(nextEarnings.results || []);
        setIssues(nextIssues.results || nextIssues || []);
        setListingsError("");
        setEarningsError("");
      } catch {
        if (active) {
          setListingsError("We could not load your hosting overview.");
          setEarningsError("Earnings are temporarily unavailable.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setReservationError("");
    dashboardService
      .hostReservations({ status: reservationStatus, page_size: 50 })
      .then((data) => {
        if (active) setReservations(data.results || []);
      })
      .catch(() => {
        if (active)
          setReservationError("Reservations are temporarily unavailable.");
      });
    return () => {
      active = false;
    };
  }, [reservationStatus]);

  const transition = async (booking, action) => {
    try {
      const next = await dashboardService.transitionBooking(booking.id, action);
      setReservations((items) =>
        items.map((item) => (item.id === next.id ? next : item)),
      );
      setActionMessage(`Booking #${booking.id} updated.`);
    } catch {
      setActionMessage("That booking cannot be moved to the next stage yet.");
    }
  };
  const resolveIssue = async (issue) => {
    try {
      const next = await dashboardService.resolveIssue(
        issue.id,
        "Resolved by the host.",
      );
      setIssues((items) =>
        items.map((item) => (item.id === next.id ? next : item)),
      );
    } catch {
      setActionMessage("This issue could not be resolved.");
    }
  };

  const reviewGuest = async (booking) => {
    const comment = window.prompt("Share feedback about this guest");
    if (!comment) return;
    try {
      await dashboardService.reviewGuest(booking.id, 5, comment);
      setActionMessage(`Guest review saved for booking #${booking.id}.`);
    } catch {
      setActionMessage("Guest review could not be saved.");
    }
  };

  const reservationBookings = reservations.map((booking) => ({
    ...booking,
    property: booking.property,
  }));
  const earningsTotal = earnings.reduce(
    (total, item) => total + Number(item.net || 0),
    0,
  );

  return (
    <div className="dashboard-layout host-dashboard-layout">
      <DashboardSidebar role="HOST" />
      <main className="dashboard-main">
        <DashboardTopbar
          title="Host dashboard"
          subtitle={`Welcome back, ${user?.first_name || "host"}`}
        />
        <div className="host-dashboard-content">
          {loading ? (
            <div className="dashboard-loading">
              <div className="dashboard-spinner" />
              <p>Loading your hosting overview...</p>
            </div>
          ) : (
            <>
              <section className="dashboard-stats">
                <StatCard
                  title="Active listings"
                  value={summary?.active_listings ?? 0}
                  icon={<HomeWorkIcon />}
                  trendText="Published homes"
                />
                <StatCard
                  title="Pending requests"
                  value={summary?.pending_reservations ?? 0}
                  icon={<CheckCircleIcon />}
                  trendText="Needs your attention"
                />
                <StatCard
                  title="Check-ins this week"
                  value={summary?.upcoming_check_ins_this_week ?? 0}
                  icon={<CalendarMonthIcon />}
                  trendText="Confirmed reservations"
                />
                <StatCard
                  title="This month's earnings"
                  value={`KES ${Number(summary?.earnings_this_month || 0).toLocaleString()}`}
                  icon={<PaymentsIcon />}
                  trendText="Completed payments"
                />
              </section>

              <section className="host-section">
                <div className="host-section-heading">
                  <div>
                    <h2>My listings</h2>
                    <p>Manage the homes connected to your host account.</p>
                  </div>
                  <a href="/add-property">Add a property</a>
                </div>
                {listingsError ? (
                  <div className="host-state error">{listingsError}</div>
                ) : listings.length ? (
                  <div className="host-listings-grid">
                    {listings.map((listing) => (
                      <article className="host-listing-card" key={listing.id}>
                        <div className="host-listing-image">
                          {listing.image ? (
                            <img src={listing.image} alt="" />
                          ) : (
                            <HomeWorkIcon />
                          )}
                        </div>
                        <div className="host-listing-body">
                          <span className={`host-status ${listing.status}`}>
                            {listing.status}
                          </span>
                          <h3>{listing.title}</h3>
                          <p>{listing.location}</p>
                          <strong>
                            KES{" "}
                            {Number(
                              listing.price_per_night || 0,
                            ).toLocaleString()}{" "}
                            <small>per night</small>
                          </strong>
                          <div className="host-listing-actions">
                            <a href={`/properties/${listing.id}`}>
                              View listing
                            </a>
                            <a href={`/host/properties/${listing.id}/manage`}>
                              Manage
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="host-state">
                    No listings yet. Add your first property to start hosting.
                  </div>
                )}
              </section>

              <section className="host-section">
                <div className="host-section-heading">
                  <div>
                    <h2>Reservations inbox</h2>
                    <p>Review guest stays by their current booking status.</p>
                  </div>
                </div>
                <div className="host-tabs">
                  {["pending", "confirmed", "checked_in", "completed"].map(
                    (status) => (
                      <button
                        className={reservationStatus === status ? "active" : ""}
                        key={status}
                        onClick={() => setReservationStatus(status)}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ),
                  )}
                </div>
                {reservationError ? (
                  <div className="host-state error">{reservationError}</div>
                ) : reservations.length ? (
                  <div className="reservations-table-wrap">
                    <table className="reservations-table">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          <th>Property</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              {booking.guest?.first_name ||
                                booking.guest?.email ||
                                "Guest"}
                            </td>
                            <td>{booking.property?.title || "Property"}</td>
                            <td>
                              {dateLabel(booking.check_in_date)} -{" "}
                              {dateLabel(booking.check_out_date)}
                            </td>
                            <td>
                              <span className="host-status published">
                                {statusLabel(booking.payment_status)}
                              </span>
                            </td>
                            <td>
                              {booking.payment_status === "CONFIRMED" && (
                                <button
                                  onClick={() =>
                                    transition(booking, "check_in")
                                  }
                                >
                                  Check in
                                </button>
                              )}
                              {booking.payment_status === "CHECKED_IN" && (
                                <button
                                  onClick={() =>
                                    transition(booking, "checkout")
                                  }
                                >
                                  Check out
                                </button>
                              )}
                              {booking.payment_status === "COMPLETED" && (
                                <button onClick={() => reviewGuest(booking)}>
                                  Review guest
                                </button>
                              )}
                              {booking.payment_status === "COMPLETED" && (
                                <span>Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="host-state">
                    No {reservationStatus.replace("_", " ")} reservations.
                  </div>
                )}
              </section>
              {actionMessage && (
                <p className="calendar-message" role="status">
                  {actionMessage}
                </p>
              )}
              {issues.filter((issue) => issue.status === "OPEN").length > 0 && (
                <section className="host-section">
                  <div className="host-section-heading">
                    <div>
                      <h2>Open guest issues</h2>
                      <p>Resolve reported problems and notify the guest.</p>
                    </div>
                  </div>
                  <div className="reservations-table-wrap">
                    <table className="reservations-table">
                      <thead>
                        <tr>
                          <th>Issue</th>
                          <th>Booking</th>
                          <th>Reported by</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues
                          .filter((issue) => issue.status === "OPEN")
                          .map((issue) => (
                            <tr key={issue.id}>
                              <td>{issue.title}</td>
                              <td>#{issue.booking}</td>
                              <td>{issue.reporter_name || "Guest"}</td>
                              <td>
                                <button onClick={() => resolveIssue(issue)}>
                                  Resolve
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section className="host-section host-two-column">
                <div>
                  <div className="host-section-heading">
                    <div>
                      <h2>Earnings</h2>
                      <p>Completed payment records for your properties.</p>
                    </div>
                  </div>
                  {earningsError ? (
                    <div className="host-state error">{earningsError}</div>
                  ) : earnings.length ? (
                    <div className="reservations-table-wrap">
                      <table className="reservations-table">
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Gross</th>
                            <th>Platform fee</th>
                            <th>Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map((item) => (
                            <tr key={item.id}>
                              <td>{item.property_title}</td>
                              <td>KES {Number(item.gross).toLocaleString()}</td>
                              <td>
                                KES {Number(item.platform_fee).toLocaleString()}
                              </td>
                              <td>KES {Number(item.net).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="host-state">No completed earnings yet.</div>
                  )}
                  <strong className="earnings-total">
                    Displayed total: KES {earningsTotal.toLocaleString()}
                  </strong>
                </div>
                <div className="calendar-dependency">
                  <CalendarMonthIcon />
                  <h3>Calendar manager</h3>
                  <p>
                    Use the calendar below to set date-specific prices and
                    availability.
                  </p>
                </div>
              </section>
              <HostCalendarManager listings={listings} />
              <GuestCommunication bookings={reservationBookings} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default HostDashboard;
