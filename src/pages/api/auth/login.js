import { getSession } from "../../../middleware/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  // For development, let's use a simple hardcoded admin user
  // In production, you should use a proper authentication system
  if (username === "admin" && password === "admin") {
    const session = await getSession(req, res);
    session.user = {
      username: "admin",
      role: "admin",
    };
    await session.save();

    return res.status(200).json({
      user: {
        username: "admin",
        role: "admin",
      },
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
}
