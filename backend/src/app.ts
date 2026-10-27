import app from "./server";
import envConfig, { validateProductionConfig } from "./config/envConfig";
import { startMemoryWorker } from "./modules/queue/memory.worker";

validateProductionConfig();
const PORT = envConfig.PORT;

try {
    startMemoryWorker();
    console.log("Embedded background memory worker started.");
} catch (err) {
    console.warn("Failed to initialize background memory worker:", err);
}

app.listen(PORT, () => {
    console.log(`Server is listening at [PORT]: ${PORT}`);
});

