import { JwtPayload } from "jsonwebtoken";
import { Agency } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload;
            agency?: Agency;
            agencyId?: string;
        }
    }
}

export { };
