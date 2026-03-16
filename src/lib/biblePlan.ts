import fs from "fs";
import path from "path";

let _cachedBibleData: Record<string, string> | null = null;

function loadBibleData(): Record<string, string> {
  if (_cachedBibleData) return _cachedBibleData;
  const filePath = path.join(process.cwd(), "src", "lib", "bibleData.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  _cachedBibleData = JSON.parse(raw) as Record<string, string>;
  return _cachedBibleData!;
}

export const BIBLE_BOOKS = [
  { id: "Gen", name: "창세기", abbr: "창", chapters: 50, testament: "OT" },
  { id: "Exo", name: "출애굽기", abbr: "출", chapters: 40, testament: "OT" },
  { id: "Lev", name: "레위기", abbr: "레", chapters: 27, testament: "OT" },
  { id: "Num", name: "민수기", abbr: "민", chapters: 36, testament: "OT" },
  { id: "Deu", name: "신명기", abbr: "신", chapters: 34, testament: "OT" },
  { id: "Jos", name: "여호수아", abbr: "수", chapters: 24, testament: "OT" },
  { id: "Jdg", name: "사사기", abbr: "삿", chapters: 21, testament: "OT" },
  { id: "Rut", name: "룻기", abbr: "룻", chapters: 4, testament: "OT" },
  { id: "1Sa", name: "사무엘상", abbr: "삼상", chapters: 31, testament: "OT" },
  { id: "2Sa", name: "사무엘하", abbr: "삼하", chapters: 24, testament: "OT" },
  { id: "1Ki", name: "열왕기상", abbr: "왕상", chapters: 22, testament: "OT" },
  { id: "2Ki", name: "열왕기하", abbr: "왕하", chapters: 25, testament: "OT" },
  { id: "1Ch", name: "역대상", abbr: "대상", chapters: 29, testament: "OT" },
  { id: "2Ch", name: "역대하", abbr: "대하", chapters: 36, testament: "OT" },
  { id: "Ezr", name: "에스라", abbr: "스", chapters: 10, testament: "OT" },
  { id: "Neh", name: "느헤미야", abbr: "느", chapters: 13, testament: "OT" },
  { id: "Est", name: "에스더", abbr: "에", chapters: 10, testament: "OT" },
  { id: "Job", name: "욥기", abbr: "욥", chapters: 42, testament: "OT" },
  { id: "Psa", name: "시편", abbr: "시", chapters: 150, testament: "OT" },
  { id: "Pro", name: "잠언", abbr: "잠", chapters: 31, testament: "OT" },
  { id: "Ecc", name: "전도서", abbr: "전", chapters: 12, testament: "OT" },
  { id: "Sng", name: "아가", abbr: "아", chapters: 8, testament: "OT" },
  { id: "Isa", name: "이사야", abbr: "사", chapters: 66, testament: "OT" },
  { id: "Jer", name: "예레미야", abbr: "렘", chapters: 52, testament: "OT" },
  { id: "Lam", name: "애가", abbr: "애", chapters: 5, testament: "OT" },
  { id: "Ezk", name: "에스겔", abbr: "겔", chapters: 48, testament: "OT" },
  { id: "Dan", name: "다니엘", abbr: "단", chapters: 12, testament: "OT" },
  { id: "Hos", name: "호세아", abbr: "호", chapters: 14, testament: "OT" },
  { id: "Jol", name: "요엘", abbr: "욜", chapters: 3, testament: "OT" },
  { id: "Amo", name: "아모스", abbr: "암", chapters: 9, testament: "OT" },
  { id: "Oba", name: "오바댜", abbr: "옵", chapters: 1, testament: "OT" },
  { id: "Jon", name: "요나", abbr: "욘", chapters: 4, testament: "OT" },
  { id: "Mic", name: "미가", abbr: "미", chapters: 7, testament: "OT" },
  { id: "Nah", name: "나훔", abbr: "나", chapters: 3, testament: "OT" },
  { id: "Hab", name: "하박국", abbr: "합", chapters: 3, testament: "OT" },
  { id: "Zep", name: "스바냐", abbr: "습", chapters: 3, testament: "OT" },
  { id: "Hag", name: "학개", abbr: "학", chapters: 2, testament: "OT" },
  { id: "Zec", name: "스가랴", abbr: "슥", chapters: 14, testament: "OT" },
  { id: "Mal", name: "말라기", abbr: "말", chapters: 4, testament: "OT" },
  { id: "Mat", name: "마태복음", abbr: "마", chapters: 28, testament: "NT" },
  { id: "Mrk", name: "마가복음", abbr: "막", chapters: 16, testament: "NT" },
  { id: "Luk", name: "누가복음", abbr: "눅", chapters: 24, testament: "NT" },
  { id: "Jhn", name: "요한복음", abbr: "요", chapters: 21, testament: "NT" },
  { id: "Act", name: "사도행전", abbr: "행", chapters: 28, testament: "NT" },
  { id: "Rom", name: "로마서", abbr: "롬", chapters: 16, testament: "NT" },
  { id: "1Co", name: "고린도전서", abbr: "고전", chapters: 16, testament: "NT" },
  { id: "2Co", name: "고린도후서", abbr: "고후", chapters: 13, testament: "NT" },
  { id: "Gal", name: "갈라디아서", abbr: "갈", chapters: 6, testament: "NT" },
  { id: "Eph", name: "에베소서", abbr: "엡", chapters: 6, testament: "NT" },
  { id: "Php", name: "빌립보서", abbr: "빌", chapters: 4, testament: "NT" },
  { id: "Col", name: "골로새서", abbr: "골", chapters: 4, testament: "NT" },
  { id: "1Th", name: "데살로니가전서", abbr: "살전", chapters: 5, testament: "NT" },
  { id: "2Th", name: "데살로니가후서", abbr: "살후", chapters: 3, testament: "NT" },
  { id: "1Ti", name: "디모데전서", abbr: "딤전", chapters: 6, testament: "NT" },
  { id: "2Ti", name: "디모데후서", abbr: "딤후", chapters: 4, testament: "NT" },
  { id: "Tit", name: "디도서", abbr: "딛", chapters: 3, testament: "NT" },
  { id: "Phm", name: "빌레몬서", abbr: "몬", chapters: 1, testament: "NT" },
  { id: "Heb", name: "히브리서", abbr: "히", chapters: 13, testament: "NT" },
  { id: "Jas", name: "야고보서", abbr: "약", chapters: 5, testament: "NT" },
  { id: "1Pe", name: "베드로전서", abbr: "벧전", chapters: 5, testament: "NT" },
  { id: "2Pe", name: "베드로후서", abbr: "벧후", chapters: 3, testament: "NT" },
  { id: "1Jn", name: "요한1서", abbr: "요일", chapters: 5, testament: "NT" },
  { id: "2Jn", name: "요한2서", abbr: "요이", chapters: 1, testament: "NT" },
  { id: "3Jn", name: "요한3서", abbr: "요삼", chapters: 1, testament: "NT" },
  { id: "Jud", name: "유다서", abbr: "유", chapters: 1, testament: "NT" },
  { id: "Rev", name: "요한계시록", abbr: "계", chapters: 22, testament: "NT" }
];

export const DURATION_DAYS: Record<string, number> = {
  ONE_YEAR: 365,
  NINE_MONTHS: 270,
  SIX_MONTHS: 180,
  THREE_MONTHS: 90
};

// name -> abbr 매핑
const nameToAbbr: Record<string, string> = {};
for (const book of BIBLE_BOOKS) {
  nameToAbbr[book.name] = book.abbr;
}

type ChapterEntry = { book: string; abbr: string; chapter: number };

// Flatten books into an array of {bookName, abbr, chapterNum}
function getFlattenedArray(books: typeof BIBLE_BOOKS): ChapterEntry[] {
  const flat: ChapterEntry[] = [];
  for (const book of books) {
    for (let c = 1; c <= book.chapters; c++) {
      flat.push({ book: book.name, abbr: book.abbr, chapter: c });
    }
  }
  return flat;
}

// 오늘의 읽기 범위를 계산하여 flat 배열의 start/end indices를 반환
function getReadingRange(dayNumber: number, duration: string, method: string) {
  const totalDays = DURATION_DAYS[duration as keyof typeof DURATION_DAYS] || 365;
  const currentDay = ((dayNumber - 1) % totalDays) + 1;

  if (method === "ALT") {
    const otBooks = BIBLE_BOOKS.filter(b => b.testament === "OT");
    const ntBooks = BIBLE_BOOKS.filter(b => b.testament === "NT");
    const flatOT = getFlattenedArray(otBooks);
    const flatNT = getFlattenedArray(ntBooks);

    const startOTIdx = Math.floor((currentDay - 1) * flatOT.length / totalDays);
    const endOTIdx = Math.floor(currentDay * flatOT.length / totalDays) - 1;
    const startNTIdx = Math.floor((currentDay - 1) * flatNT.length / totalDays);
    const endNTIdx = Math.floor(currentDay * flatNT.length / totalDays) - 1;

    return {
      ot: startOTIdx <= endOTIdx ? flatOT.slice(startOTIdx, endOTIdx + 1) : [],
      nt: startNTIdx <= endNTIdx ? flatNT.slice(startNTIdx, endNTIdx + 1) : [],
    };
  } else {
    let sortedBooks = [...BIBLE_BOOKS];
    if (method === "NT_FIRST") {
      sortedBooks = [
        ...BIBLE_BOOKS.filter(b => b.testament === "NT"),
        ...BIBLE_BOOKS.filter(b => b.testament === "OT")
      ];
    }
    const flatAll = getFlattenedArray(sortedBooks);
    const startIdx = Math.floor((currentDay - 1) * flatAll.length / totalDays);
    const endIdx = Math.floor(currentDay * flatAll.length / totalDays) - 1;

    return {
      ot: [],
      nt: [],
      all: startIdx <= endIdx ? flatAll.slice(startIdx, endIdx + 1) : [],
    };
  }
}

// 범위를 사람이 읽을 수 있는 텍스트로 변환
function formatRange(entries: ChapterEntry[]): string {
  if (entries.length === 0) return "";
  const first = entries[0];
  const last = entries[entries.length - 1];

  if (first.book === last.book) {
    if (first.chapter === last.chapter) {
      return `${first.book} ${first.chapter}장`;
    }
    return `${first.book} ${first.chapter}-${last.chapter}장`;
  } else {
    return `${first.book} ${first.chapter}장 - ${last.book} ${last.chapter}장`;
  }
}

// 오늘의 분량 제목 문자열 반환
export function getTodayReading(dayNumber: number, duration: string, method: string): string {
  const range = getReadingRange(dayNumber, duration, method);

  if (method === "ALT") {
    const otText = formatRange(range.ot);
    const ntText = formatRange(range.nt);
    const parts = [otText, ntText].filter(Boolean);
    return parts.join(", ") || "분량 없음";
  } else {
    return formatRange(range.all || []) || "분량 없음";
  }
}

// 밀린 날짜 + 오늘까지의 누적 분량 제목 반환
export function getAccumulatedReading(
  currentDay: number,
  completedDayNumbers: number[],
  duration: string,
  method: string
): string {
  const entries = getAccumulatedEntries(currentDay, completedDayNumbers, duration, method);
  return formatRange(entries) || "분량 없음";
}

// 밀린 날짜 + 오늘까지의 누적 ChapterEntry 배열
function getAccumulatedEntries(
  currentDay: number,
  completedDayNumbers: number[],
  duration: string,
  method: string
): ChapterEntry[] {
  const completedSet = new Set(completedDayNumbers);
  const allEntries: ChapterEntry[] = [];

  for (let day = 1; day <= currentDay; day++) {
    if (completedSet.has(day)) continue; // 이미 읽은 날은 건너뛰기
    const range = getReadingRange(day, duration, method);
    const entries = method === "ALT" ? [...range.ot, ...range.nt] : (range.all || []);
    allEntries.push(...entries);
  }

  return allEntries;
}

// 장 하나의 모든 절을 가져옴
export interface VerseData {
  reference: string; // e.g. "마1:1"
  text: string;
}

export interface ChapterData {
  bookName: string;
  chapter: number;
  verses: VerseData[];
}

function getChapterVerses(abbr: string, chapter: number): VerseData[] {
  const bible = loadBibleData();
  const verses: VerseData[] = [];
  
  // bible.json keys are like "마1:1", "마1:2", etc.
  let verseNum = 1;
  while (true) {
    const key = `${abbr}${chapter}:${verseNum}`;
    if (bible[key] !== undefined) {
      verses.push({ reference: key, text: bible[key].trim() });
      verseNum++;
    } else {
      break;
    }
  }
  return verses;
}

// 오늘 읽어야 할 모든 장의 본문 데이터 반환 (하루치만)
export function getTodayChapters(dayNumber: number, duration: string, method: string): ChapterData[] {
  const range = getReadingRange(dayNumber, duration, method);
  const chapters: ChapterData[] = [];

  const entries = method === "ALT" ? [...range.ot, ...range.nt] : (range.all || []);
  
  for (const entry of entries) {
    const verses = getChapterVerses(entry.abbr, entry.chapter);
    chapters.push({
      bookName: entry.book,
      chapter: entry.chapter,
      verses,
    });
  }
  
  return chapters;
}

// 밀린 날짜 + 오늘까지의 누적 본문 데이터 반환
export function getAccumulatedChapters(
  currentDay: number,
  completedDayNumbers: number[],
  duration: string,
  method: string
): ChapterData[] {
  const entries = getAccumulatedEntries(currentDay, completedDayNumbers, duration, method);
  const chapters: ChapterData[] = [];

  for (const entry of entries) {
    const verses = getChapterVerses(entry.abbr, entry.chapter);
    chapters.push({
      bookName: entry.book,
      chapter: entry.chapter,
      verses,
    });
  }

  return chapters;
}

