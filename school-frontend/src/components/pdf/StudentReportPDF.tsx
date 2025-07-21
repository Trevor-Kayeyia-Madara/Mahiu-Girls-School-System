
// src/components/pdf/StudentReportPDF.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer'

// Define interfaces for typing
interface ExamEntry {
  exam: string
  score: number
  term: string
  year: string
}

interface SubjectReport {
  subject_name: string
  average_score: number
  kcse_grade: string
  exams: ExamEntry[]
}

interface LeaderboardEntry {
  student_id: number
  student_name: string
  mean: number
  kcse_grade: string
}

interface StudentReport {
  student_id: number
  student_name: string
  class_name: string
  term: string
  year: string
  mean_score: number
  kcse_grade: string
  position: number
  class_average: number
  subjects: SubjectReport[]
  leaderboard: LeaderboardEntry[]
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  heading: {
    fontSize: 14,
    marginVertical: 6,
    fontWeight: 'bold',
    color: '#1f4f91'
  },
  text: {
    marginBottom: 4
  },
  table: {
    flexDirection: 'column',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#000'
  },
  row: {
    flexDirection: 'row'
  },
  cell: {
    flex: 1,
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#ccc'
  },
  bold: {
    fontWeight: 'bold'
  }
})

const StudentReportPDF = ({ report }: { report: StudentReport }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>📘 Student Report Card</Text>

      {/* Student Info */}
      <View style={styles.section}>
        <Text style={styles.text}>Student: {report.student_name}</Text>
        <Text style={styles.text}>Class: {report.class_name}</Text>
        <Text style={styles.text}>Term: {report.term}</Text>
        <Text style={styles.text}>Year: {report.year}</Text>
      </View>

      {/* Overall Summary */}
      <View style={styles.section}>
        <Text style={styles.heading}>Performance Summary</Text>
        <Text style={styles.text}>Mean Score: {report.mean_score}</Text>
        <Text style={styles.text}>KCSE Grade: {report.kcse_grade}</Text>
        <Text style={styles.text}>Position: #{report.position}</Text>
        <Text style={styles.text}>Class Average: {report.class_average}</Text>
      </View>

      {/* Subjects Table */}
      <Text style={styles.heading}>📚 Subjects</Text>
      <View style={styles.table}>
        <View style={[styles.row, styles.bold]}>
          <Text style={styles.cell}>Subject</Text>
          <Text style={styles.cell}>Average</Text>
          <Text style={styles.cell}>KCSE Grade</Text>
          <Text style={styles.cell}>Exams</Text>
        </View>
        {report.subjects.map((subject, idx) => (
          <View style={styles.row} key={idx}>
            <Text style={styles.cell}>{subject.subject_name}</Text>
            <Text style={styles.cell}>{subject.average_score}</Text>
            <Text style={styles.cell}>{subject.kcse_grade}</Text>
            <Text style={styles.cell}>
              {subject.exams.map(e => `${e.exam}: ${e.score}`).join(', ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Leaderboard */}
      <Text style={styles.heading}>🏅 Top Students</Text>
      {report.leaderboard.map((s, i) => (
        <Text key={s.student_id} style={styles.text}>
          #{i + 1} {s.student_name} — {s.mean} ({s.kcse_grade})
        </Text>
      ))}
    </Page>
  </Document>
)

export default StudentReportPDF
