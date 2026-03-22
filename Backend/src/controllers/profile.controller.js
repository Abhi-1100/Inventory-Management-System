const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, title: true, preferences: true, lastLogin: true, isActive: true, avatar: true
    },
  });

  const totalActions = await prisma.operation.count({
    where: { createdById: req.user.id }
  });

  res.json({ ...user, role: user.role.toLowerCase(), totalActions });
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, title, preferences, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email, phone, title, preferences, avatar },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, title: true, preferences: true, lastLogin: true, isActive: true, avatar: true
    },
  });
  res.json({ ...user, role: user.role.toLowerCase() });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid)
    return res.status(400).json({ error: 'Current password is incorrect', code: 'BAD_REQUEST' });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ message: 'Password updated successfully' });
};

exports.deactivateAccount = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isActive: false }
  });
  res.json({ message: 'Account deactivated' });
};
