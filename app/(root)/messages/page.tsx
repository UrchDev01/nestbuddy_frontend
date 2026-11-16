import AuthGuard from "@/app/hoc/AuthGuard";
import MessagesWorkspace from "@/components/MessagesWorkspace";
export default function MessagesPage() {
  return (
    <AuthGuard>
      <MessagesWorkspace />
    </AuthGuard>
  );
}
