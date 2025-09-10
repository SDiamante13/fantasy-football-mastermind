type InjuryDetector = {
  checkForInjuries: (playerIds: string[]) => Array<{ playerId: string; injuryStatus: string; severity: string }>;
};

type BackupFinder = {
  findBackups: (injuredPlayerId: string) => Array<{ playerId: string; position: string; team: string; name: string }>;
};

type WaiverChecker = {
  checkAvailability: (playerIds: string[], leagueId: string) => string[];
};

type ScoreRequest = {
  playerId: string;
  injuredStarter: {
    playerId: string;
    team: string;
    position: string;
    injurySeverity: string;
  };
};

type ScoreBreakdown = {
  handcuff_bonus: number;
  opportunity_score: number;
  injury_severity_bonus: number;
};

type PriorityScorer = {
  calculateScore: (request: ScoreRequest) => { total: number; breakdown: ScoreBreakdown };
};

type Services = {
  injuryDetector: InjuryDetector;
  backupFinder: BackupFinder;
  waiverChecker: WaiverChecker;
  priorityScorer: PriorityScorer;
};

type WaiverSuggestion = {
  playerId: string;
  playerName: string;
  priorityScore: number;
  reason: string;
  breakdown: ScoreBreakdown;
};

function processInjuryForSuggestions(
  injury: { playerId: string; injuryStatus: string; severity: string },
  leagueId: string,
  services: Services
): WaiverSuggestion[] {
  const suggestions: WaiverSuggestion[] = [];
  
  const backups = services.backupFinder.findBackups(injury.playerId);
  const backupIds = backups.map(backup => backup.playerId);
  const availableIds = services.waiverChecker.checkAvailability(backupIds, leagueId);
  
  for (const backup of backups) {
    if (availableIds.includes(backup.playerId)) {
      const suggestion = createSuggestionFromBackup(backup, injury, services.priorityScorer);
      suggestions.push(suggestion);
    }
  }
  
  return suggestions;
}

function createSuggestionFromBackup(
  backup: { playerId: string; position: string; team: string; name: string },
  injury: { playerId: string; injuryStatus: string; severity: string },
  scorer: PriorityScorer
): WaiverSuggestion {
  const scoreRequest: ScoreRequest = {
    playerId: backup.playerId,
    injuredStarter: {
      playerId: injury.playerId,
      team: backup.team,
      position: backup.position,
      injurySeverity: injury.severity
    }
  };
  
  const score = scorer.calculateScore(scoreRequest);
  
  return {
    playerId: backup.playerId,
    playerName: backup.name,
    priorityScore: score.total,
    reason: `Backup for injured starter (${injury.injuryStatus})`,
    breakdown: score.breakdown
  };
}

export function createWaiverSuggestionService(services: Services): {
  getSuggestions: (playerIds: string[], leagueId: string) => WaiverSuggestion[];
} {
  return {
    getSuggestions: (playerIds: string[], leagueId: string): WaiverSuggestion[] => {
      const suggestions: WaiverSuggestion[] = [];
      const injuries = services.injuryDetector.checkForInjuries(playerIds);
      
      for (const injury of injuries) {
        const injurySuggestions = processInjuryForSuggestions(injury, leagueId, services);
        suggestions.push(...injurySuggestions);
      }
      
      return suggestions.sort((a, b) => b.priorityScore - a.priorityScore);
    }
  };
}