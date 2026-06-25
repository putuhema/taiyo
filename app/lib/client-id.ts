const CLIENT_ID_KEY = "sunset-client-id";
const AUTHOR_NAME_KEY = "sunset-author-name";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function getAuthorName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(AUTHOR_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setAuthorName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTHOR_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
}
