import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', 
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  }
);

// User login
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = rows[0];
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Exercise tracking
app.post('/exercise', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, duration, calories_burned, date } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO exercises (user_id, type, duration, calories_burned, date) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, type, duration, calories_burned, date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

app.get('/exercise', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exercises WHERE user_id = ?', [req.user?.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Error fetching exercises' });
  }
});

// Nutrition tracking
app.post('/nutrition', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { food_item, calories_gained, date } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO nutrition (user_id, food_item, calories_gained, date) VALUES (?, ?, ?, ?)',
      [req.user?.id, food_item, calories_gained, date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding nutrition data:', error);
    res.status(500).json({ error: 'Error adding nutrition data' });
  }
});

app.get('/nutrition', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nutrition WHERE user_id = ?', [req.user?.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ error: 'Error fetching nutrition data' });
  }
});

// Sleep tracking
app.post('/sleep', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { duration, quality, date } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO sleep (user_id, duration, quality, date) VALUES (?, ?, ?, ?)',
      [req.user?.id, duration, quality, date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding sleep data:', error);
    res.status(500).json({ error: 'Error adding sleep data' });
  }
});

app.get('/sleep', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sleep WHERE user_id = ?', [req.user?.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    res.status(500).json({ error: 'Error fetching sleep data' });
  }
});

// Capsule reminders
app.post('/capsule-reminders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, time } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO capsule_reminders (user_id, name, time) VALUES (?, ?, ?)',
      [req.user?.id, name, time]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error adding capsule reminder:', error);
    res.status(500).json({ error: 'Error adding capsule reminder' });
  }
});

app.get('/capsule-reminders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM capsule_reminders WHERE user_id = ?', [req.user?.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching capsule reminders:', error);
    res.status(500).json({ error: 'Error fetching capsule reminders' });
  }
});

// Music playlists
app.post('/playlists', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO playlists (user_id, name) VALUES (?, ?)',
      [req.user?.id, name]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error creating playlist' });
  }
});

app.get('/playlists', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM playlists WHERE user_id = ?', [req.user?.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
});

app.post('/tracks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { playlist_id, title, artist, duration, file_path } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO tracks (playlist_id, title, artist, duration, file_path) VALUES (?, ?, ?, ?, ?)',
      [playlist_id, title, artist, duration, file_path]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {console.error('Error adding track:', error);
    res.status(500).json({ error: 'Error adding track' });
  }
});

app.get('/tracks/:playlistId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tracks WHERE playlist_id = ?', [req.params.playlistId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Error fetching tracks' });
  }
});

// Search functionality
app.get('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    const [exercises] = await pool.query('SELECT * FROM exercises WHERE user_id = ? AND type LIKE ?', [req.user?.id, `%${query}%`]);
    const [nutrition] = await pool.query('SELECT * FROM nutrition WHERE user_id = ? AND food_item LIKE ?', [req.user?.id, `%${query}%`]);
    const [sleep] = await pool.query('SELECT * FROM sleep WHERE user_id = ? AND quality LIKE ?', [req.user?.id, `%${query}%`]);
    const [playlists] = await pool.query('SELECT * FROM playlists WHERE user_id = ? AND name LIKE ?', [req.user?.id, `%${query}%`]);
    const [tracks] = await pool.query('SELECT t.* FROM tracks t JOIN playlists p ON t.playlist_id = p.id WHERE p.user_id = ? AND (t.title LIKE ? OR t.artist LIKE ?)', [req.user?.id, `%${query}%`, `%${query}%`]);

    res.json({
      exercises,
      nutrition,
      sleep,
      playlists,
      tracks
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});