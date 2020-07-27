# Swedish holidays
Provides homey the function to know if the current day is a holiday (Red day) or a day of work. Using the ”Svenska dagar API 2.1”

# Explanation
- Card 1: Is Swedish holiday
  - If the current day is a “red day” this will trigger, e.g. Sundays and May 1st (But not christmas eve).
- Card 2: Swedish day off work
  - If the current day is off work this will trigger, e.g. Saturday, Sundays, Christmas eve, New years eve and May 1st.
- Card 3: Is Specific Swedish holiday (Pick the holiday)
  - Pick the holiday you wish in the condition
- Card 4: Swedish flag day
  - If the current day is an official flag day of Sweden this will trigger.

- Tags:
  - Tags for Holiday, Business day, API update date, First name of the day, Second name of the day, Third name of the day, Flag day and Day of week.

# Known bugs
Tags only updates with trigger of cards, todo is to add a cron job. If you have cards triggern every day you should notice.

# Updates
- ver 1.0.5 - Added Crontask that update tokens at 00:00 every day.
- Ver 1.0.4 - Addded support for Swedish lang file, corrected a bug in the APP.json (Two conditions hade the same name). Release of ver 1.0.3 only as a beta. 
- Ver 1.0.3 - Addded support for Flag day condition (new card) and more tokens. Solved a potential problem with cards if no data is present
- Ver 1.0.2 – Solved a issue with a red triangle stopping the flow
- Ver 1.0.1 – Change of tags behavior and card texts (Could change the behavior of already created cards) description
- Ver 1.0.0 – First beta

# Credits
- Credits for the API: https://api.dryg.net/
- Credits for helping with development Sonny Johannesson, Johan Bendz
