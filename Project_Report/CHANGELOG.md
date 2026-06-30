# Project Changelog

## [Unreleased]
### Added
- **AI-Powered Adaptive Timetable Optimization Engine**: Core backend algorithms (`backend/planning/utils.py`) to chunk large topics and distribute them intelligently across available study days up to the Target Exam Date.
- **Frontend Dashboard Enhancements**: 
  - Dynamic display of daily study plans.
  - Overall progress tracking (percentage completion).
  - Clear All functionality for timetables.
  - Individual session deletion capabilities.
  - Individual session completion marking.
- **Syllabus Manager Enhancements**:
  - Delete functionality for Subjects and Topics.
  - Granular topic input including Difficulty (1-5), Estimated Hours, and Preferred Time.
  - "Edit Exam Date" seamless functionality.
- **Authentication**:
  - Strict 8-character minimum password validation implemented on both React frontend and FastAPI backend.

### Fixed
- **Algorithm Fix**: Removed faulty difficulty multiplier that was incorrectly inflating total hours and creating duplicate span days in the calendar.
- **State Management**: Fixed React `ReferenceError` crashes on the dashboard when deleting study sessions.

### Technical Stack Updates
- FastAPI endpoints securely wrapped with Dependency Injection (`Depends(get_current_user)`).
- SQLAlchemy relationships and cascade deletions safely managed.
- React Router optimized for conditional redirection based on session activity.
