import Icon from "@/components/ui/icon";
import {
  User, Server, Channel, Category,
  SERVERS, CHANNELS, CATEGORIES,
  STATUS_LABELS, getUserColor,
  View, Status,
} from "./types";

interface ServerSidebarProps {
  activeServer: number;
  setActiveServer: (id: number) => void;
  activeChannel: number;
  setActiveChannel: (id: number) => void;
  setActiveView: (view: View) => void;
  collapsedCategories: number[];
  toggleCategory: (id: number) => void;
  currentUser: User;
  showNotification: (msg: string) => void;
}

export default function ServerSidebar({
  activeServer,
  setActiveServer,
  activeChannel,
  setActiveChannel,
  setActiveView,
  collapsedCategories,
  toggleCategory,
  currentUser,
  showNotification,
}: ServerSidebarProps) {
  return (
    <>
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

        {SERVERS.map((srv: Server) => (
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
          {CATEGORIES.map((cat: Category) => {
            const collapsed = collapsedCategories.includes(cat.id);
            const catChannels = CHANNELS.filter((c: Channel) => c.categoryId === cat.id);
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
                {!collapsed && catChannels.map((ch: Channel) => (
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

        {/* User Panel */}
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
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{STATUS_LABELS[currentUser.status as Status]}</div>
          </div>
          <div className="flex gap-1">
            <button
              className="p-1.5 rounded hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => showNotification("Микрофон")}
              title="Микрофон"
            >
              <Icon name="Mic" size={16} />
            </button>
            <button
              className="p-1.5 rounded hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setActiveView("settings")}
              title="Настройки"
            >
              <Icon name="Settings" size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
