import { prisma } from "@/lib/prisma";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { DeleteMessageButton } from "@/components/admin/delete-message-button";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-white/40 text-sm mt-1">{messages.length} contact messages</p>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {messages.map((message) => (
            <div key={message.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{message.name}</p>
                      <p className="text-white/30 text-xs">{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>{message.email}</span>
                    </div>
                    {message.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>{message.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DeleteMessageButton messageId={message.id} />
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#120F16] px-4 py-4">
                <p className="text-white/75 text-sm leading-7 whitespace-pre-line">{message.message}</p>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="p-8 text-center text-white/30 text-sm">No messages yet</div>
          )}
        </div>
      </div>
    </div>
  );
}