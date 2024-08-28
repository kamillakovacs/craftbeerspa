import type { NextApiRequest, NextApiResponse } from "next";
import firebaseadmin from "../../../../lib/firebaseadmin";
import bcrypt from "bcryptjs";
import { AdminUser } from "../../../../lib/interfaces";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const database = firebaseadmin.database();
  const userDb = database.ref("users");
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "Id and password are required" });
  }

  const user: AdminUser[] = await userDb?.once("value").then(function (snapshot) {
    if (snapshot.val()) {
      return (
        Object.values(snapshot.val())
          .filter((user: AdminUser) => user.id === id)
          .map((res: AdminUser) => ({
            id: res.id ?? null,
            password: res.password ?? null
          })) || []
      );
    } else {
      return null;
    }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const isValidPassword = bcrypt.compareSync(password, user[0].password);
  if (!isValidPassword) {
    [];
    return res.status(400).json({ message: "Invalid credentials" });
  }
  return res.status(200).json({ message: "Login successful" });
}
