import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import Checkbox from 'expo-checkbox';
import { luxuryTheme as t } from '@ui/theme/luxuryTheme';
import { LogoS } from '../../../../assets/images/LogoS';
import { getApiBase, setApiBase, discoverReachableBase, initAutoApiBase, api } from '@lib/api/client';
import * as SecureStore from 'expo-secure-store';

interface LoginScreenProps { onLogin?: (email: string, password: string, remember?: boolean) => void; loading?: boolean; error?: string | null; }

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading=false, error: errorProp }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const [showServerModal, setShowServerModal] = useState(false);
	const [serverInput, setServerInput] = useState<string>(getApiBase());
	const [serverInfo, setServerInfo] = useState<string | null>(null);
	const [serverBusy, setServerBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const handleLogin = () => { if (!email || !password) { setError('Email dan kata sandi wajib diisi.'); return; } setError(null); onLogin?.(email, password, rememberMe); };
	return (
		<KeyboardAvoidingView style={{ flex:1, backgroundColor: t.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={styles.container}>
				<View style={styles.logoWrap}>
					<LogoS size={76} />
					<Text style={styles.appName}>Sumatra Jewelry Mobile</Text>
				</View>
				<View style={styles.form}>
					<TextInput style={styles.input} placeholder='Email atau Nama Pengguna' placeholderTextColor={t.colors.textMuted} autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} />
					<View style={styles.passwordRow}>
						<TextInput style={[styles.input, { flex:1 }]} placeholder='Kata Sandi' placeholderTextColor={t.colors.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
						<TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}><Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text></TouchableOpacity>
					</View>
					<View style={styles.rememberRow}>
						<Checkbox value={rememberMe} onValueChange={setRememberMe} color={rememberMe ? t.colors.primary : t.colors.border} style={{ marginRight: 10 }} />
						<Text style={styles.rememberText}>Ingat Saya</Text>
					</View>
					{(errorProp || error) && <Text style={styles.error}>{errorProp || error}</Text>}
					<Pressable style={({ pressed }) => [styles.loginBtn, loading && { opacity:0.7 }, pressed && !loading && { opacity:0.85 }]} onPress={handleLogin} disabled={loading}>
						{loading ? (<ActivityIndicator color={t.colors.text} />) : (<Text style={styles.loginBtnText}>Masuk</Text>)}
					</Pressable>
					<TouchableOpacity onPress={() => { setServerInput(getApiBase()); setServerInfo(null); setShowServerModal(true); }} style={[styles.serverBtn, { marginTop: t.spacing(1) }]}>
						<Text style={styles.serverBtnText}>Server</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Server Settings Modal */}
			<Modal visible={showServerModal} transparent animationType="fade" onRequestClose={() => setShowServerModal(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Pengaturan Server</Text>
						<View style={styles.modalInputRow}>
							<Text style={styles.modalLabel}>Alamat/IP</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="cth: 192.168.1.10:3000 atau http://host:3000"
								placeholderTextColor={t.colors.textMuted}
								autoCapitalize="none"
								autoCorrect={false}
								value={serverInput}
								onChangeText={setServerInput}
							/>
						</View>
						{!!serverInfo && <Text style={{ color: t.colors.warning, marginTop: t.spacing(0.5) }}>{serverInfo}</Text>}
						<View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: t.spacing(1), gap: t.spacing(1), flexWrap:'wrap' }}>
							<Pressable
								disabled={serverBusy}
								onPress={async () => {
									setServerBusy(true);
									try {
										const next = serverInput.trim();
										if (!next) { setServerInfo('Masukkan alamat server.'); return; }
										setApiBase(next);
										try { await SecureStore.setItemAsync('api_base', getApiBase()); } catch {}
										await api.ping();
										setServerInfo('Tersambung ke server baru.');
									} catch (e: any) {
										setServerInfo(e?.message || 'Gagal terhubung.');
									} finally {
										setServerBusy(false);
									}
								}}
								style={[styles.modalBtnSave, { opacity: serverBusy ? 0.7 : 1 }]}
							>
								<Text style={styles.modalBtnSaveText}>{serverBusy ? 'Menyimpan...' : 'Simpan & Tes'}</Text>
							</Pressable>
							<Pressable
								disabled={serverBusy}
								onPress={async () => {
									setServerBusy(true);
									try {
										const found = await discoverReachableBase();
										if (found) {
											setApiBase(found);
											try { await SecureStore.setItemAsync('api_base', found); } catch {}
											setServerInput(found);
											setServerInfo('Auto-detect berhasil.');
										} else {
											setServerInfo('Auto-detect gagal. Pastikan jaringan sama dengan server.');
										}
									} finally {
										setServerBusy(false);
									}
								}}
								style={[styles.modalBtnCancel, { opacity: serverBusy ? 0.7 : 1 }]}
							>
								<Text style={styles.modalBtnCancelText}>Auto-detect</Text>
							</Pressable>
							<Pressable
								disabled={serverBusy}
								onPress={async () => {
									setServerBusy(true);
									try {
										await SecureStore.deleteItemAsync('api_base');
										await initAutoApiBase();
										const cur = getApiBase();
										setServerInput(cur);
										setServerInfo('Override dihapus. Menggunakan deteksi otomatis.');
									} finally {
										setServerBusy(false);
									}
								}}
								style={[styles.modalBtnCancel, { opacity: serverBusy ? 0.7 : 1 }]}
							>
								<Text style={styles.modalBtnCancelText}>Hapus Override</Text>
							</Pressable>
							<View style={{ flex:1 }} />
							<Pressable onPress={() => setShowServerModal(false)} style={styles.modalBtnCancel}><Text style={styles.modalBtnCancelText}>Tutup</Text></Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal: t.spacing(2) },
	logoWrap: { alignItems:'center', marginBottom: t.spacing(2) },
	appName: { marginTop: t.spacing(0.5), ...t.typography.title, color: t.colors.primary },
	form: { width:'100%', maxWidth:360, backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing(2), ...t.shadow.card },
	input: { ...t.typography.body, color:t.colors.text, backgroundColor:t.colors.surfaceElevated, borderRadius:t.radius.md, borderWidth:1, borderColor:t.colors.border, paddingHorizontal: t.spacing(1.5), paddingVertical: t.spacing(1), marginBottom: t.spacing(1.5) },
	rememberRow: { flexDirection:'row', alignItems:'center', marginBottom: t.spacing(1.5) },
	rememberText: { ...t.typography.subtitle, color:t.colors.primary },
	passwordRow: { flexDirection:'row', alignItems:'center' },
	eyeBtn: { marginLeft: t.spacing(1), paddingHorizontal: t.spacing(1.25), paddingVertical: t.spacing(0.75), borderRadius: t.radius.md, borderWidth:1, borderColor:t.colors.border, backgroundColor:t.colors.surfaceElevated },
	eyeText: { ...t.typography.subtitle, color:t.colors.primary },
	error: { color:t.colors.danger, marginBottom: t.spacing(1), ...t.typography.body },
	loginBtn: { backgroundColor:t.colors.primary, borderRadius:t.radius.md, paddingVertical: t.spacing(1), alignItems:'center', marginTop:t.spacing(1), shadowColor:t.colors.primary, shadowOpacity:0.18, shadowOffset:{ width:0, height:2 }, shadowRadius:4, elevation:2 },
	loginBtnText: { color:t.colors.text, ...t.typography.title },
});
