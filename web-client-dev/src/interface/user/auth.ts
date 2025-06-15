import { User } from "./user";

export function createAuthUser(user: User): AuthUser {
  const roles = user.vai_tro || [];
  return {
    ...user,
    role_code: roles[0]
  };
}
export interface AuthUser extends User {
  role_code: string;
}
export function checkUserRoleAllow(user: User, role: string) {
  console.log("🚀 ~ checkUserRoleAllow ~ role:", role)
  return user.vai_tro === role
}
export function checkUserRoleAllowMultiple(user: User, roles: string[]) {
  const auth_roles = user.vai_tro || [];
  return roles.some((role) => auth_roles.includes(role));
}
