import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinLobbyPage } from './join-lobby.page';

const routes: Routes = [
  {
    path: '',
    component: JoinLobbyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinLobbyPageRoutingModule {}
