import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-new-chat-form',
  imports: [ReactiveFormsModule, HlmInput, HlmButton],
  templateUrl: './new-chat-form.html',
  styleUrl: './new-chat-form.css'
})
export class NewChatForm {
  private fb = inject(FormBuilder)

  @Output() submitForm = new EventEmitter<{ email: string, message: string }>();
  @Output() cancel = new EventEmitter<void>();


  newChatForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required]]
  })

  onSubmit() {
    if (this.newChatForm.valid) {
      this.submitForm.emit(this.newChatForm.value);
      this.newChatForm.reset();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
