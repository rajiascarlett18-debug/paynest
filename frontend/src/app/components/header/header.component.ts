import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  user: any = null;
  isAdmin: boolean = false;

  menuOpen: boolean = false;

  private userSub!: Subscription;
  private routeSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    /* =========================
       USER SUBSCRIPTION
    ========================= */
    this.userSub = this.authService.user$.subscribe(user => {
      this.user = user;
      this.isAdmin = user?.role === 'ADMIN';
    });

    /* =========================
       AUTO CLOSE MENU ON ROUTE CHANGE
    ========================= */
    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
      });
  }

  /* =========================
     TOGGLE MOBILE MENU
  ========================= */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;

    // Optional: Prevent background scroll
    if (this.menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  /* =========================
     SCROLL HELPER
  ========================= */
  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /* =========================
     GO HOME + SCROLL
  ========================= */
  goHome(): void {

    const currentPath = this.router.url.split('?')[0].split('#')[0];

    if (currentPath === '/') {
      this.scrollToTop();
    } else {
      this.router.navigate(['/']).then(() => {
        this.scrollToTop();
      });
    }

    this.closeMenu();
  }

  /* =========================
     LOGOUT
  ========================= */
  logout(): void {

    this.authService.logout();

    this.router.navigate(['/']).then(() => {
      this.scrollToTop();
    });

    this.closeMenu();
  }

  ngOnDestroy(): void {

    if (this.userSub) {
      this.userSub.unsubscribe();
    }

    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }

    document.body.style.overflow = '';
  }
}
