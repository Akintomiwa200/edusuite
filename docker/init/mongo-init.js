// ══════════════════════════════════════════════
//  MongoDB Initialization Script
//  Runs when the MongoDB container starts for the first time
// ══════════════════════════════════════════════

// Switch to the edusuite database
db = db.getSiblingDB('edusuite')

// Create application user with limited permissions
db.createUser({
  user: 'edusuite_app',
  pwd: 'edusuite_app_pass',
  roles: [
    { role: 'readWrite', db: 'edusuite' },
    { role: 'dbAdmin', db: 'edusuite' },
  ],
})

// ── Create Collections with Schema Validation ───────────────────

// Users collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName', 'role', 'schoolId'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        role: {
          bsonType: 'string',
          enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN', 'HR_MANAGER', 'COUNSELOR'],
        },
      },
    },
  },
})

// ── Create Indexes ──────────────────────────────────────────────

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email' })
db.users.createIndex({ schoolId: 1, role: 1, isActive: 1 }, { name: 'idx_users_school_role' })
db.users.createIndex({ branchId: 1, role: 1 }, { name: 'idx_users_branch_role' })
db.users.createIndex(
  { firstName: 'text', lastName: 'text', email: 'text' },
  { name: 'idx_users_text_search' },
)

// Students indexes
db.students.createIndex({ admissionNumber: 1 }, { unique: true, name: 'idx_students_admission' })
db.students.createIndex({ schoolId: 1, classId: 1, isActive: 1 }, { name: 'idx_students_class' })
db.students.createIndex({ parentIds: 1 }, { name: 'idx_students_parents' })

// Attendance indexes
db.attendance.createIndex({ schoolId: 1, classId: 1, date: 1 }, { name: 'idx_attendance_class_date' })
db.attendance.createIndex({ 'records.studentId': 1, date: 1 }, { name: 'idx_attendance_student' })

// Fees indexes
db.studentfees.createIndex({ studentId: 1, termId: 1 }, { name: 'idx_fees_student_term' })
db.studentfees.createIndex({ status: 1, dueDate: 1 }, { name: 'idx_fees_status_due' })

// Results indexes
db.results.createIndex({ studentId: 1, termId: 1 }, { name: 'idx_results_student_term' })
db.results.createIndex({ examId: 1 }, { name: 'idx_results_exam' })

// Live classes indexes
db.liveclasses.createIndex({ roomName: 1 }, { unique: true, name: 'idx_liveclass_room' })
db.liveclasses.createIndex({ teacherId: 1, status: 1 }, { name: 'idx_liveclass_teacher' })
db.liveclasses.createIndex({ scheduledStart: 1, status: 1 }, { name: 'idx_liveclass_schedule' })

// Social posts indexes
db.socialposts.createIndex({ schoolId: 1, createdAt: -1 }, { name: 'idx_social_school_time' })
db.socialposts.createIndex({ authorId: 1 }, { name: 'idx_social_author' })

// Notifications indexes
db.notifications.createIndex({ recipientId: 1, isRead: 1, createdAt: -1 }, { name: 'idx_notifications_recipient' })
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000, name: 'idx_notifications_ttl' }) // 30 days TTL

// Leave requests indexes
db.leaverequests.createIndex({ userId: 1, status: 1 }, { name: 'idx_leave_user_status' })
db.leaverequests.createIndex({ schoolId: 1, status: 1, startDate: 1 }, { name: 'idx_leave_school' })

// Assignments indexes
db.assignments.createIndex({ classId: 1, termId: 1, status: 1 }, { name: 'idx_assignments_class' })
db.assignments.createIndex({ teacherId: 1 }, { name: 'idx_assignments_teacher' })
db.assignments.createIndex({ dueDate: 1 }, { name: 'idx_assignments_due' })

print('✅ EduSuite MongoDB initialized successfully')
print('   Collections created with schema validation')
print('   Indexes created for optimal performance')

