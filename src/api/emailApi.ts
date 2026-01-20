import httpClient from "./httpClient";

export const sendEmailCode = (email: string) => {
  return httpClient.post("/api/email/code", { email });
};

export const verifyEmailCode = (email: string, code: string) => {
  return httpClient.post("/api/email/verify", { email, code });
};
