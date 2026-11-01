
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./api";
import "./Donate.css";

const categories = [
  "Education",
  "Food",
  "Healthcare",
  "General Support",
];

export default function Donate() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("500");
  const [category, setCategory] = useState("General Support");
  const [frequency, setFrequency] = useState("ONE_TIME");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 1) {
      setError("Donation amount must be at least ₹1.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/api/donations", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          category,
          frequency,
        }),
      });

      setSuccess("Thank you! Your donation was recorded successfully.");
      setAmount("500");
    } catch (err) {
      setError(err.message || "Unable to submit donation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="donate-page">
      <section className="donate-hero">
        <span className="donate-eyebrow">MAKE A DIFFERENCE</span>
        <h1>Every little bit helps.</h1>
        <p>
          Your generosity helps provide children with care,
          education, food, and a brighter future.
        </p>
      </section>

      <section className="donate-layout">
        <div className="donate-info">
          <div className="donate-icon">♡</div>
          <h2>Give hope. Change a life.</h2>
          <p>Your contribution supports children in need.</p>

          <div className="donate-benefit">
            <span>✓</span> Support children's education
          </div>
          <div className="donate-benefit">
            <span>✓</span> Help provide food and healthcare
          </div>
          <div className="donate-benefit">
            <span>✓</span> Make a meaningful difference
          </div>
        </div>

        <form className="donate-form" onSubmit={handleSubmit}>
          <h2>Make a donation</h2>
          <p className="donate-subtitle">
            Choose an amount, category, and frequency.
          </p>

          <label>Donation amount (₹)</label>
          <div className="donate-amounts">
            {["250", "500", "1000", "2000"].map((value) => (
              <button
                key={value}
                type="button"
                className={amount === value ? "selected" : ""}
                onClick={() => setAmount(value)}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <input
            aria-label="Custom donation amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label htmlFor="donation-category">Donation category</label>
          <select
            id="donation-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <label htmlFor="donation-frequency">Donation frequency</label>
          <select
            id="donation-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="ONE_TIME">One-time</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>

          {error && <p className="donate-error">{error}</p>}
          {success && <p className="donate-success">{success}</p>}

          <button
            className="donate-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : `Donate ₹${amount || "0"}`}
          </button>

          <p className="donate-note">
            This records a donation through your backend;
            it does not process an online payment.
          </p>
        </form>
      </section>
    </main>
  );
}
