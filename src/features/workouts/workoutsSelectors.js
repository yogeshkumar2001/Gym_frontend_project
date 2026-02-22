import { createSelector } from '@reduxjs/toolkit';

// ─── Raw input selector ───────────────────────────────────────────────────────
const selectTemplatesList = (state) => state.workouts.templates;

// ─── selectWorkoutTemplateStats ───────────────────────────────────────────────
// Aggregates high-level stats from the templates list.
//
// Returns:
// {
//   totalTemplates   : number
//   activeTemplates  : number
//   draftTemplates   : number
//   totalExercises   : number   — across all templates + all days
//   totalDays        : number   — across all templates
// }
//
// Backend integration: replace with GET /workouts/stats and populate same shape.
export const selectWorkoutTemplateStats = createSelector(
  selectTemplatesList,
  (templates) => {
    const totalTemplates  = templates.length;
    const activeTemplates = templates.filter((t) => t.status === 'active').length;
    const draftTemplates  = templates.filter((t) => t.status === 'draft').length;

    let totalDays      = 0;
    let totalExercises = 0;

    for (const t of templates) {
      totalDays += t.days.length;
      for (const d of t.days) {
        totalExercises += d.exercises.length;
      }
    }

    return { totalTemplates, activeTemplates, draftTemplates, totalDays, totalExercises };
  },
);

// Convenience — just the raw list (avoids repetitive (state) => state.workouts.templates)
export const selectAllTemplates = selectTemplatesList;
