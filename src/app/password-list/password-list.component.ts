import { Component, OnInit } from '@angular/core';
import { PasswordStoreService } from '../password-store.service';
import { v4 as uuidv4 } from 'uuid';

export interface Password {
  id: string;
  category: string;
  app: string;
  userName: string;
  encryptedPassword: string;
  decryptedPassword?: string;
  isEditing: boolean;
}


@Component({
  selector: 'app-password-list',
  templateUrl: './password-list.component.html',
  styleUrls: ['./password-list.component.css']
})
export class PasswordListComponent implements OnInit {
  passwords: Password[] = [];
  category: string = '';
  app: string = '';
  userName: string = '';
  password: string = '';
  errorMessage: string = '';
  isEditing: boolean = false;
  editedPasswordId: number | null = null;
  categoryFilter: string = '';
  appFilter: string = '';
  userNameFilter: string = '';

  constructor(private passwordService: PasswordStoreService) { }

  ngOnInit(): void {
    this.loadPasswords();
  }

  loadPasswords(): void {
    try {
      this.passwords = this.passwordService.getAll();
    } catch (error: any) {
      this.handleError("Error fetching passwords: " + error.message);
    }
  }

  editPassword(password: Password): void {
  // Decrypt the password before editing and store it in decryptedPassword property
  password.decryptedPassword = this.passwordService.decryptPassword(password.encryptedPassword);
  // Set the password field to display the decrypted password
  this.password = password.decryptedPassword;
  password.isEditing = true;
}

  savePassword(password: Password): void {
    // You can add validation logic here if needed
    password.isEditing = false;
    // Re-encrypt the password after editing
    password.encryptedPassword = this.passwordService.encryptPassword(password.encryptedPassword);
    // Update the password in the store (if needed)
    this.passwordService.update(password);
  }

  cancelEdit(password: Password): void {
    password.isEditing = false;
  }


  deletePassword(id: string): void {
    try {
      this.passwordService.delete(id);
      this.loadPasswords();
    } catch (error: any) {
      this.handleError("Error deleting password: " + error.message);
    }
  }


  addPassword(): void {
    if (!this.validateInputs()) {
      // Handle validation error
      this.errorMessage = 'Please fill out all fields.';
      return;
    }

    try {
      const encryptedPassword = this.passwordService.encryptPassword(this.password);
      const newPassword: Password = {
        id: uuidv4(),
        category: this.category,
        app: this.app,
        userName: this.userName,
        encryptedPassword,
        isEditing: false,
      };

      this.passwordService.add(newPassword);
      // this.loadPasswords();
      this.clearInputs();
    } catch (error: any) {
      this.handleError("Error adding password: " + error.message);
    }
  }

  private validateInputs(): boolean {
    return this.category.trim() !== '' && this.app.trim() !== '' && this.userName.trim() !== '' && this.password.trim() !== '';
  }

  private clearInputs(): void {
    this.category = '';
    this.app = '';
    this.userName = '';
    this.password = '';
    this.errorMessage = '';
  }

  private handleError(message: string): void {
    console.error(message);
    // You can implement error handling logic here, e.g., displaying an error message to the user
  }

  getPasswordsByApp(): void {
    try {
      this.passwords = this.passwordService.getPasswordByApp(this.appFilter);
    } catch (error: any) {
      this.handleError("Error fetching passwords: " + error.message);
    }
  }

  getPasswordsByUsername(): void {
    try {
      this.passwords = this.passwordService.getPasswordByUsername(this.userNameFilter);
    } catch (error: any) {
      this.handleError("Error fetching passwords: " + error.message);
    }
  }
  clearFilters(): void {
    this.categoryFilter = '';
    this.appFilter = '';
    this.userNameFilter = '';
    this.loadPasswords();
  }
}
