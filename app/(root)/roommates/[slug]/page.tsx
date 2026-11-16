import type { Metadata } from "next";
import PublicProfilePage from "../../profile/[id]/page";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RoommatePage() {
  return <PublicProfilePage />;
}
