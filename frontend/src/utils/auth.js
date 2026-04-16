export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function isTokenExpired(token) {
  try {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;

    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (error) {
    return true;
  }
}

export function getValidToken() {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    logout();
    return null;
  }

  return token;
}