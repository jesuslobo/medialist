import express from 'express';

const handler = express();
const staticRoute = express.static('./public/users');
handler.use('/api/file', staticRoute);

export default handler;

export const config = {
    api: { externalResolver: true }
}