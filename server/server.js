import app from "./src/app.js";
import { startScheduler } from "./src/services/schedulerService.js";

/* ======================
   SCHEDULER
====================== */
startScheduler();


/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
