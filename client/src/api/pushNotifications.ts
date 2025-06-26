export async function registerFcmToken(token: string) {
  const res = await fetch("/api/push-notifications/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // if using cookies/session
    body: JSON.stringify({ fcmToken: token }),
  });
  return res.json();
}
