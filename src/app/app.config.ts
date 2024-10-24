import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCyhVUrM3AB_nX6aAGFXgOYpHTiJUELSXA',
        authDomain: 'bubble-651ee.firebaseapp.com',
        projectId: 'bubble-651ee',
        storageBucket: 'bubble-651ee.appspot.com',
        messagingSenderId: '813155893908',
        appId: '1:813155893908:web:8f9dcc08956e2ae732ea81',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
