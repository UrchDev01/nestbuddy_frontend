import type { Metadata } from "next";
import LegalDocumentLayout from "@/components/legal/LegalDocumentLayout";
import { privacySections } from "@/components/legal/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy | NestBuddy",
  description:
    "Learn what information NestBuddy handles, how it is used and shared, and how to exercise applicable privacy rights.",
  openGraph: {
    title: "Privacy Policy | NestBuddy",
    description:
      "NestBuddy's draft privacy notice for roommate discovery and property search.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      introduction="This draft describes personal-information handling found in the current NestBuddy product implementation. It identifies details the operator must confirm before publication."
      effectiveDate="To be set before publication"
      lastUpdated="9 October 2026"
      sections={privacySections}
    />
  );
}
