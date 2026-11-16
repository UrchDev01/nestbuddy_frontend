import type { Metadata } from "next";
import LegalDocumentLayout from "@/components/legal/LegalDocumentLayout";
import { termsSections } from "@/components/legal/legalContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | NestBuddy",
  description:
    "Read the draft rules for using NestBuddy roommate matching, property discovery, messaging and viewing features.",
  openGraph: {
    title: "Terms & Conditions | NestBuddy",
    description:
      "Draft terms for using NestBuddy's roommate and property discovery platform.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Terms & Conditions"
      introduction="These draft terms explain the rules intended to apply when using NestBuddy. The current registration process does not record explicit acceptance, so publication and reliance require further review."
      effectiveDate="To be set after approval"
      lastUpdated="9 October 2026"
      sections={termsSections}
      numbered
    />
  );
}
