const TIME_PER_Q = 60;

const TOPICS = {
  class1: ["Spatial Sense", "Comparison", "Numbers 1-9", "Addition up to 9", "Subtraction up to 9", "Numbers 10-20", "Addition up to 20", "Subtraction up to 20", "Numbers 21-100", "Measurement Basics", "Time Basics", "Shapes", "Patterns", "Data Handling"],
  class2: ["Numbers up to 1000", "Place Value", "Number Names", "Comparison of Numbers", "Addition with Carry", "Subtraction with Borrow", "Multiplication Basics", "Tables (2,3,4,5,10)", "Money", "Length Measurement", "Weight", "Capacity", "Time (Days & Months)", "3D Shapes", "Number Patterns"],
  class3: ["Numbers up to 9999", "Ascending & Descending Order", "Addition (3-digit numbers)", "Subtraction (4-digit numbers)", "Multiplication", "Division Basics", "Fractions (1/2, 1/4, 3/4)", "Measurement Conversion", "Weight & Volume", "Time (Clock, AM/PM)", "Basic Geometry", "Symmetry", "Data (Tally Marks)"],
  class4: ["Large Numbers (5-6 digits)", "Addition & Subtraction", "Multiplication (multi-digit)", "Division", "Factors & Multiples", "Fractions (Like & Unlike)", "Decimals", "Measurement", "Money (Unitary Method)", "Angles", "Circle Parts", "Perimeter", "Area", "Patterns & Tiling", "Data (Bar Graphs)"],
  class5: ["Large Numbers (7-9 digits)", "Roman Numerals", "BODMAS", "HCF & LCM", "Fractions (Advanced)", "Decimals (All Operations)", "Percentage", "Profit & Loss", "Simple Interest", "Measurement (Metric System)", "Time (24-hour format)", "Triangles", "Angles with Protractor", "Properties of Shapes", "Area & Volume", "Average", "3D Nets", "Maps & Directions"],
};

const CLASS_META = [
  { id: "class1", label: "Class 1", sub: "Beginner", emoji: "1" },
  { id: "class2", label: "Class 2", sub: "Foundations", emoji: "2" },
  { id: "class3", label: "Class 3", sub: "Building Up", emoji: "3" },
  { id: "class4", label: "Class 4", sub: "Intermediate", emoji: "4" },
  { id: "class5", label: "Class 5", sub: "Advanced", emoji: "5" },
];

