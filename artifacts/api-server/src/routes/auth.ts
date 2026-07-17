import { Router } from "express";
import { db, investorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/signin — check email, return investor status
router.post("/signin", async (req, res): Promise<void> => {
  const parsed = SignInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }

  const { email } = parsed.data;

  try {
    const [investor] = await db
      .select()
      .from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!investor) {
      res.status(404).json({ error: "No account found with this email." });
      return;
    }

    res.json({
      status: investor.status,
      fullName: investor.fullName,
      email: investor.email,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sign in");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
