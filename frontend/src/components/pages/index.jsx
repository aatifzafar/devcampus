// Which page component each sidebar tab id opens.
import React from 'react';
import { Assignments, Recordings } from './Subjects';
import { TestsLive, TestsUpcoming, TestsCompleted, TestsResults } from './Tests';
import { LiveToday } from './Classes';
import { DailyChallenge, Coding, PlayLearn } from './Practice';
import { Discussions, Projects } from './Community';
import { PlannerCalendar, PlannerTodos } from './Planner';
import { Progress, Achievements, Personality, Settings } from './Profile';
import { HelpCenter, WhatsNew, Feedback, GetApp } from './Help';
import { FindTutor, SkillSwap, MySessions, BecomeTutor } from '../features/LearnWithFriends';
import { PYQPapers, PYQTopics } from '../features/PYQ';
import { AlumniDirectory, AlumniCompanies } from '../features/Alumni';
import { AskAlliancePage } from '../features/AskAlliance';
import { ThreeDLearning } from '../features/ThreeDLearning';
import { EventsUpcoming, MyEvents, Clubs } from '../features/Events';
import { ResumeBuilder } from '../features/ResumeBuilder';
import { FACULTY_PAGES } from '../faculty';

export const PAGES = {
  assignments: Assignments,
  recordings: Recordings,
  'tests-live': TestsLive,
  'tests-upcoming': TestsUpcoming,
  'tests-completed': TestsCompleted,
  'tests-results': TestsResults,
  'live-today': LiveToday,
  challenges: DailyChallenge,
  coding: Coding,
  playlearn: PlayLearn,
  discussions: Discussions,
  projects: Projects,
  'planner-calendar': PlannerCalendar,
  'planner-todos': PlannerTodos,
  progress: Progress,
  achievements: Achievements,
  personality: Personality,
  settings: Settings,
  help: HelpCenter,
  whatsnew: WhatsNew,
  feedback: Feedback,
  getapp: GetApp,
  'friends-find': FindTutor,
  'friends-swap': SkillSwap,
  'friends-sessions': MySessions,
  'friends-teach': BecomeTutor,
  pyq: PYQPapers,
  'pyq-topics': PYQTopics,
  alumni: AlumniDirectory,
  'alumni-companies': AlumniCompanies,
  chatbot: AskAlliancePage,
  threeD: ThreeDLearning,
  events: EventsUpcoming,
  'events-mine': MyEvents,
  clubs: Clubs,
  resume: ResumeBuilder,
  ...FACULTY_PAGES,
};

export function Page({ id, ...props }) {
  const Component = PAGES[id];
  return Component ? <Component {...props} /> : null;
}
