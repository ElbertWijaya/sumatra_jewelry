import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@lib/context/AuthContext';
import { api } from '@lib/api/client';
const APP_VERSION = 'v1.2.3';

const COLORS = {
  gold: '#FFD700',
  brown: '#4E342E',
  dark: '#181512',
  yellow: '#ffe082',
  white: '#fff',
  card: '#23201c',
  border: '#4e3f2c',
};

export default function ProfileScreen() {
  const { token, user, setUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const handleEditAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled) return;

    const asset = pickerResult.assets[0];
    if (!asset.uri) return;

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const uploadResult = await api.files.upload(user?.token || '', formData);
      const avatarUrl = uploadResult.url;

      await api.users.updateMe(user?.token || '', { avatar: avatarUrl });
      setUser({ ...user, avatar: avatarUrl });
      Alert.alert('Berhasil', 'Avatar berhasil diperbarui!');
    } catch (error) {
      console.error('Upload avatar error:', error);
      Alert.alert('Error', 'Gagal mengupload avatar. Coba lagi.');
    }
  };

  const handleEditProfile = () => {
    setEditPhone(user?.phone || '');
    setEditAddress(user?.address || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!token) {
      Alert.alert('Error', 'Token tidak ditemukan. Silakan login ulang.');
      return;
    }
    try {
      const updated = await api.users.updateMe(token, {
        phone: editPhone,
        address: editAddress
      });
      setUser({ ...user, phone: updated.phone, address: updated.address });
      setShowEditModal(false);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      if (error.message?.includes('Unauthorized')) {
        Alert.alert('Error', 'Sesi login telah berakhir. Silakan login ulang.');
      } else {
        Alert.alert('Error', error.message || 'Gagal memperbarui profil. Coba lagi.');
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok!');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter!');
      return;
    }
    try {
      await api.users.changePassword(user?.token || '', {
        oldPassword,
        newPassword
      });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Berhasil', 'Password berhasil diubah!');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', 'Gagal mengubah password. Periksa password lama.');
    }
  };

  if (!user) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:COLORS.gold}}>Memuat data user...</Text></View>;
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.dark }}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.brown, COLORS.dark]}
        start={{x:0, y:0}}
        end={{x:1, y:1}}
        style={s.headerBg}
      />
      <ScrollView contentContainerStyle={{paddingBottom: 32}}>
        {/* Cover Image */}
        <View style={s.coverContainer}>
          <LinearGradient
            colors={[COLORS.gold, COLORS.brown, COLORS.dark]}
            start={{x:0, y:0}}
            end={{x:1, y:1}}
            style={s.coverGradient}
          />
          <View style={s.coverOverlay}>
            <Text style={s.coverTitle}>Profil Pengguna</Text>
          </View>
        </View>

        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatarWrapper}>
            <Image source={{uri: user.avatar || 'https://ui-avatars.com/api/?name='+(user.fullName||'User')+'&background=FFD700&color=181512&size=256'}} style={s.largeAvatar} />
            <TouchableOpacity style={s.editAvatarBtn} onPress={handleEditAvatar}>
              <Ionicons name="camera" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
          <Text style={s.userName}>{user.fullName}</Text>
          <Text style={s.userEmail}>{user.email}</Text>
          <View style={s.roleBadge}><Text style={s.roleBadgeText}>{user.job_role || 'User'}</Text></View>
        </View>

        {/* Bio Section */}
        <View style={s.bioSection}>
          <Text style={s.bioTitle}>Tentang Saya</Text>
          <View style={s.bioRow}>
            <Ionicons name="call" size={20} color={COLORS.gold} />
            <Text style={s.bioText}>{user.phone || 'Belum diisi'}</Text>
          </View>
          <View style={s.bioRow}>
            <Ionicons name="location" size={20} color={COLORS.gold} />
            <Text style={s.bioText}>{user.address || 'Belum diisi'}</Text>
          </View>
          <View style={s.bioRow}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.gold} />
            <Text style={s.bioText}>Bergabung {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('id-ID') : '-'}</Text>
          </View>
        </View>

        {/* Branch Info */}
        <View style={s.branchSection}>
          <Text style={s.sectionTitle}>Informasi Cabang</Text>
          <View style={s.branchRow}>
            <MaterialCommunityIcons name="store" size={24} color={COLORS.gold} />
            <View style={s.branchDetails}>
              <Text style={s.branchName}>{user.branchName || 'Belum diisi'}</Text>
              <Text style={s.branchAddress}>{user.branchAddress || 'Belum diisi'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={s.actionsGrid}>
          <TouchableOpacity style={s.gridBtn} onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color={COLORS.dark} />
            <Text style={s.gridBtnText}>Edit Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.gridBtn} onPress={() => setShowPasswordModal(true)}>
            <Ionicons name="key" size={24} color={COLORS.dark} />
            <Text style={s.gridBtnText}>Ubah Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.gridBtn, s.logoutGridBtn]}>
            <Ionicons name="log-out" size={24} color={COLORS.gold} />
            <Text style={[s.gridBtnText, {color: COLORS.gold}]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Versi aplikasi */}
        <View style={s.versionWrap}><Text style={s.versionText}>Versi aplikasi: {APP_VERSION}</Text></View>
      </ScrollView>

      {/* Modal ganti password */}
      {showPasswordModal && (
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Ganti Password</Text>
            <View style={s.modalInputRow}>
              <Text style={s.modalLabel}>Lama</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Password lama"
                placeholderTextColor={COLORS.brown}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
            <View style={s.modalInputRow}>
              <Text style={s.modalLabel}>Baru</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Password baru"
                placeholderTextColor={COLORS.brown}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <View style={s.modalInputRow}>
              <Text style={s.modalLabel}>Konfirmasi</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Konfirmasi password baru"
                placeholderTextColor={COLORS.brown}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <View style={{flexDirection:'row', justifyContent:'flex-end', gap:10, marginTop:10}}>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={s.modalBtnCancel}><Text style={s.modalBtnCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleChangePassword} style={s.modalBtnSave}><Text style={s.modalBtnSaveText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal edit profil */}
      {showEditModal && (
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Edit Profil</Text>
            <View style={s.modalInputRow}>
              <Text style={s.modalLabel}>No. HP</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Masukkan No. HP"
                placeholderTextColor={COLORS.brown}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={s.modalInputRow}>
              <Text style={s.modalLabel}>Alamat</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Masukkan Alamat"
                placeholderTextColor={COLORS.brown}
                value={editAddress}
                onChangeText={setEditAddress}
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={{flexDirection:'row', justifyContent:'flex-end', gap:10, marginTop:10}}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={s.modalBtnCancel}><Text style={s.modalBtnCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={s.modalBtnSave}><Text style={s.modalBtnSaveText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ...existing code...
// ...existing code...
const s = StyleSheet.create({
  headerBg: { position:'absolute', top:0, left:0, right:0, height:180, zIndex:-1 },
  headerWrap: { alignItems:'center', paddingTop:38, paddingBottom:18 },
  avatarImg: { width:90, height:90, borderRadius:45, borderWidth:3, borderColor:COLORS.gold, marginBottom:8 },
  editAvatarBtn: { position:'absolute', right:30, top:110, backgroundColor:COLORS.card, borderRadius:16, padding:6, borderWidth:1, borderColor:COLORS.gold },
  profileName: { color:COLORS.white, fontSize:22, fontWeight:'700', marginBottom:2 },
  profileEmail: { color:COLORS.yellow, fontSize:15, fontWeight:'500', marginBottom:6 },
  roleBadge: { backgroundColor:COLORS.gold, borderRadius:12, paddingHorizontal:12, paddingVertical:3, alignSelf:'center', marginBottom:2 },
  roleBadgeText: { color:COLORS.dark, fontWeight:'700', fontSize:13 },
  infoCard: { backgroundColor:COLORS.card, borderRadius:16, padding:18, marginHorizontal:18, marginBottom:18, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  infoRow: { flexDirection:'row', alignItems:'center', marginBottom:10 },
  infoIcon: { marginRight:8 },
  infoLabel: { color:COLORS.gold, fontWeight:'600', fontSize:14, width:80 },
  infoValue: { color:COLORS.white, fontSize:14, fontWeight:'500', flex:1 },
  actionRow: { flexDirection:'row', justifyContent:'space-around', marginHorizontal:18, marginBottom:18, gap:8 },
  actionBtn: { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.gold, borderRadius:14, paddingVertical:10, paddingHorizontal:16, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:4, shadowOffset:{width:0,height:1} },
  actionIcon: { marginRight:8 },
  actionText: { color:COLORS.dark, fontWeight:'700', fontSize:14 },
  versionWrap: { alignItems:'center', marginTop:18, marginBottom:8 },
  versionText: { color:COLORS.yellow, fontSize:13, fontWeight:'600' },
  modalOverlay: { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'#181512cc', justifyContent:'center', alignItems:'center', zIndex:99 },
  modalCard: { backgroundColor:COLORS.card, borderRadius:18, padding:16, minWidth:350, borderWidth:1, borderColor:COLORS.gold, shadowColor:'#000', shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0,height:2} },
  modalTitle: { color:COLORS.gold, fontSize:18, fontWeight:'700', marginBottom:8, textAlign:'center' },
  modalInputRow: { flexDirection:'row', alignItems:'center', marginBottom:8, flexWrap:'wrap' },
  modalLabel: { color:COLORS.gold, fontWeight:'600', fontSize:14, minWidth:70, marginRight:10 },
  modalInput: { backgroundColor:COLORS.white, borderRadius:8, borderWidth:1, borderColor:COLORS.gold, padding:10, color:COLORS.dark, fontSize:14, flex:1, minWidth:200 },
  modalBtnCancel: { paddingVertical:8, paddingHorizontal:16, borderRadius:8, backgroundColor:COLORS.brown },
  modalBtnCancelText: { color:COLORS.gold, fontWeight:'700', fontSize:14 },
  modalBtnSave: { paddingVertical:8, paddingHorizontal:16, borderRadius:8, backgroundColor:COLORS.gold },
  modalBtnSaveText: { color:COLORS.dark, fontWeight:'700', fontSize:14 },
  welcomeSection: { paddingHorizontal:20, paddingTop:20, paddingBottom:10 },
  welcomeText: { color:COLORS.yellow, fontSize:16, fontWeight:'500' },
  welcomeName: { color:COLORS.white, fontSize:28, fontWeight:'700', marginTop:4 },
  profileCard: { backgroundColor:COLORS.card, borderRadius:20, padding:20, marginHorizontal:18, marginBottom:20, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:8, shadowOffset:{width:0,height:3}, alignItems:'center' },
  avatarContainer: { position:'relative', marginBottom:12 },
  infoContainer: { marginHorizontal:18, marginBottom:20 },
  infoSection: { backgroundColor:COLORS.card, borderRadius:16, padding:18, marginBottom:16, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  sectionTitle: { color:COLORS.gold, fontSize:16, fontWeight:'700', marginBottom:12, textAlign:'center' },
  actionContainer: { flexDirection:'row', justifyContent:'space-around', marginHorizontal:18, marginBottom:18, gap:8 },
  logoutBtn: { backgroundColor:COLORS.brown },
  coverContainer: { height:200, position:'relative' },
  coverGradient: { flex:1 },
  coverOverlay: { position:'absolute', top:0, left:0, right:0, bottom:0, justifyContent:'center', alignItems:'center' },
  coverTitle: { color:COLORS.white, fontSize:24, fontWeight:'700', textShadowColor:'#000', textShadowOffset:{width:1,height:1}, textShadowRadius:2 },
  profileHeader: { alignItems:'center', marginTop:-50, marginBottom:20 },
  avatarWrapper: { position:'relative', marginBottom:12 },
  largeAvatar: { width:120, height:120, borderRadius:60, borderWidth:4, borderColor:COLORS.gold },
  userName: { color:COLORS.white, fontSize:28, fontWeight:'700', marginBottom:4 },
  userEmail: { color:COLORS.yellow, fontSize:16, fontWeight:'500', marginBottom:8 },
  bioSection: { backgroundColor:COLORS.card, borderRadius:16, padding:18, marginHorizontal:18, marginBottom:16, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  bioTitle: { color:COLORS.gold, fontSize:18, fontWeight:'700', marginBottom:12, textAlign:'center' },
  bioRow: { flexDirection:'row', alignItems:'center', marginBottom:8 },
  bioText: { color:COLORS.white, fontSize:14, fontWeight:'500', marginLeft:8 },
  branchSection: { backgroundColor:COLORS.card, borderRadius:16, padding:18, marginHorizontal:18, marginBottom:16, borderWidth:1, borderColor:COLORS.border, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2} },
  branchRow: { flexDirection:'row', alignItems:'flex-start' },
  branchDetails: { marginLeft:12, flex:1 },
  branchName: { color:COLORS.white, fontSize:16, fontWeight:'700', marginBottom:4 },
  branchAddress: { color:COLORS.yellow, fontSize:14, fontWeight:'500' },
  actionsGrid: { flexDirection:'row', justifyContent:'space-around', marginHorizontal:18, marginBottom:18, gap:8 },
  gridBtn: { flexDirection:'column', alignItems:'center', backgroundColor:COLORS.gold, borderRadius:16, paddingVertical:16, paddingHorizontal:12, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:4, shadowOffset:{width:0,height:1}, minWidth:80 },
  gridBtnText: { color:COLORS.dark, fontWeight:'700', fontSize:12, marginTop:4, textAlign:'center' },
  logoutGridBtn: { backgroundColor:COLORS.brown },
});
