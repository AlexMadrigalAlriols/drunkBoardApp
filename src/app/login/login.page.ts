import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../-services/auth.service';
import { LoadingController } from '@ionic/angular';
import * as $ from 'jquery';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements AfterViewInit, OnInit {
  email: null|string = null;
  password: null|string = null;
  error: boolean = false;

  constructor(private authService: AuthService, private router: Router, private loadingController: LoadingController) {}

  async onLogin(form: NgForm) {
    this.error = false;
    const loading = await this.loadingController.create();
    await loading.present();
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).then(success => {
        if (success) {
          loading.dismiss();
          form.reset();
          this.router.navigate(['/tabs']);
        }
      },
      error => {
        loading.dismiss();
        this.error = true;
      });
    }
  }

  ngOnInit(): void {
    if(this.authService.checkAuthenticated()) {
      this.router.navigate(['/tabs']);
    }
  }

  ngAfterViewInit(): void {
    const inputs = $('.login-input');
  }
}
