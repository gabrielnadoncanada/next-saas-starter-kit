import { Role } from '@prisma/client';

type RoleType = (typeof Role)[keyof typeof Role];
export type Action = 'create' | 'read' | 'update' | 'delete';
export type Resource =
  | 'team'
  | 'team_member'
  | 'team_invitation'
  | 'team_api_key'
  | 'team_webhook'
  | 'team_billing'
  | 'team_dsync'
  | 'team_sso';

type RolePermissions = {
  [role in RoleType]: Permission[];
};

export interface Permission {
  resource: Resource;
  actions: Action[] | '*';
}

export const availableRoles = [
  {
    id: Role.MEMBER,
    name: 'Member',
  },
  {
    id: Role.ADMIN,
    name: 'Admin',
  },
  {
    id: Role.OWNER,
    name: 'Owner',
  },
];

export const permissions: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_billing',
      actions: '*',
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
  ],
  [Role.ADMIN]: [
    {
      resource: 'team',
      actions: ['read', 'update'],
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_billing',
      actions: ['read'],
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
  ],
  [Role.MEMBER]: [
    {
      resource: 'team',
      actions: ['read'],
    },
    {
      resource: 'team_member',
      actions: ['read'],
    },
    {
      resource: 'team_invitation',
      actions: ['read'],
    },
    {
      resource: 'team_api_key',
      actions: ['read'],
    },
    {
      resource: 'team_webhook',
      actions: ['read'],
    },
    {
      resource: 'team_billing',
      actions: ['read'],
    },
    {
      resource: 'team_dsync',
      actions: ['read'],
    },
    {
      resource: 'team_sso',
      actions: ['read'],
    },
  ],
};
