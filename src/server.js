import { createApp } from "./app.js";
import { openDatabase } from "./db/database.js";

const port = Number(process.env.PORT ?? 3000);
const db = openDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`Painel de estudos: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/v1/status`);
});
