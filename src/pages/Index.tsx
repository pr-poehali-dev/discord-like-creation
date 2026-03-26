import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────
type Status = "online" | "idle" | "dnd" | "offline";
type ChannelType = "text" | "voice" | "announce";
type View = "chat" | "profile" | "settings" | "moderation";

interface User {
  id: number;
  name: string;
  tag: string;
  avatar: string;
  status: Status;
  role: string;
  joinedAt: string;
  bio?: string;
}

interface Message {
  id: number;
  userId: number;
  content: string;
  time: string;
  pinned?: boolean;
  edited?: boolean;
}

interface Channel {
  id: number;
  name: string;
  type: ChannelType;
  unread?: number;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

interface Server {
  id: number;
  name: string;
  icon: string;
  color: string;
  notifications?: number;
}

// ─── Mock Data ────────────────────────────────────────────
const SERVERS: Server[] = [
  { id: 1, name: "Nexus HQ", icon: "N", color: "#5865f2" },
  { id: 2, name: "Геймеры РФ", icon: "Г", color: "#3ba55c", notifications: 12 },
  { id: 3, name: "Dev Space", icon: "D", color: "#eb459e" },
  { id: 4, name: "Арт Студия", icon: "А", color: "#faa81a", notifications: 3 },
  { id: 5, name: "Музыка", icon: "М", color: "#00b0f4" },
];

const CATEGORIES: Category[] = [
  { id: 1, name: "Общее" },
  { id: 2, name: "Игры" },
  { id: 3, name: "Голосовые" },
];

const CHANNELS: Channel[] = [
  { id: 1, name: "добро-пожаловать", type: "announce", categoryId: 1 },
  { id: 2, name: "основной", type: "text", categoryId: 1, unread: 5 },
  { id: 3, name: "оффтоп", type: "text", categoryId: 1, unread: 2 },
  { id: 4, name: "cs2-поиск", type: "text", categoryId: 2 },
  { id: 5, name: "minecraft", type: "text", categoryId: 2, unread: 8 },
  { id: 6, name: "Лобби", type: "voice", categoryId: 3 },
  { id: 7, name: "Играем вместе", type: "voice", categoryId: 3 },
  { id: 8, name: "AFK", type: "voice", categoryId: 3 },
];

const USERS: User[] = [
  { id: 1, name: "Алексей Громов", tag: "alex#0001", avatar: "А", status: "online", role: "Администратор", joinedAt: "12 янв 2024", bio: "Основатель сервера. Люблю игры и код." },
  { id: 2, name: "Мария Светлова", tag: "maria#0042", avatar: "М", status: "online", role: "Модератор", joinedAt: "25 янв 2024", bio: "Модератор сервера. Аниме и кофе ☕" },
  { id: 3, name: "Дмитрий Ков", tag: "dima#1337", avatar: "Д", status: "idle", role: "Участник", joinedAt: "3 фев 2024" },
  { id: 4, name: "Катя Небо", tag: "kate#0777", avatar: "К", status: "dnd", role: "Участник", joinedAt: "10 фев 2024", bio: "Не мешайте — стримлю!" },
  { id: 5, name: "Иван Лесной", tag: "ivan#2024", avatar: "И", status: "offline", role: "Участник", joinedAt: "15 фев 2024" },
  { id: 6, name: "Nickbot", tag: "bot#0000", avatar: "🤖", status: "online", role: "Бот", joinedAt: "1 янв 2024", bio: "Автоматизирую всё что можно." },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 1, userId: 1, content: "Привет всем! Добро пожаловать на сервер Nexus HQ 🎉", time: "10:00", pinned: true },
  { id: 2, userId: 2, content: "Всем привет! Рада видеть вас здесь 😊", time: "10:05" },
  { id: 3, userId: 3, content: "О, новый сервер! Выглядит круто", time: "10:12" },
  { id: 4, userId: 4, content: "наконец-то темная тема как надо 🔥", time: "10:15" },
  { id: 5, userId: 6, content: "✅ Бот подключён. Введите /help для списка команд.", time: "10:17" },
  { id: 6, userId: 1, content: "Кстати, скоро запустим первый ивент! Следите за анонсами в #добро-пожаловать", time: "10:30" },
  { id: 7, userId: 5, content: "А когда ивент?", time: "10:32" },
  { id: 8, userId: 2, content: "В эти выходные! Подробности скоро 😉", time: "10:33" },
  { id: 9, userId: 3, content: "отлично, буду!", time: "10:35", edited: true },
];

const STATUS_LABELS: Record<Status, string> = {
  online: "В сети",
  idle: "Отошёл",
  dnd: "Не беспокоить",
  offline: "Не в сети",
};

