import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    {path: 'register', component: Register},
    {path: 'admin/login', component: AdminLogin},
    {path: 'admin/dashboard', component: AdminDashboard}
];
