import { createApp } from "./app.ts";
import { openDatabase } from "./db/database.ts";

const port = Number(process.env.PORT ?? 3000);
const db = openDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`Painel de estudos: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/v1/status`);
});
