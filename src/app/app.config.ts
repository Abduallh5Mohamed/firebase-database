import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { ThemeService } from '../Services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ThemeService, // Add theme service to providers
    // Firebase providers with better error handling
    provideFirebaseApp(() => {
      try {
        return initializeApp(environment.firebase);
      } catch (error) {
        console.warn('Firebase initialization error:', error);
        // Return a minimal config to prevent app crash
        return initializeApp({
          projectId: 'd2ddatabase',
          apiKey: 'AIzaSyBef27wt27Y59ko3iTHE97Ap2UL-DpOhR0',
        });
      }
    }),
    provideAuth(() => {
      try {
        return getAuth();
      } catch (error) {
        console.warn('Firebase Auth initialization error:', error);
        return getAuth();
      }
    }),
    provideFirestore(() => {
      try {
        const firestore = getFirestore();
        return firestore;
      } catch (error) {
        console.warn('Firestore initialization error:', error);
        return getFirestore();
      }
    }),
  ],
};
