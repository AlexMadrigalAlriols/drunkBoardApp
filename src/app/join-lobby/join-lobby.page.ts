import { Component, OnInit } from '@angular/core';
import { AuthService } from '../-services/auth.service';
import { Router } from '@angular/router';
import { SocketioService } from '../-services/socketio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.page.html',
  styleUrls: ['./join-lobby.page.scss'],
})
export class JoinLobbyPage implements OnInit {
  user: any = false;
  lobbyId: string = '';

  constructor(private authService: AuthService, private router: Router, private socketio : SocketioService) { }

  ngOnInit() {
    if(localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
    }
  }

  logout() {
    this.authService.logout();
  }

  async joinLobby() {
    try {
      const success = await this.socketio.joinLobby(this.lobbyId, this.user.id);
      if (success) {
        this.router.navigate(['/tabs/lobby', this.lobbyId]);
      } else {
        Swal.fire({
          toast: true,
          title: 'Lobby not exists',
          icon: 'error',
          showConfirmButton: false,
          position: 'top-end',
          timer: 3000
        });
      }
    } catch (error) {
      Swal.fire({
        toast: true,
        title: 'Lobby not exists',
        icon: 'error',
        showConfirmButton: false,
        position: 'top-end',
        timer: 3000
      });
    }
  }
}
