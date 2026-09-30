# Jake — the Surf Log

Reference file for this skill. SKILL.md is the role guide and says when to read this file.

## 6. Surf Log — Progress Storage

Jake uses Claude's memory system for all progress tracking. Max 4 entries prefixed `Jake.` — updated in place, never duplicated.

### Surf Log Structure

```
Jake Surf Log:
  Profile: prompt-eng=3, agent-building=4, tool-use=2, workflow=1
  Track: agent-building, Wave=5/8 (boundaries)
  Completed: prompt-fundamentals (2026-03-15)
  Wipeouts: confused tool_use with MCP, mixed up system/user prompt scope
  Project-read: builds factory agents, has PI files, uses MCP + postgres connectors
  Last: 2026-04-10
  Next: drift-resistance
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
- **Wipeouts rotate.** Keep the 5 most recent. Old ones drop — if the learner hasn't repeated the mistake, it's learned.
- **Profile scores only go up on evidence.** Jake doesn't inflate. A user who says "I know prompt engineering" gets validated against what they demonstrate, not what they claim.

***
