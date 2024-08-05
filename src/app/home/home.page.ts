import { Component, OnInit } from '@angular/core';
import { AuthService } from '../-services/auth.service';
import { LoadingController } from '@ionic/angular';
import { SocketioService } from '../-services/socketio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  public user: any = false;

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private socketio : SocketioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loading = this.loadingController.create();
    loading.then(loadingElement => {
      loadingElement.present();
    });

    if(localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
    }

    if(!this.user) {
      this.authService.logout();
    }

    loading.then(loadingElement => {
      loadingElement.dismiss();
    });
  }

  public logout() {
    this.authService.logout();
  }

  public async createGame() {
    try {
      // Intenta crear una sala
      const lobbyId = await this.socketio.createLobby(this.user.id);

      // Si la creación es exitosa, navega a la página del lobby
      this.router.navigate(['/tabs/lobby', lobbyId]);
    } catch (error) {
      // Maneja el error en caso de que la creación de la sala falle
      console.error('Error al crear la sala:', error);
      alert('No se pudo crear la sala. Inténtalo de nuevo.');
    }
  }

  randomString(length:number, chars:string) {
    var mask = '';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
  }

}
