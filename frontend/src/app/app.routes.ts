import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guard';
import { ChangePassword } from './pages/change-password/change-password';

export const routes: Routes = [
    {path: 'register', component: Register},
    {path: 'admin/login', component: AdminLogin},
    {path: 'admin/dashboard', component: AdminDashboard},
    {path: 'login', component: Login},
    {path: 'profile', component: Profile, canActivate: [authGuard]},
    {path: 'change-password', component: ChangePassword},
];
