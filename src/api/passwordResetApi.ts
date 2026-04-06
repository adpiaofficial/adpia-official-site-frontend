import httpClient from "./httpClient";

export async function sendPasswordResetCode(email: string) {
  const res = await httpClient.post("/members/password/reset/send-code", { email });
  return res.data;
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const res = await httpClient.post("/members/password/reset/verify-code", { email, code });
  return res.data;
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string
) {
  const res = await httpClient.post("/members/password/reset/confirm", {
    email,
    code,
    newPassword,
    confirmPassword,
  });
  return res.data;
}