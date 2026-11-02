// API tests. Start the backend first ("npm start"), then run "npm test".
// They use the demo accounts and clean up what they create.
const test = require('node:test');
const assert = require('node:assert/strict');

const API = process.env.API_URL || 'http://localhost:5000/api';
const PASSWORD = 'Alliance@123';
const run = Date.now().toString(36);

async function call(method, path, { token, body, raw, headers = {} } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, data: type.includes('json') ? await res.json() : await res.text(), headers: res.headers };
}
const login = async (email) => (await call('POST', '/auth/login', { body: { email, password: PASSWORD } })).data.token;

let faculty, alex, student2;
test.before(async () => {
  faculty = await login('demoteacher@alliance.edu.in');
  alex = await login('alex.sharma@alliance.edu.in');
  student2 = await login('demostudent@alliance.edu.in');
});

test('health reports the database is connected', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.database, 'connected');
});

test('login rejects a wrong password and accepts the right one', async () => {
  const bad = await call('POST', '/auth/login', { body: { email: 'alex.sharma@alliance.edu.in', password: 'nope' } });
  assert.equal(bad.status, 401);
  const ok = await call('POST', '/auth/login', { body: { email: 'ALEX.SHARMA@alliance.edu.in', password: PASSWORD } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.role, 'student');
  assert.equal(ok.data.user.section, '5J');
});

test('protected routes need a sign-in', async () => {
  assert.equal((await call('GET', '/store')).status, 401);
  assert.equal((await call('GET', '/store', { token: 'garbage' })).status, 401);
  const me = await call('GET', '/auth/me', { token: faculty });
  assert.equal(me.data.data.fullName, 'Demo Teacher');
});

test('an assignment sent to 5J reaches 5J only, and students cannot create one', async () => {
  const id = `t-asg-${run}`;
  const item = { id, code: 'CSE303', sections: ['5J'], title: 'API test assignment', type: 'Assignment', details: 'x', due: new Date(Date.now() + 864e5).toISOString(), marks: 10 };
  assert.equal((await call('POST', '/store/assignments', { token: alex, body: item })).status, 403);
  assert.equal((await call('POST', '/store/assignments', { token: faculty, body: { ...item, title: '' } })).status, 400);
  assert.equal((await call('POST', '/store/assignments', { token: faculty, body: { ...item, code: 'CSE302' } })).status, 403, "faculty can't post to a subject they don't teach");
  const created = await call('POST', '/store/assignments', { token: faculty, body: item });
  assert.equal(created.status, 201);
  const forAlex = (await call('GET', '/store', { token: alex })).data.data.assignments.map((a) => a.id);
  const forStudent2 = (await call('GET', '/store', { token: student2 })).data.data.assignments.map((a) => a.id);
  assert.ok(forAlex.includes(id));
  assert.ok(!forStudent2.includes(id));
  const upd = await call('PUT', `/store/assignments/${id}`, { token: faculty, body: { ...item, sections: ['5J', '5K'] } });
  assert.equal(upd.status, 200);
  assert.ok((await call('GET', '/store', { token: student2 })).data.data.assignments.some((a) => a.id === id));
  assert.equal((await call('DELETE', `/store/assignments/${id}`, { token: faculty })).status, 200);
  assert.ok(!(await call('GET', '/store', { token: alex })).data.data.assignments.some((a) => a.id === id));
});

test('submit a file, faculty grades it, student sees the marks', async () => {
  const aid = `t-sub-${run}`;
  const fileId = `sub-${aid}-2411021061234`;
  const up = await call('POST', `/files/${fileId}`, { token: alex, raw: 'answer text', headers: { 'Content-Type': 'text/plain', 'X-File-Name': 'answer.txt' } });
  assert.equal(up.status, 201);
  const at = new Date().toISOString();
  await call('PUT', '/state/alliance-assignments', { token: alex, body: { value: { [aid]: { status: 'submitted', fileId, fileName: 'answer.txt', submittedAt: at, score: 99 } } } });
  const fac = (await call('GET', '/store', { token: faculty })).data.data.submissions[aid]['2411021061234'];
  assert.equal(fac.status, 'submitted');
  assert.equal(fac.score, undefined, 'students cannot give themselves marks');
  const file = await call('GET', `/files/${fileId}`, { token: faculty });
  assert.equal(file.data, 'answer text');
  assert.equal((await call('PUT', `/store/grades/${aid}/2411021061234`, { token: alex, body: { score: 10 } })).status, 403);
  assert.equal((await call('PUT', `/store/grades/${aid}/2411021061234`, { token: faculty, body: { score: 8, feedback: 'Good' } })).status, 200);
  const mine = (await call('GET', '/state/alliance-assignments', { token: alex })).data.data[aid];
  assert.equal(mine.status, 'graded');
  assert.equal(mine.score, 8);
  assert.equal(mine.feedback, 'Good');
  // Graded work can't be resubmitted.
  await call('PUT', '/state/alliance-assignments', { token: alex, body: { value: { [aid]: { status: 'submitted', fileName: 'late.txt', submittedAt: new Date().toISOString() } } } });
  assert.equal((await call('GET', '/state/alliance-assignments', { token: alex })).data.data[aid].status, 'graded');
  assert.equal((await call('DELETE', `/files/${fileId}`, { token: alex })).status, 200);
});

test('another user cannot overwrite your uploaded file', async () => {
  const id = `t-file-${run}`;
  assert.equal((await call('POST', `/files/${id}`, { token: alex, raw: 'mine' })).status, 201);
  assert.equal((await call('POST', `/files/${id}`, { token: student2, raw: 'theirs' })).status, 409);
  assert.equal((await call('GET', `/files/${id}?token=${student2}`)).data, 'mine');
  await call('DELETE', `/files/${id}`, { token: alex });
});

test('test attempts are saved and locked after submitting', async () => {
  const tid = `t-test-${run}`;
  await call('PUT', '/state/alliance-test-attempts', { token: alex, body: { value: { [tid]: { answers: [0, null], startedAt: new Date().toISOString() } } } });
  await call('PUT', '/state/alliance-test-attempts', { token: alex, body: { value: { [tid]: { answers: [0, 1], submittedAt: new Date().toISOString() } } } });
  await call('PUT', '/state/alliance-test-attempts', { token: alex, body: { value: { [tid]: { answers: [2, 2] } } } });
  const fac = (await call('GET', '/store', { token: faculty })).data.data.attempts[tid]['2411021061234'];
  assert.deepEqual(fac.answers, [0, 1]);
});

test('live class: only chosen sections see it, votes are counted once', async () => {
  assert.equal((await call('POST', '/store/live/start', { token: faculty, body: { courseId: 'toc-5k', code: 'CSE303', sections: ['5K'] } })).status, 200);
  assert.equal((await call('GET', '/store', { token: alex })).data.data.live, null);
  assert.ok((await call('GET', '/store', { token: student2 })).data.data.live);
  await call('POST', '/store/live/start', { token: faculty, body: { courseId: 'toc-5j', code: 'CSE303', sections: ['5J', '5K'] } });
  await call('POST', '/store/live/poll', { token: faculty, body: { poll: { q: 'Is every DFA an NFA?', options: ['Yes', 'No'], answer: 0 } } });
  assert.equal((await call('POST', '/store/live/vote', { token: alex, body: { choice: 5 } })).status, 400);
  await call('POST', '/store/live/vote', { token: alex, body: { choice: 0 } });
  await call('POST', '/store/live/vote', { token: alex, body: { choice: 1 } });
  await call('POST', '/store/live/vote', { token: student2, body: { choice: 1 } });
  const live = (await call('GET', '/store', { token: faculty })).data.data.live;
  assert.deepEqual(live.votes, { 2411021061234: 0, 2411021062201: 1 });
  assert.deepEqual(live.sections, ['5J', '5K']);
  await call('POST', '/store/live/end', { token: faculty });
  assert.equal((await call('GET', '/store', { token: alex })).data.data.live, null);
});

test('discussions: new thread, faculty answer, nothing lost when two people reply', async () => {
  const id = `t-th-${run}`;
  const t0 = { id, code: 'CSE303', title: 'API test question', body: '', author: 'You', at: new Date().toISOString(), votes: 0, mine: true, replies: [] };
  await call('PUT', '/state/alliance-threads', { token: alex, body: { value: [t0] } });
  const seenByFaculty = (await call('GET', '/state/alliance-threads', { token: faculty })).data.data.find((t) => t.id === id);
  assert.equal(seenByFaculty.author, 'Alex Sharma');
  // Both reply from the same (stale) copy.
  await call('PUT', '/state/alliance-threads', { token: faculty, body: { value: [{ ...seenByFaculty, replies: [{ author: 'x', role: 'faculty', at: new Date(Date.now() + 1).toISOString(), votes: 0, accepted: true, body: 'Faculty answer' }] }] } });
  await call('PUT', '/state/alliance-threads', { token: student2, body: { value: [{ ...seenByFaculty, replies: [{ author: 'You', role: 'student', at: new Date(Date.now() + 2).toISOString(), votes: 0, body: 'Student reply' }] }] } });
  const final = (await call('GET', '/state/alliance-threads', { token: alex })).data.data.find((t) => t.id === id);
  assert.equal(final.replies.length, 2);
  assert.equal(final.replies[0].author, 'Demo Teacher');
  assert.equal(final.replies[0].accepted, true);
  assert.equal(final.replies[1].author, 'Demo Student');
  assert.equal(final.mine, true);
});

test('personal saved data is private to each user', async () => {
  const key = 'alliance-todos';
  const before = (await call('GET', `/state/${key}`, { token: alex })).data.data;
  await call('PUT', `/state/${key}`, { token: alex, body: { value: [{ id: 1, text: `api test ${run}` }] } });
  assert.equal((await call('GET', `/state/${key}`, { token: alex })).data.data[0].text, `api test ${run}`);
  const student2s = (await call('GET', `/state/${key}`, { token: student2 })).data.data;
  assert.ok(!JSON.stringify(student2s || []).includes(run));
  assert.equal((await call('PUT', '/state/not-allowed', { token: alex, body: { value: 1 } })).status, 400);
  await call('PUT', `/state/${key}`, { token: alex, body: { value: before } });
});

test('study rooms are stored in the database', async () => {
  const room = (await call('POST', '/studygroups', { token: alex, body: { title: `API room ${run}`, courseCode: 'CSE303' } })).data.data;
  await call('POST', `/studygroups/${room.id}/messages`, { token: student2, body: { message: 'hello' } });
  const again = (await call('GET', `/studygroups/${room.id}`, { token: alex })).data.data;
  assert.equal(again.messages.at(-1).sender, 'Demo Student');
});
