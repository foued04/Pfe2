const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User.model');

const signup = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.body);
  const accessToken = tokenService.generateAuthToken(user);
  res.status(201).send({ user, accessToken });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const accessToken = tokenService.generateAuthToken(user);
  res.send({ user, accessToken });
});

const getMe = asyncHandler(async (req, res) => {
  res.send({ user: req.user });
});

// ─── Password Reset Endpoints ──────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.generateResetCode(email);
  res.send({ message: 'Si cette adresse existe, un code de réinitialisation vous sera envoyé (voir console serveur).' });
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  await authService.verifyResetCode(email, code);
  res.send({ valid: true, message: 'Code valide' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  await authService.resetPassword(email, code, newPassword);
  res.send({ message: 'Mot de passe réinitialisé avec succès.' });
});

// ─── Google Login Stub ──────────────────────────────────────────────────

const googleLogin = asyncHandler(async (req, res) => {
  // En production, vous utiliseriez google-auth-library pour vérifier le token (req.body.token)
  // et extraire l'email et le nom. Pour l'instant, c'est un placeholder.
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).send({ message: 'Email manquant pour la connexion Google' });
  }

  let user = await User.findOne({ email });
  if (!user) {
    // S'inscrire automatiquement si l'utilisateur n'existe pas
    user = await User.create({
      fullName: name || 'Utilisateur Google',
      email,
      password: Math.random().toString(36).slice(-8) + 'Xy1!', // Mot de passe aléatoire fort
      role: 'tenant', // par défaut
    });
  }

  const accessToken = tokenService.generateAuthToken(user);
  res.send({ user, accessToken });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUser(req.user.id, req.body);
  res.send({ user, message: 'Profil mis à jour avec succès' });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword(req.user.id, currentPassword, newPassword);
  res.send({ message: 'Mot de passe modifié avec succès' });
});

module.exports = {
  signup,
  login,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  googleLogin,
  updateProfile,
  updatePassword,
};
