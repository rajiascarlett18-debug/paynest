import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* CORE PAGES */
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PaymenthistoryComponent } from './pages/paymenthistory/paymenthistory.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

/* ABOUT PAGES (PUBLIC) */
import { ServicesComponent } from './pages/about/services/services.component';
import { LocationsComponent } from './pages/about/locations/locations.component';
import { FaqComponent } from './pages/about/faq/faq.component';
import { ContactComponent } from './pages/about/contact/contact.component';
import { HistoryComponent } from './pages/about/history/history.component';

/* ADMIN PAGE */
import { AdminComponent } from './pages/admin/admin.component';

/* GUARDS */
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [

  /* =========================
     HOME
  ========================= */
  { path: '', component: HomeComponent },

  /* =========================
     AUTH
  ========================= */
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  /* =========================
     PROTECTED USER PAGES
  ========================= */
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'paymenthistory',
    component: PaymenthistoryComponent,
    canActivate: [AuthGuard]
  },

  /* =========================
     ADMIN (PROTECTED)
  ========================= */
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard]
  },

  /* =========================
     PUBLIC PAGES
  ========================= */
  { path: 'services', component: ServicesComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'history', component: HistoryComponent },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  /* =========================
     FALLBACK
  ========================= */
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',  // Always scroll to top
      anchorScrolling: 'enabled',
      scrollOffset: [0, 0]
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
