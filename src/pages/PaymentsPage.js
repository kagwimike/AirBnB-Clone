import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/dashboardService";
import "./AccountPage.css";

function PaymentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const data =
          user?.role === "HOST"
            ? await dashboardService.hostEarnings({ page_size: 50 })
            : await dashboardService.guestBookings({ page_size: 50 });
        setItems(data.results || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role={user?.role === "HOST" ? "HOST" : "GUEST"} />
      <main className="dashboard-main">
        <DashboardTopbar
          title="Payments"
          subtitle={
            user?.role === "HOST"
              ? "Review completed payouts"
              : "Review your booking payments"
          }
        />
        <div className="account-content">
          <section className="account-panel account-wide">
            <h2>
              {user?.role === "HOST"
                ? "Payout history"
                : "Booking payment history"}
            </h2>
            {loading ? (
              <p>Loading payments...</p>
            ) : items.length ? (
              <div className="account-table">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.property_title ||
                            item.property?.title ||
                            `Booking #${item.id}`}
                        </td>
                        <td>
                          KES{" "}
                          {Number(
                            item.net || item.total_price || 0,
                          ).toLocaleString()}
                        </td>
                        <td>{item.status || item.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No payment records yet.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
export default PaymentsPage;
