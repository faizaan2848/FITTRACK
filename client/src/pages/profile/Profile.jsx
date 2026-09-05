import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfileRequest } from "../../services/profileService";
import styles from "./profile.module.css";

function Profile() {
  const { user, refreshCurrentUser, logout } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    gender: user?.gender || "MALE",
    goal: user?.goal || "MAINTAIN",
  });
  const [qrUrl, setQrUrl] = useState(user?.paymentQrUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingQr, setIsSavingQr] = useState(false);

  // user is null while the session restores — sync the form once it loads
  // so saving never overwrites the real profile with blanks/defaults.
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      age: user.age ?? "",
      height: user.height ?? "",
      weight: user.weight ?? "",
      gender: user.gender || "MALE",
      goal: user.goal || "MAINTAIN",
    });
    setQrUrl(user.paymentQrUrl || "");
  }, [user]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileRequest({
        name: form.name,
        age: form.age ? Number(form.age) : null,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        gender: form.gender,
        goal: form.goal,
      });
      await refreshCurrentUser();
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveQr(e) {
    e.preventDefault();
    setIsSavingQr(true);
    try {
      await updateProfileRequest({ paymentQrUrl: qrUrl || null });
      await refreshCurrentUser();
      showToast("Payment QR saved", "success");
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to save QR code", "error");
    } finally {
      setIsSavingQr(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Profile</h1>
      <p className={styles.pageSubtitle}>Manage your details and how buyers pay you on the marketplace.</p>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Your Details</div>
        <form onSubmit={handleSaveProfile}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Age</label>
              <input className={styles.input} type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gender</label>
              <select className={styles.select} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Height (cm)</label>
              <input className={styles.input} type="number" value={form.height} onChange={(e) => update("height", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Weight (kg)</label>
              <input className={styles.input} type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Goal</label>
              <select className={styles.select} value={form.goal} onChange={(e) => update("goal", e.target.value)}>
                <option value="LOSE_FAT">Lose Fat</option>
                <option value="GAIN_MUSCLE">Gain Muscle</option>
                <option value="MAINTAIN">Maintain</option>
              </select>
            </div>
          </div>
          <button className={styles.saveBtn} type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Details"}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Marketplace Payment QR</div>
        <p className={styles.cardHint}>
          Paste a link to your UPI/payment QR code image. When someone buys one of your listings,
          they'll scan this to pay you directly — FitTrack never touches the money.
        </p>

        <form onSubmit={handleSaveQr}>
          <div className={styles.qrPreviewRow}>
            {qrUrl ? (
              <img src={qrUrl} alt="Your payment QR" className={styles.qrPreview} />
            ) : (
              <div className={styles.qrPlaceholder}>📷</div>
            )}
            <div style={{ flex: 1 }}>
              <div className={styles.field}>
                <label className={styles.label}>QR Image URL</label>
                <input
                  className={styles.input}
                  placeholder="https://..."
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button className={styles.saveBtn} type="submit" disabled={isSavingQr}>
            {isSavingQr ? "Saving..." : "Save QR Code"}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Account</div>
        <p className={styles.cardHint}>Sign out of FitTrack on this device.</p>
        <button className={styles.logoutBtn} type="button" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default Profile;
