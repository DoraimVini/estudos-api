import { createApp } from "./app.js";
import { openDatabase } from "./db/database.js";

const port = Number(process.env.PORT ?? 3000);
const db = openDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`API de estudos rodando em http://localhost:${port}/api/v1/status`);
  console.log(`O que estudar agora: http://localhost:${port}/api/v1/proximo`);
});
