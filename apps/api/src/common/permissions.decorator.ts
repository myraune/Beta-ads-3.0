import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@beta/shared";

export const PERMISSION_KEY = "permission";

export const RequirePermission = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);
