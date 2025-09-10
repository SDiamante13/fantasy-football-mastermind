import { createNotificationService } from './notification-service';

describe('Notification Service', () => {
  it('sends push notification when high-value player is dropped', async () => {
    const mockFCM = {
      sendNotification: jest.fn().mockResolvedValue({ success: true })
    };

    const notificationService = createNotificationService(mockFCM);
    await notificationService.sendDropAlert(
      {
        playerId: 'player123',
        rosterPercentage: 75,
        playerName: 'Saquon Barkley'
      },
      'user-token-123'
    );

    expect(mockFCM.sendNotification).toHaveBeenCalledWith({
      token: 'user-token-123',
      notification: {
        title: 'High-Value Player Dropped!',
        body: 'Saquon Barkley (75% rostered) was just dropped'
      }
    });
  });
});
