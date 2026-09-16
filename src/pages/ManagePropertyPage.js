import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import propertyService from "../services/propertyService";
import "./AccountPage.css";

function ManagePropertyPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    propertyService.getPropertyById(id).then((property) =>
      setForm({
        title: property.title || "",
        description: property.description || "",
        location: property.location || "",
        price_per_night: property.price_per_night || "",
        check_in_instructions: property.check_in_instructions || "",
        house_rules: property.house_rules || "",
        is_active: property.is_active,
      }),
    );
  }, [id]);
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    try {
      await propertyService.updateProperty(id, form);
      setMessage("Property changes saved.");
    } catch {
      setMessage("Property changes could not be saved.");
    }
  };
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="HOST" />
      <main className="dashboard-main">
        <DashboardTopbar
          title="Manage property"
          subtitle="Keep your listing details and guest instructions current"
        />
        <div className="account-content">
          {form ? (
            <form className="account-panel" onSubmit={save}>
              <h2>Edit listing</h2>
              <label>
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={update}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={update}
                  required
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={update}
                  required
                />
              </label>
              <label>
                Nightly price
                <input
                  name="price_per_night"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price_per_night}
                  onChange={update}
                  required
                />
              </label>
              <label>
                Check-in instructions
                <textarea
                  name="check_in_instructions"
                  value={form.check_in_instructions}
                  onChange={update}
                />
              </label>
              <label>
                House rules
                <textarea
                  name="house_rules"
                  value={form.house_rules}
                  onChange={update}
                />
              </label>
              <label className="account-toggle">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={update}
                />{" "}
                Published and bookable
              </label>
              {message && <p className="account-message">{message}</p>}
              <button className="account-button" type="submit">
                Save listing
              </button>
            </form>
          ) : (
            <div className="account-panel">
              <p>Loading property...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default ManagePropertyPage;
