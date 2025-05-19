import { Routes } from '@angular/router';
import { DataPageComponent } from './features/data-page/data-page.component';
import { traineesResolver } from './resolvers/trainees.resolver';

export const routes: Routes = [
    { path: '', redirectTo: '/data', pathMatch: 'full' },
    {
        path: 'data', component: DataPageComponent,
        resolve: {
            traineesResolver: traineesResolver
        },
    },
    {
        path: 'analysis', loadComponent: () => import('./features/analysis-page/analysis-page.component').then(m => m.AnalysisPageComponent),
    },
    {
        path: 'monitor', loadComponent: () => import('./features/monitor-page/monitor-page.component').then(m => m.MonitorPageComponent)
    },
    { path: '**', redirectTo: '/data' }
];
