import type { Metadata } from "next";
import PropertyDetailPage from "@/components/PropertyDetailPage";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PropertyRoute() {
  return <PropertyDetailPage />;
}
