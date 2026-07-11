import { User } from "./user";

export function createAuthUser(user: User): AuthUser {
  return {
    ...user,
    role_code: user.vai_tro
  };
}
export interface AuthUser extends User {
  role_code: string;
}
export function checkUserRoleAllow(user: User, role: string) {
  return user.vai_tro === role
}
export function checkUserRoleAllowMultiple(user: User, roles: string[]) {
  return roles.some((role) => user.vai_tro === role);
}
