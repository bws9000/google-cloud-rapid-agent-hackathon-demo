import { Component, inject } from '@angular/core';
import { ModalRef } from 'modal-lib2';

@Component({
  selector: 'app-read-me-modal',
  imports: [],
  templateUrl: './read-me-modal.component.html',
  styleUrl: './read-me-modal.component.scss'
})
export class ReadMeModalComponent {
  private modalRef = inject(ModalRef);

  close() {
    this.modalRef.close();
  }
}
