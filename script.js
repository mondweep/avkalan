// Import the Google AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

async function fetchApiKey() {
    try {
        const response = await fetch("http://localhost:5050/api-key");
        const data = await response.json();
        if (data.apiKey) {
            return data.apiKey;
        } else {
            throw new Error(data.error || "API key not found");
        }
    } catch (error) {
        console.error("Failed to fetch API key:", error);
        alert("Failed to fetch API key from backend. Please check backend server.");
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration ---
    const API_KEY = await fetchApiKey();
    if (!API_KEY) return;

    // --- Initialize Google AI ---
    let genAI;
    let model;
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }); // Changed model name
        console.log("Google AI SDK Initialized with model gemini-2.0-flash-001.");
    } catch (error) {
        console.error("Error initializing Google AI SDK:", error);
        // Optionally display an error message to the user in the UI
        alert("Failed to initialize AI Chat functionality. Please check the API key and console for errors.");
    }


    // --- Mock Data Generation ---
    const subjects = ["Mathematics", "Further Maths", "Physics", "Chemistry", "Biology", "English Literature", "History", "Geography", "Computer Science", "Art & Design", "French", "Spanish"];
    const grades = ["A*", "A", "B", "C", "D", "E", "U"]; // Index 0 is best
    const alpsGrades = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const teachers = {
        teacher1: { name: "Ms. Evans", subjects: ["Physics", "Chemistry", "Biology"] },
        teacher2: { name: "Mr. Jones", subjects: ["Mathematics", "Further Maths", "Computer Science"] }
    };
    const classes = {
        classA: { name: "Year 9 - Set 1 Science", teacher: "teacher1", subjects: ["Physics", "Chemistry", "Biology"], yearGroup: 9 },
        classB: { name: "Year 10 - Maths Group 2", teacher: "teacher2", subjects: ["Mathematics"], yearGroup: 10 },
        classC: { name: "Year 11 - GCSE Physics", teacher: "teacher1", subjects: ["Physics"], yearGroup: 11 },
        classD: { name: "Year 12 - A-Level Further Maths", teacher: "teacher2", subjects: ["Further Maths"], yearGroup: 12 },
        classE: { name: "Year 11 - GCSE CompSci", teacher: "teacher2", subjects: ["Computer Science"], yearGroup: 11 }
    };

    const mockStudents = [];
    const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Ryan", "Sophia", "Tom"];
    const lastNames = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark"];

    for (let i = 0; i < 100; i++) {
        const student = {
            id: `student_${i+1}`,
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            yearGroup: Math.floor(Math.random() * 5) + 9, // Year 9 to 13
            subjects: {}, // Subject-specific data
            engagement: { // Simulated engagement
                homeworkCompletion: Math.random() * 0.4 + 0.6, // 60-100%
                onlineParticipation: Math.random() * 0.5 + 0.5, // 50-100%
                attendance: Math.random() * 0.1 + 0.9 // 90-100%
            }
        };
        // Assign subjects and mock grades based on year group
        const numSubjects = student.yearGroup < 12 ? Math.floor(Math.random() * 3) + 6 : 3; // GCSE vs A-Level
        const availableSubjects = [...subjects];
        for(let j=0; j<numSubjects && availableSubjects.length > 0; j++) {
            const subjIndex = Math.floor(Math.random() * availableSubjects.length);
            const subjectName = availableSubjects.splice(subjIndex, 1)[0];

            // Simulate performance data for multiple years (for benchmarking)
            student.subjects[subjectName] = {};
            for (let yearOffset = 0; yearOffset < 4; yearOffset++) {
                const academicYear = `${2020+yearOffset}/${2021+yearOffset}`;
                // Simulate some variation year on year
                const gradeIndex = Math.max(0, Math.min(grades.length - 1, Math.floor(Math.random() * grades.length) + Math.floor(Math.random()*3)-1 - yearOffset)); // Tendency to slightly improve over time baseline
                const targetGradeIndex = Math.max(0, gradeIndex - (Math.random() > 0.7 ? 1 : 0)); // Target usually same or one above
                const mockScore = Math.random() * 0.6 + 0.4; // Mock score (0.4-1.0)
                const mockAlps = alpsGrades[Math.floor(Math.random() * alpsGrades.length)]; // Random Alps grade for simplicity

                student.subjects[subjectName][academicYear] = {
                    predictedGrade: grades[gradeIndex],
                    targetGrade: grades[targetGradeIndex],
                    mockExamScore: (mockScore * 100).toFixed(1) + '%',
                    assessments: [ // Simulate a couple of assessment points
                        { name: 'Mock 1', grade: grades[Math.min(grades.length -1, gradeIndex + (Math.random() > 0.6 ? 1 : 0))] }, // Sometimes dip in mocks
                        { name: 'Topic Test', grade: grades[Math.max(0, gradeIndex - (Math.random() > 0.8 ? 1 : 0))] }
                    ],
                    alpsGrade: mockAlps, // Simplified ALPS grade per subject/student/year
                    alpsScore: (Math.random() * 0.6 + 0.5).toFixed(2) // Simplified ALPS score
                };
            }
        }
        mockStudents.push(student);
    }
    // console.log("Generated Mock Students:", mockStudents); // For debugging

    // --- Populate Subject Dropdowns ---
    const subjectSelectIntervention = document.getElementById('subject-select-intervention');
    // Add more subject selects if needed for other tabs

    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        if (subjectSelectIntervention) subjectSelectIntervention.appendChild(option.cloneNode(true));
        // Add to other selects here
    });
     // Set default subject for intervention
    if (subjectSelectIntervention) subjectSelectIntervention.value = "Further Maths";


    // --- Tab Switching Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Deactivate all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Capability Logic ---

    // 1. Student Intervention
    const analyzeInterventionButton = document.getElementById('analyze-intervention');
    const interventionOutputTableBody = document.querySelector('#student-intervention-table tbody');
    const targetGapAnalysisP = document.getElementById('target-gap-analysis');
    const targetAlpsGradeInput = document.getElementById('target-alps-grade');
    const downloadTrackerButton = document.getElementById('download-tracker');

    function getGradeValue(grade) {
        // Assign numerical value for comparison (lower is better)
        return grades.indexOf(grade);
    }

    function suggestInterventions(predictedGrade) {
        const gradeVal = getGradeValue(predictedGrade);
        if (gradeVal >= 4) return "Focus on foundational concepts; Small group work; Extra practice problems."; // D, E, U
        if (gradeVal >= 2) return "Targeted topic revision (e.g., Algebra); Past paper practice; Peer tutoring."; // B, C
        return "Extension activities; University-style problems; Independent research project guidance."; // A*, A
    }

    // --- CSV Import Functionality ---
    let importedStudents = null; // Will hold parsed students if CSV is uploaded
    const fileInput = document.querySelector('input[type="file"]');

    // Helper: Parse CSV row to student object (assumes exported format)
    function csvRowToStudent(row) {
        // Expecting: Student Name,Current Predicted Grade,Target Grade (Min),Gap,Suggested Priority,Suggested Interventions
        const [name, predictedGrade, targetGrade] = row;
        if (!name) return null;
        const [firstName, ...lastNameParts] = name.split(' ');
        return {
            id: `imported_${name.replace(/\s+/g, '_')}`,
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            yearGroup: 11, // Default, or parse from extra columns if present
            subjects: {
                // We'll use a single subject for imported data, as subject is selected in UI
                [subjectSelectIntervention.value]: {
                    '2023/2024': {
                        predictedGrade: predictedGrade || '',
                        targetGrade: targetGrade || '',
                        mockExamScore: '',
                        assessments: [],
                        alpsGrade: 5, // Placeholder
                        alpsScore: ''
                    }
                }
            },
            engagement: {
                homeworkCompletion: 1,
                onlineParticipation: 1,
                attendance: 1
            }
        };
    }

    // Use PapaParse for robust CSV parsing (add via CDN if not present)
    function handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            // Use PapaParse if available, else fallback to simple split
            if (window.Papa) {
                const parsed = Papa.parse(csv, { skipEmptyLines: true });
                const rows = parsed.data;
                // Skip header row, map to students
                importedStudents = rows.slice(1).map(csvRowToStudent).filter(Boolean);
            } else {
                // Simple fallback: split by lines/commas
                const rows = csv.split('\n').map(line => line.split(','));
                importedStudents = rows.slice(1).map(csvRowToStudent).filter(Boolean);
            }
            // Re-run analysis with imported data
            calculateIntervention();
        };
        reader.readAsText(file);
    }
    if (fileInput) fileInput.addEventListener('change', handleCSVImport);

    // Helper to get current students (imported or mock)
    function getCurrentStudents() {
        return importedStudents && importedStudents.length > 0 ? importedStudents : mockStudents;
    }

    function calculateIntervention() {
        const selectedSubject = subjectSelectIntervention.value;
        const targetAlpsGrade = parseInt(targetAlpsGradeInput.value); // Target for the *department*
        const currentAcademicYear = "2023/2024"; // Assume current year for prediction

        // Simulate calculating current Alps grade (very simplified)
        let currentAlpsSum = 0;
        let studentCount = 0;
        getCurrentStudents().forEach(s => {
             if (s.subjects[selectedSubject] && s.subjects[selectedSubject][currentAcademicYear]) {
                 currentAlpsSum += s.subjects[selectedSubject][currentAcademicYear].alpsGrade;
                 studentCount++;
             }
        });
        const currentAlpsGrade = studentCount > 0 ? Math.round(currentAlpsSum / studentCount) : 5; // Default 5 if no data

        // Simulate how many need to improve (highly simplified placeholder logic)
        const studentsNeeded = Math.max(0, Math.ceil(studentCount * (currentAlpsGrade - targetAlpsGrade) * 0.15)); // Placeholder factor
        targetGapAnalysisP.textContent = `Current simulated Alpha Grade for ${selectedSubject}: ${currentAlpsGrade}. To reach target grade ${targetAlpsGrade}, analysis suggests ${studentsNeeded} students need to improve by at least one grade.`;

        // Filter and sort students for the table
        const relevantStudents = getCurrentStudents()
            .filter(s => s.subjects[selectedSubject] && s.subjects[selectedSubject][currentAcademicYear])
            .map(s => {
                const subjectData = s.subjects[selectedSubject][currentAcademicYear];
                const predictedGrade = subjectData.predictedGrade;
                const targetGrade = subjectData.targetGrade; // Using student's own target for simplicity here
                const predictedValue = getGradeValue(predictedGrade);
                const targetValue = getGradeValue(targetGrade);
                const gap = targetValue - predictedValue; // Negative means below target
                return {
                    ...s,
                    predictedGrade,
                    targetGrade,
                    gap,
                    priority: gap < 0 ? (gap < -1 ? 'High' : 'Medium') : 'Low' // Prioritize those furthest below
                };
            })
            .filter(s => s.gap < 0) // Only show students below target
            .sort((a, b) => a.gap - b.gap); // Sort by gap (most negative first)

        // Populate table
        interventionOutputTableBody.innerHTML = ''; // Clear previous results
        relevantStudents.forEach(s => {
            const row = interventionOutputTableBody.insertRow();
            row.innerHTML = `
                <td>${s.firstName} ${s.lastName}</td>
                <td>${s.predictedGrade}</td>
                <td>${s.targetGrade}</td>
                <td>${s.gap}</td>
                <td>${s.priority}</td>
                <td>${suggestInterventions(s.predictedGrade)}</td>
            `;
        });
    }

     function downloadCSV() {
        const selectedSubject = subjectSelectIntervention.value;
        let csvContent = "data:text/csv;charset=utf-8,";
        // Updated Header Row to include all visible columns + tracking columns
        csvContent += "Student Name,Current Predicted Grade,Target Grade (Min),Gap,Suggested Priority,Suggested Interventions,Intervention Start Date,Intervention Type,Progress Check 1 (Date/Notes),Progress Check 2 (Date/Notes),Outcome\n";

        const rows = interventionOutputTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            // Extract data from all relevant columns in the HTML table
            const name = cols[0]?.textContent.trim() ?? '';
            const predictedGrade = cols[1]?.textContent.trim() ?? '';
            const targetGrade = cols[2]?.textContent.trim() ?? '';
            const gap = cols[3]?.textContent.trim() ?? '';
            const priority = cols[4]?.textContent.trim() ?? '';
            const suggestedInterventions = cols[5]?.textContent.trim() ?? '';

            // Escape double quotes within data by doubling them
            const escapeCSV = (str) => `"${str.replace(/"/g, '""')}"`;

            // Construct the CSV row with extracted data + placeholders for tracking
            const rowData = [
                escapeCSV(name),
                escapeCSV(predictedGrade),
                escapeCSV(targetGrade),
                escapeCSV(gap),
                escapeCSV(priority),
                escapeCSV(suggestedInterventions),
                '""', // Placeholder for Intervention Start Date
                '""', // Placeholder for Intervention Type
                '""', // Placeholder for Progress Check 1
                '""', // Placeholder for Progress Check 2
                '""'  // Placeholder for Outcome
            ].join(',');
            csvContent += rowData + "\n";
        });

        // --- Add Chat History ---
        csvContent += "\n"; // Add a blank line separator
        csvContent += '"--- Chat History ---"\n'; // Section header
        csvContent += '"Sender","Message"\n'; // Chat header row

        const chatMessagesContainer = document.getElementById('chat-messages-intervention');
        if (chatMessagesContainer) {
            const messages = chatMessagesContainer.querySelectorAll('.user-message, .ai-message, .error-message');
            messages.forEach(messageElement => {
                let sender = "Unknown";
                let messageText = messageElement.textContent || ""; // Get raw text

                if (messageElement.classList.contains('user-message')) {
                    sender = "You";
                    // Remove the "You: " prefix if present
                    messageText = messageText.replace(/^You:\s*/, '').trim();
                } else if (messageElement.classList.contains('ai-message')) {
                    sender = "AI";
                     // Remove the "AI: " prefix if present
                    messageText = messageText.replace(/^AI:\s*/, '').trim();
                } else if (messageElement.classList.contains('error-message')) {
                    sender = "Error";
                     // Remove the "Error: " prefix if present
                    messageText = messageText.replace(/^Error:\s*/, '').trim();
                }

                 // Escape double quotes within data by doubling them
                const escapeCSV = (str) => `"${str.replace(/"/g, '""')}"`;

                const chatRowData = [
                    escapeCSV(sender),
                    escapeCSV(messageText)
                ].join(',');
                csvContent += chatRowData + "\n";
            });
        }
        // --- End Add Chat History ---


        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `intervention_tracker_${selectedSubject.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    }


    if (analyzeInterventionButton) analyzeInterventionButton.addEventListener('click', calculateIntervention);
    if (downloadTrackerButton) downloadTrackerButton.addEventListener('click', downloadCSV);

    // 2. Exam Prediction
    const runPredictionButton = document.getElementById('run-prediction');
    const predictionOutputSummary = document.getElementById('subject-risk-summary');
    const predictionOutputDeepDive = document.getElementById('subject-deep-dive');
    const examLevelSelect = document.getElementById('exam-level-select');

    function runPredictionAnalysis() {
        const selectedLevel = examLevelSelect.value; // GCSE or A-Level
        const currentAcademicYear = "2023/2024";
        predictionOutputSummary.innerHTML = '';
        predictionOutputDeepDive.innerHTML = '';

        const subjectPerformance = {}; // { subjectName: { totalScore: X, count: Y, trends: [], underperforming: Z } }

        getCurrentStudents().forEach(student => {
            const studentYear = student.yearGroup;
            // Basic level filtering
            if ((selectedLevel === 'GCSE' && studentYear > 11) || (selectedLevel === 'A-Level' && studentYear < 12)) {
                return;
            }

            Object.keys(student.subjects).forEach(subjectName => {
                if (!subjectPerformance[subjectName]) {
                    subjectPerformance[subjectName] = { totalScore: 0, count: 0, trends: [], underperformingCount: 0, recentGrades: [] };
                }

                const yearData = student.subjects[subjectName][currentAcademicYear];
                if (yearData) {
                    subjectPerformance[subjectName].count++;
                    const predictedValue = getGradeValue(yearData.predictedGrade);
                    const targetValue = getGradeValue(yearData.targetGrade);
                    subjectPerformance[subjectName].totalScore += predictedValue; // Lower is better
                    if (predictedValue > targetValue) {
                        subjectPerformance[subjectName].underperformingCount++;
                    }
                    // Simulate trend analysis based on last couple of assessments
                     if(yearData.assessments.length >= 2) {
                         const trend = getGradeValue(yearData.assessments[1].grade) - getGradeValue(yearData.assessments[0].grade);
                         subjectPerformance[subjectName].trends.push(trend); // positive = decline, negative = improvement
                     }
                     subjectPerformance[subjectName].recentGrades.push(predictedValue);
                }
            });
        });

        // Analyze aggregated data
        Object.keys(subjectPerformance).forEach(subjectName => {
            const data = subjectPerformance[subjectName];
            if (data.count === 0) return;

            const avgPredictedValue = data.totalScore / data.count;
            const underperformingRatio = data.underperformingCount / data.count;
            const avgTrend = data.trends.reduce((a, b) => a + b, 0) / (data.trends.length || 1);

            let riskLevel = 'Low';
            let riskClass = 'risk-low';
            let reason = "Generally on track.";

            if (avgPredictedValue > 3.5 || underperformingRatio > 0.3 || avgTrend > 0.3) { // C/D average, >30% underperforming, or declining trend
                riskLevel = 'Medium';
                riskClass = 'risk-medium';
                reason = "Monitor performance trends and underperforming students.";
            }
            if (avgPredictedValue > 4.5 || underperformingRatio > 0.5 || avgTrend > 0.6) { // D average, >50% underperforming, or significant decline
                riskLevel = 'High';
                riskClass = 'risk-high';
                 reason = "Significant underperformance or declining trend detected. Intervention advised.";
            }

             // Display Summary
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `<strong>${subjectName}:</strong> <span class="${riskClass}">${riskLevel} Risk</span>`;
            predictionOutputSummary.appendChild(summaryDiv);

            // Display Deep Dive for Medium/High risk
            if (riskLevel === 'Medium' || riskLevel === 'High') {
                const deepDiveDiv = document.createElement('div');
                deepDiveDiv.innerHTML = `
                    <h4>${subjectName} (${riskLevel} Risk)</h4>
                    <p>Reason: ${reason}</p>
                    <p>Average Predicted Grade Value: ${avgPredictedValue.toFixed(2)} (0=A*, 6=U)</p>
                    <p>Percentage Below Target: ${(underperformingRatio * 100).toFixed(1)}%</p>
                    <p>Average Assessment Trend: ${avgTrend.toFixed(2)} (Positive indicates recent decline)</p>
                    <p><i>Suggested Action: Review specific student data, identify common weak areas, consider targeted revision.</i></p>
                `;
                 predictionOutputDeepDive.appendChild(deepDiveDiv);
            }
        });
         if (predictionOutputSummary.innerHTML === '') {
             predictionOutputSummary.innerHTML = '<p>No relevant student data found for the selected level.</p>';
         }
    }

    if (runPredictionButton) runPredictionButton.addEventListener('click', runPredictionAnalysis);


    // 3. Teacher Dashboard
    const loadDashboardButton = document.getElementById('load-dashboard');
    const teacherSelect = document.getElementById('teacher-select');
    const classSelect = document.getElementById('class-select');
    const dashboardSnapshot = document.getElementById('class-performance-snapshot');
    const dashboardAttentionTableBody = document.querySelector('#dashboard-students-attention tbody');
    const dashboardEngagement = document.getElementById('class-engagement-indicators');

    function loadTeacherDashboard() {
        const selectedTeacherId = teacherSelect.value;
        const selectedClassId = classSelect.value; // In reality, class list might depend on teacher
        const selectedClassInfo = classes[selectedClassId];
        const currentAcademicYear = "2023/2024";

        dashboardSnapshot.innerHTML = '';
        dashboardAttentionTableBody.innerHTML = '';
        dashboardEngagement.innerHTML = '';

        if (!selectedClassInfo) return;

        let totalPredictedValue = 0;
        let totalTargetValue = 0;
        let studentCount = 0;
        let subjectStrengths = {}; // { subject: scoreSum }
        let subjectCounts = {}; // { subject: count }
        let attentionStudents = [];
        let totalHomework = 0;
        let totalParticipation = 0;

        getCurrentStudents().forEach(student => {
            // Simple check if student *could* be in this class (based on year)
            // A real system would have explicit class lists
            if (student.yearGroup !== selectedClassInfo.yearGroup) return;

            let relevantSubjectCount = 0;
            selectedClassInfo.subjects.forEach(subjectName => {
                const subjectData = student.subjects[subjectName]?.[currentAcademicYear];
                if (subjectData) {
                    relevantSubjectCount++;
                    const predictedValue = getGradeValue(subjectData.predictedGrade);
                    const targetValue = getGradeValue(subjectData.targetGrade);
                    totalPredictedValue += predictedValue;
                    totalTargetValue += targetValue;

                    if (!subjectStrengths[subjectName]) subjectStrengths[subjectName] = 0;
                    if (!subjectCounts[subjectName]) subjectCounts[subjectName] = 0;
                    subjectStrengths[subjectName] += predictedValue;
                    subjectCounts[subjectName]++;

                    // Check for attention needed
                    let attentionReason = null;
                    if (predictedValue > targetValue + 1) { // More than 1 grade below target
                        attentionReason = `Significantly below target in ${subjectName} (Predicted: ${subjectData.predictedGrade}, Target: ${subjectData.targetGrade})`;
                    } else if (subjectData.assessments.length > 0 && getGradeValue(subjectData.assessments[0].grade) > predictedValue + 1) {
                         attentionReason = `Dropped 2+ grades in recent ${subjectName} assessment (${subjectData.assessments[0].name})`;
                    } else if (student.engagement.homeworkCompletion < 0.7) {
                        attentionReason = `Low homework completion (${(student.engagement.homeworkCompletion * 100).toFixed(0)}%)`;
                    } else if (student.engagement.attendance < 0.92) {
                         attentionReason = `Low attendance (${(student.engagement.attendance * 100).toFixed(0)}%)`;
                    }

                    if (attentionReason) {
                        attentionStudents.push({
                            name: `${student.firstName} ${student.lastName}`,
                            reason: attentionReason,
                            action: "Check in with student; Review recent work/attendance."
                        });
                    }
                }
            });

            if (relevantSubjectCount > 0) {
                studentCount++;
                totalHomework += student.engagement.homeworkCompletion;
                totalParticipation += student.engagement.onlineParticipation;
            }
        });

        if (studentCount === 0) {
            dashboardSnapshot.innerHTML = "<p>No student data found for this class.</p>";
            return;
        }

        // Performance Snapshot
        const avgPredicted = totalPredictedValue / (studentCount * selectedClassInfo.subjects.length);
        const avgTarget = totalTargetValue / (studentCount * selectedClassInfo.subjects.length);
        let performanceMsg = "Overall Class Performance: ";
        if (avgPredicted <= avgTarget) performanceMsg += "At or Above Target";
        else if (avgPredicted <= avgTarget + 0.5) performanceMsg += "Slightly Below Target";
        else performanceMsg += "Significantly Below Target";
        dashboardSnapshot.innerHTML += `<p>${performanceMsg} (Avg Predicted: ${avgPredicted.toFixed(2)}, Avg Target: ${avgTarget.toFixed(2)})</p>`;

        let strengths = [];
        let weaknesses = [];
        Object.keys(subjectStrengths).forEach(subj => {
            const avgSubjPred = subjectStrengths[subj] / subjectCounts[subj];
            if (avgSubjPred < avgPredicted - 0.5) strengths.push(subj);
            if (avgSubjPred > avgPredicted + 0.5) weaknesses.push(subj);
        });
        if (strengths.length > 0) dashboardSnapshot.innerHTML += `<p>Topic Strengths: ${strengths.join(', ')}</p>`;
        if (weaknesses.length > 0) dashboardSnapshot.innerHTML += `<p>Topic Weaknesses: ${weaknesses.join(', ')}</p>`;

        // Students Requiring Attention
        attentionStudents.forEach(att => {
            const row = dashboardAttentionTableBody.insertRow();
            row.innerHTML = `<td>${att.name}</td><td>${att.reason}</td><td>${att.action}</td>`;
        });
         if (attentionStudents.length === 0) {
             const row = dashboardAttentionTableBody.insertRow();
             row.innerHTML = `<td colspan="3">No students flagged for immediate attention.</td>`;
         }

        // Engagement Indicators
        const avgHomework = (totalHomework / studentCount * 100).toFixed(0);
        const avgParticipation = (totalParticipation / studentCount * 100).toFixed(0);
        dashboardEngagement.innerHTML = `
            <p>Avg. Homework Completion: ${avgHomework}%</p>
            <p>Avg. Online Participation: ${avgParticipation}%</p>
        `;
    }

    if (loadDashboardButton) loadDashboardButton.addEventListener('click', loadTeacherDashboard);


    // 4. School Benchmarking
    const runBenchmarkingButton = document.getElementById('run-benchmarking');
    const benchmarkYearsSelect = document.getElementById('benchmark-years');
    const benchmarkSummaryDiv = document.getElementById('benchmark-summary');
    const benchmarkComparisonDiv = document.getElementById('benchmark-comparison');
    const benchmarkRecommendationsDiv = document.getElementById('benchmark-recommendations');

    function runBenchmarkingAnalysis() {
        const numYears = parseInt(benchmarkYearsSelect.value);
        benchmarkSummaryDiv.innerHTML = '';
        benchmarkComparisonDiv.innerHTML = '';
        benchmarkRecommendationsDiv.innerHTML = '';

        const yearlySubjectPerformance = {}; // { year: { subject: { alpsSum: X, count: Y } } }
        const academicYears = Array.from({length: numYears}, (_, i) => `${2023-i}/${2024-i}`).reverse(); // e.g., ["2020/2021", ..., "2023/2024"]

        academicYears.forEach(year => {
            yearlySubjectPerformance[year] = {};
            getCurrentStudents().forEach(student => {
                Object.keys(student.subjects).forEach(subjectName => {
                    const yearData = student.subjects[subjectName]?.[year];
                    if (yearData) {
                        if (!yearlySubjectPerformance[year][subjectName]) {
                            yearlySubjectPerformance[year][subjectName] = { alpsSum: 0, count: 0, scoreSum: 0 };
                        }
                        yearlySubjectPerformance[year][subjectName].alpsSum += yearData.alpsGrade;
                        yearlySubjectPerformance[year][subjectName].scoreSum += parseFloat(yearData.alpsScore); // Use the mock ALPS score
                        yearlySubjectPerformance[year][subjectName].count++;
                    }
                });
            });
        });

        // Analyze trends and performance
        let overallTrend = 0;
        let lastYearOverallAlps = 0;
        let firstYearOverallAlps = 0;
        let overallCount = 0;

        const subjectTrends = {}; // { subject: { trend: X, avgAlps: Y, avgScore: Z, stability: S } }

        subjects.forEach(subjectName => {
            let yearlyAlps = [];
            let yearlyScores = [];
            let totalCount = 0;
            academicYears.forEach(year => {
                const data = yearlySubjectPerformance[year]?.[subjectName];
                if (data && data.count > 0) {
                    yearlyAlps.push(data.alpsSum / data.count);
                    yearlyScores.push(data.scoreSum / data.count);
                    totalCount += data.count;
                } else {
                    yearlyAlps.push(null); // Handle missing data
                    yearlyScores.push(null);
                }
            });

            if (totalCount < 5 * numYears) return; // Skip subjects with very little data across years

            const validAlps = yearlyAlps.filter(a => a !== null);
            const validScores = yearlyScores.filter(s => s !== null);
            if (validAlps.length < 2) return; // Need at least 2 years for trend

            const avgAlps = validAlps.reduce((a, b) => a + b, 0) / validAlps.length;
            const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
            const trend = validAlps[validAlps.length - 1] - validAlps[0]; // Simple start-to-end trend
            const stability = Math.max(...validAlps) - Math.min(...validAlps); // Range as stability measure

            subjectTrends[subjectName] = { trend, avgAlps, avgScore, stability };
        });

        // Categorize subjects
        const performingWell = [];
        const maintaining = [];
        const strategicAttention = [];
        // Mock National Benchmarks
        const nationalAvgAlps = 4.5;
        const nationalAvgScore = 0.75;

        Object.keys(subjectTrends).forEach(subjectName => {
            const data = subjectTrends[subjectName];
            // Lower ALPS is better, Higher Score is better
            if (data.avgAlps < nationalAvgAlps - 0.5 && data.trend <= 0 && data.stability < 2) {
                performingWell.push(subjectName);
            } else if (data.avgAlps > nationalAvgAlps + 0.5 || data.trend > 1 || data.stability > 3) {
                strategicAttention.push(subjectName);
            } else {
                maintaining.push(subjectName);
            }
        });

        // Calculate overall school trend (simplified)
        const firstYearData = yearlySubjectPerformance[academicYears[0]];
        const lastYearData = yearlySubjectPerformance[academicYears[academicYears.length - 1]];
        let firstYearSum = 0, firstYearCount = 0, lastYearSum = 0, lastYearCount = 0;
        Object.values(firstYearData || {}).forEach(d => { firstYearSum += d.alpsSum; firstYearCount += d.count; });
        Object.values(lastYearData || {}).forEach(d => { lastYearSum += d.alpsSum; lastYearCount += d.count; });
        firstYearOverallAlps = firstYearCount > 0 ? firstYearSum / firstYearCount : 5;
        lastYearOverallAlps = lastYearCount > 0 ? lastYearSum / lastYearCount : 5;
        overallTrend = lastYearOverallAlps - firstYearOverallAlps; // Negative is improvement

        // Display Summary
        benchmarkSummaryDiv.innerHTML = `
            <p><strong>Overall School Trend (${numYears} Years):</strong> ${overallTrend <= 0 ? 'Stable or Improving' : 'Declining'} (Simulated Alpha Grade change: ${overallTrend.toFixed(1)})</p>
            <p><strong>Subjects Performing Consistently Well:</strong> ${performingWell.join(', ') || 'None identified'}</p>
            <p><strong>Subjects Maintaining Performance:</strong> ${maintaining.join(', ') || 'None identified'}</p>
            <p><strong>Subjects Requiring Strategic Attention:</strong> ${strategicAttention.join(', ') || 'None identified'}</p>
        `;

        // Display Comparison (Placeholders)
        const percentile = 50 + Math.round((nationalAvgAlps - lastYearOverallAlps) * 15); // Very rough simulation
        benchmarkComparisonDiv.innerHTML = `
            <p>Overall performance places school in approx. <strong>${Math.max(10, Math.min(90, percentile))}th percentile</strong> nationally (simulated).</p>
            <p>Average Alpha Score vs National: ${(Object.values(subjectTrends).reduce((sum, s) => sum + s.avgScore, 0) / Object.keys(subjectTrends).length - nationalAvgScore).toFixed(2)} (simulated difference)</p>
        `;

        // Display Recommendations
        benchmarkRecommendationsDiv.innerHTML = `
            <ul>
                ${performingWell.length > 0 ? `<li>Celebrate and share best practices from: ${performingWell.join(', ')}.</li>` : ''}
                ${strategicAttention.length > 0 ? `<li>Investigate factors affecting performance in: ${strategicAttention.join(', ')}. Consider deep dives into curriculum, staffing, or resources.</li>` : ''}
                <li>Continue monitoring subjects maintaining performance.</li>
                <li>Use subject-level trend data to inform departmental reviews.</li>
            </ul>
        `;
    }

     if (runBenchmarkingButton) runBenchmarkingButton.addEventListener('click', runBenchmarkingAnalysis);

    // --- Chat Functionality ---
    const chatSendButtons = document.querySelectorAll('.chat-send-button');

    function displayChatMessage(tabId, message, sender) {
        const messagesContainer = document.getElementById(`chat-messages-${tabId}`);
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        if (sender === 'error') {
            messageDiv.classList.remove('ai-message');
            messageDiv.classList.add('error-message');
        }

        // Basic Markdown-like formatting for bold (**text**) - can be expanded
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'AI'}:</strong> ${message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    }

    async function handleChatMessage(event) {
        if (!model) {
             alert("AI Chat is not initialized. Check console for errors.");
             return;
        }

        const button = event.target;
        const tabId = button.getAttribute('data-tab');
        const inputElement = document.getElementById(`chat-input-${tabId}`);
        const messagesContainer = document.getElementById(`chat-messages-${tabId}`);
        const userMessage = inputElement.value.trim();

        if (!userMessage) return;

        displayChatMessage(tabId, userMessage, 'user');
        inputElement.value = ''; // Clear input field
        button.disabled = true; // Prevent multiple sends while waiting

        // Prepare context based on the active tab
        let contextPrompt = `You are an AI assistant for Alpha Education, analyzing school performance data. `;
        let relevantDataSummary = "";

        // --- Generate Context Summary (Crucial for LLM) ---
        // This needs to be concise yet informative. Summarizing 100 students fully is too much.
        // We'll provide a general overview and specifics related to the current view.
        // This part can be significantly improved for better AI responses.

        const currentAcademicYear = "2023/2024"; // Consistent assumption
        const activeStudents = getCurrentStudents().slice(0, 20); // Limit data sent for brevity in this example

        relevantDataSummary = `Context: Analyzing data for ${getCurrentStudents().length} students. Focus on the ${currentAcademicYear} academic year. Key subjects include ${subjects.slice(0,5).join(', ')} etc. Grades range from A* (best) to U (worst). Alpha grades range from 1 (best) to 9 (worst).\n\n`;

        try {
            if (tabId === 'intervention') {
                const selectedSubject = subjectSelectIntervention.value;
                const targetGrade = targetAlpsGradeInput.value;
                const studentsInTable = Array.from(interventionOutputTableBody.querySelectorAll('tr')).map(row => row.cells[0].textContent);
                contextPrompt += `The user is viewing the 'Student Intervention' tab for ${selectedSubject}, aiming for Alpha grade ${targetGrade}. `;
                relevantDataSummary += `Currently displayed students needing intervention: ${studentsInTable.join(', ') || 'None'}. \n`;
                // Add summary of a few relevant students from mock data
                 relevantDataSummary += `Sample student data (up to 5 relevant): \n` + getCurrentStudents()
                    .filter(s => s.subjects[selectedSubject]?.[currentAcademicYear] && getGradeValue(s.subjects[selectedSubject][currentAcademicYear].predictedGrade) > getGradeValue(s.subjects[selectedSubject][currentAcademicYear].targetGrade))
                    .slice(0, 5)
                    .map(s => `- ${s.firstName} ${s.lastName}: Predicted ${s.subjects[selectedSubject][currentAcademicYear].predictedGrade}, Target ${s.subjects[selectedSubject][currentAcademicYear].targetGrade}`)
                    .join('\n');

            } else if (tabId === 'prediction') {
                const selectedLevel = examLevelSelect.value;
                const riskSummary = predictionOutputSummary.innerText;
                contextPrompt += `The user is viewing the 'Exam Prediction' tab for ${selectedLevel} level. `;
                relevantDataSummary += `Current Risk Summary:\n${riskSummary}\n`;
                 // Add summary of a few high/medium risk subjects
                 relevantDataSummary += `Sample data for high/medium risk subjects (if any):\n` + Object.entries(subjectPerformance || {}) // Assuming subjectPerformance is accessible or recalculated
                    .filter(([_, data]) => data.riskLevel === 'High' || data.riskLevel === 'Medium')
                    .slice(0, 3)
                    .map(([name, data]) => `- ${name}: AvgPred ${data.avgPredictedValue?.toFixed(2)}, Underperforming ${(data.underperformingRatio * 100).toFixed(1)}%`)
                    .join('\n');


            } else if (tabId === 'dashboard') {
                const selectedTeacher = teacherSelect.options[teacherSelect.selectedIndex].text;
                const selectedClass = classSelect.options[classSelect.selectedIndex].text;
                const snapshot = dashboardSnapshot.innerText;
                const attentionStudents = Array.from(dashboardAttentionTableBody.querySelectorAll('tr')).map(row => row.cells[0].textContent).join(', ');
                contextPrompt += `The user is viewing the 'Teacher Dashboard' for ${selectedTeacher}, class ${selectedClass}. `;
                relevantDataSummary += `Class Snapshot:\n${snapshot}\nStudents needing attention: ${attentionStudents || 'None'}\n`;
                 // Add sample data for a few students in the class
                 const classInfo = classes[classSelect.value];
                 relevantDataSummary += `Sample student data (up to 5 in class):\n` + getCurrentStudents()
                    .filter(s => s.yearGroup === classInfo?.yearGroup) // Corrected this line
                    .slice(0, 5)
                    .map(s => `- ${s.firstName} ${s.lastName}: Year ${s.yearGroup}, Avg Homework ${(s.engagement.homeworkCompletion*100).toFixed(0)}%`)
                    .join('\n');


            } else if (tabId === 'benchmarking') {
                const years = benchmarkYearsSelect.value;
                const summary = benchmarkSummaryDiv.innerText;
                const comparison = benchmarkComparisonDiv.innerText;
                contextPrompt += `The user is viewing the 'School Benchmarking' tab for the last ${years} years. `;
                relevantDataSummary += `Strategic Summary:\n${summary}\nComparison:\n${comparison}\n`;
                 // Add sample trend data for a few subjects
                 relevantDataSummary += `Sample subject trend data (up to 5):\n` + Object.entries(subjectTrends || {}) // Assuming subjectTrends is accessible or recalculated
                    .slice(0, 5)
                     .map(([name, data]) => `- ${name}: AvgAlpha ${data.avgAlps?.toFixed(1)}, Trend ${data.trend?.toFixed(1)}`)
                     .join('\n');
            }

            // Add formatting instruction to the prompt
            const formattingInstruction = "When providing detailed plans, steps, or lists of items, please format your response using Markdown tables or bullet points for better readability.";
            const fullPrompt = `${contextPrompt}\n${relevantDataSummary}\n\n${formattingInstruction}\n\nUser Question: ${userMessage}\n\nAnswer:`;


            // console.log("Sending prompt to Gemini:", fullPrompt); // For debugging

            // Display thinking message
            displayChatMessage(tabId, "Thinking...", 'ai');
            const thinkingMessageElement = messagesContainer.lastChild; // Get reference to update/remove later

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            // Remove "Thinking..." message and display final response
            if(thinkingMessageElement && thinkingMessageElement.textContent.includes("Thinking...")) {
                messagesContainer.removeChild(thinkingMessageElement);
            }
            displayChatMessage(tabId, text, 'ai');

        } catch (error) {
            console.error("Error calling Gemini API:", error);
             // Remove "Thinking..." message if it exists
            const thinkingElement = messagesContainer.querySelector('.ai-message:last-child');
            if(thinkingElement && thinkingElement.textContent.includes("Thinking...")) {
                 messagesContainer.removeChild(thinkingElement);
            }
            displayChatMessage(tabId, `Error communicating with AI: ${error.message}`, 'error');
        } finally {
             button.disabled = false; // Re-enable send button
        }
    }

    chatSendButtons.forEach(button => {
        button.addEventListener('click', handleChatMessage);
        // Optional: Add listener for Enter key in input field
        const tabId = button.getAttribute('data-tab');
        const inputElement = document.getElementById(`chat-input-${tabId}`);
        if (inputElement) {
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleChatMessage({ target: button }); // Simulate button click
                }
            });
        }
    });


    // --- Initial Load ---
    // Ensure dropdowns are populated before triggering analyses that might use them
    console.log("Populating dropdowns and running initial analyses..."); // Debug log

    // Trigger analysis for the default view (Intervention) on load
    if (typeof calculateIntervention === 'function') {
        calculateIntervention();
        console.log("Initial Intervention analysis triggered.");
    } else {
        console.error("calculateIntervention function not found.");
    }

    // Trigger analysis for Prediction tab with default level (GCSE)
    if (typeof runPredictionAnalysis === 'function') {
        // Ensure the element exists before setting value (though it should)
        if(examLevelSelect) examLevelSelect.value = 'GCSE';
        runPredictionAnalysis();
        console.log("Initial Prediction analysis triggered.");
    } else {
         console.error("runPredictionAnalysis function not found.");
    }

    // Trigger analysis for Dashboard tab with default teacher/class
     if (typeof loadTeacherDashboard === 'function') {
        if(teacherSelect) teacherSelect.value = 'teacher1';
        if(classSelect) classSelect.value = 'classA';
        loadTeacherDashboard();
        console.log("Initial Dashboard analysis triggered.");
    } else {
         console.error("loadTeacherDashboard function not found.");
    }

     // Trigger analysis for Benchmarking tab with default timeframe (4 years)
     if (typeof runBenchmarkingAnalysis === 'function') {
        if(benchmarkYearsSelect) benchmarkYearsSelect.value = '4';
        runBenchmarkingAnalysis();
        console.log("Initial Benchmarking analysis triggered.");
    } else {
         console.error("runBenchmarkingAnalysis function not found.");
    }


    // Make analysis results accessible if needed by chat context
    // Note: These might need to be updated if the user changes selections and re-runs analysis
    // Make analysis results accessible if needed by chat context
    let subjectPerformance = {}; // For prediction tab context
    let subjectTrends = {}; // For benchmarking tab context
    // Re-run analyses or store results when tabs change if chat needs latest context
});
