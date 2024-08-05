import { Injectable } from '@angular/core';
import { io,Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  private socket: Socket;
  private url = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.url);
  }

  createLobby(userId: string) {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit('createLobby', userId, (response: string) => {
        resolve(response);
      });
    });
  }

  joinLobby(lobbyId: string, userId: string): any {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinLobby', lobbyId, userId, (response: any) => {
        if (response) {
          resolve(response);
        } else {
          reject(false);
        }
      });
    });
  }

  leaveLobby(lobbyId: string, userId: string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('leaveLobby', lobbyId, userId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  kickPlayer(lobbyId: string, userId: string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('kickPlayer', lobbyId, userId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  giveOwner(lobbyId: string, userId: string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('giveOwner', lobbyId, userId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  startGame(lobbyId: string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('startGame', lobbyId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  changeGameTurn(lobbyId: string, userId: string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('changeGameTurn', lobbyId, userId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  updatePlayerPosition(lobbyId: string, userId: number, position: number) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('updatePlayerPosition', lobbyId, userId, position, (success: boolean) => {
        resolve(success);
      });
    });
  }

  playerLandOnCell(lobbyId: string, userId: string, cellId: number | string) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('playerLandOnCell', lobbyId, userId, cellId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  jailPlayer(lobbyId: string, userId: number) {
    return new Promise<boolean>((resolve) => {
      this.socket.emit('jailPlayer', lobbyId, userId, (success: boolean) => {
        resolve(success);
      });
    });
  }

  onGameStarted(callback: (data: any) => void) {
    this.socket.on('gameStarted', callback);
  }

  onUserJoined(callback: (data: { userId: string, user: any }) => void) {
    this.socket.on('userJoined', callback);
  }

  onUserLeft(callback: (data: { userId: string }) => void) {
    this.socket.on('userLeft', callback);
  }

  onUserListUpdate(callback: (users: any[]) => void) {
    this.socket.on('userListUpdate', callback);
  }

  onKickPlayer(callback: (data: { userId: string }) => void) {
    this.socket.on('kickPlayer', callback);
  }

  onGiveOwner(callback: (data: { user: string }) => void) {
    this.socket.on('giveOwner', callback);
  }

  onGameTurnChange(callback: (data: any) => void) {
    this.socket.on('gameTurnChanged', callback);
  }

  onPlayerPositionUpdate(callback: (data: any) => void) {
    this.socket.on('playerPositionUpdated', callback);
  }

  onPlayerLandOnCell(callback: (data: any) => void) {
    this.socket.on('playerLandedOnCell', callback);
  }

  onPlayerJailed(callback: (data: any) => void) {
    this.socket.on('playerJailed', callback);
  }
}
