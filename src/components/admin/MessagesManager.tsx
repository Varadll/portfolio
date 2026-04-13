"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2, Mail, MailOpen } from "lucide-react";
import {
  fetchContactMessages,
  markMessageRead,
  deleteContactMessage,
} from "@/lib/supabase-portfolio";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/portfolio";

export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await fetchContactMessages());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = async (msg: ContactMessage) => {
    setSelectedId(msg.id);
    if (!msg.read) {
      await markMessageRead(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteContactMessage(id);
    if (selectedId === id) setSelectedId(null);
    await load();
  };

  const selected = messages.find((m) => m.id === selectedId);
  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-6">
        Messages ({messages.length})
        {unreadCount > 0 && (
          <span className="ml-2 text-sm font-normal text-accent">
            {unreadCount} unread
          </span>
        )}
      </h2>

      {messages.length === 0 ? (
        <p className="text-center py-12 text-muted">No messages yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-5">
          {/* Message list */}
          <div className="md:col-span-2 space-y-2 max-h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  selectedId === msg.id
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-accent/30",
                  !msg.read && "border-l-4 border-l-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  {msg.read ? (
                    <MailOpen size={14} className="text-muted shrink-0" />
                  ) : (
                    <Mail size={14} className="text-accent shrink-0" />
                  )}
                  <span className="text-sm font-medium text-primary truncate">
                    {msg.name}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 truncate">
                  {msg.subject || msg.message.slice(0, 60)}
                </p>
                <p className="text-xs text-muted/60 mt-1">
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="md:col-span-3">
            {selected ? (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-primary">
                      {selected.name}
                    </h3>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {selected.email}
                    </a>
                    {selected.subject && (
                      <p className="text-sm text-muted mt-1">
                        Subject: {selected.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-primary whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted">
                  Select a message to read
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
