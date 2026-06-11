export type TaskStatus =
  | 'started'
  | 'finished'
  | 'failed'
  | 'pending'
  | 'queued';

export type ResultStatus =
  | 'pending'
  | 'available'
  | 'failed'
  | 'queued';

export interface TaskRow {
  taskId: string;
  runtime: TaskStatus;
  workflow: TaskStatus;
  service: TaskStatus;
  provider: TaskStatus;
  result: ResultStatus;

  resultContent?: string;
}