import { createSelector } from '@reduxjs/toolkit';

// ─── Raw input selector ───────────────────────────────────────────────────────
const selectTemplatesList = (state) => state.diets.templates;

// ─── selectDietTemplateStats ──────────────────────────────────────────────────
// Aggregates high-level stats across all diet templates.
//
// Returns:
// {
//   totalTemplates  : number
//   activeTemplates : number
//   draftTemplates  : number
//   totalDays       : number — sum across all templates
//   totalMeals      : number — sum across all templates + all days
//   totalFoods      : number — sum across all templates + days + meals
// }
//
// Backend integration: replace with GET /diets/stats and populate same shape.
export const selectDietTemplateStats = createSelector(
  selectTemplatesList,
  (templates) => {
    const totalTemplates  = templates.length;
    const activeTemplates = templates.filter((t) => t.status === 'active').length;
    const draftTemplates  = templates.filter((t) => t.status === 'draft').length;

    let totalDays  = 0;
    let totalMeals = 0;
    let totalFoods = 0;

    for (const t of templates) {
      totalDays += t.days.length;
      for (const d of t.days) {
        totalMeals += d.meals.length;
        for (const m of d.meals) {
          totalFoods += m.foods.length;
        }
      }
    }

    return {
      totalTemplates,
      activeTemplates,
      draftTemplates,
      totalDays,
      totalMeals,
      totalFoods,
    };
  },
);

// Convenience — avoids repeating (state) => state.diets.templates everywhere
export const selectAllDietTemplates = selectTemplatesList;
