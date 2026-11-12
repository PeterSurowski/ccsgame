import { completeInterviewChoice } from './mazeGame.js'

export function interviewFinished(completed) {
  return [0, 1, 2].every(choice => completed.includes(choice))
}

export function finishInterviewGame(completed, choice) {
  const nextCompleted = completeInterviewChoice(completed, choice)
  return {
    completed: nextCompleted,
    page: choice === 0 && !interviewFinished(nextCompleted) ? 'maze-reflection' : 'interview',
  }
}

export const happyEndingDialogue = [
  [
    'Matt: Looks like you made a great choice in hiring Peter!',
    "Philip: Yeah, our stats are looking great now!",
    "Susan: Yes, he's working out quite well. Now, how are you two doing?",
  ],
  [
    "Matt: Well, the larger class size has, uh, definitely added workload, but I'm, uh, what was I saying?",
    "Philip: Yeah, we've definitely been burning the midnight, uh... what's the word?",
    'Susan: Are you two all right?',
  ],
]
