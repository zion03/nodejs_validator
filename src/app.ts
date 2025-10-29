import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import { getDb } from "./mongo";

const app = express();
app.use(express.json());

// simple request logger (debug)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api", router);

// start only after DB is available (fail fast)
async function start() {
  try {
    await getDb();
    const PORT = Number(process.env.PORT || 3000);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
