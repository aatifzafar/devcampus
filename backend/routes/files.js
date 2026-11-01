// File uploads: notes, question papers, assignment submissions.
// Bytes go to backend/uploads/, details go to the "files" table.
//
//   POST   /api/files/:id    body = the file (raw), headers X-File-Name, Content-Type
//   GET    /api/files/:id    download (also ?token=... so links work)
//   DELETE /api/files/:id    uploader or faculty
const express = require('express');
const fs = require('fs');
const path = require('path');
const { query } = require('../db');
const { requireAuth, ah } = require('../lib/auth');

const router = express.Router();
const DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(DIR, { recursive: true });
const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 50;
const ID_RE = /^[A-Za-z0-9_-]{1,100}$/;

router.use(requireAuth);

router.post('/:id', express.raw({ type: () => true, limit: `${MAX_MB}mb` }), ah(async (req, res) => {
  const { id } = req.params;
  if (!ID_RE.test(id)) return res.status(400).json({ success: false, message: 'Invalid file id' });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ success: false, message: 'The file is empty' });
  const existing = (await query('SELECT uploaded_by FROM files WHERE id = $1', [id])).rows[0];
  if (existing && existing.uploaded_by !== req.user.id) return res.status(409).json({ success: false, message: 'A different file already uses this id' });
  const name = decodeURIComponent(req.get('X-File-Name') || 'file').slice(0, 255);
  const storage = path.join(DIR, id);
  await fs.promises.writeFile(storage, req.body);
  await query(
    `INSERT INTO files (id, original_name, mime_type, size_bytes, storage_path, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET original_name = EXCLUDED.original_name, mime_type = EXCLUDED.mime_type,
       size_bytes = EXCLUDED.size_bytes, created_at = now()`,
    [id, name, req.get('Content-Type') || 'application/octet-stream', req.body.length, id, req.user.id]
  );
  res.status(201).json({ success: true, data: { id, name, size: req.body.length } });
}));

router.get('/:id', ah(async (req, res) => {
  const f = (await query('SELECT * FROM files WHERE id = $1', [req.params.id])).rows[0];
  if (!f) return res.status(404).json({ success: false, message: 'File not found' });
  const file = path.join(DIR, path.basename(f.storage_path));
  if (!fs.existsSync(file)) return res.status(404).json({ success: false, message: 'File is missing on the server' });
  res.set('Content-Type', f.mime_type || 'application/octet-stream');
  res.set('X-File-Name', encodeURIComponent(f.original_name));
  res.set('Access-Control-Expose-Headers', 'X-File-Name');
  res.set('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(f.original_name)}`);
  fs.createReadStream(file).pipe(res);
}));

router.delete('/:id', ah(async (req, res) => {
  const f = (await query('SELECT * FROM files WHERE id = $1', [req.params.id])).rows[0];
  if (!f) return res.json({ success: true });
  if (f.uploaded_by !== req.user.id && req.user.role !== 'faculty') return res.status(403).json({ success: false, message: 'Not your file' });
  await query('DELETE FROM files WHERE id = $1', [f.id]);
  await fs.promises.unlink(path.join(DIR, path.basename(f.storage_path))).catch(() => {});
  res.json({ success: true });
}));

module.exports = router;