const app = document.getElementById("app");
const state = {
  screen: "splash",
  classId: "",
  topic: "",
  question: null,
  selected: null,
  feedback: null,
  timeLeft: TIME_PER_Q,
  score: { correct: 0, total: 0 },
  streak: 0,
  history: new Set(),
  timerId: null,
  nextId: null,
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function repeat(emoji, n) {
  return emoji.repeat(n);
}

function mcq(answer, distractors) {
  const ans = String(answer);
  const opts = shuffle([ans, ...distractors.map(String).filter((d) => d !== ans)]).slice(0, 4);
  if (!opts.includes(ans)) opts[0] = ans;
  return { options: shuffle(opts), answer: ans };
}

function numDistract(n, spread = 5) {
  const set = new Set();
  while (set.size < 6) {
    const d = n + rand(-spread, spread);
    if (d !== n && d >= 0) set.add(d);
  }
  return [...set].slice(0, 5);
}

const gens = {
  "Spatial Sense": () => {
    const opts = ["Above", "Below", "Left", "Right", "Inside", "Outside"];
    const a = pick(opts);
    const map = {
      Above: "🐦☁️ The bird is ___ the cloud.",
      Below: "☁️\n🐦 The bird is ___ the cloud.",
      Left: "🐱 🐶 The cat is on the ___ of the dog.",
      Right: "🐶 🐱 The cat is on the ___ of the dog.",
      Inside: "📦🎈 The balloon is ___ the box.",
      Outside: "📦 🎈 The balloon is ___ the box.",
    };
    return { q: map[a], ...mcq(a, opts.filter((o) => o !== a)) };
  },
  Comparison: () => {
    const a = rand(1, 9), b = rand(1, 9);
    const ans = a > b ? "Greater" : a < b ? "Less" : "Equal";
    return { q: `Compare: ${a} ___ ${b}`, ...mcq(ans, ["Greater", "Less", "Equal"]) };
  },
  "Numbers 1-9": () => {
    const n = rand(1, 9);
    return { q: "Count the apples", visual: repeat("🍎", n), ...mcq(n, numDistract(n, 4)) };
  },
  "Addition up to 9": () => {
    const a = rand(1, 5), b = rand(1, 9 - a);
    return { q: `${a} + ${b} = ?`, visual: repeat("⭐", a) + " + " + repeat("⭐", b), ...mcq(a + b, numDistract(a + b)) };
  },
  "Subtraction up to 9": () => {
    const a = rand(2, 9), b = rand(1, a);
    return { q: `${a} − ${b} = ?`, ...mcq(a - b, numDistract(a - b)) };
  },
  "Numbers 10-20": () => {
    const n = rand(10, 20);
    return { q: `What comes after ${n}?`, ...mcq(n + 1, numDistract(n + 1, 3)) };
  },
  "Addition up to 20": () => {
    const a = rand(1, 10), b = rand(1, 10);
    return { q: `${a} + ${b} = ?`, ...mcq(a + b, numDistract(a + b)) };
  },
  "Subtraction up to 20": () => {
    const a = rand(5, 20), b = rand(1, a);
    return { q: `${a} − ${b} = ?`, ...mcq(a - b, numDistract(a - b)) };
  },
  "Numbers 21-100": () => {
    const n = rand(21, 99);
    const t = pick(["after", "before"]);
    return { q: `What comes ${t} ${n}?`, ...mcq(t === "after" ? n + 1 : n - 1, numDistract(n, 5)) };
  },
  "Measurement Basics": () => {
    const items = [["Pencil", "cm"], ["Road", "km"], ["Book", "cm"], ["River", "km"], ["Finger", "cm"], ["City", "km"]];
    const [it, u] = pick(items);
    return { q: `Best unit to measure a ${it}?`, ...mcq(u, ["cm", "km", "g", "L"]) };
  },
  "Time Basics": () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const i = rand(0, 6);
    return { q: `Which day comes after ${days[i]}?`, ...mcq(days[(i + 1) % 7], days.filter((_, j) => j !== (i + 1) % 7)) };
  },
  Shapes: () => {
    const map = [["⭕", "Circle"], ["🔺", "Triangle"], ["⬛", "Square"], ["🔶", "Diamond"], ["⭐", "Star"]];
    const [emoji, name] = pick(map);
    return { q: "What shape is this?", visual: emoji, ...mcq(name, map.map((m) => m[1]).filter((n) => n !== name)) };
  },
  Patterns: () => {
    const start = rand(1, 10), step = rand(1, 5);
    const seq = [start, start + step, start + 2 * step];
    return { q: `Next: ${seq.join(", ")}, ?`, ...mcq(start + 3 * step, numDistract(start + 3 * step)) };
  },
  "Data Handling": () => {
    const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9);
    const total = a + b + c;
    return { q: `Apples:${a}, Bananas:${b}, Cherries:${c}. Total fruits?`, visual: "🍎".repeat(a) + " 🍌".repeat(b) + " 🍒".repeat(c), ...mcq(total, numDistract(total)) };
  },
  "Numbers up to 1000": () => {
    const n = rand(100, 999);
    return { q: `What comes after ${n}?`, ...mcq(n + 1, numDistract(n + 1, 5)) };
  },
  "Place Value": () => {
    const n = rand(100, 999);
    const s = String(n);
    const pos = rand(0, 2);
    const names = ["Hundreds", "Tens", "Ones"];
    const value = parseInt(s[pos]) * Math.pow(10, 2 - pos);
    return { q: `In ${n}, place value of ${s[pos]} (${names[pos]} place)?`, ...mcq(value, [parseInt(s[pos]), value * 10, value / 10 || 1, value + 100]) };
  },
  "Number Names": () => {
    const names = { 10: "Ten", 20: "Twenty", 30: "Thirty", 40: "Forty", 50: "Fifty", 100: "Hundred" };
    const keys = Object.keys(names).map(Number);
    const k = pick(keys);
    return { q: `Number name of ${k}?`, ...mcq(names[k], keys.filter((x) => x !== k).map((x) => names[x])) };
  },
  "Comparison of Numbers": () => {
    const a = rand(100, 999), b = rand(100, 999);
    return { q: "Which is greater?", ...mcq(a > b ? a : b, [a, b, a + b, Math.abs(a - b)]) };
  },
  "Addition with Carry": () => {
    const a = rand(15, 89), b = rand(15, 89);
    return { q: `${a} + ${b} = ?`, ...mcq(a + b, numDistract(a + b, 8)) };
  },
  "Subtraction with Borrow": () => {
    const a = rand(40, 99), b = rand(15, a - 1);
    return { q: `${a} − ${b} = ?`, ...mcq(a - b, numDistract(a - b, 6)) };
  },
  "Multiplication Basics": () => {
    const a = rand(2, 5), b = rand(2, 5);
    return { q: `${a} × ${b} = ?`, ...mcq(a * b, numDistract(a * b, 4)) };
  },
  "Tables (2,3,4,5,10)": () => {
    const t = pick([2, 3, 4, 5, 10]);
    const x = rand(1, 10);
    return { q: `${t} × ${x} = ?`, ...mcq(t * x, numDistract(t * x, 5)) };
  },
  Money: () => {
    const a = rand(5, 50), b = rand(5, 50);
    return { q: `You have ₹${a + b}. You spend ₹${a}. Left?`, ...mcq(b, numDistract(b)) };
  },
  "Length Measurement": () => {
    const m = rand(1, 9);
    return { q: `${m} m = ? cm`, ...mcq(m * 100, [m * 10, m * 1000, m + 100, m * 100 + 50]) };
  },
  Weight: () => {
    const kg = rand(1, 9);
    return { q: `${kg} kg = ? grams`, ...mcq(kg * 1000, [kg * 100, kg * 10, kg + 1000, kg * 500]) };
  },
  Capacity: () => {
    const l = rand(1, 9);
    return { q: `${l} L = ? mL`, ...mcq(l * 1000, [l * 100, l * 10, l + 1000, l * 500]) };
  },
  "Time (Days & Months)": () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const i = rand(0, 11);
    return { q: `Which month comes after ${months[i]}?`, ...mcq(months[(i + 1) % 12], months.filter((_, j) => j !== (i + 1) % 12)) };
  },
  "3D Shapes": () => {
    const map = [["⚽", "Sphere"], ["🧊", "Cube"], ["🥫", "Cylinder"], ["🍦", "Cone"]];
    const [e, n] = pick(map);
    return { q: "Name this 3D shape", visual: e, ...mcq(n, map.map((m) => m[1]).filter((x) => x !== n)) };
  },
  "Number Patterns": () => {
    const start = rand(2, 20), step = rand(2, 10);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    return { q: `Next number: ${seq.join(", ")}, ?`, ...mcq(start + 4 * step, numDistract(start + 4 * step)) };
  },
  "Numbers up to 9999": () => {
    const n = rand(1000, 9998);
    return { q: `What comes after ${n}?`, ...mcq(n + 1, numDistract(n + 1, 10)) };
  },
  "Ascending & Descending Order": () => {
    const nums = Array.from({ length: 4 }, () => rand(100, 999));
    const asc = pick([true, false]);
    const sorted = [...nums].sort((a, b) => asc ? a - b : b - a);
    return { q: `${asc ? "Smallest" : "Largest"} of ${nums.join(", ")}?`, ...mcq(sorted[0], nums.filter((n) => n !== sorted[0])) };
  },
  "Addition (3-digit numbers)": () => {
    const a = rand(100, 999), b = rand(100, 999);
    return { q: `${a} + ${b} = ?`, ...mcq(a + b, numDistract(a + b, 20)) };
  },
  "Subtraction (4-digit numbers)": () => {
    const a = rand(2000, 9999), b = rand(1000, a - 1);
    return { q: `${a} − ${b} = ?`, ...mcq(a - b, numDistract(a - b, 50)) };
  },
  Multiplication: () => {
    const a = rand(11, 25), b = rand(2, 9);
    return { q: `${a} × ${b} = ?`, ...mcq(a * b, numDistract(a * b, 10)) };
  },
  "Division Basics": () => {
    const b = rand(2, 9), q = rand(2, 12);
    const a = b * q;
    return { q: `${a} ÷ ${b} = ?`, ...mcq(q, numDistract(q, 4)) };
  },
  "Fractions (1/2, 1/4, 3/4)": () => {
    const fr = pick([["Half of 8", 4], ["Quarter of 8", 2], ["3/4 of 8", 6], ["Half of 10", 5], ["Quarter of 12", 3], ["3/4 of 12", 9], ["Half of 20", 10], ["Quarter of 20", 5], ["3/4 of 20", 15]]);
    return { q: `${fr[0]} = ?`, ...mcq(fr[1], numDistract(fr[1], 4)) };
  },
  "Measurement Conversion": () => {
    const km = rand(1, 9);
    return { q: `${km} km = ? m`, ...mcq(km * 1000, [km * 100, km * 10, km + 1000, km * 500]) };
  },
  "Weight & Volume": () => {
    const opts = [["3 kg", "5 kg"], ["1 L", "2 L"], ["500 g", "1 kg"]];
    const [a, b] = pick(opts);
    return { q: `Which is heavier/more: ${a} or ${b}?`, ...mcq(b, [a, b, "Equal", "Cannot say"]) };
  },
  "Time (Clock, AM/PM)": () => {
    const h = rand(1, 12);
    const ampm = pick(["AM", "PM"]);
    return { q: `${h}:00 ${ampm} is in the ${ampm === "AM" ? "morning" : "afternoon/evening"}. What is 3 hours later?`, ...mcq(`${((h + 2) % 12) + 1}:00`, [`${h}:00`, `${(h + 1) % 13 || 1}:00`, `${(h + 4) % 13 || 1}:00`, `${(h + 5) % 13 || 1}:00`]) };
  },
  "Basic Geometry": () => {
    const map = [["Triangle", 3], ["Square", 4], ["Pentagon", 5], ["Hexagon", 6], ["Octagon", 8]];
    const [n, s] = pick(map);
    return { q: `How many sides does a ${n} have?`, ...mcq(s, map.map((m) => m[1]).filter((x) => x !== s)) };
  },
  Symmetry: () => {
    const map = [["Square", 4], ["Equilateral Triangle", 3], ["Rectangle", 2], ["Circle", Infinity], ["Regular Pentagon", 5]];
    const [n, l] = pick(map.filter((m) => m[1] !== Infinity));
    return { q: `Lines of symmetry in a ${n}?`, ...mcq(l, [l + 1, l - 1, l + 2, 1]) };
  },
  "Data (Tally Marks)": () => {
    const n = rand(3, 15);
    const tally = "𝍷".repeat(Math.floor(n / 5)) + "|".repeat(n % 5);
    return { q: "How many tally marks?", visual: tally || "|", ...mcq(n, numDistract(n, 3)) };
  },
  "Large Numbers (5-6 digits)": () => {
    const n = rand(10000, 999999);
    return { q: `What comes after ${n.toLocaleString()}?`, ...mcq(n + 1, numDistract(n + 1, 100)) };
  },
  "Addition & Subtraction": () => {
    const a = rand(1000, 9999), b = rand(1000, 9999);
    const op = pick(["+", "−"]);
    const r = op === "+" ? a + b : Math.abs(a - b);
    return { q: `${Math.max(a, b)} ${op} ${Math.min(a, b)} = ?`, ...mcq(r, numDistract(r, 50)) };
  },
  "Multiplication (multi-digit)": () => {
    const a = rand(11, 99), b = rand(11, 99);
    return { q: `${a} × ${b} = ?`, ...mcq(a * b, numDistract(a * b, 30)) };
  },
  Division: () => {
    const b = rand(2, 12), q = rand(10, 50);
    return { q: `${b * q} ÷ ${b} = ?`, ...mcq(q, numDistract(q, 5)) };
  },
  "Factors & Multiples": () => {
    const n = pick([6, 8, 10, 12, 15, 18, 20, 24]);
    const factors = { 6: [1, 2, 3, 6], 8: [1, 2, 4, 8], 10: [1, 2, 5, 10], 12: [1, 2, 3, 4, 6, 12], 15: [1, 3, 5, 15], 18: [1, 2, 3, 6, 9, 18], 20: [1, 2, 4, 5, 10, 20], 24: [1, 2, 3, 4, 6, 8, 12, 24] };
    const f = factors[n];
    return { q: `How many factors does ${n} have?`, ...mcq(f.length, [f.length + 1, f.length - 1, f.length + 2, f.length + 3]) };
  },
  "Fractions (Like & Unlike)": () => {
    const d = pick([4, 6, 8, 10, 12]);
    const a = rand(1, d - 1), b = rand(1, d - a);
    return { q: `${a}/${d} + ${b}/${d} = ?`, ...mcq(`${a + b}/${d}`, [`${a + b}/${d * 2}`, `${a * b}/${d}`, `${a + b + 1}/${d}`, `${a + b - 1}/${d}`]) };
  },
  Decimals: () => {
    const a = (rand(10, 99) / 10).toFixed(1);
    const b = (rand(10, 99) / 10).toFixed(1);
    const r = (parseFloat(a) + parseFloat(b)).toFixed(1);
    return { q: `${a} + ${b} = ?`, ...mcq(r, [(parseFloat(r) + 0.1).toFixed(1), (parseFloat(r) - 0.1).toFixed(1), (parseFloat(r) + 1).toFixed(1), (parseFloat(r) - 1).toFixed(1)]) };
  },
  Measurement: () => {
    const m = rand(2, 9);
    return { q: `${m} m ${rand(10, 99)} cm = ? cm`, ...mcq(m * 100 + 50, [m * 100, m * 1000, m * 10 + 50, m + 50]) };
  },
  "Money (Unitary Method)": () => {
    const items = rand(2, 10), price = rand(5, 50), n = rand(2, 10);
    return { q: `${items} pens cost ₹${items * price}. Cost of ${n} pens?`, ...mcq(n * price, numDistract(n * price, 10)) };
  },
  Angles: () => {
    const map = [["90°", "Right"], ["45°", "Acute"], ["120°", "Obtuse"], ["180°", "Straight"], ["30°", "Acute"], ["100°", "Obtuse"]];
    const [a, t] = pick(map);
    return { q: `What type of angle is ${a}?`, ...mcq(t, ["Right", "Acute", "Obtuse", "Straight"]) };
  },
  "Circle Parts": () => {
    const map = [["Center to edge", "Radius"], ["Across through center", "Diameter"], ["Around the circle", "Circumference"], ["Part of edge", "Arc"]];
    const [d, n] = pick(map);
    return { q: `${d} of a circle is called?`, ...mcq(n, ["Radius", "Diameter", "Circumference", "Arc"]) };
  },
  Perimeter: () => {
    const l = rand(3, 15), w = rand(3, 15);
    return { q: `Perimeter of rectangle ${l}×${w}?`, ...mcq(2 * (l + w), [l * w, l + w, 2 * l * w, 2 * (l + w) + 2]) };
  },
  Area: () => {
    const l = rand(3, 15), w = rand(3, 15);
    return { q: `Area of rectangle ${l}×${w}?`, ...mcq(l * w, [2 * (l + w), l + w, l * w + 1, l * w - 1]) };
  },
  "Patterns & Tiling": () => {
    const start = rand(2, 10), step = rand(2, 8);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    return { q: `Next: ${seq.join(", ")}, ?`, ...mcq(start + 4 * step, numDistract(start + 4 * step, 6)) };
  },
  "Data (Bar Graphs)": () => {
    const a = rand(5, 20), b = rand(5, 20), c = rand(5, 20);
    const max = Math.max(a, b, c);
    return { q: `Bars - A:${a}, B:${b}, C:${c}. Highest?`, visual: `A ${"█".repeat(a)}\nB ${"█".repeat(b)}\nC ${"█".repeat(c)}`, ...mcq(max === a ? "A" : max === b ? "B" : "C", ["A", "B", "C", "Equal"]) };
  },
  "Large Numbers (7-9 digits)": () => {
    const n = rand(1000000, 999999999);
    return { q: `Predecessor of ${n.toLocaleString()}?`, ...mcq(n - 1, numDistract(n - 1, 1000)) };
  },
  "Roman Numerals": () => {
    const map = [[1, "I"], [4, "IV"], [5, "V"], [9, "IX"], [10, "X"], [40, "XL"], [50, "L"], [90, "XC"], [100, "C"], [500, "D"]];
    const [n, r] = pick(map);
    return { q: `Roman numeral for ${n}?`, ...mcq(r, map.map((m) => m[1]).filter((x) => x !== r)) };
  },
  BODMAS: () => {
    const a = rand(2, 10), b = rand(2, 10), c = rand(2, 10);
    return { q: `${a} + ${b} × ${c} = ?`, ...mcq(a + b * c, [(a + b) * c, a + b + c, a * b + c, a * b * c]) };
  },
  "HCF & LCM": () => {
    const pairs = [[12, 18, 6, 36], [8, 12, 4, 24], [10, 15, 5, 30], [6, 9, 3, 18], [4, 6, 2, 12], [9, 12, 3, 36]];
    const [a, b, h, l] = pick(pairs);
    const ask = pick(["HCF", "LCM"]);
    return { q: `${ask} of ${a} and ${b}?`, ...mcq(ask === "HCF" ? h : l, [h, l, a + b, a * b]) };
  },
  "Fractions (Advanced)": () => {
    const a = rand(1, 5), b = rand(2, 6), c = rand(1, 5), d = rand(2, 6);
    return { q: `${a}/${b} × ${c}/${d} = ?`, ...mcq(`${a * c}/${b * d}`, [`${a + c}/${b + d}`, `${a * c}/${b + d}`, `${a + c}/${b * d}`, `${a * d}/${b * c}`]) };
  },
  "Decimals (All Operations)": () => {
    const a = (rand(10, 99) / 10).toFixed(1);
    const b = rand(2, 9).toString();
    const r = (parseFloat(a) * parseFloat(b)).toFixed(1);
    return { q: `${a} × ${b} = ?`, ...mcq(r, [(parseFloat(r) + 1).toFixed(1), (parseFloat(r) - 1).toFixed(1), (parseFloat(r) + 0.1).toFixed(1), (parseFloat(r) / 2).toFixed(1)]) };
  },
  Percentage: () => {
    const p = pick([10, 20, 25, 50, 75]);
    const n = pick([100, 200, 400, 80, 60]);
    const r = (p * n) / 100;
    return { q: `${p}% of ${n} = ?`, ...mcq(r, numDistract(r, 5)) };
  },
  "Profit & Loss": () => {
    const cp = rand(50, 500), profit = rand(10, 100);
    return { q: `CP=₹${cp}, SP=₹${cp + profit}. Profit?`, ...mcq(profit, numDistract(profit, 5)) };
  },
  "Simple Interest": () => {
    const p = pick([100, 200, 500, 1000]);
    const r = pick([5, 10, 15, 20]);
    const t = pick([1, 2, 3]);
    const si = (p * r * t) / 100;
    return { q: `SI: P=₹${p}, R=${r}%, T=${t}yr?`, ...mcq(si, numDistract(si, 10)) };
  },
  "Measurement (Metric System)": () => {
    const km = rand(1, 9), m = rand(100, 999);
    return { q: `${km} km ${m} m = ? m`, ...mcq(km * 1000 + m, [km * 100 + m, km + m, km * 1000 - m, km * 10 + m]) };
  },
  "Time (24-hour format)": () => {
    const h = rand(13, 23);
    return { q: `${h}:00 in 12-hour format?`, ...mcq(`${h - 12}:00 PM`, [`${h}:00 AM`, `${h - 12}:00 AM`, `${h}:00 PM`, `${h - 11}:00 PM`]) };
  },
  Triangles: () => {
    const map = [["3 equal sides", "Equilateral"], ["2 equal sides", "Isosceles"], ["No equal sides", "Scalene"], ["One 90° angle", "Right"]];
    const [d, n] = pick(map);
    return { q: `Triangle with ${d}?`, ...mcq(n, ["Equilateral", "Isosceles", "Scalene", "Right"]) };
  },
  "Angles with Protractor": () => {
    const a = rand(10, 170);
    const t = a < 90 ? "Acute" : a === 90 ? "Right" : a < 180 ? "Obtuse" : "Straight";
    return { q: `${a}° is what type of angle?`, ...mcq(t, ["Acute", "Right", "Obtuse", "Straight"]) };
  },
  "Properties of Shapes": () => {
    const map = [["4 equal sides, 4 right angles", "Square"], ["Opposite sides equal, 4 right angles", "Rectangle"], ["4 equal sides, no right angles", "Rhombus"], ["One pair of parallel sides", "Trapezium"]];
    const [d, n] = pick(map);
    return { q: `Shape with ${d}?`, ...mcq(n, ["Square", "Rectangle", "Rhombus", "Trapezium"]) };
  },
  "Area & Volume": () => {
    const s = rand(2, 10);
    const ask = pick(["Area of square", "Volume of cube"]);
    const r = ask === "Area of square" ? s * s : s * s * s;
    return { q: `${ask} side ${s}?`, ...mcq(r, [s * 4, s * 6, r + s, r - s]) };
  },
  Average: () => {
    const nums = Array.from({ length: 4 }, () => rand(10, 50));
    const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
    return { q: `Average of ${nums.join(", ")}?`, ...mcq(avg, numDistract(avg, 5)) };
  },
  "3D Nets": () => {
    const map = [["6 squares", "Cube"], ["2 circles + rectangle", "Cylinder"], ["Circle + triangle", "Cone"], ["4 triangles", "Tetrahedron"]];
    const [d, n] = pick(map);
    return { q: `Net of ${d} forms?`, ...mcq(n, ["Cube", "Cylinder", "Cone", "Tetrahedron"]) };
  },
  "Maps & Directions": () => {
    const dirs = ["North", "South", "East", "West"];
    const opp = { North: "South", South: "North", East: "West", West: "East" };
    const d = pick(dirs);
    return { q: `Opposite of ${d}?`, ...mcq(opp[d], dirs.filter((x) => x !== opp[d])) };
  },
};

