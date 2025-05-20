import { getIronSession } from "iron-session";

export const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieName: "ctba-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export async function getSession(req, res) {
  return await getIronSession(req, res, sessionOptions);
}
