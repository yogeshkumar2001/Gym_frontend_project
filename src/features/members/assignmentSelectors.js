// ─── Assignment Selectors ─────────────────────────────────────────────────────
// Parameterized selectors for per-member workout and diet assignment state.
//
// These are plain functions (not createSelector) because they accept a runtime
// memberId parameter. For performance-sensitive use, wrap with useMemo or
// convert to selector factories when member lists grow large.
//
// All selectors use String() comparison so they work regardless of whether
// IDs are numbers (seed data) or strings (nanoid).
//
// Backend integration: replace with GET /members/:id/assignments
// and populate the same { workoutAssignments, dietAssignments } shape.

// ─── Shared helper ────────────────────────────────────────────────────────────
const findMember = (state, memberId) =>
  state.members.list.find((m) => String(m.id) === String(memberId)) ?? null;

// ─── Workout selectors ────────────────────────────────────────────────────────

export const selectMemberById = (state, memberId) =>
  findMember(state, memberId);

export const selectActiveWorkout = (state, memberId) => {
  const member = findMember(state, memberId);
  if (!member) return null;
  return (member.workoutAssignments ?? []).find((a) => a.status === 'active') ?? null;
};

export const selectWorkoutHistory = (state, memberId) => {
  const member = findMember(state, memberId);
  if (!member) return [];
  return (member.workoutAssignments ?? [])
    .filter((a) => a.status === 'completed')
    .slice()
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
};

// ─── Diet selectors ───────────────────────────────────────────────────────────

export const selectActiveDiet = (state, memberId) => {
  const member = findMember(state, memberId);
  if (!member) return null;
  return (member.dietAssignments ?? []).find((a) => a.status === 'active') ?? null;
};

export const selectDietHistory = (state, memberId) => {
  const member = findMember(state, memberId);
  if (!member) return [];
  return (member.dietAssignments ?? [])
    .filter((a) => a.status === 'completed')
    .slice()
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
};
