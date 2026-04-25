# BehaviorSpec Testing Framework Plan

## 1. Language - Dual Mode

### Gherkin (Declarative)
```gherkin
Feature: Pizza ordering
  Scenario: Add pizza to cart
    Given the app and API are running
    When I click "Pizzas"
    And I click "Add to Cart" on "Margherita"
    Then cart badge shows "1"
```

### Imperative
```
Start: http://localhost:5173
Click: button[Pizzas]
Click: .grid > div:has-text("Margherita") button
Assert: header button span = "1"
```

## 2. API Integration

| Endpoint | Purpose |
|----------|---------|
| GET /api/menu | Pizza list |
| GET /api/drinks | Drinks list |
| GET /api/orders | Orders list |
| POST /api/orders | Create order |

**CI Requirement:** Both `npm run dev` (Vite) + `node server.js` (Express API) must run

## 3. DOM Mappings (Pizza App)

| Element | Selector |
|---------|----------|
| nav[Pizzas] | `button:has-text("Pizzas")` |
| pizza[Margherita] | `.grid > div:has-text("Margherita")` |
| button[Add to Cart] | `.grid > div button` |
| badge | `header button:has(span) span` |
| cart-drawer | `.fixed.inset-0` |
| page[Orders] | `h2:has-text("Your Orders")` |

## 4. Test Generation (Manual - User Controlled)

```bash
npx behavior-spec generate pizza-ordering.behaviorSpec
```

Creates: `generated-pizza.spec.ts`

**Rationale:** Users steer test generation direction to cover all user flows

## 5. CI Pipeline

- **Trigger:** PR pushes with generated `.spec.ts` files
- **Runs:** Playwright tests
- **On failure:** Creates GitHub Issue + ProjectV2 card with failure details
- **Status flow:** Pass → Done, Fail → Needs Triage

## 6. GitHub ProjectV2 (Per-Repository)

**Create Project (run once, stores ID):**
```graphql
mutation CreateProject($repoId: ID!) {
  createProjectV2(input: {
    repositoryId: $repoId,
    title: "Behavior Specs"
  }) {
    projectV2 { id }
  }
}
```

**Add Issue to Board:**
```graphql
mutation AddToProject($projectId: ID!, $issueId: ID!) {
  addProjectV2ItemById(input: {
    projectId: $projectId,
    contentId: $issueId
  }) {
    item { id }
  }
}
```

## 7. Kanban Cards from Workflows

Pipeline parses `.behaviorSpec` → One DraftIssue (card) per scenario:
| Scenario | Card Title |
|----------|-----------|
| Add pizza to cart | Test: Add pizza to cart |
| Open cart | Test: Open cart and view items |
| Place order | Test: Place order |
| View orders | Test: View orders list |

**Columns:** To Do → In Progress → Done / Needs Triage

## 8. Generalization Notes

- **Mobile:** pinch, long-press, swipe gestures
- **Accessibility:** Auto-generate a11y assertions
- **Multi-tab:** switch-to-tab:N
- **iFrames:** Deep selector support
- **Visual regression:** Optional screenshot diff mode
