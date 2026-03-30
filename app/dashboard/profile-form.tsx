"use client";

import { useState, useTransition } from "react";
import { Camera, Save } from "lucide-react";
import { updateProfile } from "./actions";
import { createAvatarDataUrl } from "@/lib/avatar";

type ProfileFormProps = {
  initialName: string;
  email: string;
  initialAge: number | null;
  initialGender: string | null;
  initialImage: string | null;
};

export default function ProfileForm({
  initialName,
  email,
  initialAge,
  initialGender,
  initialImage,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge?.toString() ?? "");
  const [gender, setGender] = useState(initialGender ?? "");
  const [image, setImage] = useState(initialImage ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const previewImage = image.trim() || createAvatarDataUrl(name || email);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("image", image);

      const result = await updateProfile(formData);

      if (!result) {
        return;
      }

      if (!result.success) {
        setError(result.error || "Profile update failed.");
        setMessage("");
        return;
      }

      setError("");
      setMessage(result.message || "Profile updated successfully.");
    });
  }

  return (
    <section className="dashboard-card dashboard-editor">
      <div className="dashboard-section-heading">
        <div className="dashboard-card-icon">
          <Camera size={22} />
        </div>
        <div>
          <h2 className="dashboard-card-title">Edit Profile</h2>
          <p className="dashboard-card-text">
            You can update your name, age, gender, and profile picture only.
          </p>
        </div>
      </div>

      <div className="dashboard-editor-layout">
          <div className="dashboard-avatar-panel">
          <div className="dashboard-avatar-frame">
            <div
              role="img"
              aria-label={`${name || email} profile`}
              className="dashboard-avatar-image"
              style={{ backgroundImage: `url("${previewImage}")` }}
            />
          </div>
          <p className="dashboard-avatar-note">
            Leave the profile picture blank to use a generated avatar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-form">
          <label className="dashboard-field">
            <span className="dashboard-field-label">Full Name</span>
            <input
              type="text"
              className="dashboard-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              required
            />
          </label>

          <label className="dashboard-field">
            <span className="dashboard-field-label">Email Address</span>
            <input
              type="email"
              className="dashboard-input"
              value={email}
              disabled
              readOnly
            />
          </label>

          <div className="dashboard-form-grid">
            <label className="dashboard-field">
              <span className="dashboard-field-label">Age</span>
              <input
                type="number"
                min="13"
                max="120"
                className="dashboard-input"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                disabled={isPending}
              />
            </label>

            <label className="dashboard-field">
              <span className="dashboard-field-label">Gender</span>
              <select
                className="dashboard-input dashboard-select"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                disabled={isPending}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <label className="dashboard-field">
            <span className="dashboard-field-label">Profile Picture URL</span>
            <input
              type="url"
              className="dashboard-input"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              disabled={isPending}
              placeholder="https://example.com/photo.jpg"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button type="submit" className="dashboard-save-btn" disabled={isPending}>
            <Save size={18} />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
