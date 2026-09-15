import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Award, Save, CheckCircle, AlertCircle, BookOpen, Calendar, HelpCircle } from 'lucide-react';

export default function GradeEntry() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedClass, setSelectedClass] = useState('1'); // Grade 10-A
  const [selectedSubject, setSelectedSubject] = useState('1'); // Math
  const [selectedExam, setSelectedExam] = useState('');

  const [students, setStudents] = useState([]);
  const [marksState, setMarksState] = useState({}); // { student_id: { marks_obtained, comments } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function initOptions() {
      try {
        const [classRes, examRes] = await Promise.all([
          api.getClasses(),
          api.getExams()
        ]);
        if (classRes.success && classRes.classes.length > 0) {
          setClasses(classRes.classes);
        }
        if (examRes.success && examRes.exams.length > 0) {
          setExams(examRes.exams);
          setSelectedExam(examRes.exams[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    initOptions();
  }, []);

  // When selected class changes, load its subjects
  useEffect(() => {
    async function loadClassSubjects() {
      if (!selectedClass) return;
      try {
        const res = await api.getClassById(selectedClass);
        if (res.success && res.class.subjects?.length > 0) {
          setSubjects(res.class.subjects);
          setSelectedSubject(res.class.subjects[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadClassSubjects();
  }, [selectedClass]);

  // When class, subject, or exam changes, load grade sheet
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedExam) {
      loadSheet();
    }
  }, [selectedClass, selectedSubject, selectedExam]);

  async function loadSheet() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.getGradesSheet(selectedClass, selectedSubject, selectedExam);
      if (res.success) {
        setStudents(res.students);
        const map = {};
        res.students.forEach((st) => {
          map[st.student_id] = {
            marks_obtained: st.marks_obtained !== null && st.marks_obtained !== undefined ? st.marks_obtained : '',
            comments: st.comments || ''
          };
        });
        setMarksState(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleMarksChange(studentId, val) {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: val
      }
    }));
  }

  function handleCommentsChange(studentId, val) {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comments: val
      }
    }));
  }

  function getComputedGrade(marks) {
    if (marks === '' || marks === undefined || marks === null) return '-';
    const num = parseFloat(marks);
    if (isNaN(num)) return '-';
    if (num >= 90) return 'A+';
    if (num >= 80) return 'A';
    if (num >= 70) return 'B+';
    if (num >= 60) return 'B';
    if (num >= 50) return 'C';
    return 'F';
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const gradesList = Object.keys(marksState).map((sId) => ({
        student_id: Number(sId),
        marks_obtained: marksState[sId].marks_obtained,
        max_marks: 100,
        comments: marksState[sId].comments
      }));

      const res = await api.saveGradesBatch({
        exam_id: Number(selectedExam),
        subject_id: Number(selectedSubject),
        grades: gradesList
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Examination marks and remarks recorded successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save grades.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Gradebook & Mark Entry</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Record test scores, compute performance letters, and provide student evaluation comments.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn btn-primary"
          id="save-grades-btn"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save All Marks'}</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">Class Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600 }}
              id="grades-class-select"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600 }}
              id="grades-subject-select"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Assessment Term</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600 }}
              id="grades-exam-select"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.term})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: feedback.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* Grade Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Student</th>
              <th style={{ width: '160px' }}>Marks Obtained (/100)</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Letter Grade</th>
              <th>Teacher Feedback Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  Loading grading sheet...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  No students in this class.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => {
                const marks = marksState[st.student_id]?.marks_obtained ?? '';
                const letter = getComputedGrade(marks);
                const comments = marksState[st.student_id]?.comments || '';

                return (
                  <tr key={st.student_id}>
                    <td style={{ color: '#94A3B8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={st.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {st.first_name} {st.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                            {st.admission_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Marks Input */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={marks}
                          onChange={(e) => handleMarksChange(st.student_id, e.target.value)}
                          className="form-input"
                          style={{ width: '90px', fontWeight: 700, fontSize: '0.9375rem', textAlign: 'center' }}
                          placeholder="0-100"
                        />
                        <span style={{ color: '#64748B', fontSize: '0.8125rem' }}>/ 100</span>
                      </div>
                    </td>

                    {/* Auto Computed Grade Badge */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          backgroundColor:
                            letter.includes('A') ? '#DCFCE7' : (letter.includes('B') ? '#EEF2FF' : (letter === 'C' ? '#FEF3C7' : '#F1F5F9')),
                          color:
                            letter.includes('A') ? '#15803D' : (letter.includes('B') ? '#4338CA' : (letter === 'C' ? '#B45309' : '#64748B'))
                        }}
                      >
                        {letter}
                      </span>
                    </td>

                    {/* Comments Input */}
                    <td>
                      <input
                        type="text"
                        value={comments}
                        onChange={(e) => handleCommentsChange(st.student_id, e.target.value)}
                        className="form-input"
                        placeholder="e.g. Excellent problem solving ability"
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
