const User = require('../models/user.model');
const { NotFoundError } = require('../utils/error-handler');

const UserService = {
  // Mendapatkan detail user
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } 
    });
    
    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }
    
    return user;
  },
  
  // Update profil user
  async updateProfile(userId, updatedData) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }
    
    // Update data user
    await user.update(updatedData);
    
    // Return user yang sudah diupdate tanpa password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    return updatedUser;
  },
  
  // Update password user
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }
    
    // Verifikasi password lama
    const isPasswordValid = await user.verifyPassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error('Password lama tidak sesuai');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return { message: 'Password berhasil diubah' };
  },
  
  // Mendapatkan riwayat kunjungan user
  async getUserVisitHistory(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return {
      userId,
      visits: []
    };
  }
};

module.exports = UserService;