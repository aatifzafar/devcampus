// Faculty portal: which page each faculty tab id opens.
import { FacultyHome, FCourses, FMaterials, FAnnouncements, FProfile } from './FacultyCore';
import { FAssignments, FGrading, FTests, FQuestionBank, FMonitor, FResults } from './FacultyWork';
import { FClassesToday, FStudents, FDoubts, FCOReport, FPYQUpload } from './FacultyClass';

export const FACULTY_PAGES = {
  'f-home': FacultyHome,
  'f-courses': FCourses,
  'f-materials': FMaterials,
  'f-announce': FAnnouncements,
  'f-pyq': FPYQUpload,
  'f-assign': FAssignments,
  'f-grading': FGrading,
  'f-tests': FTests,
  'f-qbank': FQuestionBank,
  'f-monitor': FMonitor,
  'f-results': FResults,
  'f-classes': FClassesToday,
  'f-students': FStudents,
  'f-doubts': FDoubts,
  'f-co': FCOReport,
  'f-profile': FProfile,
};
