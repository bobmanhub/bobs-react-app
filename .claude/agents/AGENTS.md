# Custom Agents for Bob's React Pizza App

## Available Agents

### Pizza Meal Planner
**File**: [.claude/pizza-meal-planner.agent.md](.claude/pizza-meal-planner.agent.md)

Plans a week-long pizza meal strategy for your family based on the number of family members.

**Parameters**:
- `familyMembers` (required): Number of family members (1-20)
- `dietaryPreferences` (optional): Dietary restrictions like "vegetarian", "gluten-free", etc.

**What it does**:
- Creates a diverse 7-day pizza meal schedule
- Calculates optimal portions based on family size
- Provides itemized daily and weekly cost breakdowns
- Generates a shopping list with quantities
- Respects all dietary preferences and constraints
- Can create actual orders from the approved plan

**Example Usage**:
```
/pizza-meal-planner familyMembers=4
/pizza-meal-planner familyMembers=6 dietaryPreferences="vegetarian"
```

---

## Agent Integration with Skills

All custom agents leverage the **Pizza Ordering Skill** to:
- Access current menu prices
- Apply correct pricing multipliers (size-based)
- Calculate accurate costs
- Place orders when approved
- Provide real-time drink options

## How to Use Agents

In VS Code chat:
1. Type `/` to see available agents and commands
2. Select or type the agent name
3. Provide required parameters
4. Agent runs to completion
5. Review results and take action (place orders, etc.)

---

**Last Updated**: 2026-03-21
**Version**: 1.0
