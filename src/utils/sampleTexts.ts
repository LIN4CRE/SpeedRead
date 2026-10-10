import { DocumentSource, DocumentChapter } from '../types/reader';
import { tokenizeText } from './orp';
import { 
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
} from '../books';

export interface SampleBookDef {
  id: string;
  title: string;
  author: string;
  category: string;
  description?: string;
  chapters: { title: string; text: string }[];
}

export const SAMPLE_LIBRARY: SampleBookDef[] = [
  // Sci-Fi, Gothic & Adventure Classics (Full Unabridged Books)
  {
    id: TIME_MACHINE_FULL.id,
    title: TIME_MACHINE_FULL.title,
    author: TIME_MACHINE_FULL.author,
    category: TIME_MACHINE_FULL.category,
    description: TIME_MACHINE_FULL.description,
    chapters: TIME_MACHINE_FULL.chapters,
  },
  {
    id: JEKYLL_AND_HYDE_FULL.id,
    title: JEKYLL_AND_HYDE_FULL.title,
    author: JEKYLL_AND_HYDE_FULL.author,
    category: JEKYLL_AND_HYDE_FULL.category,
    description: JEKYLL_AND_HYDE_FULL.description,
    chapters: JEKYLL_AND_HYDE_FULL.chapters,
  },
  {
    id: SHERLOCK_HOLMES_FULL.id,
    title: SHERLOCK_HOLMES_FULL.title,
    author: SHERLOCK_HOLMES_FULL.author,
    category: SHERLOCK_HOLMES_FULL.category,
    description: SHERLOCK_HOLMES_FULL.description,
    chapters: SHERLOCK_HOLMES_FULL.chapters,
  },
  {
    id: 'sample-frankenstein',
    title: 'Frankenstein; or, The Modern Prometheus',
    author: 'Mary Shelley',
    category: 'Gothic Sci-Fi Classic',
    description: 'The defining gothic sci-fi masterpiece by Mary Shelley following Victor Frankenstein and his creature.',
    chapters: [
      {
        title: 'Chapter 1: Ancestry & Early Years',
        text: `I am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics, and my father had filled several public situations with honour and reputation. He was respected by all who knew him for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; nor was it until the decline of life that he thought of marrying, and bestowing on the State sons who might carry his virtues and his name down to other generations.

As the circumstances of his marriage illustrate his character, I cannot refrain from relating them. One of his most intimate friends was a merchant who, from a flourishing state, fell, through numerous mischances, into poverty. This man, whose name was Beaufort, was of a proud and unbending disposition and could not bear to live in poverty and oblivion in the same country where he had once been distinguished for his rank and magnificence. Having paid his debts, therefore, in the most honourable manner, he retreated with his daughter to the town of Lucerne, where he lived unknown and in wretchedness. My father loved Beaufort with the truest friendship and was deeply grieved by his retreat in these unfortunate circumstances. He bitterly deplored the false pride which led his friend to a conduct so little worthy of the affection that united them. He lost no time in endeavouring to seek him out, with the hope of persuading him to begin the world again through his credit and assistance.`
      },
      {
        title: 'Chapter 2: Elizabeth & Childhood Studies',
        text: `We were brought up together; there was not quite a year difference in our ages. I need not say that we were strangers to any species of disunion or dispute. Harmony was the soul of our companionship, and the diversity and contrast that subsided in our characters drew us nearer together. Elizabeth was of a calmer and more concentrated disposition; but, with all my ardour, I was capable of a more intense application and was more deeply smitten with the thirst for knowledge. She busied herself with following the aerial creations of the poets; and in the majestic and wondrous scenes which surrounded our Swiss home—the sublime shapes of the mountains, the changes of the seasons, tempest and calm, the silence of winter, and the life and turbulence of our Alpine summers—she found ample scope for admiration and delight.

While my companion contemplated with a serious and satisfied spirit the magnificent appearances of things, I delighted in investigating their causes. The world was to me a secret which I desired to divine. Curiosity, earnest research to learn the hidden laws of nature, gladness akin to rapture, as they were unfolded to me, are among the earliest sensations I can remember.`
      },
      {
        title: 'Chapter 3: The University of Ingolstadt',
        text: `When I had attained the age of seventeen, my parents resolved that I should become a student at the university of Ingolstadt. I had hitherto attended the schools of Geneva, but my father thought it necessary for the completion of my education that I should be made acquainted with other customs than those of my native country. My departure was therefore fixed at an early date, but before the day resolved upon could arrive, the first misfortune of my life occurred—an omen, as it were, of my future misery.

Elizabeth had caught the scarlet fever; her illness was severe, and she was in the greatest danger. During her illness many arguments had been urged to persuade my mother to refrain from attending upon her. My mother yielded to our entreaties, but when she heard that the life of her favourite was menaced, she could no longer control her anxiety. She attended her sickbed; her watchful attentions triumphed over the malignity of the distemper—Elizabeth was saved, but the consequences of this imprudence were fatal to her preserver.

On the third day my mother sickened; her fever was accompanied by the most alarming symptoms, and the looks of her medical attendants proved that there was little hope. On her deathbed the fortitude and benignity of this best of women did not desert her. She joined the hands of Elizabeth and myself. "My children," she said, "my firmest hopes of future happiness were placed on the prospect of your union. This expectation will now be the consolation of your father. Elizabeth, my love, you must supply my place to my younger children."

She died calmly, and her countenance expressed affection even in death. I need not describe the feelings of those whose dearest ties are rent by that most irreparable evil, the void that presents itself to the soul, and the despair that is exhibited on the countenance.`
      },
      {
        title: 'Chapter 4: The Secret of Life & Creation',
        text: `From this day natural philosophy, and particularly chemistry, in the most comprehensive sense of the term, became nearly my sole occupation. I read with ardour those works, so full of genius and discrimination, which modern inquirers have written on these subjects. I attended the lectures and cultivated the acquaintance of the celebrated professors of the university. M. Waldman inflicted on me the utmost delight, and in his companionable and encouraging voice I found an incentive that gave irresistible velocity to my pursuits.

One of the phenomena which had peculiarly attracted my attention was the structure of the human frame, and, indeed, any animal endued with life. Whence, I often asked myself, did the principle of life proceed? It was a bold question, and one which has ever been considered as a mystery; yet with how many things are we upon the brink of becoming acquainted, if cowardice or carelessness did not restrain our inquiries.

To examine the causes of life, we must first have recourse to death. I became acquainted with the science of anatomy, but this was not sufficient; I must also observe the natural decay and corruption of the human body. In my education my father had taken the greatest precautions that my mind should be impressed with no supernatural horrors. Darkness had no effect upon my fancy, and a churchyard was to me merely the receptacle of bodies deprived of life. Now I was led to examine the cause and progress of this decay and forced to spend days and nights in vaults and charnel-houses.

After days and nights of incredible labour and fatigue, I succeeded in discovering the cause of generation and life; nay, more, I became myself capable of bestowing animation upon lifeless matter.`
      }
    ]
  },

  // Philosophy, Strategy & Literature Classics (Full Unabridged Books)
  {
    id: ART_OF_WAR_FULL.id,
    title: ART_OF_WAR_FULL.title,
    author: ART_OF_WAR_FULL.author,
    category: ART_OF_WAR_FULL.category,
    description: ART_OF_WAR_FULL.description,
    chapters: ART_OF_WAR_FULL.chapters,
  },
  {
    id: METAMORPHOSIS_FULL.id,
    title: METAMORPHOSIS_FULL.title,
    author: METAMORPHOSIS_FULL.author,
    category: METAMORPHOSIS_FULL.category,
    description: METAMORPHOSIS_FULL.description,
    chapters: METAMORPHOSIS_FULL.chapters,
  },
  {
    id: CHRISTMAS_CAROL_FULL.id,
    title: CHRISTMAS_CAROL_FULL.title,
    author: CHRISTMAS_CAROL_FULL.author,
    category: CHRISTMAS_CAROL_FULL.category,
    description: CHRISTMAS_CAROL_FULL.description,
    chapters: CHRISTMAS_CAROL_FULL.chapters,
  },

  // Beginner & Children's Famous Classics (Complete Books)
  {
    id: FAIRY_TALES_FOR_KIDS.id,
    title: FAIRY_TALES_FOR_KIDS.title,
    author: FAIRY_TALES_FOR_KIDS.author,
    category: FAIRY_TALES_FOR_KIDS.category,
    description: FAIRY_TALES_FOR_KIDS.description,
    chapters: FAIRY_TALES_FOR_KIDS.chapters,
  },
  {
    id: PETER_PAN_FULL.id,
    title: PETER_PAN_FULL.title,
    author: PETER_PAN_FULL.author,
    category: PETER_PAN_FULL.category,
    description: PETER_PAN_FULL.description,
    chapters: PETER_PAN_FULL.chapters,
  },
  {
    id: ALICE_IN_WONDERLAND_FULL.id,
    title: ALICE_IN_WONDERLAND_FULL.title,
    author: ALICE_IN_WONDERLAND_FULL.author,
    category: ALICE_IN_WONDERLAND_FULL.category,
    description: ALICE_IN_WONDERLAND_FULL.description,
    chapters: ALICE_IN_WONDERLAND_FULL.chapters,
  },
  {
    id: WIZARD_OF_OZ_FULL.id,
    title: WIZARD_OF_OZ_FULL.title,
    author: WIZARD_OF_OZ_FULL.author,
    category: WIZARD_OF_OZ_FULL.category,
    description: WIZARD_OF_OZ_FULL.description,
    chapters: WIZARD_OF_OZ_FULL.chapters,
  },
  {
    id: AESOP_FABLES_FOR_KIDS.id,
    title: AESOP_FABLES_FOR_KIDS.title,
    author: AESOP_FABLES_FOR_KIDS.author,
    category: AESOP_FABLES_FOR_KIDS.category,
    description: AESOP_FABLES_FOR_KIDS.description,
    chapters: AESOP_FABLES_FOR_KIDS.chapters,
  },

  // Video Speed Training Drills & Neuroscience
  {
    id: 'sample-video-speed-challenge',
    title: 'The 600 WPM Speed Reader Drill (From the Video)',
    author: 'RSVP Perception Coach',
    category: 'Video Speed Test',
    description: 'The viral RSVP training drill guiding the reader from 300 to 900 WPM with focal tracking.',
    chapters: [
      {
        title: 'Full Video Training Drill (300 to 900 WPM)',
        text: `Let's see if you can keep up with this reading test. 

The average person reads around 200 to 250 words per minute. So this is already faster than average. 

Anyway, let's keep going. We're going to kind of pick up the pace a bit. 

Try not to move your eyes across every single word. The trick is to use your peripheral vision to take it all in. Focus your eyes on the red letters in the center of the frame. 

This technique is called RSVP, which stands for Rapid Serial Visual Presentation. The basic idea is simple: instead of having your eyes scan across a line of text, the words appear one by one in the exact same spot. 

This saves your eyes time when reading because your eyes make brief stops called fixations, and moving between words takes time. 

By eliminating saccades, RSVP lets your brain process information much faster. 

You are now cruising at 600 words per minute! 

Notice how quiet your inner voice gets. That inner voice is called subvocalization. When you read traditionally, you pronounce each word in your head. But your brain can comprehend visual symbols far faster than your vocal chords can pronounce them. 

Once you let go of vocalizing, reading feels like direct neural streaming. You don't read words—you absorb pure ideas, imagery, and narrative. 

Stick with this rhythm, and reading full books from start to finish will become second nature.`
      }
    ]
  },
  {
    id: 'sample-speed-reading-science',
    title: 'The Neuroscience of RSVP & ORP',
    author: 'Cognitive Science Research Group',
    category: 'Science & Speed Reading',
    description: 'Scientific overview of eye saccades, foveal fixations, and optimal recognition points.',
    chapters: [
      {
        title: 'Chapter 1: The Anatomy of an Eye Fixation',
        text: `Traditional reading feels smooth and continuous, but in reality, our eyes make erratic, jerky jumps known as saccades. During typical reading, your eyes fixate on a cluster of letters for roughly two hundred to two hundred and fifty milliseconds before jumping to the next word.

Crucially, roughly twenty percent of reading time is wasted on involuntary regression—unconscious backward skips where your eyes re-scan words they just processed. 

Rapid Serial Visual Presentation, or RSVP, completely eliminates eye saccades. By flashing words sequentially at a single designated physical coordinate, your fovea centralis—the high-acuity core of your retina—remains completely stationary. When cognitive energy is liberated from physical ocular motion, your brain can redirect its full computational bandwidth toward semantics, synthesis, and comprehension.`
      }
    ]
  }
];

export function createDocumentFromSample(sampleDef: SampleBookDef): DocumentSource {
  const allWords = [];
  const chapters: DocumentChapter[] = [];
  let fullText = '';

  for (let cIdx = 0; cIdx < sampleDef.chapters.length; cIdx++) {
    const chap = sampleDef.chapters[cIdx];
    const startWordIndex = allWords.length;
    const words = tokenizeText(chap.text, cIdx, 1, startWordIndex);
    allWords.push(...words);
    
    fullText += (fullText ? '\n\n' : '') + `=== ${chap.title} ===\n` + chap.text;

    chapters.push({
      id: `chap-${cIdx}`,
      title: chap.title,
      startWordIndex,
      wordCount: words.length,
      pageNumber: cIdx + 1,
    });
  }

  return {
    id: sampleDef.id,
    title: sampleDef.title,
    author: sampleDef.author,
    type: 'sample',
    totalPages: chapters.length,
    totalWords: allWords.length,
    chapters,
    rawText: fullText,
    words: allWords,
    dateAdded: Date.now(),
  };
}
