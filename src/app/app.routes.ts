import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',

        loadComponent: () =>
            import(
                './demo-grid/demo-grid.component'
            ).then(m => m.DemoGridComponent),
    }
];
