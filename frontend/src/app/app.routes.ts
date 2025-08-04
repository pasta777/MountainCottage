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

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'admin/login', component: AdminLogin},
    {path: 'admin/dashboard', component: AdminDashboard},
    {path: 'login', component: Login},
    {path: 'profile', component: Profile, canActivate: [authGuard]},
    {path: 'change-password', component: ChangePassword},
    {path: 'my-cottages', component: MyCottages, canActivate: [authGuard, roleGuard]},
    {path: 'add-cottage', component: CottageForm, canActivate: [authGuard, roleGuard]},
    {path: 'modify-cottage/:id', component: CottageForm, canActivate: [authGuard, roleGuard]},
    {path: 'cottage/:id', component: CottageDetails},
    {path: 'owner/reservations', component: OwnerReservations, canActivate: [authGuard, roleGuard], data: {expectedRole: 'owner'}},
    {path: 'my-reservations', component: MyReservations, canActivate: [authGuard, roleGuard], data: {expectedRole: 'tourist'}},
];
