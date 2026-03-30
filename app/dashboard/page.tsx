import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import {
  ShieldCheck,
  Mail,
  User,
  CalendarDays,
  LockKeyhole,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Authenticated Session</p>
            <h1 className="dashboard-title">Welcome back</h1>
            <p className="dashboard-subtitle">
              You are successfully logged in to your account.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card dashboard-card-main">
            <div className="dashboard-card-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="dashboard-card-title">Account Overview</h2>
              <p className="dashboard-card-text">
                Your session is active and your protected dashboard is working.
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
                <p className="dashboard-value">
                  {session.user?.email || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-item">
              <div className="dashboard-item-icon">
                <LockKeyhole size={18} />
              </div>
              <div>
                <p className="dashboard-label">User ID</p>
                <p className="dashboard-value dashboard-code">
                  {session.user?.userId || "Not available"}
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
                <p className="dashboard-label">Status</p>
                <p className="dashboard-value">Logged in</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
