import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { getEnv } from "./env";
import type { AuthUser } from "./current-user.decorator";

interface JwtPayload {
  sub: string;
  email: string;
  role: AuthUser["role"];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getEnv().JWT_SECRET
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
