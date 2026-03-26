"""
Авторизация пользователей: регистрация, вход, выход, получение профиля.
action: register | login | logout | me
"""
import os
import json
import secrets
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def ok(data: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}

def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """Авторизация: register, login, logout, me. Передай action в теле запроса или query-параметром."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = headers.get("x-session-token", "")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    params = event.get("queryStringParameters") or {}
    action = body.get("action") or params.get("action") or ""

    # me
    if action == "me" or (event.get("httpMethod") == "GET" and not action):
        if not token:
            return err("Не авторизован", 401)
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    f"SELECT u.id, u.username, u.display_name, u.email, u.avatar, u.status, u.bio, u.role, u.created_at "
                    f"FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id "
                    f"WHERE s.token = %s AND s.expires_at > NOW()",
                    (token,)
                )
                user = cur.fetchone()
        if not user:
            return err("Сессия истекла", 401)
        user = dict(user)
        user["created_at"] = str(user["created_at"])
        return ok({"user": user})

    # register
    if action == "register":
        username = (body.get("username") or "").strip().lower()
        display_name = (body.get("display_name") or body.get("username") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not username or not email or not password:
            return err("Заполните все поля")
        if len(username) < 3 or len(username) > 32:
            return err("Имя пользователя: от 3 до 32 символов")
        if len(password) < 6:
            return err("Пароль: минимум 6 символов")

        avatar = display_name[0].upper() if display_name else "U"
        pw_hash = hash_password(password)
        new_token = secrets.token_hex(48)

        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT id FROM {schema}.users WHERE username = %s OR email = %s", (username, email))
                if cur.fetchone():
                    return err("Пользователь с таким именем или email уже существует", 409)
                cur.execute(
                    f"INSERT INTO {schema}.users (username, display_name, email, password_hash, avatar, status) "
                    f"VALUES (%s, %s, %s, %s, %s, 'online') "
                    f"RETURNING id, username, display_name, email, avatar, status, bio, role, created_at",
                    (username, display_name, email, pw_hash, avatar)
                )
                user = dict(cur.fetchone())
                cur.execute(f"INSERT INTO {schema}.sessions (user_id, token) VALUES (%s, %s)", (user["id"], new_token))
            conn.commit()

        user["created_at"] = str(user["created_at"])
        return ok({"token": new_token, "user": user}, 201)

    # login
    if action == "login":
        login = (body.get("login") or body.get("email") or body.get("username") or "").strip().lower()
        password = body.get("password") or ""

        if not login or not password:
            return err("Введите логин и пароль")

        pw_hash = hash_password(password)
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    f"SELECT id, username, display_name, email, avatar, status, bio, role, created_at "
                    f"FROM {schema}.users WHERE (username = %s OR email = %s) AND password_hash = %s",
                    (login, login, pw_hash)
                )
                user = cur.fetchone()
                if not user:
                    return err("Неверный логин или пароль", 401)
                user = dict(user)
                new_token = secrets.token_hex(48)
                cur.execute(f"INSERT INTO {schema}.sessions (user_id, token) VALUES (%s, %s)", (user["id"], new_token))
                cur.execute(f"UPDATE {schema}.users SET status = 'online' WHERE id = %s", (user["id"],))
            conn.commit()

        user["created_at"] = str(user["created_at"])
        user["status"] = "online"
        return ok({"token": new_token, "user": user})

    # logout
    if action == "logout":
        if token:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"SELECT user_id FROM {schema}.sessions WHERE token = %s", (token,))
                    row = cur.fetchone()
                    if row:
                        cur.execute(f"UPDATE {schema}.users SET status = 'offline' WHERE id = %s", (row[0],))
                    cur.execute(f"UPDATE {schema}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
        return ok({"ok": True})

    return err("Неизвестное действие. Используйте action: register | login | logout | me", 404)
