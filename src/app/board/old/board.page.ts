import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { CardModalComponent } from '../card-modal/card-modal.component';

interface Player {
  id: number;
  name: string;
  position: number;
  profile_img?: string;
}

interface Cell {
  id: number | string;
  type?: string;
  text?: string;
  event?: string;
  background?: string;
  players: Player[];
}

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {
  boardSize: number = 8;
  totalCells: number = 60; // Total usable cells in the board (excluding 'end')
  spiralCells: Cell[] = [];
  specialCells: { [key: number]: string } = {};
  turnPlayer?: Player;
  players: Player[] = [
    { id: 1, name: 'Player 1', position: 1, profile_img: '/assets/img/default/default_profile0.png' },
    { id: 2, name: 'Player 2', position: 1, profile_img: '/assets/img/default/default_profile1.png' },
    { id: 3, name: 'Player 3', position: 1, profile_img: '/assets/img/default/default_profile2.png' },
  ];
  diceResult: number = 1;
  @ViewChild(CardModalComponent) cardPopup?: CardModalComponent;
  constructor() {}

  ngOnInit() {
    this.spiralCells = this.generateSpiral(this.boardSize);
    var playerIndex = Math.floor(Math.random() * this.players.length);
    this.turnPlayer = this.players[playerIndex];
    this.updatePlayerPositions();
  }

  generateSpiral(size: number): Cell[] {
    const spiral: Cell[] = Array.from({ length: size * size }, (_, i) => ({
      id: '',
      players: [],
      background: '',
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

    this.specialCells[1] = 'start';

    for (const [index, type] of Object.entries(this.specialCells)) {
      const cell = spiral.find(cell => cell.id === +index);
      if (cell) {
        cell.event = type;
      }
    }

    return spiral;
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

      this.movePlayer(this.turnPlayer.id, this.diceResult);
      var index = this.players.indexOf(this.turnPlayer);
      var playerIndex = (index + 1);

      if (playerIndex >= this.players.length) {
        this.turnPlayer = this.players[0];
      } else {
        console.log(playerIndex);
        this.turnPlayer = this.players[playerIndex];
      }


    }, 2000); // Duración de la animación del dado (1 segundo)
  }

  movePlayer(playerId: number, steps: number) {
    const player = this.players.find(player => player.id === playerId);
    if(!player) return;

    player.position = Math.min(player.position + steps, this.totalCells);
    this.updatePlayerPositions();
    const currentCell = this.spiralCells.find(cell => cell.id === player.position);
    if (currentCell) {
      this.onPlayerLandOnCell(player, currentCell);
    }
  }

  updatePlayerPositions() {
    // Clear all player positions
    this.spiralCells.forEach(cell => cell.players = []);

    // Set players on their respective cells
    this.players.forEach(player => {
      const cell = this.spiralCells.find(cell => cell.id === player.position);
      if (cell) {
        cell.players.push(player);
      }
    });
  }

  finishGame(player : Player) {
    console.log('Game finished');
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
      default:
        setTimeout(() => {
          this.cardPopup?.show(cell.text ?? '', cell.type ?? 'drink');
        }, 500);
    }
  }
}
