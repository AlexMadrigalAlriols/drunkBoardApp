import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CardModalComponent } from '../card-modal/card-modal.component';
import { AuthService } from '../-services/auth.service';
import { SocketioService } from '../-services/socketio.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface Player {
  id: number;
  name: string;
  jailed?: boolean;
  position: number;
  profile_img?: string;
}

interface Cell {
  id: number;
  number: number;
  type?: string;
  text?: string;
  event?: string;
  background?: string;
  players: Player[];
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @Input() players: any[] = [];
  @Input() lobbyId: string | null = null;
  @Input() turnPlayer: any;
  @Input() cells: any[] = [];

  user: any = false;
  boardSize: number = 8;
  totalCells: number = 64;
  spiralCells: Cell[] = [];
  specialCells: { [key: number]: string } = {};

  diceResult: number = 1;
  @ViewChild(CardModalComponent) cardPopup?: CardModalComponent;
  constructor(
    private authService: AuthService,
    private socketio: SocketioService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.spiralCells = this.generateSpiral(this.boardSize, this.cells);
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '{}');
    }

    if (!this.user) {
      this.authService.logout();
    }

    this.players.forEach((player, index) => {
      player.position = 1;
    });

    this.updatePlayerPositions();

    this.socketio.onGameTurnChange((data) => {
      this.turnPlayer = data.nextUser;

      const player = this.players.find(player => player.id === this.turnPlayer.id);
      if(player.jailed) {
        player.jailed = false;
        this.socketio.changeGameTurn(this.lobbyId ?? '', this.turnPlayer.id);
        this.socketio.jailPlayer(this.lobbyId ?? '', player.id);
      }
    });

    this.socketio.onPlayerPositionUpdate((data) => {
      const player = this.players.find(player => player.id === data.userId);

      if (player) {
        player.position = data.position;
        this.updatePlayerPositions();
      }
    });

    this.socketio.onPlayerLandOnCell((data) => {
      const player = this.players.find(player => player.id === data.userId);
      const cell = this.spiralCells.find(cell => cell.id === data.cellId);

      if (player && cell) {
        this.onPlayerLandOnCell(player, cell);
      }
    });

    this.socketio.onPlayerJailed((data) => {
      const player = this.players.find(player => player.id === data.userId);
      if (player) {
        player.jailed = player.jailed ? false : true;
      }
    });
  }

  generateSpiral(size: number, boardCells: any[]): Cell[] {
    const spiral: Cell[] = Array.from({ length: size * size }, (_, i) => ({
      id: 0,
      number: 1,
      players: [],
      background: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk8fFLTRZVbZdcVd87wwkINBEfJhfVZEdOuw&s',
      text: 'Bebe el que sea mas mayor de aqui',
      event: 'modal'
    }));

    let num = 1;
    let top = 0, bottom = size - 1, left = 0, right = size - 1;

    while (top <= bottom && left <= right && num <= this.totalCells) {
      for (let i = left; i <= right; i++) {
        if (num <= this.totalCells) spiral[bottom * size + i].id = num++;
      }
      bottom--;

      for (let i = bottom; i >= top; i--) {
        if (num <= this.totalCells) spiral[i * size + right].id = num++;
      }
      right--;

      for (let i = right; i >= left; i--) {
        if (num <= this.totalCells) spiral[top * size + i].id = num++;
      }
      top++;

      for (let i = top; i <= bottom; i++) {
        if (num <= this.totalCells) spiral[i * size + left].id = num++;
      }
      left++;
    }

    boardCells.forEach(boardCell => {
      const cell = spiral.find(cell => cell.id === boardCell.number);
      if (cell) {
        Object.assign(cell, boardCell);
        cell.id = boardCell.number
      }
    });

    this.specialCells[1] = 'start';
    this.specialCells[64] = 'end';
    for (const [index, type] of Object.entries(this.specialCells)) {
      const cell = spiral.find(cell => cell.id === +index);
      if (cell) {
        cell.event = type;
      }
    }

    let idsToRemove: any = [2, 61, 62, 63];
    return spiral.filter(cell => !idsToRemove.includes(cell.id));
  }

  rollDice() {
    const rollInterval = setInterval(() => {
      this.diceResult = Math.floor(Math.random() * 6) + 1;
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      if(!this.turnPlayer) {
        this.turnPlayer = this.players[0];
      }

      if(this.turnPlayer) {
        this.movePlayer(this.turnPlayer.id, this.diceResult);
      }

      this.socketio.changeGameTurn(this.lobbyId ?? '', this.turnPlayer.id);

    }, 2000); // Duración de la animación del dado (1 segundo)
  }

  movePlayer(playerId: number, steps: number) {
    const player = this.players.find(player => player.id === playerId);
    if(!player) return;

    player.position = Math.min(player.position + steps, this.totalCells);
    if(player.position == 2) {
      player.position = 3;
    }

    this.socketio.updatePlayerPosition(this.lobbyId ?? '', player.id, player.position);
    this.updatePlayerPositions();
    const currentCell = this.spiralCells.find(cell => cell.id === player.position);
    if (currentCell) {
      this.onPlayerLandOnCell(player, currentCell);
      this.socketio.playerLandOnCell(this.lobbyId ?? '', player.id, currentCell.id);
    }
  }

  updatePlayerPositions() {
    // Clear all player positions
    this.spiralCells.forEach(cell => cell.players = []);

    // Set players on their respective cells
    this.players.forEach(player => {
      const cell = this.spiralCells.find(cell => cell.id === player.position);
      if (cell) {
        if(!cell.players) {
          cell.players = [];
        }

        cell.players.push(player);
      }
    });
  }

  finishGame(player : Player) {
    console.log('Game finished');
  }

  teleportPlayer(player: Player, cell: Cell) {
    const teleportCell = this.spiralCells
      .filter(c => c.event == 'teleport' && c.id !== cell.id)
      .reduce((closest, c) => {
        const currentDistance = Math.abs(c.id - cell.id);
        const closestDistance = Math.abs(closest.id - cell.id);
        return currentDistance > closestDistance ? c : closest;
      }, { id: -1 });

    if (teleportCell.id !== -1) {
      player.position = teleportCell.id;
      this.socketio.updatePlayerPosition(this.lobbyId ?? '', player.id, player.position);
      this.updatePlayerPositions();
    }
  }

  async onPlayerLandOnCell(player: Player, cell: Cell) {
    switch (cell.event) {
      case 'end':
        this.finishGame(player);
        break;
      case 'modal':
        setTimeout(() => {
          this.cardPopup?.show(cell.text ?? '', cell.type ?? 'drink');
        }, 500);
        break;
      case 'teleport':
        this.teleportPlayer(player, cell);
        break;
      case 'die':
        player.position = 1;
        setTimeout(() => {
          this.socketio.updatePlayerPosition(this.lobbyId ?? '', player.id, player.position);
          this.updatePlayerPositions();
        }, 1000);
        break;
      case 'jail':
        this.socketio.jailPlayer(this.lobbyId ?? '', player.id);
        break;
      default:
        setTimeout(() => {
          this.cardPopup?.show(cell.text ?? '', cell.type ?? 'drink');
        }, 500);
    }
  }

  async leaveLobby() {
    try {
      await this.socketio.leaveLobby(this.lobbyId ?? '', this.user.id);
      this.router.navigate(['/tabs/home']);
    } catch (error) {
      this.router.navigate(['/tabs/home']);
    }
  }
}
