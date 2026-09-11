import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private readonly healthService;
    private httpHealthIndicator;
    constructor(healthService: HealthCheckService, httpHealthIndicator: HttpHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
