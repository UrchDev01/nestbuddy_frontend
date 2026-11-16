import AuthGuard from "@/app/hoc/AuthGuard";
import MessagesWorkspace from "@/components/MessagesWorkspace";
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return (
    <AuthGuard>
      <MessagesWorkspace conversationId={conversationId} />
    </AuthGuard>
  );
}
