import type { NextApiRequest, NextApiResponse } from "next";
import firebaseadmin from "../../../../lib/firebaseadmin";
import { AdminUser } from "../../../../lib/interfaces";
import bcrypt from "bcryptjs";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const database = firebaseadmin.database();
  const userDb = database.ref("users");
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "Id and password are required" });
  }

  const existingUser: AdminUser[] = await userDb?.once("value").then(function (snapshot) {
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
  console.log(existingUser);
  if (existingUser.length) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id, password: hashedPassword };
  await userDb.update({
    [`${id}`]: newUser
  });
  return res.status(201).json({ message: "Signup successful!" });
}
