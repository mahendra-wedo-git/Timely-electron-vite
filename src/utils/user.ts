export enum EAuthenticationPageType {
  STATIC = "STATIC",
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  AUTHENTICATED = "AUTHENTICATED",
}

export enum EInstancePageType {
  PRE_SETUP = "PRE_SETUP",
  POST_SETUP = "POST_SETUP",
}

export enum EUserStatus {
  ERROR = "ERROR",
  AUTHENTICATION_NOT_DONE = "AUTHENTICATION_NOT_DONE",
  NOT_YET_READY = "NOT_YET_READY",
}

export type TUserStatus = {
  status: EUserStatus | undefined;
  message?: string;
};

export enum EUserPermissionsLevel {
  WORKSPACE = "WORKSPACE",
  PROJECT = "PROJECT",
}

export enum EUserWorkspaceRoles {
  ADMIN = 25,
  MANAGER = 20,
  TEAM_LEAD = 16,
  QA = 15,
  DEVELOPER = 10,
  INTERN = 5,
  SALES_MANAGER = 4,
  SALES = 3,
  CLIENT = 2
}

export enum EUserProjectRoles {
  ADMIN = 25,
  MANAGER = 20,
  TEAM_LEAD = 16,
  QA = 15,
  DEVELOPER = 10,
  INTERN = 5,
  SALES_MANAGER = 4,
  SALES = 3,
  CLIENT = 2
}

export type TUserPermissionsLevel = EUserPermissionsLevel;

export enum EUserPermissions {
  ADMIN = 25,
  MANAGER = 20,
  TEAM_LEAD = 16,
  QA = 15,
  DEVELOPER = 10,
  INTERN = 5,
  SALES_MANAGER = 4,
  SALES = 3,
  CLIENT = 2
}
export type TUserPermissions = EUserPermissions;

export type TUserAllowedPermissionsObject = {
  create: TUserPermissions[];
  update: TUserPermissions[];
  delete: TUserPermissions[];
  read: TUserPermissions[];
};
export type TUserAllowedPermissions = {
  workspace: {
    [key: string]: Partial<TUserAllowedPermissionsObject>;
  };
  project: {
    [key: string]: Partial<TUserAllowedPermissionsObject>;
  };
};

export const USER_ALLOWED_PERMISSIONS: TUserAllowedPermissions = {
  workspace: {
    dashboard: {
      read: [
        EUserPermissions.ADMIN,
        EUserPermissions.MANAGER,
        EUserPermissions.TEAM_LEAD,
        EUserPermissions.QA,
        EUserPermissions.DEVELOPER,
        EUserPermissions.INTERN,
        EUserPermissions.CLIENT,
      ],
    },
  },
  project: {},
};
