import { Component, inject, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
    CellClickedEvent,
    CellContextMenuEvent,
    ColDef,
    GridReadyEvent,
} from 'ag-grid-community';

import { BaseGrid } from '../shared/grid/base-grid';
import { TaskRow } from '../shared/grid/task-row';
import { cellRenderer } from '../shared/grid/statusRenderer';
import { ModalService } from 'modal-lib2';

import {
    createClient,
    defineConfig,
    gemini,
    jsonRpc,
    mockProvider,
    websocket,
    googleAdk,
    mongodbMcpToolset,
} from '@stateflowx/client';
import { ExecutionHistoryService } from '../shared/services/execution-history.service';
import { finalize, tap } from 'rxjs';
import { ReadMeModalComponent } from '../read-me-modal/read-me-modal.component';
//import { HttpClient } from '@angular/common/http';


const mongoConnectString =
    (window as any).__env?.MONGO_URI ??
    '';

@Component({
    selector: 'app-demo-grid',
    standalone: true,
    imports: [AgGridAngular],
    templateUrl: './demo-grid.component.html',
    styleUrl: './demo-grid.component.scss',
    providers: [ExecutionHistoryService]
})
export class DemoGridComponent extends BaseGrid<TaskRow> implements OnInit {

    isLoading = false;

    config: any;

    isProviderReady = false;

    private isConnected = false;

    apiKey = '';

    isExecuting = false

    private activeTaskId: string | null = null;

    private readonly client = createClient(
        this.createConfig()
    );

    private modal = inject(ModalService);

    openReadMeModal() {
        this.modal.open(ReadMeModalComponent);
    }

    constructor(
        private readonly executionApi:
            ExecutionHistoryService
    ) {
        super();

        this.rowData = [];

        this.columnDefs = [
            { field: 'taskId', headerName: 'Task Id', cellRenderer, flex: 1 },
            { field: 'runtime', headerName: 'Runtime', cellRenderer, flex: 1 },
            { field: 'workflow', headerName: 'Workflow', cellRenderer, flex: 1 },
            { field: 'service', headerName: 'Service', cellRenderer, flex: 1 },
            { field: 'provider', headerName: 'Gemini', cellRenderer, flex: 1 },
            { field: 'result', headerName: 'Result', cellRenderer, flex: 1 },
        ];
    }

    defaultColDef: ColDef<TaskRow> = {
        sortable: true,
        filter: true,
        resizable: true,
    };

    async ngOnInit(): Promise<void> {

        this.isLoading = true;

        this.executionApi
            .findAll()
            .pipe(
                finalize(() => this.isLoading = false),
            )
            .subscribe((rows: any[]) => {

                this.rowData = rows.map((row) => ({
                    ...row,

                    runtime:
                        row.runtime === 'message'
                            ? 'finished'
                            : row.runtime,

                    workflow:
                        row.workflow === 'completed'
                            ? 'finished'
                            : row.workflow,

                    service:
                        row.service === 'completed'
                            ? 'finished'
                            : row.service,

                    provider:
                        row.provider === 'completed'
                            ? 'finished'
                            : row.provider,

                    result:
                        row.result
                            ? 'available'
                            : 'failed',

                    resultContent:
                        row.result,
                }));

                this.refreshRows();
            });


        this.client.onRuntimeEvent((event: any) => {

            const runtimeEvent =
                event.type === 'runtime.event'
                    ? event.payload
                    : event;

            // console.log('[EVENT]', runtimeEvent.type);

            this.handleRuntimeEvent(runtimeEvent);
        });

        try {
            await this.client.connect();

            this.isConnected = true;

            // console.log(
            //     '[STATEFLOWX] Connected'
            // );

        } catch (error) {
            this.isConnected = false;

            console.error(
                '[STATEFLOWX] Connection failed',
                error
            );
        }
    }

    onSetApiKey(target: EventTarget | null): void {
        const input = target as HTMLInputElement;

        this.apiKey = input.value.trim();
    }

    onGridReady(event: GridReadyEvent<TaskRow>): void {
        this.bind(event);
    }

    async executeTask(): Promise<void> {

        this.config = this.createConfig();

        if (this.isExecuting) {
            return;
        }
        this.isExecuting = true;

        //
        //PRECHECK
        //
        try {

            await this.client.precheck(
                this.config
            );
            this.isProviderReady = true;

        } catch (error) {

            alert(
                'Invalid Gemini API key.'
            );
            this.isProviderReady = false;
            return;
        }

        if (!this.isConnected) {
            alert(
                'Not connected to StateFlowX runtime.'
            );

            return;
        }


        if (!this.apiKey || this.apiKey.length < 35) {
            alert('Please enter a valid Gemini API key.');
            return;
        }


        const task: TaskRow = {
            taskId: crypto.randomUUID(),
            runtime: 'queued',
            workflow: 'queued',
            service: 'queued',
            provider: 'queued',
            result: 'queued',
        };

        this.activeTaskId = task.taskId;

        this.rowData = [
            task,
            ...this.rowData,
        ];

        this.refreshRows();

        try {

            //
            //INIT
            //
            await this.client.request(
                'runtime.initialize',
                this.config
            );

            const result =
                await this.client.request<string>(
                    'weather.execute'
                );

            this.updateTask(task.taskId, {
                runtime: 'finished',
                result: 'available',
                resultContent: result,
            });

        } catch (error) {

            this.isConnected = false;

            this.updateTask(task.taskId, {
                runtime: 'failed',
                workflow: 'failed',
                service: 'failed',
                provider: 'failed',
                result: 'failed',
                resultContent: String(error),
            });

        } finally {
            this.isExecuting = false;
        }
    }