const ROLE_COLORS: Record<string, string> = {
  "Администратор": "#ed4245",
  "Модератор": "#faa81a",
  "Бот": "#00b0f4",
  "Участник": "#96989d",
};

const USER_COLORS = ["#5865f2", "#3ba55c", "#eb459e", "#faa81a", "#00b0f4", "#f04747"];

function getUserColor(id: number) {
  return USER_COLORS[(id - 1) % USER_COLORS.length];
}

// ─── Component ────────────────────────────────────────────
export default function Index() {
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

  const currentUser = USERS[0];
  const activeChannelData = CHANNELS.find((c) => c.id === activeChannel);

  const groupedUsers: Record<string, User[]> = {
    "Администратор": USERS.filter((u) => u.role === "Администратор"),
    "Модератор": USERS.filter((u) => u.role === "Модератор"),
    "Бот": USERS.filter((u) => u.role === "Бот"),
    "Участник": USERS.filter((u) => u.role === "Участник"),
  };

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

  function getUser(id: number) {
    return USERS.find((u) => u.id === id) ?? USERS[0];
  }

  const filteredMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUser(m.userId).name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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

      {/* Server Rail */}
      <div
        className="flex flex-col items-center py-3 gap-2 overflow-y-auto flex-shrink-0"
        style={{ width: 72, backgroundColor: "var(--bg-void)", borderRight: "1px solid var(--border-subtle)" }}
      >
        <button
          className="server-icon mb-1"
          style={{ backgroundColor: activeServer === 0 ? "var(--accent-primary)" : "var(--bg-surface)" }}
          onClick={() => setActiveServer(0)}
          title="Главная"
        >
          <Icon name="Hash" size={22} />
        </button>
        <div className="w-8 h-px" style={{ backgroundColor: "var(--border-medium)" }} />

        {SERVERS.map((srv) => (
          <div key={srv.id} className="relative">
            {activeServer === srv.id && (
              <div
                className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-r-full"
                style={{ width: 4, height: 40, backgroundColor: "var(--text-primary)" }}
              />
            )}
            <button
              className={`server-icon ${activeServer === srv.id ? "active" : ""}`}
              style={{
                backgroundColor: activeServer === srv.id ? srv.color : "var(--bg-surface)",
                boxShadow: activeServer === srv.id ? `0 0 16px ${srv.color}60` : "none",
              }}
              onClick={() => setActiveServer(srv.id)}
              title={srv.name}
            >
              {srv.icon}
            </button>
            {srv.notifications != null && (
              <div className="ping-badge absolute -bottom-1 -right-1" style={{ border: "2px solid var(--bg-void)" }}>
                {srv.notifications > 9 ? "9+" : srv.notifications}
              </div>
            )}
          </div>
        ))}

        <div className="w-8 h-px mt-1" style={{ backgroundColor: "var(--border-medium)" }} />
        <button
          className="server-icon"
          style={{ backgroundColor: "var(--bg-surface)", color: "var(--accent-green)" }}
          onClick={() => showNotification("Создание сервера — скоро!")}
          title="Добавить сервер"
        >
          <Icon name="Plus" size={22} />
        </button>
        <button
          className="server-icon"
          style={{ backgroundColor: "var(--bg-surface)", color: "var(--accent-cyan)" }}
          onClick={() => showNotification("Найти серверы — скоро!")}
          title="Найти серверы"
        >
          <Icon name="Compass" size={20} />
        </button>
      </div>

      {/* Channel Sidebar */}
      <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 240, backgroundColor: "var(--bg-deep)" }}>
        <button
          className="flex items-center justify-between px-4 py-3 font-bold text-sm flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)" }}
          onClick={() => showNotification("Настройки сервера — скоро!")}
        >
          <span className="truncate">{SERVERS.find((s) => s.id === activeServer)?.name ?? "Nexus"}</span>
          <Icon name="ChevronDown" size={16} />
        </button>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {CATEGORIES.map((cat) => {
            const collapsed = collapsedCategories.includes(cat.id);
            const catChannels = CHANNELS.filter((c) => c.categoryId === cat.id);
            return (
              <div key={cat.id} className="mb-1">
                <button
                  className="flex items-center gap-1 px-1 py-1 w-full text-left mb-0.5 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <Icon name={collapsed ? "ChevronRight" : "ChevronDown"} size={12} />
                  {cat.name}
                </button>
                {!collapsed && catChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`channel-item ${activeChannel === ch.id ? "active" : ""}`}
                    onClick={() => { setActiveChannel(ch.id); setActiveView("chat"); }}
                  >
                    {ch.type === "text" && <Icon name="Hash" size={18} />}
                    {ch.type === "voice" && <Icon name="Volume2" size={18} />}
                    {ch.type === "announce" && <Icon name="Megaphone" size={18} />}
                    <span className="flex-1 truncate">{ch.name}</span>
                    {ch.unread != null && ch.unread > 0 && (
                      <div className="ping-badge">{ch.unread}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center gap-2 px-2 py-2 flex-shrink-0"
          style={{ backgroundColor: "var(--bg-void)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setActiveView("profile")}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: getUserColor(currentUser.id), color: "white" }}
            >
              {currentUser.avatar}
            </div>
            <div className={`status-dot absolute -bottom-0.5 -right-0.5 status-${currentUser.status}`} />
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveView("profile")}>
            <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{currentUser.name}</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{STATUS_LABELS[currentUser.status]}</div>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => showNotification("Микрофон")} title="Микрофон">
              <Icon name="Mic" size={16} />
            </button>
            <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => setActiveView("settings")} title="Настройки">
              <Icon name="Settings" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── CHAT ── */}
        {activeView === "chat" && (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                {activeChannelData?.type === "text" && <Icon name="Hash" size={20} style={{ color: "var(--text-secondary)" }} />}
                {activeChannelData?.type === "voice" && <Icon name="Volume2" size={20} style={{ color: "var(--text-secondary)" }} />}
                {activeChannelData?.type === "announce" && <Icon name="Megaphone" size={20} style={{ color: "var(--text-secondary)" }} />}
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{activeChannelData?.name}</span>
                <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border-medium)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Основной канал сервера</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs px-3 py-1.5 pr-7 rounded outline-none w-36 transition-all focus:w-48"
                    style={{ backgroundColor: "var(--bg-void)", color: "var(--text-primary)", border: "1px solid var(--border-medium)" }}
                  />
                  <Icon name="Search" size={13} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                </div>
                <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => showNotification("Закреплённые — скоро!")} title="Закреплённые">
                  <Icon name="Pin" size={18} />
                </button>
                <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => setActiveView("moderation")} title="Модерация">
                  <Icon name="Shield" size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <Icon name="Hash" size={28} style={{ color: "var(--accent-primary)" }} />
                </div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>#{activeChannelData?.name}</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Начало канала #{activeChannelData?.name}.</p>
              </div>

              {filteredMessages.map((msg, idx) => {
                const user = getUser(msg.userId);
                const prev = filteredMessages[idx - 1];
                const grouped = prev && prev.userId === msg.userId;
                const isDeleting = deletingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`message-row group ${isDeleting ? "opacity-0 transition-opacity duration-300" : ""} ${grouped ? "mt-0.5" : "mt-3"}`}
                  >
                    {!grouped ? (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: getUserColor(user.id), color: "white", marginTop: 2 }}
                        onClick={() => setSelectedUser(user)}
                      >
                        {user.avatar}
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 flex items-start justify-center pt-0.5">
                        <span className="text-xs opacity-0 group-hover:opacity-50 transition-opacity font-mono" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                          {msg.time}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {!grouped && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span
                            className="text-sm font-semibold cursor-pointer hover:underline"
                            style={{ color: getUserColor(user.id) }}
                            onClick={() => setSelectedUser(user)}
                          >
                            {user.name}
                          </span>
                          {user.role !== "Участник" && (
                            <span
                              className="px-1.5 py-0.5 rounded font-medium"
                              style={{ backgroundColor: `${ROLE_COLORS[user.role]}22`, color: ROLE_COLORS[user.role], fontSize: 10 }}
                            >
                              {user.role}
                            </span>
                          )}
                          <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>{msg.time}</span>
                          {msg.pinned && <Icon name="Pin" size={11} style={{ color: "var(--accent-yellow)" }} />}
                        </div>
                      )}
                      <div className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                        {msg.content}
                        {msg.edited && <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>(ред.)</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button className="p-1.5 rounded transition-colors hover:opacity-70" style={{ color: "var(--text-secondary)" }} onClick={() => showNotification("Реакция добавлена")} title="Реакция">
                        <Icon name="Smile" size={15} />
                      </button>
                      {msg.userId === 1 && (
                        <button className="p-1.5 rounded transition-colors" style={{ color: "var(--accent-red)" }} onClick={() => deleteMessage(msg.id)} title="Удалить">
                          <Icon name="Trash2" size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {searchQuery && filteredMessages.length === 0 && (
                <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                  <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-40" />
                  <p>Ничего не найдено</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
              >
                <button className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => showNotification("Файлы — скоро!")}>
                  <Icon name="Plus" size={22} />
                </button>
                <input
                  type="text"
                  placeholder={`Написать в #${activeChannelData?.name}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
                <div className="flex items-center gap-2">
                  <button className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} onClick={() => showNotification("Эмодзи — скоро!")}>
                    <Icon name="Smile" size={20} />
                  </button>
                  <button
                    className="px-3 py-1.5 rounded text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: input.trim() ? "var(--accent-primary)" : "var(--bg-active)", color: input.trim() ? "white" : "var(--text-muted)" }}
                    onClick={sendMessage}
                  >
                    <Icon name="Send" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeView === "profile" && (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Мой профиль</h2>
              <button onClick={() => setActiveView("chat")} style={{ color: "var(--text-secondary)" }}><Icon name="X" size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="h-24" style={{ background: `linear-gradient(135deg, ${getUserColor(currentUser.id)}99, var(--accent-primary)66)` }} />
              <div className="px-4 pb-6">
                <div className="relative -mt-8 mb-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4" style={{ backgroundColor: getUserColor(currentUser.id), color: "white", borderColor: "var(--bg-surface)" }}>
                    {currentUser.avatar}
                  </div>
                  <div className={`status-dot absolute bottom-1 right-1 status-${currentUser.status}`} style={{ width: 14, height: 14, borderWidth: 3, borderColor: "var(--bg-surface)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{currentUser.name}</h3>
                <div className="text-sm font-mono mb-2" style={{ color: "var(--text-secondary)" }}>{currentUser.tag}</div>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-4" style={{ backgroundColor: `${ROLE_COLORS[currentUser.role]}22`, color: ROLE_COLORS[currentUser.role] }}>
                  {currentUser.role}
                </div>
                {currentUser.bio && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-1" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>О себе</div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{currentUser.bio}</p>
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-xs font-bold mb-1" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>На сервере с</div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{currentUser.joinedAt}</p>
                </div>
                <div className="mb-5">
                  <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Статус</div>
                  <div className="flex flex-col gap-2">
                    {(["online", "idle", "dnd", "offline"] as Status[]).map((s) => (
                      <button key={s} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
                        style={{ backgroundColor: currentUser.status === s ? "var(--bg-active)" : "var(--bg-elevated)", color: "var(--text-primary)", border: currentUser.status === s ? "1px solid var(--accent-primary)" : "1px solid transparent" }}
                        onClick={() => showNotification(`Статус: ${STATUS_LABELS[s]}`)}
                      >
                        <div className={`status-dot status-${s}`} style={{ border: "none" }} />
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: "var(--accent-primary)", color: "white" }} onClick={() => showNotification("Редактирование — скоро!")}>
                  Редактировать профиль
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeView === "settings" && (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Настройки</h2>
              <button onClick={() => setActiveView("chat")} style={{ color: "var(--text-secondary)" }}><Icon name="X" size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {[
                { icon: "User", label: "Мой аккаунт", desc: "Имя, аватар, пароль" },
                { icon: "Bell", label: "Уведомления", desc: "Звуки, пинги, подписки" },
                { icon: "Shield", label: "Приватность", desc: "DM, блокировки, 2FA" },
                { icon: "Headphones", label: "Голос и видео", desc: "Устройства ввода/вывода" },
                { icon: "Palette", label: "Внешний вид", desc: "Тема, шрифт, масштаб" },
                { icon: "Globe", label: "Язык", desc: "Русский" },
                { icon: "Keyboard", label: "Быстрые клавиши", desc: "Горячие клавиши" },
                { icon: "Bot", label: "Приложения и боты", desc: "Интеграции, авторизованные приложения" },
              ].map((item) => (
                <button key={item.label} className="flex items-center gap-3 w-full px-3 py-3 rounded-lg mb-1 transition-colors text-left hover:opacity-80"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  onClick={() => showNotification(`${item.label} — скоро!`)}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <Icon name={item.icon as string} size={18} style={{ color: "var(--accent-primary)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              ))}
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition-colors"
                  style={{ color: "var(--accent-red)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#ed424511"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  onClick={() => showNotification("Выход — скоро!")}
                >
                  <Icon name="LogOut" size={18} />
                  <span className="text-sm font-medium">Выйти из аккаунта</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODERATION ── */}
        {activeView === "moderation" && (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={18} style={{ color: "var(--accent-primary)" }} />
                <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Панель модерации</h2>
              </div>
              <button onClick={() => setActiveView("chat")} style={{ color: "var(--text-secondary)" }}><Icon name="X" size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Участников", value: USERS.length, icon: "Users", color: "var(--accent-primary)" },
                  { label: "Сообщений", value: messages.length, icon: "MessageSquare", color: "var(--accent-green)" },
                  { label: "Каналов", value: CHANNELS.length, icon: "Hash", color: "var(--accent-cyan)" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <Icon name={s.icon as string} size={20} className="mx-auto mb-1" style={{ color: s.color }} />
                    <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Участники</div>
              <div className="space-y-1 mb-6">
                {USERS.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: getUserColor(user.id), color: "white" }}>
                        {user.avatar}
                      </div>
                      <div className={`status-dot absolute -bottom-0.5 -right-0.5 status-${user.status}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</div>
                      <div className="text-xs" style={{ color: ROLE_COLORS[user.role] }}>{user.role}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--accent-yellow)" }} title="Предупреждение" onClick={() => showNotification(`⚠️ ${user.name} предупреждён`)}>
                        <Icon name="AlertTriangle" size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--accent-red)" }} title="Заблокировать" onClick={() => showNotification(`🔨 ${user.name} заблокирован`)}>
                        <Icon name="Ban" size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }} title="Роли" onClick={() => showNotification(`Роли: ${user.name}`)}>
                        <Icon name="Tag" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Инструменты</div>
              <div className="space-y-1">
                {[
                  { icon: "Trash2", label: "Очистить чат", color: "var(--accent-red)" },
                  { icon: "Lock", label: "Замедленный режим", color: "var(--accent-yellow)" },
                  { icon: "UserX", label: "Просмотреть баны", color: "var(--text-secondary)" },
                  { icon: "Bot", label: "Настройки ботов", color: "var(--accent-cyan)" },
                ].map((action) => (
                  <button key={action.label} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors"
                    style={{ backgroundColor: "var(--bg-elevated)", color: action.color }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }}
                    onClick={() => showNotification(`${action.label} — скоро!`)}
                  >
                    <Icon name={action.icon as string} size={16} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members Sidebar */}
        {activeView === "chat" && (
          <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 240, backgroundColor: "var(--bg-deep)", borderLeft: "1px solid var(--border-subtle)" }}>
            <div className="px-3 py-3 text-xs font-bold flex-shrink-0" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" }}>
              Участники — {USERS.length}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(groupedUsers).map(([role, users]) =>
                users.length > 0 && (
                  <div key={role} className="mb-3">
                    <div className="text-xs font-bold mb-1.5 px-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {role} — {users.length}
                    </div>
                    {users.map((user) => (
                      <button key={user.id} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors text-left mb-0.5"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: getUserColor(user.id), color: "white" }}>
                            {user.avatar}
                          </div>
                          <div className={`status-dot absolute -bottom-0.5 -right-0.5 status-${user.status}`} style={{ width: 8, height: 8, borderWidth: 1.5 }} />
                        </div>
                        <span className="text-xs truncate">{user.name}</span>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Popup */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setSelectedUser(null)}>
          <div className="rounded-xl overflow-hidden w-72 animate-slide-up" style={{ backgroundColor: "var(--bg-elevated)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${getUserColor(selectedUser.id)}cc, ${getUserColor(selectedUser.id)}44)` }} />
            <div className="px-4 pb-4">
              <div className="relative -mt-8 mb-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4" style={{ backgroundColor: getUserColor(selectedUser.id), color: "white", borderColor: "var(--bg-elevated)" }}>
                  {selectedUser.avatar}
                </div>
                <div className={`status-dot absolute bottom-1 right-1 status-${selectedUser.status}`} style={{ width: 13, height: 13, borderWidth: 3, borderColor: "var(--bg-elevated)" }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{selectedUser.name}</h3>
              <div className="text-xs font-mono mb-2" style={{ color: "var(--text-secondary)" }}>{selectedUser.tag}</div>
              <div className="inline-flex px-2 py-0.5 rounded text-xs font-medium mb-3" style={{ backgroundColor: `${ROLE_COLORS[selectedUser.role]}22`, color: ROLE_COLORS[selectedUser.role] }}>
                {selectedUser.role}
              </div>
              {selectedUser.bio && <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{selectedUser.bio}</p>}
              <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>На сервере с {selectedUser.joinedAt}</div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: "var(--accent-primary)", color: "white" }} onClick={() => { setSelectedUser(null); showNotification(`Написать ${selectedUser.name} — скоро!`); }}>
                  Написать
                </button>
                <button className="py-2 px-3 rounded-lg text-xs transition-all hover:opacity-70" style={{ backgroundColor: "var(--bg-active)", color: "var(--text-secondary)" }} onClick={() => setSelectedUser(null)}>
                  <Icon name="X" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}