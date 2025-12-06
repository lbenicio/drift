import "next-auth";
import "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    role: string;
    sessionToken: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      role: string;
      sessionToken: string;
    };
  }

  // override user
  interface User {
    username?: string | null;
    email?: string | null;
    role?: string | null;
    id: UserId;
    token?: string;
  }
}
