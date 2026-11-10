const instructorChoices = [
  "A. I don't know, but our engagement score has hit 0!",
  "B. I just think you'll be able to raise our engagement score.",
]

export const philipDialogue = {
  ended: {
    lines: ['What do you think?'],
    choices: ['A. Looks great, but what does it do?', 'B. Never mind that, we have an emergency!'],
    next: ['enrollment', 'emergency'],
  },
  enrollment: {
    lines: ["Philip McAvoy: I've gamified the enrollment experience! Students choose their class schedule by answering questions about themselves."],
    advance: 'thinking',
  },
  thinking: {
    image: 'thinking',
    lines: ['Philip: If only there were a professor in our department who were an experienced software engineer. Then we could really...'],
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
    lines: ["Susan: Well Philip, you did it! Our engagement score is higher. How's in going on your end?"],
    advance: 'weeping',
  },
  weeping: {
    image: 'weeping',
    lines: ["Please, Susan! Take this class off my roster! I'm already teaching a full load. I haven't slept days. I forgot where I live. I can't do it anymore!"],
    prompt: true,
  },
}
