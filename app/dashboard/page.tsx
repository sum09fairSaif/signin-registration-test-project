import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAvatarDataUrl } from "@/lib/avatar";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import ProfileForm from "./profile-form";
import {
  ShieldCheck,
  Mail,
  User,
  CalendarDays,
  NotebookPen,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session || !email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login");
  }

  const displayName = user.name || "there";
  const avatarSrc = user.image || createAvatarDataUrl(user.name || user.email);
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(user.createdAt);
  const profileSummary = [
    user.age ? `${user.age} years old` : null,
    user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <main className="auth-page dashboard-page">
      <div className="auth-overlay" />

      <section className="dashboard-shell">
        <div className="dashboard-header">
          <div className="dashboard-hero">
            <div className="dashboard-avatar-frame dashboard-avatar-frame-large">
              <div
                role="img"
                aria-label={`${displayName} profile`}
                className="dashboard-avatar-image"
                style={{ backgroundImage: `url("${avatarSrc}")` }}
              />
            </div>

            <div>
              <h1 className="dashboard-title">Welcome back, {displayName}!</h1>
              <p className="dashboard-subtitle">
                You are signed in and verified.
              </p>
              {profileSummary && (
                <p className="dashboard-summary">{profileSummary}</p>
              )}
            </div>
          </div>

          <div className="dashboard-header-actions">
            <LogoutButton />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card dashboard-card-main">
            <div className="dashboard-card-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="dashboard-card-title">Account Overview</h2>
              <p className="dashboard-card-text">
                Your dashboard now shows your profile data.
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <User size={18} />
              </div>
              <div>
                <p className="dashboard-label">Full Name</p>
                <p className="dashboard-value">
                  {session.user?.name || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <Mail size={18} />
              </div>
              <div>
                <p className="dashboard-label">Email</p>
                <p className="dashboard-value">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <NotebookPen size={18} />
              </div>
              <div>
                <p className="dashboard-label">Short Bio</p>
                <p className="dashboard-value">
                  {user.bio || "Add a short bio to introduce yourself"}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="dashboard-label">Member Since</p>
                <p className="dashboard-value">{memberSince}</p>
              </div>
            </div>
          </div>

          <ProfileForm
            initialName={user.name}
            email={user.email}
            initialAge={user.age}
            initialGender={user.gender}
            initialImage={user.image}
            initialHomeAddress={user.homeAddress}
            initialWorkAddress={user.workAddress}
            initialBio={user.bio}
          />
        </div>
      </section>
    </main>
  );
}
