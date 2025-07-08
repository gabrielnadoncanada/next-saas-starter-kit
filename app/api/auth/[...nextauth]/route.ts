import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';

const handler = (req: any, res: any) =>
  NextAuth(req, res, getAuthOptions(req, res));

export { handler as GET, handler as POST };
