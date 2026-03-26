// ─── Types ───────────────────────────────────────────────
export type Status = "online" | "idle" | "dnd" | "offline";
export type ChannelType = "text" | "voice" | "announce";
export type View = "chat" | "profile" | "settings" | "moderation";

export interface User {
  id: number;
  name: string;
  tag: string;
  avatar: string;
  status: Status;
  role: string;
  joinedAt: string;
  bio?: string;
}

export interface Message {
  id: number;
  userId: number;
  content: string;
  time: string;
  pinned?: boolean;
  edited?: boolean;
}

export interface Channel {
  id: number;
  name: string;
  type: ChannelType;
  unread?: number;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Server {
  id: number;
  name: string;
  icon: string;
  color: string;
  notifications?: number;
}

// ─── Mock Data ────────────────────────────────────────────
export const SERVERS: Server[] = [
  { id: 1, name: "Nexus HQ", icon: "N", color: "#5865f2" },
  { id: 2, name: "Геймеры РФ", icon: "Г", color: "#3ba55c", notifications: 12 },
  { id: 3, name: "Dev Space", icon: "D", color: "#eb459e" },
  { id: 4, name: "Арт Студия", icon: "А", color: "#faa81a", notifications: 3 },
  { id: 5, name: "Музыка", icon: "М", color: "#00b0f4" },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: "Общее" },
  { id: 2, name: "Игры" },
  { id: 3, name: "Голосовые" },
];

export const CHANNELS: Channel[] = [
  { id: 1, name: "добро-пожаловать", type: "announce", categoryId: 1 },
  { id: 2, name: "основной", type: "text", categoryId: 1, unread: 5 },
  { id: 3, name: "оффтоп", type: "text", categoryId: 1, unread: 2 },
  { id: 4, name: "cs2-поиск", type: "text", categoryId: 2 },
  { id: 5, name: "minecraft", type: "text", categoryId: 2, unread: 8 },
  { id: 6, name: "Лобби", type: "voice", categoryId: 3 },
  { id: 7, name: "Играем вместе", type: "voice", categoryId: 3 },
  { id: 8, name: "AFK", type: "voice", categoryId: 3 },
];

export const USERS: User[] = [
  { id: 1, name: "Алексей Громов", tag: "alex#0001", avatar: "А", status: "online", role: "Администратор", joinedAt: "12 янв 2024", bio: "Основатель сервера. Люблю игры и код." },
  { id: 2, name: "Мария Светлова", tag: "maria#0042", avatar: "М", status: "online", role: "Модератор", joinedAt: "25 янв 2024", bio: "Модератор сервера. Аниме и кофе ☕" },
  { id: 3, name: "Дмитрий Ков", tag: "dima#1337", avatar: "Д", status: "idle", role: "Участник", joinedAt: "3 фев 2024" },
  { id: 4, name: "Катя Небо", tag: "kate#0777", avatar: "К", status: "dnd", role: "Участник", joinedAt: "10 фев 2024", bio: "Не мешайте — стримлю!" },
  { id: 5, name: "Иван Лесной", tag: "ivan#2024", avatar: "И", status: "offline", role: "Участник", joinedAt: "15 фев 2024" },
  { id: 6, name: "Nickbot", tag: "bot#0000", avatar: "🤖", status: "online", role: "Бот", joinedAt: "1 янв 2024", bio: "Автоматизирую всё что можно." },
];

export const INITIAL_MESSAGES: Message[] = [
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

export const STATUS_LABELS: Record<Status, string> = {
  online: "В сети",
  idle: "Отошёл",
  dnd: "Не беспокоить",
  offline: "Не в сети",
};

export const ROLE_COLORS: Record<string, string> = {
  "Администратор": "#ed4245",
  "Модератор": "#faa81a",
  "Бот": "#00b0f4",
  "Участник": "#96989d",
};

export const USER_COLORS = ["#5865f2", "#3ba55c", "#eb459e", "#faa81a", "#00b0f4", "#f04747"];

export function getUserColor(id: number) {
  return USER_COLORS[(id - 1) % USER_COLORS.length];
}
