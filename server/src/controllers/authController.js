import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function publicUser(user) {
  return { id: user._id, name: user.name, username: user.username, email: user.email, xp: user.xp, completedGames: user.completedGames, role: user.role };
}

export async function register(req, res) {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'Бардык талааларды толтуруңуз.' });
    if (String(name).trim().length < 2) return res.status(400).json({ message: 'Аты кеминде 2 белгиден турушу керек.' });
    if (!usernamePattern.test(String(username))) return res.status(400).json({ message: 'Username 3–20 белгиден туруп, тамга, сан же _ камтышы керек.' });
    if (!emailPattern.test(String(email))) return res.status(400).json({ message: 'Email туура эмес.' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Сырсөз кеминде 8 белгиден турушу керек.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();
    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (existing) return res.status(409).json({ message: existing.email === normalizedEmail ? 'Бул email менен аккаунт бар.' : 'Бул username бош эмес.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: String(name).trim(), username: normalizedUsername, email: normalizedEmail, passwordHash });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Email же username колдонулуп жатат.' });
    console.error(error);
    return res.status(500).json({ message: 'Серверде ката кетти.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email жана сырсөздү киргизиңиз.' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email же сырсөз туура эмес.' });
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Серверде ката кетти.' });
  }
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
