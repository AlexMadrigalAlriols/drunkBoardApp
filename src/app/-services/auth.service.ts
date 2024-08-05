import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FrameworkService } from './framework.service';
import { get } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string | null = null;
  private user: string |null = null;

  constructor(private router: Router, private framework: FrameworkService) { }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.framework.post('auth/login', {email, password}, false).subscribe((response: any) => {
        console.log(response);
        if(response.token) {
          this.isAuthenticated = true;
          this.token = response.token;
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.user = JSON.stringify(response.user);

          resolve(true);
        } else {
          resolve(false);
        }
      },
      error => {
        reject(error);
      });
    });
  }

  getUser(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.framework.get('users/', {}, true).subscribe(
        (response: any) => {
          this.user = JSON.stringify(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          resolve(this.user);
        },
        error => {
          this.router.navigate(['/login']);
          reject(error);
        }
      );
    });
  }

  logout() {
    this.isAuthenticated = false;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('portal');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  async getUserDetails() {
    return this.getUser()
      .then(user => {
        return JSON.parse(user);
      })
      .catch(error => {
        this.logout();
        this.router.navigate(['/login']);
      });
  }

  checkAuthenticated(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('token')|| !!localStorage.getItem('user');
  }
}
