import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { accountSchema, accountPayloadSchema, Account, AccountPayload } from "./schemas";
import { validate } from "./middlewares";

const router = Router();

/**
 * POST /api/accounts
 * Create account. Validates payload (strict). Server sets createdAt and updatedAt.
 * Ensure that client cannot inject updatedAt/createdAt because payload schema is strict.
 */
router.post("/accounts", validate(accountPayloadSchema), async (req: Request, res: Response) => {
  try {
    const payload = req.body as AccountPayload; // validated by middleware

    // Build server-side full object and validate final structure via accountSchema
    const account = accountSchema.parse({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const db = await getDb();
    const result = await db.collection<Account>("accounts").insertOne(account);
    const created = await db.collection<Account>("accounts").findOne({ _id: result.insertedId });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PUT /api/accounts/:id
 * Update account. Validates payload (strict). Server sets updatedAt.
 * CreatedAt cannot be provided due to strict payload schema.
 */
router.put("/accounts/:id", validate(accountPayloadSchema), async (req: Request, res: Response) => {
  try {
    const payload = req.body as AccountPayload; // validated
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ path: "id", message: "Invalid id" }] });
    }

    const updateDoc = {
      name: payload.name,
      scope: payload.scope,
      updatedAt: new Date()
    };

    // Optionally validate update shape (we validate updated shape partially)
    // Use accountSchema to validate full object only when reading or creating
    const db = await getDb();
    const { matchedCount } = await db
      .collection<Account>("accounts")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    if (matchedCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const updated = await db.collection<Account>("accounts").findOne({ _id: new ObjectId(id) });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/accounts/stats
 * Returns counts per scope: { accounts, prospects, children }
 */
router.get("/accounts/stats", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const agg = await db
      .collection("accounts")
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$scope", count: { $sum: 1 } } }])
      .toArray();

    const stats = { accounts: 0, prospects: 0, children: 0 };

    for (const row of agg) {
      if (row._id === "account") stats.accounts = row.count;
      if (row._id === "prospect") stats.prospects = row.count;
      if (row._id === "child") stats.children = row.count;
    }

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
