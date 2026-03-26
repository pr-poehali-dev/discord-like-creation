import Icon from "@/components/ui/icon";
import { logout as apiLogout } from "@/lib/api";
import {
  User, Message, Channel,
  USERS, CHANNELS,
  ROLE_COLORS, STATUS_LABELS, getUserColor,
  View, Status,
} from "./types";

interface ChatAreaProps {
  activeView: View;
  setActiveView: (view: View) => void;
  activeChannel: number;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  sendMessage: () => void;
  deleteMessage: (id: number) => void;
  deletingId: number | null;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredMessages: Message[];
  currentUser: User;
  setSelectedUser: (u: User) => void;
  showNotification: (msg: string) => void;
  onLogout: () => void;
}

function getUser(id: number): User {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

export default function ChatArea({
  activeView,
  setActiveView,
  activeChannel,
  input,
  setInput,
  sendMessage,
  deleteMessage,
  deletingId,
  searchQuery,
  setSearchQuery,
  filteredMessages,
  currentUser,
  setSelectedUser,
  showNotification,
  onLogout,
}: ChatAreaProps) {
  const activeChannelData: Channel | undefined = CHANNELS.find((c) => c.id === activeChannel);

  const groupedUsers: Record<string, User[]> = {
    "Администратор": USERS.filter((u) => u.role === "Администратор"),
    "Модератор": USERS.filter((u) => u.role === "Модератор"),
    "Бот": USERS.filter((u) => u.role === "Бот"),
    "Участник": USERS.filter((u) => u.role === "Участник"),
  };

  return (
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
                onClick={async () => { await apiLogout(); onLogout(); }}
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
                { label: "Сообщений", value: filteredMessages.length, icon: "MessageSquare", color: "var(--accent-green)" },
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

      {/* Members Sidebar (only visible in chat view) */}
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
  );
}
