const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('sms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        // localStorage.removeItem('sms_token');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudentById: (id) => request(`/students/${id}`),
  createStudent: (studentData) => request('/students', { method: 'POST', body: JSON.stringify(studentData) }),
  updateStudent: (id, studentData) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(studentData) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // Teachers
  getTeachers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/teachers${query ? `?${query}` : ''}`);
  },
  getTeacherById: (id) => request(`/teachers/${id}`),
  getMyClasses: () => request('/teachers/my-classes'),
  createTeacher: (teacherData) => request('/teachers', { method: 'POST', body: JSON.stringify(teacherData) }),
  updateTeacher: (id, teacherData) => request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(teacherData) }),
  deleteTeacher: (id) => request(`/teachers/${id}`, { method: 'DELETE' }),

  // Classes
  getClasses: () => request('/classes'),
  getClassById: (id) => request(`/classes/${id}`),
  createClass: (classData) => request('/classes', { method: 'POST', body: JSON.stringify(classData) }),
  getClassRoster: (id) => request(`/classes/${id}/roster`),
  addSubjectToClass: (classId, subjectData) => request(`/classes/${classId}/subjects`, { method: 'POST', body: JSON.stringify(subjectData) }),

  // Attendance
  markAttendanceBatch: (payload) => request('/attendance/batch', { method: 'POST', body: JSON.stringify(payload) }),
  getClassAttendance: (classId, date) => request(`/attendance/class/${classId}${date ? `?date=${date}` : ''}`),
  getStudentAttendance: (studentId) => request(`/attendance/student${studentId ? `/${studentId}` : ''}`),
  getAttendanceOverview: () => request('/attendance/overview'),

  // Grades
  getExams: () => request('/grades/exams'),
  createExam: (examData) => request('/grades/exams', { method: 'POST', body: JSON.stringify(examData) }),
  getGradesSheet: (classId, subjectId, examId) => request(`/grades/class/${classId}/subject/${subjectId}${examId ? `?exam_id=${examId}` : ''}`),
  saveGradesBatch: (payload) => request('/grades/batch', { method: 'POST', body: JSON.stringify(payload) }),
  getReportCard: (studentId, examId) => request(`/grades/report-card${studentId ? `/${studentId}` : ''}${examId ? `?exam_id=${examId}` : ''}`),

  // Announcements
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),

  // Reports
  getAdminOverview: () => request('/reports/overview'),

  // Fees
  getAllFees: () => request('/fees'),
  getStudentFees: (studentId) => request(`/fees/student${studentId ? `/${studentId}` : ''}`),
  payFee: (feeId, data = {}) => request(`/fees/${feeId}/pay`, { method: 'POST', body: JSON.stringify(data) })
};
