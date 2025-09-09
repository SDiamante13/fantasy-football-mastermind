import { initializeApp, getApps } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

type FirebaseConfig = {
  projectId: string;
  privateKey: string;
  clientEmail: string;
};
type FirebaseApp = { name: string };

export function createFirebaseAppInitializer(
  firebaseInit: (config: unknown) => FirebaseApp,
  getExistingApps: () => FirebaseApp[],
  createCredential: (cert: unknown) => unknown
) {
  return function initializeFirebaseApp(config: FirebaseConfig): FirebaseApp {
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
