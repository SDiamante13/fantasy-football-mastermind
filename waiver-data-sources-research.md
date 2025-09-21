# Fantasy Football Waiver Wire Data Sources Research

## Executive Summary

### Top 3 Recommendations

1. **Sleeper API** - Completely free, no authentication required, excellent CORS support, comprehensive data
2. **NFLverse/nfldata ecosystem** - Rich historical data, Python/R support, regularly updated CSV downloads
3. **Fantasy Football Data Pros API** - Free historical data back to 1999, simple REST API, no rate limits

### Quick Start Options
- **Immediate Implementation**: Sleeper API for current season data
- **Historical Analysis**: Fantasy Football Data Pros for 1999-present weekly data
- **Advanced Analytics**: NFLverse ecosystem for comprehensive NFL statistics

---

## Detailed Analysis

### 1. Sleeper API ⭐⭐⭐⭐⭐

**Overview**: Sleeper provides a completely free, public API for fantasy football data with no authentication required.

**Endpoints Available**:
```
Base URL: https://api.sleeper.app/v1/

Players: /players/nfl
Trending: /players/nfl/trending/add
User Leagues: /user/{user_id}/leagues/nfl/{season}
League Data: /league/{league_id}
Rosters: /league/{league_id}/rosters
Matchups: /league/{league_id}/matchups/{week}
Transactions: /league/{league_id}/transactions/{round}
```

**Sample API Call**:
```javascript
// Get all NFL players
fetch('https://api.sleeper.app/v1/players/nfl')
  .then(response => response.json())
  .then(data => console.log(data));

// Get trending adds (waiver wire candidates)
fetch('https://api.sleeper.app/v1/players/nfl/trending/add')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Pros**:
- Completely free, no API key required
- Excellent for waiver wire analysis (trending adds endpoint)
- CORS-friendly for web applications
- Well-documented REST API
- Real-time data during NFL season
- Comprehensive player data including projections

**Cons**:
- Limited historical data compared to other sources
- No injury reports or depth chart data
- Rate limit of 1000 calls/minute (generous but exists)

**Implementation Difficulty**: ⭐ (Very Easy)
**Data Quality**: ⭐⭐⭐⭐⭐ (Excellent)
**CORS Support**: ⭐⭐⭐⭐⭐ (Full support)

---

### 2. NFLverse Ecosystem ⭐⭐⭐⭐⭐

**Overview**: A comprehensive collection of NFL data packages providing historical and current statistics.

**Available Data Sources**:
- **nflfastR**: Play-by-play data (1999-present)
- **nfldata**: Player stats and team data
- **nfl-data-py**: Python interface to all nflverse data

**Python Implementation**:
```python
import nfl_data_py as nfl

# Get weekly fantasy data
weekly_data = nfl.import_weekly_data([2023, 2024])

# Get player stats
player_stats = nfl.import_player_stats()

# Get seasonal data
seasonal = nfl.import_seasonal_data([2023])
```

**R Implementation**:
```r
library(nflfastR)
library(nflreadr)

# Load player stats
player_stats <- load_player_stats(seasons = 2023)

# Get snap counts (opportunity metrics)
snap_counts <- load_snap_counts(seasons = 2023)
```

**CSV Downloads**:
Direct CSV access available from GitHub repositories:
- `https://github.com/nflverse/nfldata/releases`
- Updated nightly during season

**Pros**:
- Rich historical data (1999-present for some datasets)
- Both Python and R support
- Includes advanced metrics (snap counts, target share, etc.)
- Pre-computed CSV files available
- Active community and regular updates
- Comprehensive play-by-play data

**Cons**:
- Requires some data processing for fantasy-specific metrics
- No direct "waiver wire" recommendations
- Setup complexity higher than simple APIs

**Implementation Difficulty**: ⭐⭐⭐ (Moderate)
**Data Quality**: ⭐⭐⭐⭐⭐ (Excellent)
**CORS Support**: ⭐⭐⭐ (CSV downloads work, API varies)

---

### 3. Fantasy Football Data Pros API ⭐⭐⭐⭐

**Overview**: Free API providing historical fantasy football data with weekly and seasonal endpoints.

**API Endpoints**:
```
Base URL: https://api.fantasyfootballdatapros.com/

Weekly Data: /api/players/{year}/{week}
Seasonal Data: /api/players/{year}/all
Projections: /api/projections
```

