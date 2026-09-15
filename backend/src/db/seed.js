const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

function runSeed() {
  console.log('🌱 Starting database seeding...');

  // Read and execute schema
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Drop existing tables in reverse dependency order
  const dropTables = `
    DROP TABLE IF EXISTS fees;
    DROP TABLE IF EXISTS announcements;
    DROP TABLE IF EXISTS grades;
    DROP TABLE IF EXISTS exams;
    DROP TABLE IF EXISTS attendance;
    DROP TABLE IF EXISTS parents;
    DROP TABLE IF EXISTS teachers;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS subjects;
    DROP TABLE IF EXISTS classes;
    DROP TABLE IF EXISTS users;
  `;

  db.exec(dropTables);
  db.exec(schemaSql);

  const defaultPassword = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Admin
  const adminId = insertUser.run(
    'admin@techschool.edu',
    hashedPassword,
    'admin',
    'Eleanor',
    'Vance',
    '+1 (555) 019-2834',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  ).lastInsertRowid;

  // 2. Teachers
  const teacher1 = insertUser.run(
    'sarah.jenkins@techschool.edu',
    hashedPassword,
    'teacher',
    'Sarah',
    'Jenkins',
    '+1 (555) 234-5678',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  ).lastInsertRowid;

  const teacher2 = insertUser.run(
    'marcus.chen@techschool.edu',
    hashedPassword,
    'teacher',
    'Marcus',
    'Chen',
    '+1 (555) 345-6789',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  ).lastInsertRowid;

  const teacher3 = insertUser.run(
    'rachel.green@techschool.edu',
    hashedPassword,
    'teacher',
    'Rachel',
    'Green',
    '+1 (555) 456-7890',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  ).lastInsertRowid;

  const teacher4 = insertUser.run(
    'david.miller@techschool.edu',
    hashedPassword,
    'teacher',
    'David',
    'Miller',
    '+1 (555) 567-8901',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ).lastInsertRowid;

  // 3. Parents
  const parent1 = insertUser.run(
    'robert.johnson@example.com',
    hashedPassword,
    'parent',
    'Robert',
    'Johnson',
    '+1 (555) 901-2345',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  ).lastInsertRowid;

  const parent2 = insertUser.run(
    'jennifer.williams@example.com',
    hashedPassword,
    'parent',
    'Jennifer',
    'Williams',
    '+1 (555) 912-3456',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  ).lastInsertRowid;

  const parent3 = insertUser.run(
    'michael.davis@example.com',
    hashedPassword,
    'parent',
    'Michael',
    'Davis',
    '+1 (555) 923-4567',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  ).lastInsertRowid;

  // 4. Students
  const studentData = [
    { email: 'liam.johnson@techschool.edu', first: 'Liam', last: 'Johnson', gender: 'Male', parent: parent1, dob: '2009-04-12' },
    { email: 'emma.williams@techschool.edu', first: 'Emma', last: 'Williams', gender: 'Female', parent: parent2, dob: '2009-08-23' },
    { email: 'noah.brown@techschool.edu', first: 'Noah', last: 'Brown', gender: 'Male', parent: parent3, dob: '2009-01-15' },
    { email: 'olivia.davis@techschool.edu', first: 'Olivia', last: 'Davis', gender: 'Female', parent: parent3, dob: '2009-11-30' },
    { email: 'ethan.martinez@techschool.edu', first: 'Ethan', last: 'Martinez', gender: 'Male', parent: parent1, dob: '2009-06-18' },
    { email: 'sophia.wilson@techschool.edu', first: 'Sophia', last: 'Wilson', gender: 'Female', parent: parent2, dob: '2009-09-05' },
    { email: 'lucas.anderson@techschool.edu', first: 'Lucas', last: 'Anderson', gender: 'Male', parent: parent1, dob: '2010-02-14' },
    { email: 'ava.thomas@techschool.edu', first: 'Ava', last: 'Thomas', gender: 'Female', parent: parent2, dob: '2010-07-22' },
    { email: 'mason.jackson@techschool.edu', first: 'Mason', last: 'Jackson', gender: 'Male', parent: parent3, dob: '2010-05-19' },
    { email: 'isabella.white@techschool.edu', first: 'Isabella', last: 'White', gender: 'Female', parent: parent1, dob: '2010-10-11' },
    { email: 'james.harris@techschool.edu', first: 'James', last: 'Harris', gender: 'Male', parent: parent2, dob: '2010-03-08' },
    { email: 'mia.martin@techschool.edu', first: 'Mia', last: 'Martin', gender: 'Female', parent: parent3, dob: '2010-12-01' }
  ];

  const studentUserIds = [];
  for (const s of studentData) {
    const sId = insertUser.run(
      s.email,
      hashedPassword,
      'student',
      s.first,
      s.last,
      '+1 (555) 600-' + Math.floor(1000 + Math.random() * 9000),
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.first}`
    ).lastInsertRowid;
    studentUserIds.push({ userId: sId, ...s });
  }

  // Insert Teacher details
  const insertTeacher = db.prepare(`
    INSERT INTO teachers (user_id, employee_id, qualification, department, joining_date)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertTeacher.run(teacher1, 'EMP-1001', 'M.Sc. Mathematics, B.Ed', 'Mathematics', '2020-08-15');
  insertTeacher.run(teacher2, 'EMP-1002', 'Ph.D. Physics', 'Science', '2019-07-01');
  insertTeacher.run(teacher3, 'EMP-1003', 'M.A. English Literature', 'Humanities', '2021-09-01');
  insertTeacher.run(teacher4, 'EMP-1004', 'B.Tech Computer Science', 'Technology', '2022-01-10');

  // Insert Parent details
  const insertParent = db.prepare(`
    INSERT INTO parents (user_id, occupation, relationship)
    VALUES (?, ?, ?)
  `);
  insertParent.run(parent1, 'Civil Engineer', 'Father');
  insertParent.run(parent2, 'Pediatrician', 'Mother');
  insertParent.run(parent3, 'Architect', 'Father');

  // Insert Classes
  const insertClass = db.prepare(`
    INSERT INTO classes (name, grade_level, section, room_number, academic_year, class_teacher_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const class10A = insertClass.run('Grade 10-A', 10, 'A', 'Room 201', '2026-2027', teacher1).lastInsertRowid;
  const class10B = insertClass.run('Grade 10-B', 10, 'B', 'Room 202', '2026-2027', teacher2).lastInsertRowid;
  const class9A = insertClass.run('Grade 9-A', 9, 'A', 'Room 101', '2026-2027', teacher3).lastInsertRowid;
  const class9B = insertClass.run('Grade 9-B', 9, 'B', 'Room 102', '2026-2027', teacher4).lastInsertRowid;

  // Insert Subjects
  const insertSubject = db.prepare(`
    INSERT INTO subjects (name, code, class_id, teacher_id)
    VALUES (?, ?, ?, ?)
  `);

  const subjects10A = [
    { name: 'Advanced Mathematics', code: 'MATH-10', classId: class10A, teacher: teacher1 },
    { name: 'Physics & Chemistry', code: 'SCI-10', classId: class10A, teacher: teacher2 },
    { name: 'English Literature', code: 'ENG-10', classId: class10A, teacher: teacher3 },
    { name: 'Computer Science', code: 'CS-10', classId: class10A, teacher: teacher4 }
  ];

  const subjects10B = [
    { name: 'Advanced Mathematics', code: 'MATH-10', classId: class10B, teacher: teacher1 },
    { name: 'Physics & Chemistry', code: 'SCI-10', classId: class10B, teacher: teacher2 },
    { name: 'English Literature', code: 'ENG-10', classId: class10B, teacher: teacher3 },
    { name: 'Computer Science', code: 'CS-10', classId: class10B, teacher: teacher4 }
  ];

  const subjectMap = {};
  for (const s of [...subjects10A, ...subjects10B]) {
    const id = insertSubject.run(s.name, s.code, s.classId, s.teacher).lastInsertRowid;
    const key = `${s.classId}-${s.name}`;
    subjectMap[key] = id;
  }

  // Insert Students enrollment
  const insertStudent = db.prepare(`
    INSERT INTO students (user_id, admission_number, class_id, date_of_birth, gender, blood_group, address, emergency_contact, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const enrolledStudents = [];
  // First 6 in 10-A, next 6 in 10-B
  studentUserIds.forEach((s, idx) => {
    const classId = idx < 6 ? class10A : class10B;
    const admNum = `SMS-2026-${String(idx + 101).padStart(4, '0')}`;
    const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-'];
    const bGroup = bloodGroups[idx % bloodGroups.length];
    const sDbId = insertStudent.run(
      s.userId,
      admNum,
      classId,
      s.dob,
      s.gender,
      bGroup,
      `${100 + idx} Academic Lane, Springfield`,
      '+1 (555) 999-0000',
      s.parent
    ).lastInsertRowid;

    enrolledStudents.push({
      studentId: sDbId,
      userId: s.userId,
      classId,
      name: `${s.first} ${s.last}`,
      parentUserId: s.parent
    });
  });

  // Insert Past 14 Weekdays of Attendance
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (student_id, class_id, date, status, remarks, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const dates = [];
  const today = new Date();
  let dayOffset = 0;
  while (dates.length < 14) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      dates.push(d.toISOString().split('T')[0]);
    }
    dayOffset++;
  }
  dates.reverse(); // Chronological order

  for (const dateStr of dates) {
    for (const st of enrolledStudents) {
      // 88% present, 7% late, 5% absent
      const rand = Math.random();
      let status = 'present';
      let remarks = 'On time';
      if (rand > 0.93) {
        status = 'absent';
        remarks = 'Unexcused illness';
      } else if (rand > 0.85) {
        status = 'late';
        remarks = 'Traffic delay';
      }

      insertAttendance.run(
        st.studentId,
        st.classId,
        dateStr,
        status,
        remarks,
        st.classId === class10A ? teacher1 : teacher2
      );
    }
  }

  // Insert Exams
  const insertExam = db.prepare(`
    INSERT INTO exams (name, term, academic_year, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
  `);
  const midtermExam = insertExam.run(
    'Mid-Term Assessment 2026',
    'Term 1',
    '2026-2027',
    '2026-10-10',
    '2026-10-18'
  ).lastInsertRowid;

  const finalExam = insertExam.run(
    'Final Annual Examination 2027',
    'Term 2',
    '2026-2027',
    '2027-03-15',
    '2027-03-25'
  ).lastInsertRowid;

  // Insert Grades for Midterm
  const insertGrade = db.prepare(`
    INSERT INTO grades (exam_id, student_id, subject_id, marks_obtained, max_marks, grade_letter, comments, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  function calculateGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  }

  const subjectNames = ['Advanced Mathematics', 'Physics & Chemistry', 'English Literature', 'Computer Science'];
  for (const st of enrolledStudents) {
    for (const sName of subjectNames) {
      const subjectId = subjectMap[`${st.classId}-${sName}`];
      if (!subjectId) continue;
      // Realistic random marks between 65 and 99
      const marks = Math.floor(65 + Math.random() * 34);
      const gradeLetter = calculateGrade(marks);
      const comments = marks >= 85 ? 'Exemplary academic understanding and proactive participation.' : 'Consistent effort shown; focus on weekly practice exercises.';
      const teacher = sName === 'Advanced Mathematics' ? teacher1 : (sName === 'Physics & Chemistry' ? teacher2 : (sName === 'English Literature' ? teacher3 : teacher4));

      insertGrade.run(midtermExam, st.studentId, subjectId, marks, 100, gradeLetter, comments, teacher);
    }
  }

  // Insert Announcements
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, content, category, target_role, author_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run(
    'Welcome to Academic Year 2026-2027',
    'Welcome back students, faculty, and esteemed parents! Classes are in full swing. Please review the updated code of conduct and academic calendar on the school portal.',
    'General',
    'all',
    adminId
  );

  insertAnnouncement.run(
    'Annual STEM & Robotics Exhibition',
    'The Annual Science & Technology Exhibition will be held on Friday, November 20. Interested students should submit project proposals to the Computer Science department by next week.',
    'Academic',
    'student',
    teacher4
  );

  insertAnnouncement.run(
    'Parent-Teacher Conference (Term 1)',
    'We invite all parents to attend the upcoming Term 1 consultation session on Saturday, October 24, from 9:00 AM to 1:00 PM. Individual appointment slots can be reserved via the parent portal.',
    'Meeting',
    'parent',
    adminId
  );

  insertAnnouncement.run(
    'Department Curriculum Planning Meeting',
    'All department heads and faculty members are requested to join the curriculum review session in Conference Hall B this Thursday at 3:30 PM.',
    'Staff',
    'teacher',
    adminId
  );

  // Insert Fees
  const insertFee = db.prepare(`
    INSERT INTO fees (student_id, title, amount, due_date, status, paid_amount, paid_date, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  enrolledStudents.forEach((st, idx) => {
    // Term 1 Tuition
    const isPaid = idx % 3 !== 0;
    insertFee.run(
      st.studentId,
      'Term 1 Tuition Fee',
      1250.00,
      '2026-09-30',
      isPaid ? 'paid' : 'unpaid',
      isPaid ? 1250.00 : 0.00,
      isPaid ? '2026-09-10' : null,
      isPaid ? 'Card Payment (Online)' : null
    );

    // STEM Lab & Tech Fee
    insertFee.run(
      st.studentId,
      'STEM Lab & Digital Library Fee',
      180.00,
      '2026-10-15',
      isPaid ? 'paid' : 'unpaid',
      isPaid ? 180.00 : 0.00,
      isPaid ? '2026-09-12' : null,
      isPaid ? 'Bank Transfer' : null
    );
  });

  console.log('✅ Database seeded successfully!');
  console.log('   - 1 Super Admin: admin@techschool.edu (password: password123)');
  console.log('   - 4 Faculty: sarah.jenkins@techschool.edu, etc.');
  console.log('   - 12 Students: liam.johnson@techschool.edu, etc.');
  console.log('   - 3 Parents: robert.johnson@example.com, etc.');
  console.log('   - 4 Classes with 14 days of attendance, exams, grades, and fees.');
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
