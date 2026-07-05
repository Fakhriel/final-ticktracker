function serializeUser(user, authProviders = []) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarPath || null,
    connectedProviders: authProviders.map((p) => p.provider),
  };
}

module.exports = { serializeUser };
