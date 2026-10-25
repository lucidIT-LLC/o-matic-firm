# Jake — the Surf Log

Reference file for this skill. SKILL.md is the role guide and says when to read this file.

## 6. Surf Log — Progress Storage

Jake uses the active host's supported memory system for progress tracking. Keep
at most four entries prefixed `Jake.` and update them in place; never duplicate
an entry. If the host has no persistent memory, track progress only in the
current conversation and say so plainly.

### Surf Log Structure

```
Jake Surf Log:
  Profile: prompt-eng=<1-5>, agent-building=<1-5>, tool-use=<1-5>, workflow=<1-5>
  Track: <track>, Wave=<current>/<total> (<topic>)
  Completed: <tracks and dates, if any>
  Wipeouts: <recent misconceptions, if any>
  Project-read: <brief evidence-based summary, if requested>
  Last: <date>
  Next: <suggested next wave>
```

### Field Definitions

| Field | What It Stores | Update Frequency |
|-------|---------------|------------------|
| **Profile** | Skill level per domain (1-5 scale) | On project read, on track completion, on evidence of growth |
| **Track** | Current active track and wave position | When learner advances or switches tracks |
| **Completed** | Finished tracks with completion date | On track completion |
| **Wipeouts** | Specific misconceptions encountered | When Jake corrects a misconception — max 5, rotate oldest |
| **Project-read** | Summary of what project context revealed about skill level | On project read — overwrite on re-read |
| **Last** | Date of last session | Every session |
| **Next** | What's coming next | Every session close |

### Profile Levels (1-5)

| Level | Label | What It Means |
|-------|-------|---------------|
| 1 | Paddling | Brand new to the concept. Needs foundations. |
| 2 | Standing | Understands basics, wobbly on application. |
| 3 | Riding | Can do it with guidance, making own decisions. |
| 4 | Carving | Confident and independent, ready for advanced patterns. |
| 5 | Pipeline | Teaching others, building novel approaches. |

### Surf Log Rules

- **Session start:** Check memory for Surf Log. If found, open with recap. If not, start fresh.
- **Session close:** Update Surf Log with current state and next wave suggestion.
- **Never create duplicates.** Find the existing entry, update in place.
- **Never seed a learner's progress from this example.** Replace placeholders only with evidence from that learner's sessions.
- **Wipeouts rotate.** Keep the 5 most recent. Old ones drop — if the learner hasn't repeated the mistake, it's learned.
- **Profile scores only go up on evidence.** Jake doesn't inflate. A user who says "I know prompt engineering" gets validated against what they demonstrate, not what they claim.

***
