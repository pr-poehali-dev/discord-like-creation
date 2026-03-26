import { useState } from "react";
import { login, register, UserProfile } from "@/lib/api";
import Icon from "@/components/ui/icon";

interface AuthProps {
  onSuccess: (user: UserProfile) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let result;
      if (mode === "login") {
        result = await login(form.email || form.username, form.password);
      } else {
        result = await register(form.username, form.display_name || form.username, form.email, form.password);
      }
      onSuccess(result.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "var(--bg-void)",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(88,101,242,0.15) 0%, transparent 60%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 nexus-glow"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            <span className="text-white text-2xl font-black">N</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Nexus
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {mode === "login" ? "Рады снова видеть тебя!" : "Создай свой аккаунт"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
            {mode === "login" ? "Войти" : "Регистрация"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    placeholder="cooluser123"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: "var(--bg-deep)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-medium)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-medium)"; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                    Отображаемое имя
                  </label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(e) => set("display_name", e.target.value)}
                    placeholder="Иван Иванов"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: "var(--bg-deep)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-medium)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-medium)"; }}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                {mode === "login" ? "Email или имя пользователя" : "Email"}
              </label>
              <input
                type={mode === "register" ? "email" : "text"}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder={mode === "login" ? "user@example.com или username" : "user@example.com"}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--bg-deep)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-medium)"; }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Пароль
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--bg-deep)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-medium)"; }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm animate-fade-in"
                style={{ backgroundColor: "rgba(237,66,69,0.15)", color: "#ed4245", border: "1px solid rgba(237,66,69,0.3)" }}
              >
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--accent-primary)", color: "white" }}
            >
              {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          {" "}
          <button
            className="font-semibold hover:underline transition-all"
            style={{ color: "var(--accent-primary)" }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </div>
  );
}
