"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const compressionLib = require('compression');
const helmet_1 = require("helmet");
const app_module_1 = require("./modules/app.module");
const realtime_service_1 = require("./realtime/realtime.service");
const fs_1 = require("fs");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.use((0, helmet_1.default)());
    const compressionMw = (compressionLib.default || compressionLib)();
    app.use(compressionMw);
    app.setGlobalPrefix('api');
    try {
        const express = require('express');
        app.use(express.json({ limit: '2mb', type: ['application/json', 'application/*+json'] }));
        app.use(express.text({ type: 'text/plain', limit: '2mb' }));
        app.use((req, _res, next) => {
            const needsParse = ((req.method === 'POST' && (req.url.startsWith('/api/orders') || req.url.startsWith('/api/tasks/assign-bulk'))) ||
                (req.method === 'PATCH' && req.url.startsWith('/api/orders/')));
            if (needsParse && typeof req.body === 'string') {
                const raw = req.body.trim();
                if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
                    try {
                        req.body = JSON.parse(raw);
                        console.log('[TEXT->JSON] Converted text/plain body. Keys:', Object.keys(req.body));
                    }
                    catch (e) {
                        console.warn('[TEXT->JSON] parse failed:', e?.message);
                    }
                }
            }
            next();
        });
    }
    catch (e) {
        console.warn('express.json load failed (will rely on Nest default):', e?.message);
    }
    app.use((req, _res, next) => {
        if (req.method === 'POST' && req.url.startsWith('/api/orders')) {
            console.log('[PRE-VALIDATION] URL:', req.url, 'Body type:', typeof req.body, 'Keys:', req.body && Object.keys(req.body || {}));
            try {
                if (req.body && typeof req.body === 'object') {
                    const { customerName, jenisBarang, jenisEmas, warnaEmas } = req.body;
                    console.log('[PRE-VALIDATION] preview:', { customerName, jenisBarang, jenisEmas, warnaEmas });
                    console.log('[PRE-VALIDATION] types:', {
                        customerName: typeof customerName,
                        jenisBarang: typeof jenisBarang,
                        jenisEmas: typeof jenisEmas,
                        warnaEmas: typeof warnaEmas,
                    });
                    try {
                        const snapshot = JSON.stringify(req.body).slice(0, 500);
                        console.log('[PRE-VALIDATION] raw json (truncated 500):', snapshot);
                    }
                    catch { }
                }
            }
            catch { }
        }
        next();
    });
    app.use((req, _res, next) => {
        if (req.method === 'POST' && req.url.startsWith('/api/tasks/assign-bulk')) {
            try {
                const b = req.body;
                console.log('[ASSIGN-BULK] body keys:', b && Object.keys(b || {}));
                console.log('[ASSIGN-BULK] typeofs:', {
                    orderId: typeof b?.orderId,
                    role: typeof b?.role,
                    userId: typeof b?.userId,
                    subtasks: Array.isArray(b?.subtasks) ? 'array' : typeof b?.subtasks,
                });
                try {
                    console.log('[ASSIGN-BULK] body json (trunc 300):', JSON.stringify(b).slice(0, 300));
                }
                catch { }
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
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    app.enableCors({ origin: '*', credentials: true });
    try {
        const rt = app.get(realtime_service_1.RealtimeService);
        rt.init(app);
        console.log('[Realtime] WebSocket initialized at /ws');
    }
    catch (e) {
        console.warn('[Realtime] init failed:', e?.message);
    }
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`API running on http://0.0.0.0:${port} (LAN access: http://<IP_LAN>:${port}/api )`);
}
bootstrap();
//# sourceMappingURL=main.js.map