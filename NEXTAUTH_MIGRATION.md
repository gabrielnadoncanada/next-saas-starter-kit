# Migration NextAuth vers App Router

Ce document explique les changements apportés pour migrer NextAuth vers la structure App Router avec NextAuth v5.

## Changements principaux

### 1. Configuration NextAuth (`lib/auth.ts`)

- **Avant** : Configuration complexe avec `getAuthOptions()` et gestion manuelle des req/res
- **Après** : Configuration simplifiée avec NextAuth v5 et export direct des handlers

```typescript
// Nouvelle approche - lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Configuration directe
});
```

### 2. Route Handler (`app/api/auth/[...nextauth]/route.ts`)

- **Avant** : Import de `getAuthOptions` avec adaptation req/res
- **Après** : Import direct des handlers

```typescript
// Nouveau
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

### 3. Middleware (`middleware.ts`)

- **Avant** : Utilisation de `getToken()` avec logique complexe JWT/Database
- **Après** : Utilisation du middleware NextAuth v5 avec `auth()`

```typescript
// Nouveau
export default auth((req) => {
  if (!req.auth) {
    // Redirection vers login
  }
  // Suite de la logique
});
```

### 4. Helpers d'authentification (`lib/auth-helpers.ts`)

Nouveaux helpers pour Server Components :

```typescript
// Server Components
await requireAuth(); // Redirige si non authentifié
await getCurrentUser(); // Récupère l'utilisateur actuel
await isAuthenticated(); // Vérifie l'authentification
await hasRole('ADMIN'); // Vérifie les rôles
```

### 5. Utilitaires d'authentification (`lib/auth-utils.ts`)

Séparation des utilitaires pour éviter les imports circulaires :

```typescript
export { verifyPassword, isAuthProviderEnabled, hashPassword };
```

## Utilisation dans les composants

### Server Components

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-helpers';

export default async function Dashboard() {
  const session = await requireAuth();

  return (
    <div>
      <h1>Bonjour {session.user?.name}</h1>
    </div>
  );
}
```

### Client Components

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function UserProfile() {
  const { data: session } = useSession();

  if (!session) return <div>Non connecté</div>;

  return <div>Bonjour {session.user?.name}</div>;
}
```

### Boutons d'authentification

```typescript
import { AuthButton } from '@/components/auth/AuthButton';

// Utilisation
<AuthButton />
```

## SessionProvider

Le `SessionProvider` est maintenant wrappé dans un composant personnalisé :

```typescript
// components/auth/SessionProvider.tsx
export function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

## Avantages de la migration

1. **Simplicité** : Configuration plus simple et directe
2. **Performance** : Meilleure intégration avec App Router
3. **Type Safety** : Meilleur support TypeScript
4. **Maintenance** : Code plus maintenable et moderne
5. **Fonctionnalités** : Accès aux dernières fonctionnalités NextAuth

## Points d'attention

1. **Imports circulaires** : Évités en séparant les utilitaires
2. **Middleware** : Nouvelle syntaxe avec `auth()`
3. **Server Components** : Utilisation des nouveaux helpers
4. **Client Components** : Utilisation de `useSession` reste identique

## Migration progressive

La migration peut être faite progressivement :

1. ✅ Migrer la configuration NextAuth
2. ✅ Mettre à jour le route handler
3. ✅ Adapter le middleware
4. ✅ Créer les helpers d'authentification
5. ✅ Mettre à jour les composants au fur et à mesure

## Compatibilité

- **NextAuth** : v5 (beta)
- **Next.js** : 13+ avec App Router
- **React** : 18+
- **TypeScript** : Support complet
