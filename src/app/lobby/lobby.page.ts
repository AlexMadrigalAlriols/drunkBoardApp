import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../-services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from '../-services/socketio.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit, OnDestroy {
  lobbyId: string | null = null;
  user: any = false;
  gameCreator: any;
  players: any[] = [];
  gameStarted: boolean = false;
  turnPlayer: any;
  board: any = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private socketio: SocketioService,
    private cdRef: ChangeDetectorRef,
    private loadingController: LoadingController,
  ) {}

  async ngOnInit() {
    const loading = this.loadingController.create();
    loading.then(loadingElement => {
      loadingElement.present();
    });

    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
    }

    this.route.paramMap.subscribe(async params => {
      this.lobbyId = params.get('id');

      if (!this.lobbyId || this.lobbyId === '') {
        console.log('No lobby id');
        this.router.navigate(['/tabs/home']);
      }

      await this.joinLobby();
    });

    if (!this.user) {
      this.authService.logout();
    }

    window.addEventListener('beforeunload', this.handleBeforeUnload);

    loading.then(loadingElement => {
      loadingElement.dismiss();
    });
  }

  async joinLobby() {
    try {
      let data = await this.socketio.joinLobby(this.lobbyId ?? '', this.user.id);
      this.players = data.users;
      this.gameCreator = data.owner;
      this.gameStarted = data.started;

      if (this.players) {
        await this.socketio.onUserListUpdate((users: any[]) => {
          this.players = users;
          this.cdRef.detectChanges();
        });

        this.socketio.onUserJoined((data) => {
          if (!this.players.find(user => user.id === data.user.id)) {
            this.players.push(data.user);
            this.cdRef.detectChanges();

            Swal.fire({
              toast: true,
              title: 'A Player joined the lobby',
              icon: 'success',
              background: 'rgba(15, 16, 89, 0.74)',
              color: '#fff',
              showConfirmButton: false,
              position: 'top-end',
              timer: 3000,
              didOpen: (toast) => {
                toast.style.border = '2px solid #fff';
              }
            });
          }
        });

        this.socketio.onUserLeft((data) => {
          console.log('me voy')
          this.players = this.players.filter(user => user.id !== data.userId);
          this.cdRef.detectChanges();

          if(data.userId !== this.user.id) {
            Swal.fire({
              toast: true,
              title: 'A Player left the lobby',
              icon: 'error',
              background: 'rgba(15, 16, 89, 0.74)',
              color: '#fff',
              showConfirmButton: false,
              position: 'top-end',
              timer: 3000,
              didOpen: (toast) => {
                toast.style.border = '2px solid #fff';
              }
            });
          }
        });

        this.socketio.onGameStarted((data) => {
          this.gameStarted = true;
          this.turnPlayer = data.startUser;
          this.board = data.board;

          if(!this.board.cells) {
            this.leaveLobby();
          }
        });

        this.socketio.onKickPlayer((data) => {
          if (data.userId === this.user.id) {
            Swal.fire({
              toast: true,
              title: 'Te han echado de la sala',
              icon: 'error',
              background: 'rgba(15, 16, 89, 0.74)',
              color: '#fff',
              showConfirmButton: false,
              position: 'top-end',
              timer: 3000,
              didOpen: (toast) => {
                toast.style.border = '2px solid #fff';
              }
            });
            this.router.navigate(['/tabs/home']);
          }
        });

        this.socketio.onGiveOwner((data) => {
          console.log(data);
          this.gameCreator = data.user;
        });
      } else {
        this.router.navigate(['/tabs/home']);
      }
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      this.router.navigate(['/tabs/home']);
    }
  }

  logout() {
    this.authService.logout();
  }

  startGame() {
    this.socketio.startGame(this.lobbyId ?? '');
  }

  kickPlayer(playerId: string) {
    this.socketio.kickPlayer(this.lobbyId ?? '', playerId);
  }

  giveOwner(playerId: string) {
    this.socketio.giveOwner(this.lobbyId ?? '', playerId);
  }

  async leaveLobby() {
    try {
      await this.socketio.leaveLobby(this.lobbyId ?? '', this.user.id);
      this.router.navigate(['/tabs/home']);
    } catch (error) {
      this.router.navigate(['/tabs/home']);
    }
  }

  ngOnDestroy(): void {
    this.leaveLobby();

    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  handleBeforeUnload = () => {
    this.leaveLobby();
  };
}
