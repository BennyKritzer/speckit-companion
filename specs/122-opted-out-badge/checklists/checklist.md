# Specification Quality Checklist: Opted Out Badge Navigation

**Purpose**: Validate the specification quality of the compact opted-out badge requirements before planning implementation
**Created**: 2026-06-08
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are the unrun and run states for optional steps both described clearly enough to cover the full badge lifecycle? [Completeness, Spec §FR-001-007]
- [ ] CHK002 Are all optional steps covered by the badge behavior, including any custom workflows that mark steps optional? [Completeness, Assumption, Spec §FR-006]
- [ ] CHK003 Are required steps explicitly excluded from the new compact badge treatment? [Completeness, Spec §FR-004]

## Requirement Clarity

- [ ] CHK004 Is "compact" defined clearly enough to distinguish the new indicator from the current optional label presentation? [Clarity, Spec §FR-002, Spec §FR-005]
- [ ] CHK005 Is the "compact icon or OO badge" fallback rule precise enough to avoid conflicting interpretations? [Ambiguity, Spec §FR-002]
- [ ] CHK006 Are "unrun", "run", and "skipped" used consistently enough that the badge state is unambiguous? [Clarity, Assumption]

## Requirement Consistency

- [ ] CHK007 Do the requirements for showing, hiding, and removing the badge align across FR-001, FR-003, and FR-007? [Consistency, Spec §FR-001-007]
- [ ] CHK008 Do the acceptance scenarios match the stated assumptions about skipped optional steps counting as opted out? [Consistency, Spec §Assumptions]
- [ ] CHK009 Is the normal step presentation after a run consistent with the success criteria for updated states? [Consistency, Spec §SC-002]

## Scenario Coverage

- [ ] CHK010 Are multi-step navigation cases covered, including the case where multiple optional steps are unrun at the same time? [Coverage, Edge Case]
- [ ] CHK011 Are narrow-navigation / limited-space cases covered well enough to justify the compact badge requirement? [Coverage, Spec §Edge Cases]
- [ ] CHK012 Are retroactive run scenarios covered so the badge disappears immediately after the optional step is executed? [Coverage, Spec §FR-007]

## Acceptance Criteria Quality

- [ ] CHK013 Is "visually smaller" measurable enough to support objective verification? [Measurability, Spec §FR-005]
- [ ] CHK014 Can the absence of the badge on run optional steps be verified without relying on subjective interpretation? [Measurability, Spec §FR-003, Spec §SC-002]
- [ ] CHK015 Do the success criteria describe a testable difference between unrun and run optional steps without opening the step? [Measurability, Spec §SC-001, Spec §SC-004]

## Dependencies & Assumptions

- [ ] CHK016 Are the viewer navigation rendering and optional-step state-tracking dependencies identified clearly enough for implementation planning? [Dependencies]
- [ ] CHK017 Is the assumption that existing optional metadata already exists and can be reused stated clearly enough to avoid schema changes? [Assumption, Spec §FR-002]

## Notes

- Check items off as they are validated: `[x]`
- Add comments or findings inline when a requirement needs refinement
- Items are numbered sequentially for easy reference