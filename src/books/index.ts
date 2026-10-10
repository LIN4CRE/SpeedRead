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
import { DRACULA_FULL } from './dracula';
import { CARMILLA_FULL } from './carmilla';
import { IRON_HEEL_FULL } from './ironHeel';
import { MACHINE_STOPS_FULL } from './machineStops';
import { LOST_WORLD_FULL } from './lostWorld';
import { SECRET_GARDEN_FULL } from './secretGarden';
import { DOCTOR_MOREAU_FULL } from './doctorMoreau';
import { JOURNEY_CENTRE_EARTH_FULL } from './journeyToCentreOfEarth';

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
  DRACULA_FULL,
  CARMILLA_FULL,
  IRON_HEEL_FULL,
  MACHINE_STOPS_FULL,
  LOST_WORLD_FULL,
  SECRET_GARDEN_FULL,
  DOCTOR_MOREAU_FULL,
  JOURNEY_CENTRE_EARTH_FULL,
};
export type { FullBookDef, BookChapter };

export const ALL_FULL_BOOKS: FullBookDef[] = [
  // Gothic, Vampire & Thriller Classics
  DRACULA_FULL,
  CARMILLA_FULL,
  JEKYLL_AND_HYDE_FULL,
  SHERLOCK_HOLMES_FULL,

  // Dystopian & Speculative Sci-Fi Classics
  DOCTOR_MOREAU_FULL,
  IRON_HEEL_FULL,
  MACHINE_STOPS_FULL,
  TIME_MACHINE_FULL,
  LOST_WORLD_FULL,
  JOURNEY_CENTRE_EARTH_FULL,
  
  // Philosophy & Wisdom
  ART_OF_WAR_FULL,
  
  // World Literature & Drama
  METAMORPHOSIS_FULL,
  CHRISTMAS_CAROL_FULL,
  
  // Youth, Fantasy & Wonder Classics
  SECRET_GARDEN_FULL,
  ALICE_IN_WONDERLAND_FULL,
  PETER_PAN_FULL,
  WIZARD_OF_OZ_FULL,
  FAIRY_TALES_FOR_KIDS,
  AESOP_FABLES_FOR_KIDS,
];
