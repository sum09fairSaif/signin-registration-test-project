"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, HardDriveUpload, Save, Upload } from "lucide-react";
import { updateProfile } from "./actions";
import { createAvatarDataUrl } from "@/lib/avatar";

type ProfileFormProps = {
  initialName: string;
  email: string;
  initialAge: number | null;
  initialGender: string | null;
  initialImage: string | null;
  initialHomeAddress: string | null;
  initialWorkAddress: string | null;
  initialBio: string | null;
};

const acceptedImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export default function ProfileForm({
  initialName,
  email,
  initialAge,
  initialGender,
  initialImage,
  initialHomeAddress,
  initialWorkAddress,
  initialBio,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge?.toString() ?? "");
  const [gender, setGender] = useState(initialGender ?? "");
  const [image, setImage] = useState(initialImage ?? "");
  const [homeAddress, setHomeAddress] = useState(initialHomeAddress ?? "");
  const [workAddress, setWorkAddress] = useState(initialWorkAddress ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPictureTools, setShowPictureTools] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewImage = image.trim() || createAvatarDataUrl(name || email);

  async function readFileAsDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Could not read the selected image."));
      };

      reader.onerror = () => reject(new Error("Could not read the selected image."));
      reader.readAsDataURL(file);
    });
  }

  async function compressImage(file: File) {
    const source = await readFileAsDataUrl(file);

    return await new Promise<string>((resolve, reject) => {
      const imageElement = new Image();

      imageElement.onload = () => {
        const maxSize = 420;
        const scale = Math.min(
          1,
          maxSize / imageElement.width,
          maxSize / imageElement.height
        );
        const width = Math.max(1, Math.round(imageElement.width * scale));
        const height = Math.max(1, Math.round(imageElement.height * scale));
        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not prepare the selected image."));
          return;
        }

        context.drawImage(imageElement, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.72);

        if (compressed.length > 850_000) {
          reject(new Error("Please choose a smaller image."));
          return;
        }

        resolve(compressed);
      };

      imageElement.onerror = () =>
        reject(new Error("Could not process the selected image."));
      imageElement.src = source;
    });
  }

  async function applyImageFile(file: File) {
    if (!acceptedImageTypes.has(file.type)) {
      setError("Use a PNG, JPG, WEBP, or GIF image.");
      setMessage("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile pictures must be 5 MB or smaller.");
      setMessage("");
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      setError("");
      setMessage("Profile picture selected. Save changes to apply it.");
    } catch {
      setError("Could not read the selected image.");
      setMessage("");
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await applyImageFile(file);
    event.target.value = "";
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    await applyImageFile(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("image", image);
      formData.append("homeAddress", homeAddress);
      formData.append("workAddress", workAddress);
      formData.append("bio", bio);

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
            You can update your name, age, gender, addresses, bio, and profile picture here.
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

          <button
            type="button"
            className="dashboard-picture-btn"
            onClick={() => setShowPictureTools((current) => !current)}
          >
            Change Profile Picture
          </button>

          {showPictureTools && (
            <div className="dashboard-picture-tools">
              <div
                className={`dashboard-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <HardDriveUpload size={22} />
                <p>Drag and drop an image here</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                hidden
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="dashboard-picture-option"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload From Computer
              </button>
            </div>
          )}
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
            <span className="dashboard-field-label">Home Address</span>
            <input
              type="text"
              className="dashboard-input"
              value={homeAddress}
              onChange={(event) => setHomeAddress(event.target.value)}
              disabled={isPending}
              maxLength={180}
              placeholder="Enter your home address"
            />
          </label>

          <label className="dashboard-field">
            <span className="dashboard-field-label">Work Address</span>
            <input
              type="text"
              className="dashboard-input"
              value={workAddress}
              onChange={(event) => setWorkAddress(event.target.value)}
              disabled={isPending}
              maxLength={180}
              placeholder="Enter your work address"
            />
          </label>

          <label className="dashboard-field">
            <span className="dashboard-field-label">Short Bio</span>
            <textarea
              className="dashboard-input dashboard-textarea"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              disabled={isPending}
              maxLength={280}
              placeholder="Write a short bio about yourself"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button
            type="submit"
            className="dashboard-save-btn"
            disabled={isPending}
          >
            <Save size={18} />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
