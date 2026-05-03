import {Component, inject} from '@angular/core';
import {UserService} from '../services/user/user.service';
import {AuthService} from '../services/auth/auth.service';
import feather from 'feather-icons';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  userService = inject(UserService);
  authService = inject(AuthService);

  ngAfterViewChecked() {
    feather.replace();
  }

}
