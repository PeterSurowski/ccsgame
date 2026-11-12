function effects(budget, gpa, placement, engagement) {
  return [budget, gpa, placement, engagement].map(([delta, reason], index) => ({
    label: ['Budget', 'Ave. GPA', 'Job Placement', 'Engagement'][index], delta, reason,
  }))
}

export const resumeCandidates = [
  {
    id: 'peter', name: 'Peter Surowski', photo: 'ProfilePic-PeterSurowski.png',
    tech: '20+ years', teaching: '10+ years', degree: 'Masters in Communications',
    summary: 'Veteran Software Designer/Engineer with lots of part-time college-level teaching experience. Worked for AOL and WordPress.com, also for University of Redlands and Fullerton College.',
    strengths: ['Extensive hands-on tech experience relevant to UX Design', 'Extensive part-time teaching experience in relevant topics', 'Large social media following (knows how to market his classes)'],
    weaknesses: ['No full-time teaching exp', 'No PhD', 'No academic publications'],
    effects: effects([-30, 'Reasonable salary expectations'], [-10, 'Notoriously tough grader'], [20, 'Teaches skills employers want'], [30, 'Hands-on classes']),
  },
  {
    id: 'theo', name: 'Theo Retical', photo: 'ProfilePic-TheoRetical.jpg',
    tech: '5 years', teaching: '25 years', degree: 'PhD in Computer Science',
    summary: 'Veteran professor with 25 years of teaching experience. Got his start in the 90s at IBM before shifting into academia. Taught at NYU before moving to MI.',
    strengths: ['Extensive full-time university-level teaching experience', 'PhD in CS gives him a deep theoretical knowledge', 'Understands university culture'],
    weaknesses: ['No recent real-world experience', 'High salary expectations'],
    effects: effects([-55, 'High salary expectations'], [5, 'Clear curriculum'], [-20, 'Teaches outdated skills'], [-10, 'Classes too theoretical']),
  },
  {
    id: 'taryn', name: 'Taryn Canvas', photo: 'ProfilePic-TarynCanvas.jpg',
    tech: '1 year', teaching: '30 years... but not in higher ed', degree: "Master's in Fine Arts",
    summary: 'A design instructor with 30 years instructional experience. Taught art at the high school level for 20 years before joining a nearby community college as an adjunct, then full-time faculty. Taught some digital design courses as part of her duties.',
    strengths: ['Extensive teaching experience', 'Excellent portfolio'],
    weaknesses: ['Most teaching experience was high school level', 'Almost no tech experience'],
    effects: effects([-30, 'Reasonable salary expectations'], [10, 'Fun assignments'], [-30, 'Not teaching in-demand skills'], [-30, 'Lessons not technical enough']),
  },
  {
    id: 'sammy', name: 'Sammy Colon', photo: 'ProfilePic-SammyColon.jpg',
    tech: '11 years', teaching: '2 years part-time', degree: 'BS in Computer Science',
    summary: 'A full-stack software engineer with Stellantis with some part-time teaching experience. Teaches a coding bootcamp in addition to building interfaces for vehicle consoles.',
    strengths: ['Recent hands-on tech experience', 'Some teaching experience'],
    weaknesses: ["Tech experience isn't very diverse", 'Not much familiarity with university culture'],
    effects: effects([-30, 'Reasonable salary expectations'], [0, ''], [15, 'Teaching in-demand skills'], [-20, 'Poorly built curriculum']),
  },
  {
    id: 'perry', name: 'Perry Ameter', photo: 'ProfilePic-PerryAmeter.jpg',
    tech: '13 years', teaching: '1 year', degree: 'MA in Informatics',
    summary: 'Senior level IT specialist, worked for numerous small companies. Teaches senior citizens how to use technology at a community center.',
    strengths: ["Has a master's degree", 'Has industry experience'],
    weaknesses: ['No higher ed teaching experience', 'Experience not very relevant to UX design', 'No familiarity with university work/culture'],
    effects: effects([-30, 'Reasonable salary expectations'], [0, ''], [0, ''], [-20, 'Poor lesson plans']),
  },
  {
    id: 'paige', name: 'PaigeRefresh', photo: 'ProfilePic-PaigeRefresh.jpg',
    tech: '3 years', teaching: '0 years', degree: 'BS in Data Science',
    summary: 'Software Engineer with excellent technical chops but little work experience. Hosts the famous "Tech Girl" podcast, so employing her would elevate CCS\'s reputation.',
    strengths: ['Impressive portfolio of personal projects', 'Can use the podcast to advertise her classes'],
    weaknesses: ['Spotty track record of professional projects', 'Minimal work experience'],
    effects: effects([-20, 'Low salary expectations'], [10, 'Students love her'], [-30, 'Limited professional experience'], [20, 'Lessons are fun/challenging']),
  },
  {
    id: 'noah', name: 'Noah Kesperiens', photo: 'ProfilePic-NoahKesperiens.jpg',
    tech: '0', teaching: '0', degree: 'In progress',
    summary: "Student employee in the university and a family member of one of your colleagues. He's said to be bright, trustworthy and dependable.",
    strengths: ['A trusted colleague vouched for him', 'Familiar with university culture'],
    weaknesses: ['No tech experience', 'No teaching experience'],
    effects: effects([-10, 'Low salary expectations'], [-50, 'Confusing material'], [-50, 'Not teaching in-demand skills'], [-50, 'Bad curriculum']),
  },
  {
    id: 'dean', name: 'Dean Slist', photo: 'ProfilePic-DeanSlist.jpg',
    tech: '10 years', teaching: '35 years', degree: 'PhD in Graphic Design',
    summary: 'A seasoned professional professor with 35 years teaching in higher ed, both full time and as an adjunct. Also worked in tech for AOL and other companies before shifting to education.',
    strengths: ['Strong background in education', 'Strong experience in tech', 'PhD in a highly relevant topic'],
    weaknesses: ['Has not had hands on experience in decades'],
    effects: effects([-40, 'Reasonable salary expectations'], [10, 'Clear instruction'], [-30, 'Not teaching in-demand skills'], [10, 'Well built curriculum']),
  },
  {
    id: 'bobby', name: 'Bobby Droptables', photo: 'ProfilePic-BobbyDroptables.jpg',
    tech: '7 years', teaching: '0 years', degree: 'PhD in Cyber Security',
    summary: 'A Cyber Security analyst with a small consultancy with an extremely popular YouTube channel, "Learn to Hack with Bobby." Teaching on YouTube might be considered education experience.',
    strengths: ['Technical chops are excellent', 'YouTube channel might attract students to CCS', 'PhD in related field'],
    weaknesses: ['Skills not directly relevant to UX design', 'No higher ed teaching experience'],
    effects: effects([-20, 'Reasonable salary expectations'], [0, ''], [10, 'Teaching in-demand skills'], [-20, 'Poorly built lessons']),
  },
  {
    id: 'belle', name: 'Belle Curve', photo: 'ProfilePic-BelleCurve.jpg',
    tech: '0 years', teaching: '20 years', degree: 'PhD in Computer Science',
    summary: 'Veteran professor of computer science, currently teaching at a rival university but looking to make a change. Has taught every possible topic related to computers.',
    strengths: ['Lots of higher ed teaching experience', 'Designed and taught lots of computer-related subjects', 'PhD gives her deep theoretical knowledge'],
    weaknesses: ['Zero real-world experience'],
    effects: effects([-55, 'High salary expectations'], [10, 'Clear instruction'], [-30, 'Not teaching in-demand skills'], [10, 'Clear lesson plans']),
  },
  {
    id: 'barb', name: 'Barb Wireframe', photo: 'ProfilePic-BarbWireframe.jpg',
    tech: '15 years', teaching: '5 years', degree: 'BS in Information Science',
    summary: 'A veteran IT professional and part-time professor specializing in system architecture. Adjunct at a neighboring college, worked for Rocket and WordPress.com previously.',
    strengths: ['Up-to-date tech exp', 'Relevant education and exp'],
    weaknesses: ['No full-time teaching exp'],
    effects: effects([-30, 'Reasonable salary expectations'], [5, 'Relevant lessons'], [20, 'Teaching in-demand skills'], [-25, 'No full-time teaching experience']),
  },
  {
    id: 'al', name: 'Al Gorithm', photo: 'ProfilePic-AlGorithm.jpg',
    tech: '6 years', teaching: '1 year', degree: 'AS in Digital Design',
    summary: 'Mid-level software developer and part-time middle school instructor. Teaches kids to program robots at a middle school. One company on resume, small agency.',
    strengths: ['Recent tech industry exp'],
    weaknesses: ['No higher ed teaching exp', 'No bachelor or higher degree', 'Not much exp overall'],
    effects: effects([-10, 'Very low salary expectations'], [-35, 'Confusing curriculum'], [5, 'Teaching technical skills'], [-20, 'Disorganized lessons']),
  },
]

export function shuffleCandidates(candidates, random = Math.random) {
  const shuffled = [...candidates]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled
}

export function applyCandidateEffects(scores, candidate) {
  return candidate.effects.reduce(applyScoreEffect, scores)
}

export function applyScoreEffect(scores, effect) {
  return scores.map(score => ({
    ...score,
    value: score.label === effect.label
      ? Math.min(100, score.value + effect.delta) : score.value,
  }))
}

export function resumeOutcome(scores, hires) {
  if (hires < 3) return 'card'
  return scores.some(score => score.value < 0) ? 'revolt' : 'success'
}

export function nextResumeIndex(deck, index, hires) {
  for (let offset = 1; offset <= deck.length; offset += 1) {
    const next = (index + offset) % deck.length
    if (!hires.includes(deck[next].id)) return next
  }
  throw new Error('No unhired candidates remain in the resume deck')
}