    private createConfig() {
        return defineConfig({
            apiKey: this.apiKey,

            protocol: jsonRpc(),

            transport: websocket({
                url: 'wss://runtime.stateflowx.com?key=stateflowx-demo-2026'
            }),

            providers: [
                googleAdk({
                    priority: 1,

                    tools: [
                        mongodbMcpToolset()
                    ]
                }),
            ],

            services: [
                {
                    name: 'weather',
                    type: 'http',
                    method: 'GET',
                    //url: 'https://api.open-meteo.com/v1/forecast?latitude=40.7357&longitude=-74.1724&current_weather=true',
                    url: 'mock://weather'
                },
            ],

            workflows: [
                {
                    route: 'weather.execute',
                    service: 'weather',
                    provider: 'google-adk',

                    // Gemini only prompt
                    // provider: 'default',
                    // prompt: `
                    //     Return ONLY valid JSON.

                    //     Format this weather data into
                    //     an array structure suitable
                    //     for AG-Grid.
                    // `,




                    //
                    // Hackathon Note:
                    //
                    // During testing, Gemini would sometimes
                    // recognize the MongoDB MCP tool but would
                    // not establish a connection before issuing
                    // collection queries.
                    //
                    // Explicitly providing the MongoDB Atlas
                    // connection string in the prompt produced
                    // more reliable MCP tool execution.
                    //
                    prompt: `

                    Connect to MongoDB using:

                    ${mongoConnectString}

                    Return ONLY valid JSON.

                    You MUST return exactly one array item.

                    Schema:

                    [
                        {
                        "city": string,
                        "temperature": number,
                        "condition": string,
                        "exe-count": number
                        }
                    ]

                    Use the supplied DATA for weather values.

                    Use MongoDB tools.

                    Database: demo-executions
                    Collection: executions

                    Count all documents in the executions collection.

                    If the count cannot be determined, set "exe-count" to -1.

                    Never return an empty array.

                    Never omit "exe-count".

                    Return ONLY valid JSON.
                    `,
                },
            ],
        });
    }

    private handleRuntimeEvent(event: any): void {

        // console.log(
        //     '[HANDLE]',
        //     event.type
        // );

        if (!this.activeTaskId) {
            return;
        }

        switch (event.type) {
            case 'runtime.message.received':
                this.updateTask(this.activeTaskId, {
                    runtime: 'started',
                });
                break;

            case 'workflow.started':
                this.updateTask(this.activeTaskId, {
                    workflow: 'started',
                });
                break;

            case 'service.started':
                this.updateTask(this.activeTaskId, {
                    service: 'started',
                });
                break;

            case 'provider.started':
                this.updateTask(this.activeTaskId, {
                    provider: 'started',
                });
                break;

            case 'provider.completed':
                this.updateTask(this.activeTaskId, {
                    provider: 'finished',
                });
                break;

            case 'service.completed':
                this.updateTask(this.activeTaskId, {
                    service: 'finished',
                });
                break;

            case 'workflow.completed':
                this.updateTask(this.activeTaskId, {
                    workflow: 'finished',
                });
                break;

            case 'workflow.failed':
                this.updateTask(this.activeTaskId, {
                    workflow: 'failed',
                    provider: 'failed',
                    result: 'failed',
                    resultContent: String(event.payload?.error ?? 'Workflow failed'),
                });
                break;

            case 'runtime.message.completed':
                this.updateTask(this.activeTaskId, {
                    runtime: 'finished',
                });
                break;
        }
    }

    private updateTask(
        taskId: string,
        changes: Partial<TaskRow>
    ): void {
        this.rowData = this.rowData.map((row) =>
            row.taskId === taskId
                ? { ...row, ...changes }
                : row
        );

        this.refreshRows();
    }

    private refreshRows(): void {
        this.gridApi?.setGridOption(
            'rowData',
            this.rowData
        );
    }

    onCellClickedEvent(event: CellClickedEvent<TaskRow>): void {
        if (
            event.colDef.field === 'result' &&
            event.value === 'available'
        ) {
            alert(event.data?.resultContent);
        }

        if (
            event.colDef.field === 'result' &&
            event.value === 'failed'
        ) {
            alert(event.data?.resultContent);
        }
    }

    onCellContextMenu(
        event: CellContextMenuEvent<TaskRow>
    ): void {
        event.node.setSelected(true);
        // console.log(event.data);
    }
}