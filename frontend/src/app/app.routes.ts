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
import { Home } from './pages/home/home';
import { CottageDetails } from './pages/cottage-details/cottage-details';
import { OwnerReservations } from './pages/owner-reservations/owner-reservations';
import { MyReservations } from './pages/my-reservations/my-reservations';
import { OwnerStats } from './pages/owner-stats/owner-stats';
import { AdminUsersManagement } from './pages/admin-users-management/admin-users-management';
import { AdminUserEdit } from './pages/admin-user-edit/admin-user-edit';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'admin/login', component: AdminLogin, canActivate: [authGuard]},
    {path: 'admin/dashboard', component: AdminDashboard, canActivate: [authGuard, roleGuard], data: {expectedRole: 'administrator'}},
    {path: 'admin/users', component: AdminUsersManagement, canActivate: [authGuard, roleGuard], data: {expectedRole: 'administrator'}},
    {path: 'admin/users/edit/:id', component: AdminUserEdit, canActivate: [authGuard, roleGuard], data: {expectedRole: 'administrator'}},
    {path: 'login', component: Login},
    {path: 'profile', component: Profile, canActivate: [authGuard]},
    {path: 'change-password', component: ChangePassword, canActivate: [authGuard]},
    {path: 'my-cottages', component: MyCottages, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}},
    {path: 'add-cottage', component: CottageForm, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}},
    {path: 'modify-cottage/:id', component: CottageForm, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}},
    {path: 'cottage/:id', component: CottageDetails},
    {path: 'owner/reservations', component: OwnerReservations, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}},
    {path: 'my-reservations', component: MyReservations, canActivate: [authGuard, roleGuard], data: {expectedRole: 'tourist'}},
    {path: 'owner/stats', component: OwnerStats, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}}
];