**Sample Implementation**:
```javascript
// Get week 1 data for 2023
fetch('https://api.fantasyfootballdatapros.com/api/players/2023/1')
  .then(response => response.json())
  .then(data => {
    // Data includes passing, rushing, receiving stats
    console.log(data);
  });

// Get full season data
fetch('https://api.fantasyfootballdatapros.com/api/players/2023/all')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Data Structure**:
```json
{
  "player_id": "12345",
  "player_name": "Player Name",
  "team": "TB",
  "position": "RB",
  "passing_yards": 0,
  "rushing_yards": 85,
  "receiving_yards": 23,
  "total_touchdowns": 1,
  "fantasy_points": 14.8
}
```

**Pros**:
- Completely free, no authentication
- Historical data back to 1999
- Simple REST API
- No stated rate limits
- Includes fantasy points calculations
- Both weekly and seasonal data

**Cons**:
- Limited to statistical data (no projections for current season)
- No injury reports or depth charts
- Basic data structure
- No trending/waiver wire specific endpoints

**Implementation Difficulty**: ⭐ (Very Easy)
**Data Quality**: ⭐⭐⭐⭐ (Very Good)
**CORS Support**: ⭐⭐⭐⭐ (Good, based on REST principles)

---

### 4. Yahoo Fantasy Sports API ⭐⭐⭐⭐

**Overview**: Official Yahoo API with comprehensive fantasy football features including waiver wire support.

**Key Features**:
- Waiver wire transaction support
- League management capabilities
- Player rankings and projections
- Historical league data

**Authentication**: OAuth 2.0 required for private league data

**Sample Endpoints**:
```
Base URL: https://fantasysports.yahooapis.com/fantasy/v2/

Game Info: /game/nfl
League Info: /league/{league_key}
Players: /league/{league_key}/players
Transactions: /league/{league_key}/transactions
```

**GitHub Wrapper**:
- `uberfastman/yfpy` - Comprehensive Python wrapper
- Simplifies OAuth and data parsing

**Pros**:
- Official API with full waiver wire support
- Comprehensive fantasy football features
- Active community support
- Python wrapper available

**Cons**:
- OAuth required for most useful data
- Complex authentication setup
- Rate limiting on API calls
- Documentation can be confusing

**Implementation Difficulty**: ⭐⭐⭐ (Moderate - OAuth complexity)
**Data Quality**: ⭐⭐⭐⭐⭐ (Excellent)
**CORS Support**: ⭐⭐ (Limited - requires backend for OAuth)

---

### 5. ESPN Fantasy API (Unofficial) ⭐⭐⭐

**Overview**: Unofficial access to ESPN's fantasy football data through reverse-engineered endpoints.

**GitHub Resources**:
- `cwendt94/espn-api` - Python wrapper for ESPN Fantasy API
- Supports both public and private leagues

**Base URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games`

**Sample Usage**:
```python
from espn_api import League

# Public league
league = League(league_id=123456, year=2023)

# Private league (requires cookies)
league = League(league_id=123456, year=2023,
                espn_s2='your_espn_s2_cookie',
                swid='{your_swid}')

# Get player projections
projections = league.player_info()
```

**Pros**:
- Comprehensive ESPN fantasy data
- Player projections and rankings
- League-specific analysis
- Active Python wrapper

**Cons**:
- Unofficial API (could break)
- Private leagues require authentication cookies
- No official documentation
- CORS issues for web applications

**Implementation Difficulty**: ⭐⭐⭐ (Moderate)
**Data Quality**: ⭐⭐⭐⭐ (Very Good)
**CORS Support**: ⭐ (Poor - requires backend)

---

### 6. Pro Football Reference Scraping ⭐⭐⭐

**Overview**: Web scraping from Pro Football Reference for comprehensive NFL statistics.

**Python Libraries**:
- `pro-football-reference-web-scraper`
- `pandas.read_html()` for simple scraping

**Sample Implementation**:
```python
import pandas as pd
from pro_football_reference_web_scraper import pfr

# Scrape player stats
df = pd.read_html('https://www.pro-football-reference.com/years/2023/fantasy.htm')[0]

# Using the dedicated library
player_stats = pfr.player_game_log('Tom Brady', 2023)
```

**Data Available**:
- Historical player statistics
- Fantasy points by game/season
- Advanced metrics (snap counts, target share)
- Injury reports
- Depth charts

**Pros**:
- Comprehensive historical data
- Advanced statistics
- Free access to all data
- Well-structured HTML tables

**Cons**:
- Web scraping has inherent risks
- No official API
- Need to respect rate limits
- Requires data processing

**Implementation Difficulty**: ⭐⭐ (Easy with libraries)
**Data Quality**: ⭐⭐⭐⭐⭐ (Excellent)
**CORS Support**: ⭐ (Scraping required)

---

### 7. NFL.com API (Limited) ⭐⭐

**Overview**: Limited unofficial access to NFL.com fantasy endpoints.

**Available Endpoints**:
```
Base: http://api.fantasy.nfl.com/v1/

Player Stats: /players/stats?statType=seasonStats&season=2023&format=json
```

**Pros**:
- Direct NFL data source
- No authentication required for some endpoints
- JSON format

**Cons**:
- Very limited endpoints
- Unofficial access
- No waiver wire specific data
- Inconsistent availability

**Implementation Difficulty**: ⭐⭐ (Easy but limited)
**Data Quality**: ⭐⭐⭐ (Good when available)
**CORS Support**: ⭐⭐ (Limited)

---

## GitHub Repository Examples

### Community-Built Solutions

1. **Fantasy Rankings Scraper** (`n-roth12/fantasy-rankings-scraper`)
   - Multi-site scraper for draft rankings
   - Supports FantasyPros, ESPN, Yahoo, etc.

