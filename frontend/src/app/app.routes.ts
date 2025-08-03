import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guard';
import { ChangePassword } from './pages/change-password/change-password';
import { MyCottages } from './pages/my-cottages/my-cottages';
import { CottageForm } from './pages/cottage-form/cottage-form';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
    {path: 'register', component: Register},
    {path: 'admin/login', component: AdminLogin},
    {path: 'admin/dashboard', component: AdminDashboard},
    {path: 'login', component: Login},
    {path: 'profile', component: Profile, canActivate: [authGuard]},
    {path: 'change-password', component: ChangePassword},
    {path: 'my-cottages', component: MyCottages, canActivate: [authGuard, roleGuard]},
    {path: 'add-cottage', component: CottageForm, canActivate: [authGuard, roleGuard]},
    {path: 'modify-cottage/:id', component: CottageForm, canActivate: [authGuard, roleGuard]}
];
