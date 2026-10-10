import app from "./server";
import envConfig from "./config/envConfig";

const PORT = envConfig.PORT;

app.listen(PORT, () => {
    console.log(`Server is listening at [PORT]: ${PORT}`);
})

