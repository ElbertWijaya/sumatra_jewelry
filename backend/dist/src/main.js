"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const compressionLib = require('compression');
const helmet_1 = require("helmet");
const app_module_1 = require("./modules/app.module");
const fs_1 = require("fs");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.use((0, helmet_1.default)());
    const compressionMw = (compressionLib.default || compressionLib)();
    app.use(compressionMw);
    app.setGlobalPrefix('api');
    app.use((req, _res, next) => {
        if (req.method === 'POST' && req.url.startsWith('/api/orders')) {
            console.log('[PRE-VALIDATION] URL:', req.url, 'Body type:', typeof req.body, 'Keys:', req.body && Object.keys(req.body || {}));
            try {
                if (req.body && typeof req.body === 'object') {
                    const { customerName, jenisBarang, jenisEmas, warnaEmas } = req.body;
                    console.log('[PRE-VALIDATION] preview:', { customerName, jenisBarang, jenisEmas, warnaEmas });
                }
            }
            catch { }
        }
        next();
    });
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsDir))
        (0, fs_1.mkdirSync)(uploadsDir);
    const express = require('express');
    app.use('/uploads', express.static(uploadsDir));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.enableCors({ origin: '*', credentials: true });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map