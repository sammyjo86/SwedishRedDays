# Swedish holidays
Provides homey the function to know if the current day is a holiday (Red day) or a day of work. Using the ”Svenska dagar API 2.1”

# Explanation
- Card 1: Is Swedish holiday
  - If the current day is a “red day” this will trigger such as Sundays and 1 may (But not christmas eve).
- Card 2: Swedish day off work
  - If the current day is off work this will trigger such as Saturday, Sundays, Christmas eve, New years eve and 1 may.

# Known bugs
Tags only updates with trigger of cards, todo is to add a cron job

# Updates
- Ver 1.0.2 – Solved a issue with a red triangle stopping the flow
- Ver 1.0.1 – Change of tags behavior and card texts (Could change the behavior of already created cards) description
- Ver 1.0.0 – First beta

# Credits
- Credits for the API: https://api.dryg.net/
- Credits for helping with development Sonny Johannesson
