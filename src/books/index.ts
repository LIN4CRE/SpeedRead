import { FullBookDef, BookChapter } from './types';
import { ALICE_IN_WONDERLAND_FULL } from './aliceInWonderland';
import { PETER_PAN_FULL } from './peterPan';
import { FAIRY_TALES_FOR_KIDS } from './fairytalesForKids';
import { WIZARD_OF_OZ_FULL } from './wizardOfOz';
import { AESOP_FABLES_FOR_KIDS } from './aesopFables';
import { TIME_MACHINE_FULL } from './timeMachine';
import { JEKYLL_AND_HYDE_FULL } from './jekyllAndHyde';
import { ART_OF_WAR_FULL } from './artOfWar';
import { METAMORPHOSIS_FULL } from './metamorphosis';
import { SHERLOCK_HOLMES_FULL } from './sherlockHolmes';
import { CHRISTMAS_CAROL_FULL } from './christmasCarol';

export {
  ALICE_IN_WONDERLAND_FULL,
  PETER_PAN_FULL,
  FAIRY_TALES_FOR_KIDS,
  WIZARD_OF_OZ_FULL,
  AESOP_FABLES_FOR_KIDS,
  TIME_MACHINE_FULL,
  JEKYLL_AND_HYDE_FULL,
  ART_OF_WAR_FULL,
  METAMORPHOSIS_FULL,
  SHERLOCK_HOLMES_FULL,
  CHRISTMAS_CAROL_FULL,
};
export type { FullBookDef, BookChapter };

export const ALL_FULL_BOOKS: FullBookDef[] = [
  // Sci-Fi, Gothic & Thrillers
  TIME_MACHINE_FULL,
  JEKYLL_AND_HYDE_FULL,
  SHERLOCK_HOLMES_FULL,
  
  // Philosophy & Wisdom
  ART_OF_WAR_FULL,
  
  // World Literature & Drama
  METAMORPHOSIS_FULL,
  CHRISTMAS_CAROL_FULL,
  
  // Youth & Whimsical Classics
  ALICE_IN_WONDERLAND_FULL,
  PETER_PAN_FULL,
  WIZARD_OF_OZ_FULL,
  FAIRY_TALES_FOR_KIDS,
  AESOP_FABLES_FOR_KIDS,
];
