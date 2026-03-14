const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateOTP } = require('../utils/generateOTP');
const { sendOTPEmail } = require('../config/email');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });
  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid email or password', code: 'UNAUTHORIZED' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password', code: 'UNAUTHORIZED' });
  
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: 'If that email exists, an OTP was sent' });
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_MINUTES) * 60000);
  await prisma.otpToken.create({ data: { userId: user.id, token: otp, expiresAt } });
  await sendOTPEmail(email, otp);
  res.json({ message: 'OTP sent to your email' });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid OTP', code: 'INVALID_OTP' });
  const record = await prisma.otpToken.findFirst({
    where: { userId: user.id, token: otp, used: false, expiresAt: { gt: new Date() } },
  });
  if (!record) return res.status(400).json({ error: 'Invalid or expired OTP', code: 'INVALID_OTP' });
  res.json({ message: 'OTP verified', valid: true });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid request', code: 'BAD_REQUEST' });
  const record = await prisma.otpToken.findFirst({
    where: { userId: user.id, token: otp, used: false, expiresAt: { gt: new Date() } },
  });
  if (!record) return res.status(400).json({ error: 'Invalid or expired OTP', code: 'INVALID_OTP' });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.otpToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);
  res.json({ message: 'Password reset successfully' });
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ ...user, role: user.role.toLowerCase() });
};
