import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export function createFirebaseAppInitializer(
  firebaseInit: any,
  getExistingApps: any,
  createCredential: any
) {
  return function initializeFirebaseApp(config: { projectId: string; privateKey: string; clientEmail: string }) {
    if (getExistingApps().length > 0) {
      return getExistingApps()[0];
    }

    return firebaseInit({
      credential: createCredential({
        projectId: config.projectId,
        privateKey: config.privateKey.replace(/\\n/g, '\n'),
        clientEmail: config.clientEmail
      }),
      projectId: config.projectId
    });
  };
}

export const initializeFirebaseApp = createFirebaseAppInitializer(
  initializeApp,
  getApps,
  credential.cert
);