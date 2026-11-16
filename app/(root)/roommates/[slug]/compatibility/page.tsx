import type { Metadata } from "next";
import CompatibilityPage from "../../../roommate-compatibility/[id]/page";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RoommateCompatibilityPage() {
  return <CompatibilityPage />;
}
