export function safeUser(user) {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return safe;
}