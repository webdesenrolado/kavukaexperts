export {
  computeSkillsIndex,
  BAND_LABEL_PT as SKILLS_BAND_LABEL_PT,
} from "./skills-index";
export type { SkillRow, SkillsIndexResult } from "./skills-index";

export {
  computeBehavioralIndex,
  BEHAVIORAL_BAND_LABEL_PT,
} from "./behavioral-index";
export type { AssessmentSnapshot, BehavioralIndexResult } from "./behavioral-index";

export { generateNarrative } from "./narrative";
export type { NarrativeInputs, ICHNarrative } from "./narrative";
