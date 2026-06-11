import { ICellRendererParams } from 'ag-grid-community';


export function cellRenderer(
  params: ICellRendererParams
): string {

  switch (params?.colDef?.field) {

    case 'taskId':
      return params.data.taskId;

    case 'result':
      return resultRenderer(params);

    case 'runtime':
      return runtimeRenderer(params);
    case 'workflow':
      return workflowRenderer(params);
    case 'service':
    case 'provider':
      return statusRenderer(params);

    default:
      return '';
  }
}



export function statusRenderer(
  params: ICellRendererParams
): string {

  switch (params.value) {

    case 'queued':
    case 'pending':
    case 'started':
      return '<span class="sfx-spinner"></span>';

    case 'finished':
      return '✅';

    case 'failed':
      return '❌';

    default:
      return '';
  }
}

export function resultRenderer(
  params: ICellRendererParams
): string {

  switch (params.value) {

    case 'queued':
    case 'pending':
      return '<span class="sfx-spinner"></span>';

    case 'available':
      return `
        <span style="cursor:pointer">
          📄 (click)
        </span>
      `;

    case 'failed':
      return '❌';

    default:
      return '';
  }
}

export function runtimeRenderer(
  params: ICellRendererParams
): string {

  switch (params.value) {

    case 'queued':
      return '<span class="sfx-spinner"></span>';
    case 'pending':
      return '<span class="sfx-spinner"></span>';
    case 'started':
      return '✅';

    case 'finished':
      return '✅';

    case 'failed':
      return '❌';

    default:
      return '';

  }
}

export function workflowRenderer(
  params: ICellRendererParams
): string {

  switch (params.value) {

    case 'queued':
      return '<span class="sfx-spinner"></span>';
    case 'pending':
      return '<span class="sfx-spinner"></span>';
    case 'started':
      return '✅';

    case 'finished':
      return '✅';

    case 'failed':
      return '❌';

    default:
      return '';

  }
}