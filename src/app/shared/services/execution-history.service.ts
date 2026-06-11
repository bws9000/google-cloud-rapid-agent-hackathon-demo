import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskRow } from '../grid/task-row';

@Injectable({
    providedIn: 'root'
})
export class ExecutionHistoryService {

    private readonly baseUrl =
        'https://runtime.stateflowx.com/api/executions';

    constructor(
        private readonly http: HttpClient
    ) {}

    findAll(): Observable<TaskRow[]> {
        return this.http.get<TaskRow[]>(
            this.baseUrl
        );
    }

    save(row: TaskRow): Observable<TaskRow> {
        return this.http.post<TaskRow>(
            this.baseUrl,
            {
                ...row,
                savedAt: Date.now(),
            }
        );
    }
}
