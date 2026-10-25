import app from "./server";
import envConfig, { validateProductionConfig } from "./config/envConfig";

validateProductionConfig();
const PORT = envConfig.PORT;

app.listen(PORT, () => {
    console.log(`Server is listening at [PORT]: ${PORT}`);
})
