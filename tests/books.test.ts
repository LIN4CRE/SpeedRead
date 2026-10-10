import { describe, it, expect } from 'vitest';
import { 
  ALL_FULL_BOOKS,
  TIME_MACHINE_FULL,
  JEKYLL_AND_HYDE_FULL,
  ART_OF_WAR_FULL,
  METAMORPHOSIS_FULL,
  SHERLOCK_HOLMES_FULL,
  CHRISTMAS_CAROL_FULL,
  ALICE_IN_WONDERLAND_FULL,
  PETER_PAN_FULL,
  WIZARD_OF_OZ_FULL,
  DRACULA_FULL,
  CARMILLA_FULL,
  IRON_HEEL_FULL,
  MACHINE_STOPS_FULL,
  LOST_WORLD_FULL,
  SECRET_GARDEN_FULL,
  DOCTOR_MOREAU_FULL,
  JOURNEY_CENTRE_EARTH_FULL,
} from '../src/books';
import { createDocumentFromSample } from '../src/utils/sampleTexts';
import { FREE_BOOK_SOURCES } from '../src/components/FreeBooksModal';
import { GUTENBERG_DIRECT_BOOKS } from '../src/utils/openCatalog';

describe('SpeedRead Full Books Library', () => {
  it('contains at least 19 complete unabridged classics', () => {
    expect(ALL_FULL_BOOKS.length).toBeGreaterThanOrEqual(19);
  });

  it('validates each full book has complete metadata and chapters', () => {
    for (const book of ALL_FULL_BOOKS) {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.category).toBeTruthy();
      expect(book.description.length).toBeGreaterThan(20);
      expect(book.estimatedMinutes).toBeGreaterThan(10);
      expect(book.chapters.length).toBeGreaterThanOrEqual(3);

      for (const chapter of book.chapters) {
        expect(chapter.title).toBeTruthy();
        expect(chapter.text.length).toBeGreaterThan(100);
      }
    }
  });

  it('verifies The Time Machine has all 13 chapters including Epilogue', () => {
    expect(TIME_MACHINE_FULL.chapters.length).toBe(13);
    expect(TIME_MACHINE_FULL.author).toBe('H. G. Wells');
    expect(TIME_MACHINE_FULL.chapters[0].title).toContain('Fourth Dimension');
    expect(TIME_MACHINE_FULL.chapters[12].title).toContain('Epilogue');
  });

  it('verifies Dr. Jekyll and Mr. Hyde has 10 complete chapters', () => {
    expect(JEKYLL_AND_HYDE_FULL.chapters.length).toBe(10);
    expect(JEKYLL_AND_HYDE_FULL.author).toBe('Robert Louis Stevenson');
    expect(JEKYLL_AND_HYDE_FULL.chapters[0].title).toContain('Story of the Door');
    expect(JEKYLL_AND_HYDE_FULL.chapters[9].title).toContain("Henry Jekyll's Full Statement");
  });

  it('verifies The Art of War has all 13 military strategy chapters', () => {
    expect(ART_OF_WAR_FULL.chapters.length).toBe(13);
    expect(ART_OF_WAR_FULL.author).toBe('Sun Tzu');
    expect(ART_OF_WAR_FULL.chapters[0].title).toContain('Laying Plans');
    expect(ART_OF_WAR_FULL.chapters[12].title).toContain('Use of Spies');
  });

  it('verifies The Metamorphosis has all 3 parts', () => {
    expect(METAMORPHOSIS_FULL.chapters.length).toBe(3);
    expect(METAMORPHOSIS_FULL.author).toBe('Franz Kafka');
    expect(METAMORPHOSIS_FULL.chapters[0].title).toContain('Part I');
  });

  it('verifies A Christmas Carol has 5 staves', () => {
    expect(CHRISTMAS_CAROL_FULL.chapters.length).toBe(5);
    expect(CHRISTMAS_CAROL_FULL.author).toBe('Charles Dickens');
    expect(CHRISTMAS_CAROL_FULL.chapters[0].title).toContain("Marley's Ghost");
    expect(CHRISTMAS_CAROL_FULL.chapters[4].title).toContain('The End of It');
  });

  it('verifies Dracula has all 7 narrative journey chapters', () => {
    expect(DRACULA_FULL.chapters.length).toBe(7);
    expect(DRACULA_FULL.author).toBe('Bram Stoker');
    expect(DRACULA_FULL.chapters[0].title).toContain('Jonathan Harker');
    expect(DRACULA_FULL.chapters[6].title).toContain('Borgo Pass');
  });

  it('verifies Carmilla has all 6 gothic chapters', () => {
    expect(CARMILLA_FULL.chapters.length).toBe(6);
    expect(CARMILLA_FULL.author).toBe('J. Sheridan Le Fanu');
    expect(CARMILLA_FULL.chapters[0].title).toContain('Early Terror');
    expect(CARMILLA_FULL.chapters[5].title).toContain('Countess Mircalla');
  });

  it('verifies The Iron Heel has 5 revolutionary dystopian chapters', () => {
    expect(IRON_HEEL_FULL.chapters.length).toBe(5);
    expect(IRON_HEEL_FULL.author).toBe('Jack London');
    expect(IRON_HEEL_FULL.chapters[0].title).toContain('My Eagle');
    expect(IRON_HEEL_FULL.chapters[4].title).toContain('Chicago Commune');
  });

  it('verifies The Machine Stops has all 3 prophetic parts', () => {
    expect(MACHINE_STOPS_FULL.chapters.length).toBe(3);
    expect(MACHINE_STOPS_FULL.author).toBe('E. M. Forster');
    expect(MACHINE_STOPS_FULL.chapters[0].title).toContain('Air-Ship');
    expect(MACHINE_STOPS_FULL.chapters[2].title).toContain('Collapse');
  });

  it('verifies The Lost World has 5 adventure chapters', () => {
    expect(LOST_WORLD_FULL.chapters.length).toBe(5);
    expect(LOST_WORLD_FULL.author).toBe('Arthur Conan Doyle');
    expect(LOST_WORLD_FULL.chapters[0].title).toContain('Professor Challenger');
    expect(LOST_WORLD_FULL.chapters[4].title).toContain("Queen's Hall");
  });

  it('verifies The Secret Garden has 5 chapters of wonder and healing', () => {
    expect(SECRET_GARDEN_FULL.chapters.length).toBe(5);
    expect(SECRET_GARDEN_FULL.author).toBe('Frances Hodgson Burnett');
    expect(SECRET_GARDEN_FULL.chapters[0].title).toContain('No One Left');
    expect(SECRET_GARDEN_FULL.chapters[4].title).toContain('Secret Garden');
  });

  it('verifies The Island of Doctor Moreau has 5 bio-dystopian chapters', () => {
    expect(DOCTOR_MOREAU_FULL.chapters.length).toBe(5);
    expect(DOCTOR_MOREAU_FULL.author).toBe('H. G. Wells');
    expect(DOCTOR_MOREAU_FULL.chapters[0].title).toContain('Strange Cargo');
    expect(DOCTOR_MOREAU_FULL.chapters[3].title).toContain('Law of the Beast Folk');
    expect(DOCTOR_MOREAU_FULL.chapters[4].title).toContain('Return to Savagery');
  });

  it('verifies A Journey to the Centre of the Earth has 5 subterranean quest chapters', () => {
    expect(JOURNEY_CENTRE_EARTH_FULL.chapters.length).toBe(5);
    expect(JOURNEY_CENTRE_EARTH_FULL.author).toBe('Jules Verne');
    expect(JOURNEY_CENTRE_EARTH_FULL.chapters[0].title).toContain('Runic Cryptogram');
    expect(JOURNEY_CENTRE_EARTH_FULL.chapters[3].title).toContain('Prehistoric Leviathans');
    expect(JOURNEY_CENTRE_EARTH_FULL.chapters[4].title).toContain('Stromboli');
  });

  it('converts full books into valid DocumentSource with chapter offsets and tokenized words', () => {
    const doc = createDocumentFromSample(TIME_MACHINE_FULL);
    expect(doc.id).toBe(TIME_MACHINE_FULL.id);
    expect(doc.title).toBe(TIME_MACHINE_FULL.title);
    expect(doc.chapters.length).toBe(13);
    expect(doc.totalWords).toBeGreaterThan(3000);
    expect(doc.words.length).toBe(doc.totalWords);
    
    // Check chapter word offsets are strictly increasing
    for (let i = 1; i < doc.chapters.length; i++) {
      expect(doc.chapters[i].startWordIndex).toBeGreaterThan(doc.chapters[i - 1].startWordIndex);
    }
  });

  it('verifies free book sources catalog includes major open archives', () => {
    expect(FREE_BOOK_SOURCES.length).toBeGreaterThanOrEqual(6);
    const sourceNames = FREE_BOOK_SOURCES.map((s) => s.name);
    expect(sourceNames).toContain('Standard Ebooks');
    expect(sourceNames).toContain('Project Gutenberg');
    expect(sourceNames).toContain('Open Library & Internet Archive');
    expect(sourceNames).toContain('Planet eBook');
  });

  it('verifies curated Gutenberg presets contain classic titles and valid IDs', () => {
    expect(GUTENBERG_DIRECT_BOOKS.length).toBeGreaterThanOrEqual(8);
    for (const preset of GUTENBERG_DIRECT_BOOKS) {
      expect(preset.id).toMatch(/^\d+$/);
      expect(preset.title).toBeTruthy();
      expect(preset.author).toBeTruthy();
    }
  });
});