2. **Yahoo Fantasy Scraper** (`andrewrgoss/yahoo-fantasy-fball-scraper`)
   - Selenium-based Yahoo scraper
   - Extracts auction values and projections

3. **ESPN Fantasy Tools** (`cwendt94/espn-api`)
   - Comprehensive ESPN API wrapper
   - Supports private leagues

4. **Multi-Platform Scraper** (`loisaidasam/fantasyfootball`)
   - Scrapes multiple fantasy platforms
   - Aggregates data from various sources

---

## Backup Options

### CSV Data Sources
1. **Fantasy Football Data Pros CSV Downloads**
   - URL: `https://www.fantasyfootballdatapros.com/csv_files`
   - Historical data 1970-present
   - Free downloads

2. **NFLverse Data Releases**
   - URL: `https://github.com/nflverse/nfldata/releases`
   - Updated nightly during season
   - Comprehensive statistics

3. **Kaggle Datasets**
   - Search for "fantasy football" datasets
   - Community-contributed data
   - Various time ranges and formats

### Web Scraping Targets
1. **FantasyPros Free Rankings**
   - URL: `https://www.fantasypros.com/nfl/rankings/`
   - Consensus expert rankings
   - Waiver wire recommendations

2. **ESPN Free Content**
   - Player news and updates
   - Injury reports
   - Depth chart changes

3. **NFL.com Fantasy Section**
   - Official injury reports
   - Player news
   - Snap count data

---

## Hybrid Approach Recommendations

### Primary Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sleeper API   │    │ Fantasy Football │    │   NFLverse      │
│                 │    │   Data Pros      │    │   CSV Data      │
│ • Current data  │    │ • Historical     │    │ • Advanced      │
│ • Waiver trends │    │ • 1999-present   │    │   metrics       │
│ • Player info   │    │ • Fantasy points │    │ • Snap counts   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                     ┌─────────────────────┐
                     │   Your Application  │
                     │                     │
                     │ • Combine data      │
                     │ • Calculate metrics │
                     │ • Generate insights │
                     └─────────────────────┘
```

### Implementation Strategy

1. **Current Season Data**: Use Sleeper API for real-time player data and waiver wire trends
2. **Historical Analysis**: Supplement with Fantasy Football Data Pros for trend analysis
3. **Advanced Metrics**: Pull snap counts and opportunity metrics from NFLverse
4. **Backup Data**: Maintain CSV downloads for offline analysis

### Sample Integration Code

```javascript
class WaiverWireAnalyzer {
  async getCurrentTrending() {
    // Primary: Sleeper API
    const response = await fetch('https://api.sleeper.app/v1/players/nfl/trending/add');
    return response.json();
  }

  async getHistoricalPerformance(playerId, year) {
    // Secondary: Fantasy Football Data Pros
    const response = await fetch(`https://api.fantasyfootballdatapros.com/api/players/${year}/all`);
    const data = await response.json();
    return data.filter(player => player.player_id === playerId);
  }

  async getOpportunityMetrics() {
    // Tertiary: NFLverse CSV data
    const csvUrl = 'https://github.com/nflverse/nfldata/releases/latest/download/snap_counts.csv';
    const response = await fetch(csvUrl);
    return this.parseCSV(await response.text());
  }
}
```

---

## Rate Limits and Considerations

### API Rate Limits
- **Sleeper**: 1000 calls/minute
- **Fantasy Football Data Pros**: No stated limits
- **Yahoo**: Variable based on OAuth scope
- **ESPN**: Unofficial, be conservative

### Best Practices
1. **Cache API responses** locally to reduce calls
2. **Implement request queuing** for multiple data sources
3. **Use CSV downloads** for bulk historical data
4. **Respect robots.txt** when web scraping
5. **Monitor for API changes** especially unofficial endpoints

---

## Implementation Difficulty Assessment

### Beginner Level (⭐)
- Sleeper API direct calls
- Fantasy Football Data Pros API
- CSV downloads from NFLverse

### Intermediate Level (⭐⭐⭐)
- Yahoo API with OAuth
- ESPN API wrapper setup
- Pro Football Reference scraping with libraries

### Advanced Level (⭐⭐⭐⭐⭐)
- Custom web scraping solutions
- Real-time data aggregation from multiple sources
- Advanced data processing and normalization

---

## Conclusion

For a comprehensive waiver wire analysis application, I recommend starting with the **Sleeper API** as your primary data source due to its excellent free tier and waiver wire specific features. Supplement this with **Fantasy Football Data Pros** for historical context and **NFLverse** data for advanced opportunity metrics.

This hybrid approach provides:
- Real-time waiver wire trends (Sleeper)
- Historical performance analysis (FF Data Pros)
- Advanced opportunity metrics (NFLverse)
- Reliable backup options (CSV downloads)
- Scalable architecture for future enhancements

The combination offers the best balance of data quality, reliability, and implementation simplicity while maintaining completely free access to comprehensive fantasy football data.