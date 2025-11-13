import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: string | jwt.JwtPayload;
        }
    }
}

async function check_token(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Missing authentication token" });
        return;
    }

    try {
        // Construct proper Supabase JWKS URL
        const supabaseProjectId = process.env.SUPABASE_PROJECT_ID;
        if (!supabaseProjectId) {
            throw new Error("SUPABASE_PROJECT_ID not configured");
        }

        const jwksUrl = `https://${supabaseProjectId}.supabase.co/.well-known/jwks.json`;
        const { data: jwks } = await axios.get(jwksUrl);
        const publicKey = (jwks as { keys: { x5c: string[] }[] }).keys[0].x5c[0];

        const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
        req.user = decoded; // attach user info to the request object
        next();
    } catch (err: any) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

export { check_token };