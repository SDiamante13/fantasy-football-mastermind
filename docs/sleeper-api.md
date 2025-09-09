# SLEEPER API DOCS

## Introduction
The Sleeper API is a read-only HTTP API that is free to use and allows access to a user's leagues, drafts, and rosters.

- **No API Token necessary** - read-only API
- **Rate limit**: Stay under 1000 API calls per minute  
- **Base URL**: `https://api.sleeper.app/v1`

## User Endpoints

### Get User
```
GET https://api.sleeper.app/v1/user/<username>
GET https://api.sleeper.app/v1/user/<user_id>
```

Response:
```json
{
  "username": "sleeperuser",
  "user_id": "12345678", 
  "display_name": "SleeperUser",
  "avatar": "cc12ec49965eb7856f84d71cf85306af"
}
```

## League Endpoints

### Get All Leagues for User
```
GET https://api.sleeper.app/v1/user/<user_id>/leagues/<sport>/<season>
```

### Get Specific League
```
GET https://api.sleeper.app/v1/league/<league_id>
```

### Get Rosters in League
```
GET https://api.sleeper.app/v1/league/<league_id>/rosters
```

### Get Users in League
```
GET https://api.sleeper.app/v1/league/<league_id>/users
```

### Get Matchups for Week
```
GET https://api.sleeper.app/v1/league/<league_id>/matchups/<week>
```

### Get Playoff Brackets
```
GET https://api.sleeper.app/v1/league/<league_id>/winners_bracket
GET https://api.sleeper.app/v1/league/<league_id>/losers_bracket
```

### Get Transactions
```
GET https://api.sleeper.app/v1/league/<league_id>/transactions/<round>
```

### Get Traded Picks
```
GET https://api.sleeper.app/v1/league/<league_id>/traded_picks
```

## Draft Endpoints

### Get All Drafts for User
```
GET https://api.sleeper.app/v1/user/<user_id>/drafts/<sport>/<season>
```

### Get All Drafts for League
```
GET https://api.sleeper.app/v1/league/<league_id>/drafts
```

### Get Specific Draft
```
GET https://api.sleeper.app/v1/draft/<draft_id>
```

### Get Draft Picks
```
GET https://api.sleeper.app/v1/draft/<draft_id>/picks
```

## Player Endpoints

### Get All Players (Cache This - 5MB!)
```
GET https://api.sleeper.app/v1/players/nfl
```

### Get Trending Players
```
GET https://api.sleeper.app/v1/players/<sport>/trending/<type>?lookback_hours=<hours>&limit=<int>
```

## Other Endpoints

### Get NFL State
```
GET https://api.sleeper.app/v1/state/nfl
```

## Important Notes

- **Only NFL supported** currently
- **Player data is ~5MB** - cache locally, don't call repeatedly
- **Rate limit**: 1000 calls/minute or you'll be IP-blocked
- **No authentication** required
- Use **roster_id** for team identification within leagues
- **Week numbers**: 1-18 for regular season

## Error Codes
- 400: Bad Request
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error
- 503: Service Unavailable
  EOF
```