// ─── Additional indexes for PRD v2.5 modules ─────────────────────────────────

// Leave Management
db.leave_requests.createIndex({ schoolId: 1, userId: 1, status: 1 });
db.leave_requests.createIndex({ schoolId: 1, startDate: 1, endDate: 1 });
db.leave_balances.createIndex({ userId: 1, leaveType: 1, year: 1 }, { unique: true });

// Health & Medical
db.student_health.createIndex({ studentId: 1 }, { unique: true });
db.clinic_visits.createIndex({ schoolId: 1, visitDate: -1 });
db.clinic_visits.createIndex({ patientId: 1, patientType: 1 });

// Transport
db.vehicles.createIndex({ schoolId: 1, status: 1 });
db.transport_routes.createIndex({ schoolId: 1, branchId: 1, isActive: 1 });
db.trip_logs.createIndex({ routeId: 1, date: -1 });

// Hostel
db.hostel_allocations.createIndex({ studentId: 1, termId: 1 });
db.hostel_exeats.createIndex({ studentId: 1, status: 1 });

// Inventory
db.inventory_items.createIndex({ schoolId: 1, category: 1, isActive: 1 });
db.inventory_items.createIndex({ sku: 1 }, { unique: true });
db.stock_movements.createIndex({ itemId: 1, createdAt: -1 });

// Sports
db.sports_teams.createIndex({ schoolId: 1, sport: 1 });
db.match_fixtures.createIndex({ schoolId: 1, matchDate: -1 });
db.house_points.createIndex({ houseId: 1, createdAt: -1 });

// Events
db.events.createIndex({ schoolId: 1, startDate: 1, status: 1 });
db.venue_bookings.createIndex({ schoolId: 1, startDateTime: 1, endDateTime: 1 });

// Admissions
db.admissions_enquiries.createIndex({ schoolId: 1, status: 1, nextFollowUpDate: 1 });
db.admission_applications.createIndex({ applicationNumber: 1 }, { unique: true });
db.admission_applications.createIndex({ schoolId: 1, status: 1, academicYearId: 1 });

// Cafeteria
db.meal_subscriptions.createIndex({ studentId: 1, termId: 1 });
db.meal_transactions.createIndex({ studentId: 1, date: -1 });

// Maintenance
db.maintenance_requests.createIndex({ schoolId: 1, status: 1, priority: 1 });
db.maintenance_requests.createIndex({ ticketNumber: 1 }, { unique: true });

// ICT
db.ict_assets.createIndex({ assetTag: 1 }, { unique: true });
db.it_tickets.createIndex({ schoolId: 1, status: 1 });

// Security
db.visitor_logs.createIndex({ schoolId: 1, date: -1 });
db.gate_logs.createIndex({ schoolId: 1, timestamp: -1 });
db.security_incidents.createIndex({ incidentNumber: 1 }, { unique: true });

// Alumni
db.alumni.createIndex({ schoolId: 1, graduationYear: 1 });
db.alumni.createIndex({ email: 1 });

// Payroll
db.payroll_records.createIndex({ userId: 1, year: 1, month: 1 }, { unique: true });
db.payroll_records.createIndex({ schoolId: 1, month: 1, year: 1, status: 1 });

// Gamification
db.student_points.createIndex({ schoolId: 1, totalPoints: -1 });
db.points_transactions.createIndex({ studentId: 1, createdAt: -1 });

// Communication
db.notice_board.createIndex({ schoolId: 1, type: 1, isActive: 1 });
db.bulk_messages.createIndex({ schoolId: 1, sentAt: -1 });
db.direct_messages.createIndex({ senderId: 1, recipientId: 1, createdAt: -1 });

// Audit Logs - TTL
db.audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years
db.audit_logs.createIndex({ schoolId: 1, module: 1, action: 1, timestamp: -1 });

print("All PRD v2.5 indexes created successfully");
