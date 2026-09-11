"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const dotbev = require("dotenv");
dotbev.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const frontendUrl = process.env.NODE_ENV === 'production'
        ? configService.get('FRONTEND_URL')
        : 'http://localhost:5173';
    app.enableCors({
        origin: frontendUrl,
        methods: 'GET,POST,PUT,DELETE',
        credentials: true,
    });
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map