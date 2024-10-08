import {
  DashboardSection,
  Features,
  LandingSection,
  StatsSection,
} from "~/components/landing";
import { FeedbackMarquee } from "~/components/landing/feedback";

export default function Page() {
  return (
    <div className="grid">
      <LandingSection />
      <div className="grid space-y-32">
        <DashboardSection />
        <Features />
        <StatsSection />
        <FeedbackMarquee />
      </div>
    </div>
  );
}