function generateQuestion(topic, history) {
  const gen = gens[topic];
  if (!gen) {
    const a = rand(1, 20), b = rand(1, 20);
    return { q: `${a} + ${b} = ?`, ...mcq(a + b, numDistract(a + b)) };
  }
  for (let i = 0; i < 30; i++) {
    const q = gen();
    const key = q.q + "|" + q.answer;
    if (!history.has(key)) {
      history.add(key);
      if (history.size > 200) {
        const first = history.values().next().value;
        if (first) history.delete(first);
      }
      return q;
    }
  }
  return gen();
}

function loadHtmlSnippet(path, target) {
  fetch(path)
    .then((response) => response.ok ? response.text() : "")
    .then((html) => {
      if (!html.trim()) return;
      const template = document.createElement("template");
      template.innerHTML = html;
      [...template.content.childNodes].forEach((node) => {
        if (node.tagName === "SCRIPT") {
          const script = document.createElement("script");
          [...node.attributes].forEach((attr) => script.setAttribute(attr.name, attr.value));
          script.textContent = node.textContent;
          target.appendChild(script);
        } else {
          target.appendChild(node.cloneNode(true));
        }
      });
    })
    .catch(() => {});
}

function triggerInterstitialAd(answeredCount) {
  if (answeredCount > 0 && answeredCount % 20 === 0) {
    try {
      // Paste your Propeller Ads Interstitial Ad code here
    } catch (error) {
      console.warn("Interstitial ad error ignored", error);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clearTimers() {
  if (state.timerId) clearTimeout(state.timerId);
  if (state.nextId) clearTimeout(state.nextId);
  state.timerId = null;
  state.nextId = null;
}

function setScreen(screen) {
  clearTimers();
  state.screen = screen;
  render();
}

function startQuiz(topic) {
  clearTimers();
  state.topic = topic;
  state.history = new Set();
  state.score = { correct: 0, total: 0 };
  state.streak = 0;
  nextQuestion(false);
  state.screen = "quiz";
  render();
}

function nextQuestion(shouldRender = true) {
  clearTimers();
  state.question = generateQuestion(state.topic, state.history);
  state.selected = null;
  state.feedback = null;
  state.timeLeft = TIME_PER_Q;
  if (shouldRender) render();
}

function chooseAnswer(option) {
  if (state.feedback) return;
  const correct = option === state.question.answer;
  state.selected = option;
  state.feedback = correct ? "correct" : "wrong";
  const total = state.score.total + 1;
  triggerInterstitialAd(total);
  state.score = { correct: state.score.correct + (correct ? 1 : 0), total };
  state.streak = correct ? state.streak + 1 : 0;
  render();
  state.nextId = setTimeout(() => nextQuestion(true), 2000);
}

function timeExpired() {
  if (state.feedback) return;
  state.feedback = "wrong";
  state.streak = 0;
  const total = state.score.total + 1;
  triggerInterstitialAd(total);
  state.score = { correct: state.score.correct, total };
  render();
  state.nextId = setTimeout(() => nextQuestion(true), 2000);
}

function updateTimerUI() {
  const pct = (state.timeLeft / TIME_PER_Q) * 100;
  const danger = state.timeLeft <= 10;
  const valueEl = document.querySelector(".time-value");
  const barEl = document.querySelector(".progress-bar");
  if (valueEl) {
    valueEl.textContent = `${String(state.timeLeft).padStart(2, "0")}s`;
    valueEl.classList.toggle("danger", danger);
  }
  if (barEl) {
    barEl.style.width = `${pct}%`;
    barEl.classList.toggle("danger", danger);
  }
}

function startTimer() {
  if (state.screen !== "quiz" || state.feedback) return;
  if (state.timerId) clearTimeout(state.timerId);
  const tick = () => {
    if (state.screen !== "quiz" || state.feedback) return;
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      timeExpired();
      return;
    }
    updateTimerUI();
    state.timerId = setTimeout(tick, 1000);
  };
  state.timerId = setTimeout(tick, 1000);
}

function footerHtml() {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <span>© ${new Date().getFullYear()} Math.</span>
      <a href="/privacy" data-route="privacy">Privacy Policy</a>
    </div>
  </footer>`;
}

function renderShell(content) {
  app.innerHTML = `<main class="app-shell">
    <h1 class="sr-only">Math. — Primary School Math Learning Platform (Class 1–5)</h1>
    <div class="screen">${content}</div>
    ${footerHtml()}
  </main>`;
  bindGlobalEvents();
}

function renderSplash() {
  renderShell(`<section class="splash dot-grid">
    <div class="splash-content">
      <div class="pulse-row">
        <span class="pulse-dot"></span>
        <span class="pulse-dot" style="animation-delay: 0.2s"></span>
        <span class="pulse-dot" style="animation-delay: 0.4s"></span>
      </div>
      <h2 class="logo-title"><span>Math</span><span class="logo-dot">.</span></h2>
      <p class="splash-subtitle">Primary School · Class 1 — 5</p>
      <button class="enter-btn" data-action="start">Start Journey →</button>
    </div>
    <div class="version-label">v1.0 · Infinite Quizzes</div>
  </section>`);
}

function renderClassSelect() {
  const cards = CLASS_META.map((c) => `<button class="class-card glass" data-class="${c.id}">
    <div class="class-top">
      <span class="class-word mono">CLASS</span>
      <span class="class-emoji">${c.emoji}</span>
    </div>
    <div class="class-bottom">
      <div>
        <p class="class-title">${c.label}</p>
        <p class="class-sub mono">${c.sub}</p>
      </div>
      <span class="arrow mono">→</span>
    </div>
  </button>`).join("");

  renderShell(`<section class="container fade-in">
    <button class="back-btn" data-action="home">‹ Back</button>
    <div class="section-head">
      <p class="step-label">// Step 01</p>
      <h2 class="page-title">Choose your class</h2>
    </div>
    <div class="class-grid">${cards}</div>
  </section>`);
}

function renderTopicSelect() {
  const meta = CLASS_META.find((c) => c.id === state.classId);
  const topics = TOPICS[state.classId] || [];
  const cards = topics.map((topic, i) => `<button class="topic-card glass" data-topic="${escapeHtml(topic)}">
    <div>
      <p class="number-label">${String(i + 1).padStart(2, "0")}</p>
      <p class="topic-title">${escapeHtml(topic)}</p>
    </div>
    <span class="arrow">→</span>
  </button>`).join("");

  renderShell(`<section class="container fade-in">
    <button class="back-btn" data-action="classes">‹ Back</button>
    <div class="section-head">
      <p class="step-label">// ${escapeHtml(meta ? meta.label : "Class")} · Step 02</p>
      <h2 class="page-title">Pick a topic</h2>
      <p class="page-copy">Each topic generates infinite practice questions.</p>
    </div>
    <div class="topic-grid">${cards}</div>
  </section>`);
}

function renderQuiz() {
  const q = state.question;
  const pct = (state.timeLeft / TIME_PER_Q) * 100;
  const options = q.options.map((opt, i) => {
    const isSelected = state.selected === opt;
    const isAnswer = opt === q.answer;
    const showCorrect = state.feedback && isAnswer;
    const showWrong = state.feedback === "wrong" && isSelected;
    const className = `option-btn glass${showCorrect ? " correct" : ""}${showWrong ? " wrong" : ""}`;
    const icon = showCorrect ? "✓" : showWrong ? "×" : "";
    return `<button class="${className}" data-option="${escapeHtml(opt)}" ${state.feedback ? "disabled" : ""}>
      <span class="option-left">
        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
        <span class="option-text">${escapeHtml(opt)}</span>
      </span>
      <span class="option-icon">${icon}</span>
    </button>`;
  }).join("");

  renderShell(`<section class="quiz-container fade-in">
    <div class="quiz-topbar">
      <button class="back-btn" data-action="topics">‹ Exit</button>
      <div class="score-line">SCORE <span class="score-strong">${state.score.correct}/${state.score.total}</span>${state.streak >= 2 ? `<span class="streak">🔥 ${state.streak}</span>` : ""}</div>
    </div>
    <p class="topic-label">// ${escapeHtml(state.topic)}</p>
    <div class="timer">
      <div class="timer-head">
        <span class="timer-label">TIME LEFT</span>
        <span class="time-value${state.timeLeft <= 10 ? " danger" : ""}">${String(state.timeLeft).padStart(2, "0")}s</span>
      </div>
      <div class="progress-track"><div class="progress-bar${state.timeLeft <= 10 ? " danger" : ""}" style="width: ${pct}%"></div></div>
    </div>
    <div class="question-card glass${state.feedback ? ` ${state.feedback}` : ""}">
      ${q.visual ? `<div class="visual">${escapeHtml(q.visual)}</div>` : ""}
      <h2 class="question-text">${escapeHtml(q.q)}</h2>
    </div>
    <div class="options-grid">${options}</div>
    ${state.feedback ? `<p class="feedback ${state.feedback}">${state.feedback === "correct" ? "Correct" : `Answer: ${escapeHtml(q.answer)}`}</p>` : ""}
  </section>`);

  startTimer();
}

function renderPrivacy() {
  app.innerHTML = `<main class="app-shell">
    <article class="privacy-article fade-in">
      <a href="/" class="back-btn" data-route="home">← Back</a>
      <h1>Privacy Policy</h1>
      <p class="privacy-date">Last Updated: November 2025</p>
      <p>Welcome to our website. Your privacy is important to us. This Privacy Policy explains how we handle user information.</p>
      <section class="privacy-section"><h2>1. Information We Do Not Collect</h2><p>We want to clearly state that our website does <strong>NOT</strong> collect, store, or process any personal information from users.</p><ul><li>No user registration or login is required</li><li>We do not collect personal details such as name, email address, or phone number</li><li>We do not maintain any database of user information</li><li>We do not directly track users or store personal data</li></ul></section>
      <section class="privacy-section"><h2>2. Use of Cookies</h2><p>Our website itself does not use cookies to store personal data. However, third-party services used on this website may use cookies or similar technologies for advertising and analytics purposes.</p></section>
      <section class="privacy-section"><h2>3. Third-Party Advertising</h2><p>We use third-party advertising services such as Propeller Ads to display ads and generate revenue. These services may use cookies, collect non-personal information, and show personalized or non-personalized advertisements.</p><p>We do not control how these third-party services collect or use data. Users are advised to review their respective privacy policies.</p></section>
      <section class="privacy-section"><h2>4. Data Security</h2><p>Since we do not collect or store any personal data, there is no risk of your personal information being stored or misused by us.</p></section>
      <section class="privacy-section"><h2>5. External Links</h2><p>Our website may contain links to external websites. We are not responsible for the content or privacy practices of those external sites.</p></section>
      <section class="privacy-section"><h2>6. Children's Information</h2><p>Our website does not knowingly collect any information from children. Since no data is collected at all, there is no risk related to children's data.</p></section>
      <section class="privacy-section"><h2>7. Changes to This Privacy Policy</h2><p>We may update this Privacy Policy from time to time. Any updates will be posted on this page with a revised "Last Updated" date.</p></section>
      <section class="privacy-section"><h2>8. Contact Us</h2><p>If you have any questions about this Privacy Policy, you can contact us through the website.</p></section>
      <div class="privacy-bottom"><a href="/" data-route="home">← Back to Math.</a></div>
    </article>
  </main>`;
  bindGlobalEvents();
}

function bindGlobalEvents() {
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.getAttribute("data-action");
      if (action === "start") setScreen("class");
      if (action === "home") setScreen("splash");
      if (action === "classes") setScreen("class");
      if (action === "topics") setScreen("topic");
    });
  });

  document.querySelectorAll("[data-class]").forEach((el) => {
    el.addEventListener("click", () => {
      state.classId = el.getAttribute("data-class");
      setScreen("topic");
    });
  });

  document.querySelectorAll("[data-topic]").forEach((el) => {
    el.addEventListener("click", () => startQuiz(el.getAttribute("data-topic")));
  });

  document.querySelectorAll("[data-option]").forEach((el) => {
    el.addEventListener("click", () => chooseAnswer(el.getAttribute("data-option")));
  });

  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const route = el.getAttribute("data-route");
      clearTimers();
      history.pushState({}, "", route === "privacy" ? "/privacy" : "/");
      if (route === "privacy") renderPrivacy();
      if (route === "home") {
        state.screen = "splash";
        renderSplash();
      }
    });
  });
}

function render() {
  if (state.timerId) clearTimeout(state.timerId);
  state.timerId = null;
  if (location.pathname === "/privacy") {
    renderPrivacy();
    return;
  }
  if (state.screen === "splash") renderSplash();
  if (state.screen === "class") renderClassSelect();
  if (state.screen === "topic") renderTopicSelect();
  if (state.screen === "quiz") renderQuiz();
}

window.addEventListener("popstate", () => {
  clearTimers();
  if (location.pathname === "/privacy") renderPrivacy();
  else render();
});

document.addEventListener("DOMContentLoaded", () => {
  loadHtmlSnippet("./meta-tags.html", document.head);
  loadHtmlSnippet("./ads.html", document.body);
  render();
});
