interface ExecutionSummaryViewModel {
  executionId: string;

  runtimeStatus: string;
  workflowStatus: string;
  serviceStatus: string;
  providerStatus: string;

  startedAt?: number;
  completedAt?: number;
}