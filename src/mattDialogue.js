export const mattDialogue = [
  {
    image: 'matt',
    lines: ['Matt Raupp: This is excellent work, miss. But I have a suspicion. Did you use AI to finish this project?'],
  },
  {
    image: 'student',
    lines: ['Student (nervously): Ummm.. maybe a little...'],
  },
  {
    image: 'happy',
    lines: ["Matt Raupp: Fantastic! You've demonstrated the ability to adapt to new technologies! That's an import skill I've worked hard to impart on you."],
  },
  {
    image: 'weeping',
    lines: ['Matt Raupp: Now go back and do it again by hand. I want you to become an expert at this technology, and that will not happen if you use AI to do your work.',
      'Student (weeping): Yessir.',
      'Susan: Professor Raupp, may I speak with you in the hallway?'],
  },
  {
    image: 'hallway',
    lines: ['Susan: I need you to take over the UX class.',
      "Matt Raupp: Why? What's going on?"],
  },
  {
    image: 'hallway',
    lines: ['Susan: Our engagement score is... really bad. Our job placement score also needs improvement. I think your real-world experience is exactly what those students need right now.',
      'Matt Raupp: You can count on me!'],
  },
]

export const mattFollowup = {
  susan: {
    image: 'susan',
    lines: ["Susan: You did it, Matt! Your real-world experience is exactly what these students needed to stay engaged and land jobs after graduation! How's everything going on your end?"],
    advance: 'sleeping',
  },
  sleeping: {
    image: 'sleeping',
    lines: ['Matt: Zzzzzzz... make sure it works on mobile... zzzzzzzz... remove friction... zzzzzzzzzz...',
      'Susan: Matt! Maaaaaaaaaaatt!'],
    advance: 'decision',
  },
  pushing: {
    image: 'pushing',
    lines: ['Student: I rebuilt the web app, this time I did it by hand, no AI!',
      "Matt: Good, this, ah... it's important to understand how... uh, how to do these things manually, even though... um, what was I saying?... Zzzzzzzzzzzzz..."],
    advance: 'mobbed',
  },
  mobbed: {
    image: 'mobbed',
    lines: ['Matt: Yaaaaaaaaaaaaaaaaa!'],
    advance: 'ending-fading',
  },
}

export function mattDecision(askedProfessors) {
  const choices = ['A. Push Matt Raupp to keep teaching', 'B. Hire a new instructor']
  if (!askedProfessors.includes('philip')) choices.push('C. Ask Philip McAvoy to teach it')
  return {
    image: 'thinking',
    lines: ["Susan (thinking): He's too overworked to teach this class. What else can I do?"],
    choices,
    disabled: [],
    next: ['failure-fading', 'hire-fading', ...(choices.length === 3 ? ['philip-fading'] : [])],
  }
}
