import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermission } from "@beta/shared";
import { PERMISSION_KEY } from "./permissions.decorator";
import type { AuthUser } from "./current-user.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    if (!request.user || !hasPermission(request.user.role, requiredPermission as never)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
