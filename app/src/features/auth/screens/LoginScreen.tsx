import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import { luxuryTheme as t } from '@ui/theme/luxuryTheme';
import { LogoS } from '../../../../assets/images/LogoS';

interface LoginScreenProps { onLogin?: (email: string, password: string) => void; loading?: boolean; error?: string | null; }

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading=false, error: errorProp }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const handleLogin = () => { if (!email || !password) { setError('Email dan kata sandi wajib diisi.'); return; } setError(null); onLogin?.(email, password); };
	return (<KeyboardAvoidingView style={{ flex:1, backgroundColor: t.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.container}><View style={styles.logoWrap}><LogoS size={76} /><Text style={styles.appName}>Sumatra Jewelry Mobile</Text></View><View style={styles.form}><TextInput style={styles.input} placeholder='Email atau Nama Pengguna' placeholderTextColor={t.colors.textMuted} autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} /><TextInput style={styles.input} placeholder='Kata Sandi' placeholderTextColor={t.colors.textMuted} secureTextEntry value={password} onChangeText={setPassword} /><View style={styles.rememberRow}><Checkbox value={rememberMe} onValueChange={setRememberMe} color={rememberMe ? t.colors.primary : t.colors.border} style={{ marginRight: 10 }} /><Text style={styles.rememberText}>Ingat Saya</Text></View>{(errorProp || error) && <Text style={styles.error}>{errorProp || error}</Text>}<Pressable style={({ pressed }) => [styles.loginBtn, loading && { opacity:0.7 }, pressed && !loading && { opacity:0.85 }]} onPress={handleLogin} disabled={loading}>{loading ? (<ActivityIndicator color={t.colors.text} />) : (<Text style={styles.loginBtnText}>Masuk</Text>)}</Pressable></View></View></KeyboardAvoidingView> );
};

const styles = StyleSheet.create({
	container: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal: t.spacing(2) },
	logoWrap: { alignItems:'center', marginBottom: t.spacing(2) },
	appName: { marginTop: t.spacing(0.5), ...t.typography.title, color: t.colors.primary },
	form: { width:'100%', maxWidth:360, backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing(2), ...t.shadow.card },
	input: { ...t.typography.body, color:t.colors.text, backgroundColor:t.colors.surfaceElevated, borderRadius:t.radius.md, borderWidth:1, borderColor:t.colors.border, paddingHorizontal: t.spacing(1.5), paddingVertical: t.spacing(1), marginBottom: t.spacing(1.5) },
	rememberRow: { flexDirection:'row', alignItems:'center', marginBottom: t.spacing(1.5) },
	rememberText: { ...t.typography.subtitle, color:t.colors.primary },
	error: { color:t.colors.danger, marginBottom: t.spacing(1), ...t.typography.body },
	loginBtn: { backgroundColor:t.colors.primary, borderRadius:t.radius.md, paddingVertical: t.spacing(1), alignItems:'center', marginTop:t.spacing(1), shadowColor:t.colors.primary, shadowOpacity:0.18, shadowOffset:{ width:0, height:2 }, shadowRadius:4, elevation:2 },
	loginBtnText: { color:t.colors.text, ...t.typography.title },
});
