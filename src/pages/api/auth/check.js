import { getSession } from "../../../middleware/session";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession(req, res);
  const isAuthenticated = session?.user;

  if (!isAuthenticated) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.status(200).json({
    user: session.user,
  });
}
