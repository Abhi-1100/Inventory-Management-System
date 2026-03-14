const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email },
    select: { id: true, name: true, email: true, role: true },
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
