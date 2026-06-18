import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: {
        name,
        clerkUserId: user.id, // FIXED
      },
      create: {
        email: user.emailAddresses[0].emailAddress,
        name,
        clerkUserId: user.id, // FIXED
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};