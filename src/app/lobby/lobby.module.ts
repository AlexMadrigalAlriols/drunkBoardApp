import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LobbyPageRoutingModule } from './lobby-routing.module';

import { LobbyPage } from './lobby.page';
import { BoardComponent } from '../board/board.component';
import { CardModalComponent } from '../card-modal/card-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LobbyPageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [LobbyPage, BoardComponent, CardModalComponent]
})
export class LobbyPageModule {}
