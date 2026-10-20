export interface TenantContext {
    organizationId: string;
    projectId: string;
    apiKeyId: string;
}

declare global {
    namespace Express {
        interface Request {
            tenant?: TenantContext;
        }
    }
}
