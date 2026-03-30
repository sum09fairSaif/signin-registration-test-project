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
  BadgeCheck,
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
  const loginVerificationStatus = session ? "Verified for this session" : "Pending";
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
              <p className="dashboard-eyebrow">Protected Dashboard</p>
              <h1 className="dashboard-title">Welcome back, {displayName}!</h1>
              <p className="dashboard-subtitle">
                Your account is signed in and verified. You can manage only the
                profile details allowed for your account here.
              </p>
              {profileSummary && (
                <p className="dashboard-summary">{profileSummary}</p>
              )}
            </div>
          </div>

          <div className="dashboard-header-actions">
            <p className="dashboard-subtitle">
              Signed in securely with email verification completed.
            </p>
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
                Your dashboard now shows the profile data you are allowed to
                manage and nothing else.
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
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className="dashboard-label">Login Verification Status</p>
                <p className="dashboard-value">{loginVerificationStatus}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="dashboard-label">Profile Picture</p>
                <p className="dashboard-value">
                  {user.image ? "Custom image selected" : "Random avatar active"}
                </p>
              </div>
            </div>
          </div>

          <ProfileForm
            initialName={user.name}
            email={user.email}
            initialAge={user.age}
            initialGender={user.gender}
            initialImage={user.image}
          />
        </div>
      </section>
    </main>
  );
}
