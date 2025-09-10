type DropAlert = {
  playerId: string;
  rosterPercentage: number;
  playerName?: string;
};

type FCMService = {
  sendNotification: (payload: {
    token: string;
    notification: {
      title: string;
      body: string;
    };
  }) => Promise<{ success: boolean }>;
};

export function createNotificationService(fcmService: FCMService): {
  sendDropAlert: (alert: DropAlert, userToken: string) => Promise<void>;
} {
  return {
    sendDropAlert: async (alert: DropAlert, userToken: string): Promise<void> => {
      await fcmService.sendNotification({
        token: userToken,
        notification: {
          title: 'High-Value Player Dropped!',
          body: `${alert.playerName} (${alert.rosterPercentage}% rostered) was just dropped`
        }
      });
    }
  };
}