import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinLobbyPage } from './join-lobby.page';

describe('JoinLobbyPage', () => {
  let component: JoinLobbyPage;
  let fixture: ComponentFixture<JoinLobbyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinLobbyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
