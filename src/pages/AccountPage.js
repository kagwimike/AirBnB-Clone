import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import "./AccountPage.css";

function AccountPage({ settings = false }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [message, setMessage] = useState("");
  useEffect(() => {
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => setProfile(user));
  }, [user]);
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role={user?.role === "HOST" ? "HOST" : "GUEST"} />
      <main className="dashboard-main">
        <DashboardTopbar
          title={settings ? "Settings" : "Profile"}
          subtitle={
            settings
              ? "Manage your account preferences"
              : "Your StayBnB account information"
          }
        />
        <div className="account-content">
          <section className="account-panel">
            <div className="account-avatar">
              {(profile?.first_name || profile?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <h2>
              {profile?.first_name || "Guest"} {profile?.last_name || ""}
            </h2>
            <p>{profile?.email}</p>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{profile?.role || "GUEST"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{profile?.phone_number || "Not provided"}</dd>
              </div>
            </dl>
            {settings && (
              <>
                <h3>Preferences</h3>
                <label className="account-toggle">
                  <input type="checkbox" defaultChecked /> Receive booking and
                  message notifications
                </label>
                <label className="account-toggle">
                  <input type="checkbox" defaultChecked /> Email me about
                  account activity
                </label>
              </>
            )}
            {message && <p className="account-message">{message}</p>}
            <button
              className="account-button"
              onClick={() =>
                setMessage("Your account settings are saved for this session.")
              }
            >
              Save preferences
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
export default AccountPage;
