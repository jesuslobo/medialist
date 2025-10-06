import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({
        disableSignup: process.env.DISABLE_SIGNUP === 'true'
    });
}