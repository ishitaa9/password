import { Injectable } from '@angular/core';
import * as cryptoJS from 'crypto-js';
import { Password } from './password-list/password-list.component';

@Injectable({
  providedIn: 'root'
})
export class PasswordStoreService {
  private localStorageKey = 'passwords';
  private passwordStore: Password[] = [];

  constructor() {
    // Check if localStorage is available
    if (this.isLocalStorageAvailable()) {
      // Initialize the password store from local storage on service instantiation
      const storedPasswords = localStorage.getItem(this.localStorageKey);
      if (storedPasswords) {
        this.passwordStore = JSON.parse(storedPasswords);
      }
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = 'test';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private saveToLocalStorage(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.passwordStore));
    }
  }

  add(password: Password): void {
    try {
      const encryptedPassword = this.encryptPassword(password.encryptedPassword);
      password.encryptedPassword = encryptedPassword;
      this.passwordStore.push(password);
      this.saveToLocalStorage();
    } catch (error) {
      throw new Error("Error encrypting password: " + (error as Error).message);
    }
  }

  getAll(): Password[] {
    try {
      return this.passwordStore;
    } catch (error) {
      throw new Error("Error fetching passwords: " + (error as Error).message);
    }
  }

  delete(id: string): void {
    try {
      this.passwordStore = this.passwordStore.filter(password => password.id !== id);
      this.saveToLocalStorage();
    } catch (error) {
      throw new Error("Error deleting password: " + (error as Error).message);
    }
  }

  update(password: Password): void {
    const index = this.passwordStore.findIndex(p => p.id === password.id);
    if (index !== -1) {
      // Decrypt the password before editing
      password.encryptedPassword = this.decryptPassword(password.encryptedPassword);
      this.passwordStore[index] = password;
      // Re-encrypt the password after editing
      this.passwordStore[index].encryptedPassword = this.encryptPassword(password.encryptedPassword);
      this.saveToLocalStorage();
    }
  }

  encryptPassword(password: string): string {
    try {
      return cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(password));
    } catch (error) {
      throw new Error("Error encrypting password: " + (error as Error).message);
    }
  }

  decryptPassword(encryptedPassword: string): string {
    try {
      return cryptoJS.enc.Utf8.stringify(cryptoJS.enc.Base64.parse(encryptedPassword));
    } catch (error) {
      throw new Error("Error decrypting password: " + (error as Error).message);
    }
  }

  getPasswordByApp(app: string): Password[] {
    return this.passwordStore.filter(password => password.app === app);
  }

  getPasswordByUsername(userName: string): Password[] {
    return this.passwordStore.filter(password => password.userName === userName);
  }

}
