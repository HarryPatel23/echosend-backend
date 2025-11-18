const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Get user's pending schedules
router.get('/', protect, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM schedules WHERE user_id = $1 AND status = $2 ORDER BY send_at DESC',
      [req.user.id, 'pending']
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create new schedule
router.post('/', protect, upload.single('file'), async (req, res) => {
  const { recipient, message, send_at, recurring } = req.body;
  let media_url = null;
  let media_type = null;

  // Upload file if present
  if (req.file) {
    const fileName = `${uuidv4()}_${req.file.originalname}`;
    const { error } = await supabase.storage
      .from('media')
      .upload(`media/${fileName}`, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from('media').getPublicUrl(`media/${fileName}`);
    media_url = data.publicUrl;

    if (req.file.mimetype.startsWith('image/')) media_type = 'image';
    else if (req.file.mimetype.startsWith('video/')) media_type = 'video';
    else if (req.file.mimetype.startsWith('audio/')) media_type = 'audio';
    else media_type = 'document';
  }

  try {
    const sendAt = new Date(send_at);
    const result = await db.query(
      `INSERT INTO schedules 
      (user_id, recipient, message, send_at, recurring, media_url, media_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, recipient, message || null, sendAt, recurring || 'once', media_url, media_type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete schedule
router.delete('/:id', protect, async (req, res) => {
  try {
    await db.query('DELETE FROM schedules WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ msg: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
