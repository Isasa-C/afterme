import { ArrowLeft, Bell, ChevronRight, Clock3, Download, HelpCircle, Info, LogOut, Moon, Shield, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Card, IconButton } from "../components/ui";
import { useUpdateProfile, useUserProfile } from "../hooks/useAfterMeData";
import { useUser } from "../hooks/useUser";
import { signOut } from "../lib/auth";
import { cn } from "../lib/utils";

type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</h2>
      <Card padding="px-4 py-0">
        {children}
      </Card>
    </section>
  );
}

function SettingsRow({ icon: Icon, label, value, disabled, danger, onClick, children }: SettingsRowProps) {
  const content = (
    <>
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600", danger && "bg-red-50 text-red-500", disabled && "opacity-50")}>
        <Icon className="h-5 w-5" />
      </span>
      <span className={cn("flex-1 text-left font-bold text-ink", disabled && "text-slate-400", danger && "text-red-500")}>{label}</span>
      {children ?? (
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          {value}
          {onClick ? <ChevronRight className="h-5 w-5" /> : null}
        </span>
      )}
    </>
  );

  const className = "flex min-h-[64px] w-full items-center gap-4 border-b border-slate-100 py-3 last:border-b-0";
  return onClick ? (
    <button className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-slate-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white transition-transform", checked ? "translate-x-7" : "translate-x-1")} />
    </button>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");

  const remindersEnabled = profile?.reminders_enabled ?? true;
  const reminderTime = profile?.reminder_time ?? "19:00";
  const darkMode = profile?.dark_mode ?? false;
  const accountEmail = user?.email ?? "your email";

  return (
    <AppShell>
      <header className="mb-8 flex items-center justify-between">
        <IconButton aria-label="Back to profile" onClick={() => navigate("/profile")}>
          <ArrowLeft className="h-6 w-6" />
        </IconButton>
        <h1 className="text-3xl font-semibold text-ink">Settings</h1>
        <span className="h-12 w-12" />
      </header>

      <div className="space-y-6">
        <SettingsSection title="Notifications">
          <SettingsRow icon={Bell} label="Reminders">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">{remindersEnabled ? "On" : "Off"}</span>
              <Toggle checked={remindersEnabled} onChange={(checked) => updateProfile.mutate({ reminders_enabled: checked })} />
            </div>
          </SettingsRow>
          <SettingsRow icon={Clock3} label="Reminder time" disabled={!remindersEnabled}>
            <input
              aria-label="Reminder time"
              type="time"
              value={reminderTime}
              disabled={!remindersEnabled}
              onChange={(event) => updateProfile.mutate({ reminder_time: event.target.value })}
              className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-bold text-brand-600 disabled:text-slate-400"
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsRow icon={Moon} label="Dark mode">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">{darkMode ? "On" : "Off"}</span>
              <Toggle checked={darkMode} onChange={(checked) => updateProfile.mutate({ dark_mode: checked })} />
            </div>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Privacy & Data">
          <SettingsRow icon={Shield} label="Privacy" onClick={() => navigate("/settings/privacy")} />
          <SettingsRow icon={Download} label="Export my data" value="Coming soon" disabled />
          <SettingsRow icon={Trash2} label="Delete my account" danger onClick={() => setConfirmOpen(true)} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon={Info} label="About AfterMe" onClick={() => navigate("/settings/about")} />
          <SettingsRow icon={HelpCircle} label="Help & Support" onClick={() => navigate("/settings/help")} />
          <div className="py-4 text-center text-sm font-semibold text-slate-400">Version 1.2.0</div>
        </SettingsSection>

        <SettingsSection title="Account">
          <button
            className="flex min-h-[60px] w-full items-center justify-center gap-3 py-3 font-semibold text-red-500 transition hover:text-red-600"
            onClick={() => {
              signOut();
              queryClient.clear();
              navigate("/auth");
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </SettingsSection>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-semibold text-ink">Delete account?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is intentionally hard to do by accident. Type {accountEmail} to confirm.
            </p>
            <input
              value={typedEmail}
              onChange={(event) => setTypedEmail(event.target.value)}
              className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-ink outline-none focus:border-brand-400"
              placeholder={accountEmail}
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-slate-200 py-3 font-bold text-ink" onClick={() => setConfirmOpen(false)}>
                Keep account
              </button>
              <button
                className="rounded-2xl bg-red-500 py-3 font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
                disabled={typedEmail !== accountEmail}
                onClick={() => setConfirmOpen(false)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function SettingsInfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <AppShell>
      <header className="mb-8 flex items-center justify-between">
        <IconButton aria-label="Back to settings" onClick={() => navigate("/settings")}>
          <ArrowLeft className="h-6 w-6" />
        </IconButton>
        <h1 className="text-3xl font-semibold text-ink">{title}</h1>
        <span className="h-12 w-12" />
      </header>
      <Card className="space-y-4 text-[15px] leading-relaxed text-slate-600">
        {children}
      </Card>
    </AppShell>
  );
}

export function SettingsPrivacy() {
  return (
    <SettingsInfoPage title="Privacy">
      <p>AfterMe keeps your demo data local in this build. When Supabase is connected, your commitments, reflections, and profile settings will be scoped to your account.</p>
      <p>No social features, public profiles, or shared activity feeds are part of v1.</p>
    </SettingsInfoPage>
  );
}

export function SettingsAbout() {
  return (
    <SettingsInfoPage title="About">
      <p>AfterMe helps you get through the small moment before starting, then lets your own evidence make the next start easier.</p>
      <p>It is built for gentle momentum, not pressure.</p>
    </SettingsInfoPage>
  );
}

export function SettingsHelp() {
  return (
    <SettingsInfoPage title="Help">
      <p>If something feels off, start small: pick one activity, gather the first item, and let the app carry the next step.</p>
      <p>Support contact can be connected here when the production account is ready.</p>
    </SettingsInfoPage>
  );
}
