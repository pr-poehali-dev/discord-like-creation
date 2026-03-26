import { useState } from "react";
import { UserProfile } from "@/lib/api";
import { User, Message, View, Status, INITIAL_MESSAGES, USERS } from "@/components/discord/types";
import ServerSidebar from "@/components/discord/ServerSidebar";
import ChatArea from "@/components/discord/ChatArea";
import UserProfilePopup from "@/components/discord/UserProfilePopup";

interface IndexProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function Index({ currentUser: apiUser, onLogout }: IndexProps) {
  const [activeServer, setActiveServer] = useState(1);
  const [activeChannel, setActiveChannel] = useState(2);
  const [activeView, setActiveView] = useState<View>("chat");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser: User = {
    id: apiUser.id,
    name: apiUser.display_name,
    tag: `${apiUser.username}#0000`,
    avatar: apiUser.avatar || apiUser.display_name?.[0]?.toUpperCase() || "U",
    status: (apiUser.status as Status) || "online",
    role: apiUser.role || "Участник",
    joinedAt: new Date(apiUser.created_at).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" }),
    bio: apiUser.bio || undefined,
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => {
        const user = USERS.find((u) => u.id === m.userId) ?? USERS[0];
        return (
          m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : messages;

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, {
      id: Date.now(),
      userId: 1,
      content: text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  }

  function deleteMessage(id: number) {
    setDeletingId(id);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
      showNotification("Сообщение удалено");
    }, 300);
  }

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }

  function toggleCategory(id: number) {
    setCollapsedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: "var(--bg-void)" }}>

      {/* Toast */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold animate-slide-up"
          style={{ backgroundColor: "var(--accent-primary)", color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
        >
          {notification}
        </div>
      )}

      <ServerSidebar
        activeServer={activeServer}
        setActiveServer={setActiveServer}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        setActiveView={setActiveView}
        collapsedCategories={collapsedCategories}
        toggleCategory={toggleCategory}
        currentUser={currentUser}
        showNotification={showNotification}
      />

      <ChatArea
        activeView={activeView}
        setActiveView={setActiveView}
        activeChannel={activeChannel}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        deleteMessage={deleteMessage}
        deletingId={deletingId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredMessages={filteredMessages}
        currentUser={currentUser}
        setSelectedUser={setSelectedUser}
        showNotification={showNotification}
        onLogout={onLogout}
      />

      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}