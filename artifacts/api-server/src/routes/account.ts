import { clerkClient, getAuth } from "@clerk/express";
import { EnsureAttendeeAccessResponse } from "@workspace/api-zod";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/me/attendee-access", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication is required" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const existingRole = user.publicMetadata.role;
    let role: "attendee" | "instructor" | "unassigned";

    if (existingRole === "instructor" || existingRole === "attendee") {
      role = existingRole;
    } else if (existingRole == null) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          role: "attendee",
        },
      });
      role = "attendee";
    } else {
      role = "unassigned";
    }

    res.json(
      EnsureAttendeeAccessResponse.parse({
        role,
        canAccessAttendeePortal: role === "attendee",
        canAccessInstructorPortal: role === "instructor",
      }),
    );
  } catch (error) {
    req.log.error({ err: error, userId }, "Could not ensure attendee access");
    res.status(500).json({ error: "Unable to verify account access" });
  }
});

export default router;
