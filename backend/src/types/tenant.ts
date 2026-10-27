export interface TenantContext {
    organizationId: string;
    projectId: string;
    apiKeyId: string;
}

export interface DashboardUserContext {
    id: string;
    clerkId: string;
    organizationIds: string[];
}

export interface DashboardProjectContext {
    id: string;
    organizationId: string;
}

declare global {
    namespace Express {
        interface Request {
        tenant?: TenantContext;
        dashboardUser?: DashboardUserContext;
        dashboardProject?: DashboardProjectContext;
        }
    }
}
