import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* Shared Components */
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/* Pages */
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PaymentsComponent } from './pages/payments/payments.component';

/* About Pages */
import { ServicesComponent } from './pages/about/services/services.component';
import { LocationsComponent } from './pages/about/locations/locations.component';
import { FaqComponent } from './pages/about/faq/faq.component';
import { ContactComponent } from './pages/about/contact/contact.component';
import { HistoryComponent } from './pages/about/history/history.component';
import { PaymenthistoryComponent } from './pages/paymenthistory/paymenthistory.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminComponent } from './pages/admin/admin.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    PaymentsComponent,
    ServicesComponent,
    LocationsComponent,
    FaqComponent,
    ContactComponent,
    HistoryComponent,
    PaymenthistoryComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthLayoutComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
