import { Router } from "express";
import { db, investorsTable, holdingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// GET /api/holdings?email= — get holdings for a user by email
router.get("/holdings", async (req, res): Promise<void> => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid email query param is required." });
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
      res.status(404).json({ error: "Investor not found." });
      return;
    }

    const [holding] = await db
      .select()
      .from(holdingsTable)
      .where(eq(holdingsTable.investorId, investor.id))
      .limit(1);

    res.json({
      investorId: investor.id,
      shares: holding?.shares ?? "0",
      avgCost: holding?.avgCost ?? "0",
      updatedAt: holding?.updatedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get holdings");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
