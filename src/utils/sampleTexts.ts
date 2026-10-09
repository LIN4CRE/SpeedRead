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
    id: 'sample-harry-potter-book-1',
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
    category: 'Fantasy Masterpiece',
    chapters: [
      {
        title: 'Chapter 1: The Boy Who Lived',
        text: `Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors. The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere.

The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it. They didn't think they could bear it if anyone found out about the Potters. Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be.

When Mr. and Mrs. Dursley woke up on the dull, gray Tuesday our story starts, there was nothing about the cloudy sky outside to suggest that strange and mysterious things would soon be happening all over the country. Mr. Dursley hummed as he picked out his most boring tie for work, and Mrs. Dursley gossiped away happily as she wrestled a screaming Dudley into his high chair.

None of them noticed a large, tawny owl flutter past the window.

At half past eight, Mr. Dursley picked up his briefcase, pecked Mrs. Dursley on the cheek, and tried to kiss Dudley good-bye but missed, because Dudley was now having a tantrum and throwing his cereal at the walls. "Little tyke," chortled Mr. Dursley as he left the house. He got into his car and backed out of number four's drive.

It was on the corner of the street that he noticed the first sign of something peculiar—a cat reading a map. For a second, Mr. Dursley didn't realize what he had seen—then he jerked his head around to look again. There was a tabby cat standing on the corner of Privet Drive, but there wasn't a map in sight. What could he have been thinking of? It must have been a trick of the light. Mr. Dursley blinked and stared at the cat. It stared back.

As Mr. Dursley drove around the corner and up the road, he watched the cat in his mirror. It was now reading the sign that said Privet Drive—no, looking at the sign; cats couldn't read maps or signs. Mr. Dursley gave himself a little shake and put the cat out of his mind.

As he drove toward town he thought of nothing except a large order of drills he was hoping to get that day. But on the edge of town, drills were driven out of his mind by something else. As he sat in the usual morning traffic jam, he couldn't help noticing that there seemed to be a lot of strangely dressed people about. People in cloaks. Mr. Dursley couldn't bear people who dressed in funny clothes—the young people with their wild fashions! He supposed this was some stupid new fashion. He drummed his fingers on the steering wheel and his eyes fell on a huddle of these weirdos standing quite close by. They were whispering excitedly together. Mr. Dursley was enraged to see that a couple of them weren't young at all; why, that man had to be older than he was, and wearing an emerald-green cloak! The nerve of him! But then it struck Mr. Dursley that this might be some silly stunt—these people were obviously collecting for something... yes, that would be it. The traffic moved on and a few minutes later, Mr. Dursley arrived in the Grunnings parking lot, his mind back on drills.

It was in his office on the ninth floor that Mr. Dursley always sat with his back to the window. If he hadn't, he might have found it a lot harder to concentrate on drills that morning. He didn't see the owls swooping past in broad daylight, though people down in the street did; they pointed and gazed open-mouthed as owl after owl sped overhead. Most of them had never seen an owl even at night.

Mr. Dursley, however, had a perfectly normal, owl-free morning. He yelled at five different people. He made several important telephone calls and shouted a bit more. He was in a very good mood until lunchtime, when he thought he'd stretch his legs and walk across the road to buy himself a bun from the bakery.

He'd forgotten all about the people in cloaks until he passed a group of them next to the baker's. He eyed them angrily as he passed. He didn't know why, but they made him uneasy. This bunch were whispering excitedly, too, and he couldn't see a single collecting tin. It was on his way back past them, clutching a large doughnut in a bag, that he caught a few words of what they were saying.

"The Potters, that's right, that's what I heard—"
"—yes, their son, Harry—"

Mr. Dursley stopped dead. Fear flooded him. He looked back at the whisperers as if he wanted to say something to them, but thought better of it. He hurried back across the street, rushed up to his office, snapped at his secretary not to disturb him, seized his telephone, and had almost finished dialing his home number when he changed his mind. He put the receiver back down and stroked his mustache, thinking... no, he was being stupid. Potter wasn't such an unusual name. He was quite sure there were lots of people called Potter who had a son called Harry. Come to think of it, he wasn't even sure his nephew was called Harry. He'd never even seen the boy. It might have been Harvey. Or Harold. There was no point in worrying Mrs. Dursley; she always got so upset at any mention of her sister. He didn't blame her—if he'd had a sister like that... but all the same, those people in cloaks...

He found it a lot harder to concentrate on drills that afternoon and when he left the building at five o'clock, he was still so worried that he walked straight into someone just outside the door.

"Sorry," he grunted, as the tiny old man stumbled and almost fell. It was a few seconds before Mr. Dursley realized that the man was wearing a violet cloak. He didn't seem at all upset at being almost knocked to the ground. On the contrary, his face split into a wide smile and he said in a squeaky voice that made passersby stare, "Don't be sorry, my dear sir, for nothing could upset me today! Rejoice, for You-Know-Who has gone at last! Even Muggles like yourself should be celebrating, this happy, happy day!"

And the old man hugged Mr. Dursley around the middle and walked off.

Mr. Dursley stood rooted to the spot. He had been hugged by a complete stranger. He also thought he had been called a Muggle, whatever that was. He was rattled. He hurried to his car and set off for home, hoping he was imagining things, which he had never hoped before, because he didn't approve of imagination.`
      },
      {
        title: 'Chapter 2: The Vanishing Glass',
        text: `Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step, but Privet Drive had hardly changed at all. The sun rose on the same tidy front gardens and lit up the brass number four on the Dursleys' front door; it crept into their living room, which was almost exactly the same as it had been on the night when Mr. Dursley had seen that fateful news report about the owls. Only the photographs on the mantelpiece showed how much time had passed. Ten years ago, there had been lots of pictures of what looked like a large pink beach ball wearing different-colored bonnets—but Dudley Dursley was no longer a baby, and now the photographs showed a large blond boy riding his first bicycle, on a carousel at the fair, playing a computer game with his father, being hugged and kissed by his mother. There was no sign that another boy lived in the house, too.

Yet Harry Potter was still there, asleep at the moment, but not for long. His Aunt Petunia was awake and it was her shrill voice that made the first noise of the day.

"Up! Get up! Now!"

Harry woke with a start. His aunt rapped on the door again.

"Up!" she screeched. Harry heard her walking toward the kitchen and then the sound of the frying pan being put on the stove. He rolled onto his back and tried to remember the dream he had been having. It had been a good one. There had been a flying motorcycle in it. He had a strange feeling he'd had the same dream before.

His aunt was back outside the door.

"Are you up yet?" she demanded.

"Nearly," said Harry.

"Well, get a move on, I want you to look after the bacon. And don't you dare let it burn, I want everything perfect on Duddy's birthday."

Harry groaned.

"What did you say?" his aunt snapped through the door.

"Nothing, nothing..."

Dudley's birthday—how could he have forgotten? Harry got slowly out of bed and started looking for socks. He found a pair under his bed and, after pulling a spider off one of them, put them on. Harry was used to spiders, because the cupboard under the stairs was full of them, and that was where he slept.

When he was dressed he went down the hall into the kitchen. The table was almost hidden beneath all Dudley's birthday presents. It looked as though Dudley had gotten the new computer he wanted, not to mention the second television and the racing bike. Exactly why Dudley wanted a racing bike was a mystery to Harry, as Dudley was very fat and hated exercise—unless of course it involved punching somebody. Dudley's favorite punching bag was Harry, but he couldn't often catch him. Harry didn't look it, but he was very fast.

Perhaps it had something to do with living in a dark cupboard, but Harry had always been small and skinny for his age. He looked even smaller and skinnier than he really was because all he had to wear were old clothes of Dudley's, and Dudley was about four times bigger than he was. Harry had a thin face, knobbly knees, black hair, and bright green eyes. He wore round glasses held together with a lot of Scotch tape because of all the times Dudley had punched him on the nose. The only thing Harry liked about his own appearance was a very thin scar on his forehead that was shaped like a bolt of lightning. He had had it as long as he could remember, and the first question he could ever remember asking his Aunt Petunia was how he had gotten it.

"In the car crash when your parents died," she had said. "And don't ask questions."

Don't ask questions—that was the first rule for a quiet life with the Dursleys.`
      },
      {
        title: 'Chapter 3: The Letters from No One',
        text: `The escape of the Brazilian boa constrictor earned Harry his longest-ever punishment. By the time he was allowed out of his cupboard again, the summer holidays had started and Dudley had already broken his new video camera, crashed his remote-control airplane, and, first time out on his racing bike, knocked down old Mrs. Figg as she crossed Privet Drive on her crutches.

Harry was glad school was over, but there was no escaping Dudley's gang, who visited the house every single day. Piers, Dennis, Malcolm, and Gordon were all big and stupid, but as Dudley was the biggest and stupidest of the lot, he was the leader. The rest of them were all quite happy to join in Dudley's favorite sport: Harry Hunting.

This was why Harry spent as much time as possible out of the house, wandering around and thinking about the end of the holidays, where he could see a tiny ray of hope. When September came he would be going to secondary school and, for the first time in his life, he wouldn't be with Dudley. Dudley had been accepted at Uncle Vernon's old private school, Smeltings. Piers Polkiss was going there too. Harry, on the other hand, was going to Stonewall High, the local comprehensive. Dudley thought this was very funny.

One morning in July, Aunt Petunia took Dudley to London to buy his Smeltings uniform, leaving Harry at Mrs. Figg's. Mrs. Figg wasn't as bad as usual. It turned out she'd broken her leg tripping over one of her cats, and she seemed much less fond of them now. She let Harry watch television and gave him a piece of chocolate cake that tasted as though she'd had it for several years.

That evening, Dudley paraded around the living room for his parents in his brand-new uniform. Smeltings' boys wore maroon tailcoats, orange knickerbockers, and flat straw hats called boaters. They also carried knobbly sticks, used for hitting each other while the teachers weren't looking. This was supposed to be good training for later life.

As he looked at Dudley in his new knickerbockers, Uncle Vernon said gruffly that it was the proudest moment of his life. Aunt Petunia burst into tears and said she couldn't believe it was her Ickle Dudleykins, he looked so handsome and grown-up. Harry didn't trust himself to speak. He thought two of his ribs might already have cracked from trying not to laugh.

There was a horrible smell in the kitchen the next morning when Harry went in for breakfast. It seemed to be coming from a large metal tub in the sink. He went to have a look. The tub was full of what looked like dirty rags swimming in gray water.

"What's this?" he asked Aunt Petunia. Her lips tightened as they always did if he dared to ask a question.

"Your new school uniform," she said.

Harry looked in the basin again.

"Oh," he said, "I didn't realize it had to be so wet."

"Don't be stupid," snapped Aunt Petunia. "I'm dyeing some of Dudley's old things gray for you. It'll look just like everyone else's when I'm done."

Harry seriously doubted this, but thought it best not to argue. He sat down at the table and tried not to think about how he was going to look on his first day at Stonewall High—like he was wearing bits of old elephant skin, probably.

Dudley and Uncle Vernon came in, both wrinkling their noses at the smell of Aunt Petunia's dye. Uncle Vernon opened his newspaper as usual and Dudley banged his Smeltings stick, which he carried everywhere, on the table.

Then they heard the click of the mail slot and flop of letters on the doormat.

"Get the mail, Dudley," said Uncle Vernon from behind his paper.

"Make Harry get it."

"Get the mail, Harry."

"Make Dudley get it."

"Poke him with your Smeltings stick, Dudley."

Harry dodged the Smeltings stick and went to get the mail. Three things lay on the doormat: a postcard from Uncle Vernon's sister Marge, who was vacationing on the Isle of Wight, a brown envelope that looked like a bill, and—a letter for Harry.

Harry picked it up and stared at it, his heart twanging like a giant elastic band. No one, ever, in his whole life, had written to him. Who would? He had no friends, no other relatives—he didn't belong to the library, so he'd never even gotten rude notes asking for books back. Yet here it was, a letter, addressed so plainly there could be no mistake:

Mr. H. Potter
The Cupboard under the Stairs
4 Privet Drive
Little Whinging
Surrey

The envelope was thick and heavy, made of yellowish parchment, and the words were written in emerald-green ink. There was no stamp.

Turning the envelope over, his hand trembling, Harry saw a purple wax seal bearing a coat of arms; a lion, an eagle, a badger, and a snake surrounding a large letter H.`
      },
      {
        title: 'Chapter 4: The Keeper of the Keys',
        text: `BOOM. They knocked again. Dudley jerked awake. "Where's the cannon?" he said stupidly.

There was a crash behind them and Uncle Vernon came skidding into the room. He was holding a rifle in his hands—now they knew what had been in the long, thin package he had brought with them.

"Who's there?" he shouted. "I warn you—I'm armed!"

There was a pause. Then—

SMASH!

The door was hit with such force that it swung clean off its hinges and with a deafening crash landed flat on the floor.

A giant of a man was standing in the doorway. His face was almost completely hidden by a long, shaggy mane of hair and a wild, tangled beard, but you could see his eyes, glinting like black beetles under all the hair.

The giant squeezed his way into the hut, stooping so that his head just brushed the ceiling. He bent down, picked up the door, and fitted it easily back into its frame. The noise of the storm outside dropped a little. He turned to look at them all.

"Couldn't make us a cup o' tea, could yer? It's not been an easy journey..."

He strode over to the sofa where Dudley sat frozen with fear.

"Budge up, yeh great lump," said the stranger.

Dudley squeaked and ran to hide behind his mother, who was crouching, terrified, behind Uncle Vernon.

"An' here's Harry!" said the giant.

Harry looked up into the fierce, wild, shadowy face and saw that the beetle eyes were crinkled in a smile.

"Las' time I saw you, you was only a baby," said the giant. "Yeh look a lot like yer dad, but yeh've got yer mom's eyes."

Uncle Vernon made a funny rasping noise.

"I demand that you leave at once, sir!" he said. "You are breaking and entering!"

"Ah, shut up, Dursley, yeh great prune," said the giant; he reached over the back of the sofa, jerked the gun out of Uncle Vernon's hands, bent it into a knot as easily as if it had been made of rubber, and threw it into a corner of the room.

Uncle Vernon made another funny noise, like a mouse being trodden on.

"Anyway—Harry," said the giant, turning his back on the Dursleys, "a very happy birthday to yeh. Got summat fer yeh here—I mighta sat on it at some point, but it'll taste all right."

From an inside pocket of his black overcoat he pulled out a slightly squashed box. Harry opened it with trembling fingers. Inside was a fat, sticky chocolate cake with "Happy Birthday Harry" written on it in green icing.

Harry looked up at the giant. He meant to say thank you, but the words got lost on the way to his mouth, and what he said instead was, "Who are you?"

The giant chuckled.

"True, I haven't introduced meself. Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts."

He held out an enormous hand and shook Harry's whole arm.

"What about that tea, then, eh?" he said, rubbing his hands together. "I wouldn't say no to summat stronger if yeh've got it, mind."

His eyes fell on the empty grate with the shriveled chip bags in it and he snorted. He bent down over the fireplace; they couldn't see what he was doing, but when he drew back a second later, there was a roaring fire there. It filled the whole damp hut with flickering light and Harry felt the warmth wash over him as though he'd stepped into a hot bath.

The giant sat back down on the sofa, which sagged under his weight, and began taking all sorts of things out of the pockets of his coat: a copper kettle, a squashy package of sausages, a poker, a teapot, several chipped mugs, and a bottle of some amber liquid that he took a swig from before starting to make tea. Soon the hut was full of the sound and smell of sizzling sausage. Nobody said a thing while the giant was working, but as he slid the first six fat, juicy, slightly burnt sausages from the poker, Dudley fidgeted a little. Uncle Vernon said sharply, "Don't touch anything he gives you, Dudley."

The giant chuckled darkly.

"Yer great puddin' of a son don' need fattenin' anymore, Dursley, don' worry."

He passed the sausages to Harry, who was so hungry he had never tasted anything so wonderful, but he still couldn't take his eyes off the giant. Finally, as nobody seemed about to explain anything, he said, "I'm sorry, but I still don't really know who you are."

The giant took a gulp of tea and wiped his mouth with the back of his hand.

"Call me Hagrid," he said, "everyone does. An' like I told yeh, I'm Keeper of Keys at Hogwarts—yeh'll know all about Hogwarts, o' course."

"Er—no," said Harry.

Hagrid looked shocked.

"Sorry," Harry said quickly.

"Sorry?" barked Hagrid, turning to stare at the Dursleys, who shrank back into the shadows. "It's them as should be sorry! I knew yeh weren't gettin' yer letters but I never thought yeh wouldn't even know abou' Hogwarts, fer cryin' out loud! Did yeh never wonder where yet parents learnt it all?"

"All what?" asked Harry.

"ALL WHAT?" Hagrid thundered. "Now wait jus' one second!"

He jumped to his feet. In his anger he seemed to fill the whole hut. The Dursleys were cowering against the wall.

"Do you mean ter tell me," he growled at the Dursleys, "that this boy—this boy!—knows nothin' abou'—about ANYTHING?"

Harry thought this was going a bit far. He had been to school, after all, and his marks weren't bad.

"I know some things," he said. "I can, you know, do math and stuff."

Hagrid simply waved his hand and said, "About our world, I mean. Your world. My world. Yer parents' world."

"What world?"

Hagrid looked as if he was about to explode.

"DURSLEY!" he boomed.

Uncle Vernon, who had gone very pale, whispered something that sounded like "Mimblewimble." Hagrid stared wildly at Harry.

"But yeh must know about yer mom and dad," he said. "I mean, they're famous. You're famous."

"What? My mom and dad weren't famous, were they?"

"Yeh don' know... yeh don' know..." Hagrid ran the fingers through his hair, fixing Harry with a bewildered stare.

"Yeh don' know what yeh are?" he said at last.

Uncle Vernon suddenly found his voice.

"Stop!" he commanded. "Stop right there, sir! I forbid you to tell the boy anything!"

A braver man than Vernon Dursley would have quailed under the furious look Hagrid gave him; when Hagrid spoke, his every syllable trembled with rage.

"You never told him?" he whispered. "Never told him what was in the letter Dumbledore left fer him? I was there! I saw Dumbledore leave it, Dursley! An' you've kept it from him all these years?"

"Kept what from me?" said Harry eagerly.

"STOP! I FORBID YOU!" yelled Uncle Vernon in panic.

Aunt Petunia gave a gasp of horror.

"Ah, go boil yer heads, both of yeh," said Hagrid. "Harry—yer a wizard."

There was silence inside the hut. Only the sea and the whistling wind could be heard.

"I'm a what?" gasped Harry.

"A wizard, o' course," said Hagrid, sitting back down on the sofa, which groaned and sank even lower, "an' a thumpin' good'un, I'd say, once yeh've been trained up a bit. With a mum an' dad like yours, what else would yeh be? An' I reckon it's about time yeh read yer letter."`
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
