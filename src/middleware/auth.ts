import jwt from 'jsonwebtoken';
import axios from 'axios';

async function check_token(req: any, res: any, next: any): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("missing token");

    try {
        // const { data: jwks } = await axios.get("https://.supabase.co/.well-known/jwks.json");
        const { data: jwks } = await axios.get(process.env.SUPABASE_PROJECT_ID + "/.well-known/jwks.json");
        const publicKey = (jwks as { keys: { x5c: string[] }[] }).keys[0].x5c[0];
        const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
        req.user = decoded; // attach user info to the request object
        next();
    } catch (err) {
        res.status(401).send("invalid token");
    }
}

export { check_token };