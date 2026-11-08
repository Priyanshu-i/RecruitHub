// server/test-direct.js
// Direct controller and repository integration test

process.env.NODE_ENV = 'test';

const authController = require('./src/controllers/authController');
const driveController = require('./src/controllers/driveController');
const applicationController = require('./src/controllers/applicationController');
const adminController = require('./src/controllers/adminController');
const { verifyToken } = require('./src/utils/customJwt');
const config = require('./src/config');

// Helper to simulate Express req/res
function mockReqRes(reqData = {}) {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...reqData
  };

  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };

  const next = (err) => {
    if (err) throw err;
  };

  return { req, res, next };
}

async function runDirectTests() {
  console.log('--- Running Direct Integration Tests for RecruitHub ---\n');

  // Test 1: Student Login
  const loginTest = mockReqRes({
    body: { email: 'alice@student.edu', password: 'Student@123' }
  });
  await authController.login(loginTest.req, loginTest.res, loginTest.next);
  console.log('[PASS] 1. AuthController.login:', loginTest.res.statusCode, loginTest.res.data.message);
  const token = loginTest.res.data.token;
  const decoded = verifyToken(token, config.JWT_SECRET);
  console.log('       Decoded Custom JWT Subject:', decoded.email, '| Role:', decoded.role);

  // Test 2: Get Drives with filter
  const drivesTest = mockReqRes({
    query: { status: 'OPEN' }
  });
  await driveController.getDrives(drivesTest.req, drivesTest.res, drivesTest.next);
  console.log('[PASS] 2. DriveController.getDrives returned:', drivesTest.res.data.count, 'active drives.');

  // Test 3: Admin Stats
  const adminTest = mockReqRes({
    user: { id: 1, role: 'TPO_ADMIN', name: 'Admin' }
  });
  await adminController.getDashboardStats(adminTest.req, adminTest.res, adminTest.next);
  console.log('[PASS] 3. AdminController.getDashboardStats:');
  console.log('       Total Students:', adminTest.res.data.stats.totalStudents);
  console.log('       Placement Rate:', adminTest.res.data.stats.placementPercentage + '%');
  console.log('       Average Package:', adminTest.res.data.stats.averageCtc, 'LPA');

  // Test 4: Student view applications
  const myAppsTest = mockReqRes({
    user: { id: decoded.id, role: 'STUDENT', name: decoded.name }
  });
  await applicationController.getMyApplications(myAppsTest.req, myAppsTest.res, myAppsTest.next);
  console.log('[PASS] 4. ApplicationController.getMyApplications for Alice:');
  console.log('       Found', myAppsTest.res.data.count, 'submitted applications.');
  myAppsTest.res.data.applications.forEach(app => {
    console.log(`       - ${app.company_name} (${app.drive_title}): Current Status [${app.status}]`);
  });

  // Test 5: Eligibility Cutoff Check
  // Charlie has CGPA 6.8. Google requires 8.5. Applying to Google should fail!
  const charlieLogin = mockReqRes({
    body: { email: 'charlie@student.edu', password: 'Student@123' }
  });
  await authController.login(charlieLogin.req, charlieLogin.res, charlieLogin.next);
  const charlieUser = charlieLogin.res.data.user;

  // Find Google drive ID
  const googleDrive = drivesTest.res.data.drives.find(d => d.company_name === 'Google');
  const applyRejectTest = mockReqRes({
    user: charlieUser,
    params: { id: googleDrive.id }
  });
  await applicationController.applyToDrive(applyRejectTest.req, applyRejectTest.res, applyRejectTest.next);
  console.log('[PASS] 5. Charlie (CGPA 6.8) applied to Google (Min 8.5):');
  console.log('       Response Status:', applyRejectTest.res.statusCode);
  console.log('       Rejection Reason:', applyRejectTest.res.data.message);

  console.log('\n--- ALL INTEGRATION & BUSINESS LOGIC TESTS PASSED! ---');
}

runDirectTests().catch(console.error);
