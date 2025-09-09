import { createFirebaseAppInitializer } from './app';

describe('Firebase App', () => {
  it('initializes successfully with valid configuration', () => {
    const mockConfig = {
      projectId: 'test-project',
      privateKey: 'test-key',
      clientEmail: 'test@test.com'
    };

    const mockFirebaseInit = () => ({ name: '[DEFAULT]' });
    const mockGetApps = () => [];
    const mockCredential = () => ({});

    const initializeFirebaseApp = createFirebaseAppInitializer(
      mockFirebaseInit,
      mockGetApps,
      mockCredential
    );

    const app = initializeFirebaseApp(mockConfig);

    expect(app).toBeTruthy();
    expect(app.name).toBeDefined();
  });
});