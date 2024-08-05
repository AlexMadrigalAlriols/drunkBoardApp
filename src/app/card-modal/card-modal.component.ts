import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
})
export class CardModalComponent{
  @Input() text?: string;
  @Input() type: string = 'drink';
  visible = false;
  showFront = false;
  exiting = false;

  show(text: string, type: string = 'drink') {
    this.text = text;
    this.type = type;
    this.visible = true;
    this.showFront = false;
    this.exiting = false;
  }

  toggleCard() {
    if (this.showFront) {
      this.close();
    } else {
      this.showFront = true;
    }
  }

  close() {
    this.exiting = true;
    setTimeout(() => {
      this.visible = false;
    }, 600); // Duración de la animación de salida (0.6s)
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if(!this.showFront) {
      this.toggleCard();
      return;
    }

    if (this.visible && !this.exiting && !(event.target as HTMLElement).closest('.card-container')) {
      this.close();
    }
  }
}
