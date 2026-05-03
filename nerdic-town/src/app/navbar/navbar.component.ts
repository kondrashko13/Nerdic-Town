import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import feather from 'feather-icons';
import {AuthService} from '../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  router = inject(Router);
  authService = inject(AuthService);

  ngAfterViewChecked() {
    feather.replace();
  }

  menuOpen = false;

  toggleMenu() {
    if(this.authService.isLoggedIn()){
      this.menuOpen = !this.menuOpen;
    } else {
      this.menuOpen = false;
      this.router.navigate(['login']);
    }
  }

  logout() {
    this.menuOpen = false;
    this.authService.logout().subscribe()
  }
}
