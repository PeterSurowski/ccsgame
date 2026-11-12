const instructorChoices = [
  "A. I don't know, but our engagement score needs some help!",
  "B. I just think that your extensive teaching experience is just what those students need.",
]

export const philipDialogue = {
  ended: {
    lines: ['Philip McAvoy: What do you think?'],
    choices: ['A. Looks great, but what does it do?', 'B. Never mind that, we have an emergency!'],
    next: ['enrollment', 'emergency'],
  },
  enrollment: {
    lines: ["Philip McAvoy: I've gamified the enrollment experience! Students choose their class schedule by answering questions about themselves."],
    advance: 'thinking',
  },
  thinking: {
    image: 'thinking',
    lines: ['Philip: If only there were a professor in our department who were an experienced software engineer. Then we could really do some cool stuff...'],
    choices: [
      'A. Quit your yammering! I need you to teach the UX class.',
      'B. It sounds like a great idea, but I need your help teaching the UX class.',
    ],
    next: ['instructor', 'instructor'],
  },
  instructor: {
    image: 'thinking',
    lines: ['Philip: What happened with the previous instructor?'],
    choices: instructorChoices,
    next: ['assurance', 'assurance'],
  },
  emergency: {
    lines: ['Susan: I need you to take over the UX class right away.',
      'Philip: What happened to the previous instructor?'],
    choices: instructorChoices,
    next: ['assurance', 'assurance'],
  },
  assurance: {
    lines: ['Philip: You can count on me!'],
    advance: 'fading',
  },
  susan: {
    image: 'susan',
    lines: ["Susan: Well Philip, you did it! Our engagement score is higher. How's it going on your end?"],
    advance: 'weeping',
  },
  weeping: {
    image: 'weeping',
    lines: ["Philip: Please, Susan! Take this class off my roster! I'm already teaching a full load. I haven't slept days. I forgot where I live. I can't do it anymore!"],
    advance: 'decision',
  },
  teaching: {
    image: 'teaching',
    lines: ['Philip: So you control which, ah... element in the DOM is shown, with... uh, with an x-index... no wait, I mean a z-index. So you, uh...'],
    advance: 'zombies1',
  },
  zombies1: {
    image: 'zombies1',
    lines: ["Philip: Wait, what's wrong with you all?"],
    advance: 'zombies2',
  },
  zombies2: {
    image: 'zombies2',
    lines: ['Philip: Why are you all standing up? Sit down, class.'],
    advance: 'running',
  },
  running: {
    image: 'running',
    lines: ['Philip: Yaaaaaaaaaaaaaaaaaa!'],
    advance: 'game-over',
  },
}

export function philipDecision(askedProfessors) {
  const choices = [
    'A. Hire a new instructor',
    'B. Push Philip McAvoy to keep teaching the class',
  ]
  if (!askedProfessors.includes('matt')) choices.push('C. Ask Matt Raupp to teach the class.')
  return {
    image: 'susan-thinking',
    lines: ['What will you do?'],
    choices,
    disabled: [],
    next: ['hire-fading', 'failure-fading', ...(choices.length === 3 ? ['matt'] : [])],
  }
}
