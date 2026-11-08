// server/src/db/seed.js
/**
 * ============================================================================
 * DATABASE SEEDER (Realistic Demo Campus Data)
 * ============================================================================
 * Populates the SQLite database with realistic accounts, active drives,
 * and application states. Perfect for portfolio evaluation and instant interview
 * demonstrations without needing to manually register accounts.
 * ============================================================================
 */

const db = require('./database');
const { hashPassword } = require('../utils/password');

function seed() {
  console.log('Seeding database with realistic campus placement data...');

  // Clear existing tables in reverse dependency order
  db.exec(`
    DELETE FROM applications;
    DELETE FROM drives;
    DELETE FROM student_profiles;
    DELETE FROM recruiter_profiles;
    DELETE FROM users;
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (email, password, role, name)
    VALUES (?, ?, ?, ?)
  `);

  const insertStudentProfile = db.prepare(`
    INSERT INTO student_profiles (user_id, roll_number, branch, cgpa, graduation_year, resume_url, skills, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecruiterProfile = db.prepare(`
    INSERT INTO recruiter_profiles (user_id, company_name, company_website, industry, designation)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertDrive = db.prepare(`
    INSERT INTO drives (recruiter_id, company_name, title, description, ctc_lpa, min_cgpa, eligible_branches, job_location, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertApplication = db.prepare(`
    INSERT INTO applications (drive_id, student_id, status, recruiter_feedback)
    VALUES (?, ?, ?, ?)
  `);

  // Transaction ensures all or nothing
  const transaction = db.transaction(() => {
    // 1. TPO Admin
    const adminPass = hashPassword('Admin@123');
    insertUser.run('admin@college.edu', adminPass, 'TPO_ADMIN', 'Prof. Rajesh Sharma (TPO Head)');

    // 2. Recruiters
    const recruiterPass = hashPassword('Recruiter@123');

    const googleUser = insertUser.run('google@recruiter.com', recruiterPass, 'RECRUITER', 'Sundar Kumar');
    insertRecruiterProfile.run(googleUser.lastInsertRowid, 'Google', 'https://careers.google.com', 'Information Technology', 'Lead University Recruiter');

    const msftUser = insertUser.run('microsoft@recruiter.com', recruiterPass, 'RECRUITER', 'Satya Priya');
    insertRecruiterProfile.run(msftUser.lastInsertRowid, 'Microsoft', 'https://careers.microsoft.com', 'Cloud & Enterprise', 'Senior Talent Partner');

    const amazonUser = insertUser.run('amazon@recruiter.com', recruiterPass, 'RECRUITER', 'Andy Gupta');
    insertRecruiterProfile.run(amazonUser.lastInsertRowid, 'Amazon', 'https://amazon.jobs', 'E-Commerce & AWS', 'Campus Relations Lead');

    // 3. Students
    const studentPass = hashPassword('Student@123');

    const alice = insertUser.run('alice@student.edu', studentPass, 'STUDENT', 'Alice Chen');
    insertStudentProfile.run(
      alice.lastInsertRowid,
      'CS21B001',
      'Computer Science and Engineering',
      9.1,
      2026,
      'https://github.com/alice-chen/resume.pdf',
      'React, Node.js, TypeScript, Distributed Systems, Python',
      '+91 98765 43210'
    );

    const bob = insertUser.run('bob@student.edu', studentPass, 'STUDENT', 'Bob Smith');
    insertStudentProfile.run(
      bob.lastInsertRowid,
      'IT21B045',
      'Information Technology',
      7.8,
      2026,
      'https://github.com/bob-smith/resume.pdf',
      'Java, Spring Boot, MySQL, Docker, React',
      '+91 98765 43211'
    );

    const charlie = insertUser.run('charlie@student.edu', studentPass, 'STUDENT', 'Charlie Dave');
    insertStudentProfile.run(
      charlie.lastInsertRowid,
      'EC21B088',
      'Electronics and Communication',
      6.8,
      2026,
      'https://github.com/charlie-dave/resume.pdf',
      'C++, Embedded Systems, IoT, Linux, Python',
      '+91 98765 43212'
    );

    // 4. Placement Drives
    const googleDrive = insertDrive.run(
      googleUser.lastInsertRowid,
      'Google',
      'Software Development Engineer - I',
      'Join Google engineering team to build scalable services reaching billions of users worldwide. Ideal for strong problem solvers proficient in algorithms, data structures, and web distributed architectures.',
      24.0,
      8.5,
      'CSE,IT',
      'Bengaluru, Karnataka (Hybrid)',
      '2026-12-15 23:59:59',
      'OPEN'
    );

    const msftDrive = insertDrive.run(
      msftUser.lastInsertRowid,
      'Microsoft',
      'Cloud & DevOps Engineer',
      'Architect, develop, and maintain Azure cloud infrastructure and automated CI/CD pipelines. Experience with Linux, cloud services, and container orchestration is preferred.',
      16.5,
      7.5,
      'CSE,IT,ECE',
      'Hyderabad, Telangana',
      '2026-12-10 23:59:59',
      'OPEN'
    );

    const amazonDrive = insertDrive.run(
      amazonUser.lastInsertRowid,
      'Amazon',
      'Full Stack Software Engineer',
      'Work on cutting-edge e-commerce platforms and cloud services. Must possess proficiency in JavaScript/TypeScript, React, modern backend frameworks, and relational databases.',
      19.0,
      7.0,
      'CSE,IT,ECE',
      'Bengaluru, Karnataka',
      '2026-12-05 23:59:59',
      'OPEN'
    );

    // 5. Initial Applications (representing different stages in the pipeline)
    // Alice -> Google (INTERVIEW)
    insertApplication.run(
      googleDrive.lastInsertRowid,
      alice.lastInsertRowid,
      'INTERVIEW',
      'Shortlisted after OA. Technical Round 1 scheduled for this Friday.'
    );

    // Alice -> Amazon (OFFERED)
    insertApplication.run(
      amazonDrive.lastInsertRowid,
      alice.lastInsertRowid,
      'OFFERED',
      'Exceptional performance across all 3 rounds. Official campus offer letter extended at 19 LPA.'
    );

    // Bob -> Microsoft (SHORTLISTED)
    insertApplication.run(
      msftDrive.lastInsertRowid,
      bob.lastInsertRowid,
      'SHORTLISTED',
      'Resume shortlisted for technical assessment round.'
    );

    // Bob -> Amazon (APPLIED)
    insertApplication.run(
      amazonDrive.lastInsertRowid,
      bob.lastInsertRowid,
      'APPLIED',
      'Application under initial screening by hiring team.'
    );

    // Charlie -> Microsoft (APPLIED)
    insertApplication.run(
      msftDrive.lastInsertRowid,
      charlie.lastInsertRowid,
      'APPLIED',
      'Application submitted successfully.'
    );
  });

  transaction();
  console.log('Database seeded successfully with users, drives, and applications!\n');
  console.log('--- Quick Demo Credentials ---');
  console.log('Student 1 (CGPA 9.1): alice@student.edu / Student@123');
  console.log('Student 2 (CGPA 7.8): bob@student.edu   / Student@123');
  console.log('Recruiter (Google):   google@recruiter.com / Recruiter@123');
  console.log('Recruiter (Microsoft):microsoft@recruiter.com / Recruiter@123');
  console.log('TPO Admin:            admin@college.edu / Admin@123');
  console.log('------------------------------');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
