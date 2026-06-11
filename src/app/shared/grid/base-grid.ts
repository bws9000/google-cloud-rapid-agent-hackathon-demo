import {
  GridApi,
  GridReadyEvent,
  ColDef
} from 'ag-grid-community';

export abstract class BaseGrid<T> {

  protected gridApi!: GridApi<T>;

  rowData: T[] = [];

  columnDefs: ColDef<T>[] = [];

  bind(event: GridReadyEvent<T>): void {
    this.gridApi = event.api;
  }

  refresh(): void {
    this.gridApi.refreshCells();
  }

  autoSizeColumns(): void {
    this.gridApi.sizeColumnsToFit();
  }

  exportCsv(): void {
    this.gridApi.exportDataAsCsv();
  }
}