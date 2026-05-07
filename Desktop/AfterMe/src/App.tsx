import { Navigate, Route, Routes } from "react-router-dom";
import { ActivityDetail } from "./pages/ActivityDetail";
import { Auth } from "./pages/Auth";
import { Commit } from "./pages/Commit";
import { Committed } from "./pages/Committed";
import { CommitLauncher } from "./pages/CommitLauncher";
import { Design } from "./pages/Design";
import { EntryDetail } from "./pages/EntryDetail";
import { HistoryPage } from "./pages/History";
import { Onboarding } from "./pages/Onboarding";
import { Profile } from "./pages/Profile";
import { ProfileActivities } from "./pages/ProfileActivities";
import { ProfileMotivations } from "./pages/ProfileMotivations";
import { Reflect } from "./pages/Reflect";
import { RestylePreview } from "./pages/RestylePreview";
import { Settings, SettingsAbout, SettingsHelp, SettingsPrivacy } from "./pages/Settings";
import { Today } from "./pages/Today";
import { ActivityItems } from "./pages/ActivityItems";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/today" element={<Today />} />
      <Route path="/commit/:id" element={<CommitLauncher />} />
      <Route path="/committed/:id" element={<Committed />} />
      <Route path="/reflect/:commitmentId" element={<Reflect />} />
      <Route path="/activities/:id/items" element={<ActivityItems />} />
      <Route path="/commit" element={<Commit />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/entry/:id" element={<EntryDetail />} />
      <Route path="/history/activity/:id" element={<ActivityDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/activities" element={<ProfileActivities />} />
      <Route path="/profile/activities/:id" element={<ActivityItems />} />
      <Route path="/profile/motivations" element={<ProfileMotivations />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/privacy" element={<SettingsPrivacy />} />
      <Route path="/settings/about" element={<SettingsAbout />} />
      <Route path="/settings/help" element={<SettingsHelp />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/design" element={<Design />} />
      <Route path="/restyle-preview" element={<RestylePreview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
