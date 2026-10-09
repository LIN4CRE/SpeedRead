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

Stick with this rhythm, and reading full books from start to finish will become second nature.`
      }
    ]
  },
  {
    id: 'sample-alice-in-wonderland',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    category: 'Classic Fantasy Novel',
    chapters: [
      {
        title: 'Chapter 1: Down the Rabbit-Hole',
        text: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.`
      },
      {
        title: 'Chapter 2: The Pool of Tears',
        text: `"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I'm opening out like the largest telescope that ever was! Good-bye, feet!" (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). "Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can;—but I must be kind to them," thought Alice, "or perhaps they won't walk the way I want to go! Let me see: I'll give them a new pair of boots every Christmas."

And she went on planning to herself how she would manage it. "They must go by the carrier," she thought; "and how funny it'll seem, sending presents to one's own feet! And how odd the directions will look!

Alice's Right Foot, Esq.
Hearthrug,
near the Fender,
(with Alice's love).

Oh dear, what nonsense I'm talking!"`
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

"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. They taught you that? Nor has a mathematical plane. These things are mere abstractions."`
      }
    ]
  },
  {
    id: 'sample-sherlock-holmes',
    title: 'A Scandal in Bohemia',
    author: 'Arthur Conan Doyle',
    category: 'Mystery Classic',
    chapters: [
      {
        title: 'Chapter 1: The Woman',
        text: `To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.`
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
