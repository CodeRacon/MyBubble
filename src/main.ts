import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideAnimations(),
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
}).catch((err) => console.error(err));
