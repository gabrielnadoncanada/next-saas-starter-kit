import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getUser } from '@/shared/model/user';
import { verifyPassword } from '@/lib/auth-utils';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { isAuthProviderEnabled } from '@/lib/auth-utils';
import { validateRecaptcha } from '@/lib/recaptcha';
import { sendMagicLink } from '@/lib/email/sendMagicLink';
import {
  clearLoginAttempts,
  exceededLoginAttemptsThreshold,
  incrementLoginAttempts,
} from '@/lib/accountLock';
import { slackNotify } from '@/lib/slack';
import { maxLengthPolicies } from '@/lib/common';
import { createUser } from '@/shared/model/user';

const adapter = PrismaAdapter(prisma);
const providers: any[] = [];
const sessionMaxAge = 14 * 24 * 60 * 60; // 14 days

if (isAuthProviderEnabled('credentials')) {
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        recaptchaToken: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('no-credentials');
        }

        const { email, password, recaptchaToken } = credentials;

        await validateRecaptcha(recaptchaToken);

        if (!email || !password) {
          return null;
        }

        const user = await getUser({ email });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (exceededLoginAttemptsThreshold(user)) {
          throw new Error('exceeded-login-attempts');
        }

        if (env.confirmEmail && !user.emailVerified) {
          throw new Error('confirm-your-email');
        }

        const hasValidPassword = await verifyPassword(
          password,
          user?.password as string
        );

        if (!hasValidPassword) {
          if (
            exceededLoginAttemptsThreshold(await incrementLoginAttempts(user))
          ) {
            throw new Error('exceeded-login-attempts');
          }

          throw new Error('invalid-credentials');
        }

        await clearLoginAttempts(user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    })
  );
}

if (isAuthProviderEnabled('github')) {
  providers.push(
    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('google')) {
  providers.push(
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('email')) {
  providers.push(
    EmailProvider({
      server: {
        host: env.smtp.host,
        port: env.smtp.port,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.password,
        },
      },
      from: env.smtp.from,
      maxAge: 1 * 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLink(identifier, url);
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter,
  providers,
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: env.nextAuth.sessionStrategy,
    maxAge: sessionMaxAge,
  },
  secret: env.nextAuth.secret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !user.email || !account) {
        return false;
      }

      if (!isEmailAllowed(user.email)) {
        return '/auth/login?error=allow-only-work-email';
      }

      const existingUser = await getUser({ email: user.email });

      if (account?.provider === 'credentials') {
        return true;
      }

      // Login via email (Magic Link)
      if (account?.provider === 'email') {
        return Boolean(existingUser);
      }

      // First time users
      if (!existingUser) {
        const newUser = await createUser({
          name: `${user.name}`,
          email: `${user.email}`,
        });

        slackNotify()?.alert({
          text: 'New user signed up',
          fields: {
            Name: user.name || '',
            Email: user.email,
          },
        });

        return true;
      }

      return true;
    },

    async session({ session, token, user }) {
      // When using JWT for sessions, the JWT payload (token) is provided.
      // When using database sessions, the User (user) object is provided.
      if (session && (token || user)) {
        session.user.id = token?.sub || user?.id;
      }

      if (user?.name) {
        user.name = user.name.substring(0, maxLengthPolicies.name);
      }
      if (session?.user?.name) {
        session.user.name = session.user.name.substring(
          0,
          maxLengthPolicies.name
        );
      }

      return session;
    },

    async jwt({ token, trigger, session }) {
      if (trigger === 'update' && 'name' in session && session.name) {
        return { ...token, name: session.name };
      }

      return token;
    },
  },
};
