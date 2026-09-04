import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { UserRole } from "@nordicdrive/types";

interface JwtPayload {
  sub: string;
  email?: string;
  role?: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("app.jwt.secret"),
      issuer: config.getOrThrow<string>("app.jwt.issuer"),
      audience: config.getOrThrow<string>("app.jwt.audience"),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? "user",
    };
  }
}
