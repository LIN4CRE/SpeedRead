import { DocumentSource, DocumentChapter } from '../types/reader';
import { tokenizeText } from './orp';

export interface SampleBookDef {
  id: string;
  title: string;
  author: string;
  category: string;
  chapters: { title: string; text: string }[];
}

export const SAMPLE_LIBRARY: SampleBookDef[] = [
  {
    id: 'sample-harry-potter-ch1',
    title: "Harry Potter & the Sorcerer's Stone",
    author: 'J.K. Rowling',
    category: 'Featured Fantasy Book',
    chapters: [
      {
        title: 'Chapter 1: The Boy Who Lived (Part 1 - Privet Drive)',
        text: `Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.

The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere. The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it. They didn't think they could bear it if anyone found out about the Potters.

Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be.`
      },
      {
        title: 'Chapter 1: The Boy Who Lived (Part 2 - The Cat on the Wall)',
        text: `When Mr. and Mrs. Dursley woke up on the dull, gray Tuesday our story starts, there was nothing about the cloudy sky outside to suggest that strange and mysterious things would soon be happening all over the country.

Mr. Dursley hummed as he picked out his most boring tie for work, and Mrs. Dursley gossiped away happily as she wrestled a screaming Dudley into his high chair. None of them noticed a large, tawny owl flutter past the window.

At half past eight, Mr. Dursley picked up his briefcase, pecked Mrs. Dursley on the cheek, and tried to kiss Dudley good-bye but missed, because Dudley was now having a tantrum and throwing his cereal at the walls. "Little tyke," chortled Mr. Dursley as he left the house. He got into his car and backed out of number four's drive.

It was on the corner of the street that he noticed the first sign of something peculiar—a cat reading a map. For a second, Mr. Dursley didn't realize what he had seen—then he jerked his head around to look again. There was a tabby cat standing on the corner of Privet Drive, but there wasn't a map in sight. What could he have been thinking of? It must have been a trick of the light.`
      },
      {
        title: 'Chapter 1: The Boy Who Lived (Part 3 - Albus Dumbledore)',
        text: `A man appeared on the corner the cat had been watching, appeared so suddenly and silently you'd have thought he'd just popped out of the ground. The cat's tail twitched and its eyes narrowed.

Nothing like this man had ever been seen on Privet Drive. He was tall, thin, and very old, judging by the silver of his hair and beard, which were both long enough to tuck into his belt. He was wearing long robes, a purple cloak that swept the ground, and high-heeled, buckled boots. His blue eyes were light, bright, and sparkling behind half-moon spectacles and his nose was very long and crooked, as though it had been broken at least twice. This man's name was Albus Dumbledore.

Albus Dumbledore didn't seem to realize that he had just arrived in a street where everything from his name to his boots was unwelcome. He was busy rummaging in his cloak, looking for something. But he did seem to realize he was being watched, because he looked up suddenly at the cat, which was still staring at him from the other end of the street. For some reason, the sight of the cat seemed to amuse him. He chuckled and muttered, "I should have known."

He had found what he was looking for in his inside pocket. It seemed to be a silver cigarette lighter. He flicked it open, held it up in the air, and clicked it. The nearest street lamp went out with a little pop. He clicked it again; the next lamp flickered into darkness. Twelve times he clicked the Put-Outer, until the only lights left on the whole street were two tiny pinpricks in the distance, which were the eyes of the cat watching him.`
      }
    ]
  },
  {
    id: 'sample-video-speed-challenge',
    title: 'The 600 WPM Speed Reader Drill (From the Video)',
    author: 'RSVP Perception Coach',
    category: 'Video Speed Test',
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

Stick with this rhythm, and reading full books like Harry Potter will become effortless.`
      }
    ]
  },
  {
    id: 'sample-speed-reading-science',
    title: 'The Neuroscience of RSVP & ORP',
    author: 'Cognitive Science Research Group',
    category: 'Science & Speed Reading',
    chapters: [
      {
        title: 'Chapter 1: The Anatomy of an Eye Fixation',
        text: `Traditional reading feels smooth and continuous, but in reality, our eyes make erratic, jerky jumps known as saccades. During typical reading, your eyes fixate on a cluster of letters for roughly two hundred to two hundred and fifty milliseconds before jumping to the next word.

Crucially, roughly twenty percent of reading time is wasted on involuntary regression—unconscious backward skips where your eyes re-scan words they just processed. 

Rapid Serial Visual Presentation, or RSVP, completely eliminates eye saccades. By flashing words sequentially at a single designated physical coordinate, your fovea centralis—the high-acuity core of your retina—remains completely stationary. When cognitive energy is liberated from physical ocular motion, your brain can redirect its full computational bandwidth toward semantics, synthesis, and comprehension.`
      },
      {
        title: 'Chapter 2: The Optimal Recognition Point (ORP)',
        text: `Every printed word possesses a physiological focal center known as the Optimal Recognition Point (ORP). Decades of psycholinguistic research reveal that when the eye lands approximately one-third of the way into a word—usually the second or third letter—the visual cortex identifies the entire word in a fraction of the time.

By calculating the mathematical ORP for every incoming word and aligning that specific character against a fixed visual reticle, the eye stays in a state of frictionless kinetic focus. The brain absorbs vocabulary at speeds exceeding six hundred to eight hundred words per minute without fatigue.`
      }
    ]
  },
  {
    id: 'sample-time-machine',
    title: 'The Time Machine',
    author: 'H. G. Wells',
    category: 'Classic Sci-Fi',
    chapters: [
      {
        title: 'Chapter 1: The Fourth Dimension',
        text: `The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burnt brightly, and the soft radiance of the incandescent lights caught the bubbles that flashed and passed in our glasses.

"You must follow me carefully," he said. "I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."

"Is not that rather a large thing to expect us to begin upon?" said Filby, an argumentative person with red hair.

"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. Nor has a mathematical plane. These things are mere abstractions."`
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
