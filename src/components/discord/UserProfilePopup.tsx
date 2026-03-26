import Icon from "@/components/ui/icon";
import { User, ROLE_COLORS, getUserColor } from "./types";

interface UserProfilePopupProps {
  user: User;
  onClose: () => void;
  showNotification: (msg: string) => void;
}

export default function UserProfilePopup({ user, onClose, showNotification }: UserProfilePopupProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl overflow-hidden w-72 animate-slide-up"
        style={{ backgroundColor: "var(--bg-elevated)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-20" style={{ background: `linear-gradient(135deg, ${getUserColor(user.id)}cc, ${getUserColor(user.id)}44)` }} />
        <div className="px-4 pb-4">
          <div className="relative -mt-8 mb-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4"
              style={{ backgroundColor: getUserColor(user.id), color: "white", borderColor: "var(--bg-elevated)" }}
            >
              {user.avatar}
            </div>
            <div
              className={`status-dot absolute bottom-1 right-1 status-${user.status}`}
              style={{ width: 13, height: 13, borderWidth: 3, borderColor: "var(--bg-elevated)" }}
            />
          </div>
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{user.name}</h3>
          <div className="text-xs font-mono mb-2" style={{ color: "var(--text-secondary)" }}>{user.tag}</div>
          <div
            className="inline-flex px-2 py-0.5 rounded text-xs font-medium mb-3"
            style={{ backgroundColor: `${ROLE_COLORS[user.role]}22`, color: ROLE_COLORS[user.role] }}
          >
            {user.role}
          </div>
          {user.bio && (
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{user.bio}</p>
          )}
          <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            На сервере с {user.joinedAt}
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
              onClick={() => { onClose(); showNotification(`Написать ${user.name} — скоро!`); }}
            >
              Написать
            </button>
            <button
              className="py-2 px-3 rounded-lg text-xs transition-all hover:opacity-70"
              style={{ backgroundColor: "var(--bg-active)", color: "var(--text-secondary)" }}
              onClick={onClose}
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
