-- School Management System (SMS) Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  section TEXT NOT NULL,
  room_number TEXT,
  academic_year TEXT NOT NULL DEFAULT '2026-2027',
  class_teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_number TEXT UNIQUE NOT NULL,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date_of_birth TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
  blood_group TEXT,
  address TEXT,
  emergency_contact TEXT,
  parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  enrollment_date TEXT DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  qualification TEXT,
  department TEXT NOT NULL,
  joining_date TEXT DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occupation TEXT,
  relationship TEXT NOT NULL DEFAULT 'Guardian'
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-2027',
  start_date TEXT,
  end_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained REAL NOT NULL,
  max_marks REAL NOT NULL DEFAULT 100,
  grade_letter TEXT NOT NULL,
  comments TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  target_role TEXT NOT NULL DEFAULT 'all' CHECK(target_role IN ('all', 'teacher', 'student', 'parent')),
  author_id INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK(status IN ('paid', 'unpaid', 'partial', 'overdue')),
  paid_amount REAL NOT NULL DEFAULT 0,
  paid_date TEXT,
  payment_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
