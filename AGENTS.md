# Architecture
- Store daily practice form payloads in date-scoped daily_practice_logs.notes, not profile configuration, so persisted schedules cannot leak yesterday's answers.
- Store gratitude items in gratitude_entries with an explicit period and local calendar date so morning and evening remain independent.
- Use a shared local-day subscription with visibility and minute checks; remount daily forms on date changes to reset timers and drafts.