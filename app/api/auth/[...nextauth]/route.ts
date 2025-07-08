import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';

// For App Router, we need to adapt the getAuthOptions function
// Since it expects req/res objects, we'll create minimal compatible objects
const handler = NextAuth({
  ...getAuthOptions({} as any, {} as any),
});

export { handler as GET, handler as POST };
