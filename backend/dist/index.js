import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});
app.get('/sapa', (_req, res) => {
    res.json({
        pesan: "Halo! Kabar saya baik, terima kasih! 😊",
        status: "Siap membantu pelacakan pesanan perhiasan Sumatra",
        time: new Date().toISOString()
    });
});
app.post('/sapa', (req, res) => {
    const { pesan } = req.body;
    if (pesan && (pesan.toLowerCase().includes('halo') || pesan.toLowerCase().includes('gimana'))) {
        res.json({
            pesan: "Halo! Kabar saya baik, terima kasih! 😊",
            status: "Siap membantu pelacakan pesanan perhiasan Sumatra",
            balasan_untuk: pesan,
            time: new Date().toISOString()
        });
    }
    else {
        res.json({
            pesan: "Halo! Silakan bertanya tentang pelacakan pesanan perhiasan.",
            time: new Date().toISOString()
        });
    }
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});
io.on('connection', socket => {
    console.log('Client connected', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});
httpServer.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
});
