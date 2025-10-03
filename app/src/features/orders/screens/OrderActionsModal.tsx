import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, Image, ScrollView, Platform } from 'react-native';
import { useAuth } from '@lib/context/AuthContext';
import { api, API_URL } from '@lib/api/client';
import { InlineSelect } from '@ui/atoms/InlineSelect';
import { JENIS_BARANG_OPTIONS, JENIS_EMAS_OPTIONS, WARNA_EMAS_OPTIONS, BENTUK_BATU_OPTIONS } from '@constants/orderOptions';
import ImagePreviewModal from '@ui/molecules/ImagePreviewModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatIDR, formatIDRInputText, parseIDR } from '@lib/utils/currency';

type Props = { visible: boolean; order: any | null; onClose(): void; onChanged?(): void };

const ROLE_TEMPLATES: Record<string, string[]> = {
	DESIGNER: ['3D Design', 'Print Resin', 'Pengecekan'],
	CASTER: ['Pasang Tiang', 'Cor', 'Kasih Ke Admin'],
	CARVER: ['Reparasi', 'Cap', 'Kasih Ke Admin'],
	DIAMOND_SETTER: ['Pasang Berlian', 'Kasih Ke Admin'],
	FINISHER: ['Chrome Warna', 'Kasih Ke Admin'],
	INVENTORY: ['Input Data Inventory'],
};
const ROLE_OPTIONS = Object.keys(ROLE_TEMPLATES) as (keyof typeof ROLE_TEMPLATES)[];

export const OrderActionsModal: React.FC<Props> = ({ visible, order, onClose, onChanged }) => {
	const { token, user } = useAuth();
	const [tab, setTab] = useState<'assign'|'validate'>('assign');
	const [role, setRole] = useState<string>('');
	const [users, setUsers] = useState<any[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>('');
	const [selectedStages, setSelectedStages] = useState<string[]>([]);
	const [validations, setValidations] = useState<any[]>([]);
	const [orderTasks, setOrderTasks] = useState<any[]>([]);
	const [orderDetail, setOrderDetail] = useState<any | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [edit, setEdit] = useState(false);
	const [fCustomerName, setFCustomerName] = useState('');
	const [fCustomerPhone, setFCustomerPhone] = useState('');
	const [fCustomerAddress, setFCustomerAddress] = useState('');
	const [fCatatan, setFCatatan] = useState('');
	const [fReady, setFReady] = useState('');
	const [fSelesai, setFSelesai] = useState('');
	const [fAmbil, setFAmbil] = useState('');
	const [fJenisBarang, setFJenisBarang] = useState('');
	const [fJenisEmas, setFJenisEmas] = useState('');
	const [fWarnaEmas, setFWarnaEmas] = useState('');
	const [fHargaPerGram, setFHargaPerGram] = useState('');
	const [fDp, setFDp] = useState('');
	const [fHargaPerkiraan, setFHargaPerkiraan] = useState('');
	const [fHargaAkhir, setFHargaAkhir] = useState('');
	const [fStones, setFStones] = useState<{ bentuk: string; jumlah: string; berat: string }[]>([]);
	const [showPicker, setShowPicker] = useState<null | { field: 'ready' | 'selesai' | 'ambil'; date: Date }>(null);
	const [liveTasks, setLiveTasks] = useState<any[]>([]);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [openDropdown, setOpenDropdown] = useState<string|null>(null);
	const [fRingSize, setFRingSize] = useState('');

	useEffect(() => { if (!visible) setOpenDropdown(null); }, [visible]);
	const handleOpenDropdown = (key: string) => setOpenDropdown(prev => (prev === key ? null : key));

	useEffect(() => { if (!visible) return; setTab('assign'); setRole(''); setSelectedStages([]); setSelectedUserId(''); setUsers([]); setValidations([]); setOrderDetail(null); setEdit(false); }, [visible]);

		// TODO: Integrate users list endpoint (api.users.list) once available in api client
		useEffect(() => { setUsers([]); }, [role, token, visible]);
	useEffect(() => { (async () => { if (!token || !visible || !order) return; try { const res = await api.tasks.awaitingValidation(token, order.id); setValidations(res); } catch {} })(); }, [token, visible, order]);
	useEffect(() => { (async () => { if (!token || !visible || !order?.id) return; try { const all = await api.tasks.list(token); setOrderTasks(Array.isArray(all) ? all.filter((t:any)=> t.orderId === order.id) : []); } catch {} })(); }, [token, visible, order?.id]);
	useEffect(() => { (async () => { if (!token || !visible || !order?.id) return; try { const det = await api.orders.get(token, order.id); setOrderDetail(det); } catch {} })(); }, [token, visible, order?.id]);
	useEffect(() => { const det = orderDetail || order; if (!det) return; setFCustomerName(det.customerName || ''); setFCustomerPhone(det.customerPhone || ''); setFCustomerAddress(det.customerAddress || ''); setFCatatan(det.catatan || ''); setFReady(det.promisedReadyDate ? String(det.promisedReadyDate).slice(0,10) : ''); setFSelesai(det.tanggalSelesai ? String(det.tanggalSelesai).slice(0,10) : ''); setFAmbil(det.tanggalAmbil ? String(det.tanggalAmbil).slice(0,10) : ''); setFJenisBarang(det.jenisBarang || ''); setFJenisEmas(det.jenisEmas || ''); setFWarnaEmas(det.warnaEmas || ''); setFRingSize(det.ringSize || ''); setFHargaPerGram(det.hargaEmasPerGram != null ? formatIDRInputText(String(det.hargaEmasPerGram)) : ''); setFDp(det.dp != null ? formatIDRInputText(String(det.dp)) : ''); setFHargaPerkiraan(det.hargaPerkiraan != null ? formatIDRInputText(String(det.hargaPerkiraan)) : ''); setFHargaAkhir(det.hargaAkhir != null ? formatIDRInputText(String(det.hargaAkhir)) : ''); const stones = Array.isArray(det.stones) ? det.stones : []; setFStones(stones.map((s: any) => ({ bentuk: s.bentuk || '', jumlah: s.jumlah != null ? String(s.jumlah) : '', berat: s.berat != null ? String(s.berat) : '' }))); }, [orderDetail]);

	const saveEdit = async () => {
		if (!token || !order?.id) return;
		const patch: any = { customerName: fCustomerName || undefined, customerPhone: fCustomerPhone || undefined, customerAddress: fCustomerAddress || undefined, catatan: fCatatan || undefined, jenisBarang: fJenisBarang || undefined, jenisEmas: fJenisEmas || undefined, warnaEmas: fWarnaEmas || undefined, ringSize: (fJenisBarang === 'Women Ring' || fJenisBarang === 'Men Ring') && fRingSize ? fRingSize : undefined, hargaEmasPerGram: parseIDR(fHargaPerGram) ?? undefined, dp: parseIDR(fDp) ?? undefined, hargaPerkiraan: parseIDR(fHargaPerkiraan) ?? undefined, hargaAkhir: parseIDR(fHargaAkhir) ?? undefined, promisedReadyDate: fReady || undefined, tanggalSelesai: fSelesai || undefined, tanggalAmbil: fAmbil || undefined, stones: fStones.length ? fStones.filter(s => s.bentuk).map(s => ({ bentuk: s.bentuk, jumlah: Number(s.jumlah || '0'), berat: s.berat ? Number(s.berat) : undefined })) : undefined };
		try { await api.orders.update(token, order.id, patch); const det = await api.orders.get(token, order.id); setOrderDetail(det); setEdit(false); onChanged?.(); Alert.alert('Edit', 'Perubahan disimpan'); } catch (e:any) { Alert.alert('Gagal simpan', e.message || String(e)); }
	};

	const pickDate = (field: 'ready' | 'selesai' | 'ambil') => { const current = field === 'ready' ? fReady : field === 'selesai' ? fSelesai : fAmbil; const seed = current || new Date().toISOString().slice(0,10); setShowPicker({ field, date: new Date(seed) }); };
	const onDateChange = (_: any, selected?: Date) => { if (!showPicker) return; if (Platform.OS !== 'ios') setShowPicker(null); if (selected) { const iso = selected.toISOString().slice(0,10); if (showPicker.field === 'ready') setFReady(iso); if (showPicker.field === 'selesai') setFSelesai(iso); if (showPicker.field === 'ambil') setFAmbil(iso); } };
	const toggleStage = (stage: string) => setSelectedStages(s => s.includes(stage) ? s.filter(x=>x!==stage) : [...s, stage]);
	const canValidate = user?.jobRole === 'ADMINISTRATOR' || user?.jobRole === 'SALES';
	const doAssignBulk = async () => { if (!token || !order) return; if (!role) { Alert.alert('Assign Tugas', 'Pilih Role Pekerjaan terlebih dahulu.'); return; } if (!selectedUserId) { Alert.alert('Assign Tugas', 'Pilih orang yang akan ditugaskan.'); return; } const cleaned = (ROLE_TEMPLATES[role] || []).filter(st => selectedStages.includes(st)).map(st => ({ stage: st })); if (cleaned.length === 0) { Alert.alert('Assign Tugas', 'Pilih minimal satu sub-task.'); return; } try { const payload = { orderId: Number(order.id), role: String(role), userId: String(selectedUserId), subtasks: Array.isArray(cleaned) ? cleaned : [], }; await api.tasks.assignBulk(token, payload); Alert.alert('Assign', 'Tugas berhasil dibuat.'); try { const all = await api.tasks.list(token); setOrderTasks(Array.isArray(all) ? all.filter((t:any)=> t.orderId === order.id) : []); } catch {} onChanged?.(); onClose(); } catch (e: any) { Alert.alert('Gagal Assign', e.message || String(e)); } };
	useEffect(() => { if (!token || !visible || !order?.id) return; let cancel = false; let timer: any; const loadLive = async () => { try { const rows = await api.tasks.listByOrder(token, order.id); if (!cancel) { setLiveTasks(Array.isArray(rows) ? rows : []); setLastUpdated(new Date()); } } catch {} }; loadLive(); timer = setInterval(loadLive, 5000); return () => { cancel = true; if (timer) clearInterval(timer); }; }, [token, visible, order?.id]);

	const renderAssign = () => (<> {/* reuse original layout - trimmed for brevity since styling refactor pending */}
		<View style={styles.detailCard}>{(() => { const det = orderDetail || order || {}; const fmt = (n?: number) => formatIDR(n as any); const badgeStyle = (() => { const s = (det.status || '').toUpperCase(); if (s === 'DRAFT') return styles.badgeNeutral; if (s === 'DITERIMA' || s === 'DALAM_PROSES') return styles.badgeInfo; if (s === 'SELESAI') return styles.badgeSuccess; if (s === 'DIBATALKAN') return styles.badgeDanger; return styles.badgeNeutral; })(); return (<>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={styles.detailTitle}>{det.code ? `#${det.code}` : `#${det.id}`}</Text>
				{det.status && String(det.status).toUpperCase() !== 'DALAM_PROSES' ? (<Text style={[styles.badgeBase, badgeStyle]}>{String(det.status)}</Text>) : null}
			</View>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				{!edit ? (<Text style={styles.detailSubtitle}>{det.customerName || '-'}</Text>) : (<TextInput placeholder='Nama Customer' style={styles.input} value={fCustomerName} onChangeText={setFCustomerName} />)}
				{!edit ? (<TouchableOpacity onPress={()=> setEdit(true)} style={styles.editBtn}><Text style={styles.editBtnText}>Edit</Text></TouchableOpacity>) : null}
			</View>
			<View style={styles.rowGrid}>
				<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Telepon</Text><Text style={styles.infoValue}>{det.customerPhone || '-'}</Text></>) : (<TextInput placeholder='Telepon' style={styles.input} value={fCustomerPhone} onChangeText={setFCustomerPhone} keyboardType='phone-pad' />)}</View>
				<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Jenis</Text><Text style={styles.infoValue}>{det.jenisBarang || '-'}</Text></>) : (<InlineSelect label='Jenis Barang' value={fJenisBarang} options={JENIS_BARANG_OPTIONS} onChange={setFJenisBarang} open={openDropdown==='jenisBarang'} onRequestOpen={()=>handleOpenDropdown('jenisBarang')} />)}</View>
				<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Alamat</Text><Text style={styles.infoValue}>{det.customerAddress || '-'}</Text></>) : (<TextInput placeholder='Alamat' style={styles.input} value={fCustomerAddress} onChangeText={setFCustomerAddress} />)}</View>
				<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Emas</Text><Text style={styles.infoValue}>{det.jenisEmas || '-'}</Text></>) : (<InlineSelect label='Jenis Emas' value={fJenisEmas} options={JENIS_EMAS_OPTIONS} onChange={setFJenisEmas} open={openDropdown==='jenisEmas'} onRequestOpen={()=>handleOpenDropdown('jenisEmas')} />)}</View>
				<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Warna</Text><Text style={styles.infoValue}>{det.warnaEmas || '-'}</Text></>) : (<InlineSelect label='Warna Emas' value={fWarnaEmas} options={WARNA_EMAS_OPTIONS} onChange={setFWarnaEmas} open={openDropdown==='warnaEmas'} onRequestOpen={()=>handleOpenDropdown('warnaEmas')} />)}</View>
				{(fJenisBarang === 'Women Ring' || fJenisBarang === 'Men Ring') && (<View style={styles.infoRow}>{!edit ? (<><Text style={styles.infoLabel}>Ring Size</Text><Text style={styles.infoValue}>{det.ringSize || '-'}</Text></>) : (<TextInput placeholder='Ukuran Cincin' style={styles.input} value={fRingSize} onChangeText={setFRingSize} />)}</View>)}
			</View>
			<View style={styles.sectionDivider} />
			<Text style={styles.sectionTitle}>Pembayaran</Text>
			<View style={styles.rowGrid}>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Harga/gr</Text>{!edit ? (<Text style={styles.infoValue}>{fmt(det.hargaEmasPerGram)}</Text>) : (<TextInput placeholder='Harga/gr' style={styles.input} value={fHargaPerGram} onChangeText={(t)=> setFHargaPerGram(formatIDRInputText(t))} keyboardType='numeric' />)}</View>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>DP</Text>{!edit ? (<Text style={styles.infoValue}>{fmt(det.dp)}</Text>) : (<TextInput placeholder='DP' style={styles.input} value={fDp} onChangeText={(t)=> setFDp(formatIDRInputText(t))} keyboardType='numeric' />)}</View>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Perkiraan</Text>{!edit ? (<Text style={styles.infoValue}>{fmt(det.hargaPerkiraan)}</Text>) : (<TextInput placeholder='Perkiraan' style={styles.input} value={fHargaPerkiraan} onChangeText={(t)=> setFHargaPerkiraan(formatIDRInputText(t))} keyboardType='numeric' />)}</View>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Harga Akhir</Text>{!edit ? (<Text style={styles.infoValue}>{fmt(det.hargaAkhir)}</Text>) : (<TextInput placeholder='Harga Akhir' style={styles.input} value={fHargaAkhir} onChangeText={(t)=> setFHargaAkhir(formatIDRInputText(t))} keyboardType='numeric' />)}</View>
			</View>
			<View style={styles.sectionDivider} />
			<Text style={styles.sectionTitle}>Tanggal</Text>
			<View style={styles.rowGrid}>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Perkiraan Siap</Text>{!edit ? (<Text style={styles.infoValue}>{formatDateOnly(det.promisedReadyDate)}</Text>) : (<TouchableOpacity onPress={()=>pickDate('ready')} style={[styles.input,{justifyContent:'center'}]}><Text>{fReady || 'Pilih tanggal'}</Text></TouchableOpacity>)}</View>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Selesai</Text>{!edit ? (<Text style={styles.infoValue}>{formatDateOnly(det.tanggalSelesai)}</Text>) : (<TouchableOpacity onPress={()=>pickDate('selesai')} style={[styles.input,{justifyContent:'center'}]}><Text>{fSelesai || 'Pilih tanggal'}</Text></TouchableOpacity>)}</View>
				<View style={styles.infoRow}><Text style={styles.infoLabel}>Ambil</Text>{!edit ? (<Text style={styles.infoValue}>{formatDateOnly(det.tanggalAmbil)}</Text>) : (<TouchableOpacity onPress={()=>pickDate('ambil')} style={[styles.input,{justifyContent:'center'}]}><Text>{fAmbil || 'Pilih tanggal'}</Text></TouchableOpacity>)}</View>
			</View>
			{(!edit && det.stones?.length) ? (<><View style={styles.sectionDivider} /><Text style={styles.sectionTitle}>Batu</Text><View style={styles.pillRow}>{det.stones.map((s: any, idx: number) => (<View key={idx} style={styles.pill}><Text style={styles.pillText}>{`${s.bentuk || '-'}${s.jumlah ? ` x${s.jumlah}` : ''}${s.berat ? ` • ${s.berat} gr` : ''}`}</Text></View>))}</View></>) : null}
			{edit ? (<><View style={styles.sectionDivider} /><Text style={styles.sectionTitle}>Batu</Text>{fStones.map((s, idx) => (<View key={idx} style={{ marginBottom:10 }}><InlineSelect label='Bentuk' value={s.bentuk} options={BENTUK_BATU_OPTIONS} onChange={(v)=> setFStones(arr => arr.map((x,i)=> i===idx?{...x,bentuk:v}:x))} open={openDropdown===`bentuk${idx}`} onRequestOpen={()=>handleOpenDropdown(`bentuk${idx}`)} /><View style={{ flexDirection:'row', alignItems:'center', gap:8 }}><TextInput placeholder='Jumlah' style={[styles.input, { width:90 }]} value={s.jumlah} onChangeText={(v)=> setFStones(arr => arr.map((x,i)=> i===idx?{...x,jumlah:v}:x))} keyboardType='numeric' /><TextInput placeholder='Berat (gr)' style={[styles.input, { width:110 }]} value={s.berat} onChangeText={(v)=> setFStones(arr => arr.map((x,i)=> i===idx?{...x,berat:v}:x))} keyboardType='numeric' /><TouchableOpacity onPress={()=> setFStones(arr => arr.filter((_,i)=> i!==idx))} style={{ padding:8 }}><Text style={{ color:'#c00' }}>Hapus</Text></TouchableOpacity></View></View>))}<TouchableOpacity onPress={()=> setFStones(arr => [...arr, { bentuk:'', jumlah:'', berat:'' }])}><Text style={{ color:'#1976d2' }}>+ Tambah Batu</Text></TouchableOpacity></>) : null}
			{(() => { const imgs = (det?.referensiGambarUrls) as string[] | undefined; return Array.isArray(imgs) && imgs.length; })() ? (<><View style={styles.sectionDivider} /><Text style={styles.sectionTitle}>Referensi Gambar</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:8 }}>{(det.referensiGambarUrls as string[]).map((u: string, idx: number) => (<TouchableOpacity key={u+idx} onPress={() => setPreviewUrl(u)}><Image source={{ uri: toDisplayUrl(u) }} style={styles.thumbImg} /></TouchableOpacity>))}</ScrollView></>) : null}
			{(!edit && det.catatan) ? (<><View style={styles.sectionDivider} /><Text style={styles.sectionTitle}>Catatan</Text><Text style={styles.noteText}>{det.catatan}</Text></>) : null}
			{edit ? (<><View style={styles.sectionDivider} /><Text style={styles.sectionTitle}>Catatan</Text><TextInput placeholder='Catatan' style={[styles.input, { minHeight: 70 }]} value={fCatatan} onChangeText={setFCatatan} multiline /><View style={{ height: 10 }} /><TouchableOpacity onPress={saveEdit} style={styles.primary}><Text style={styles.primaryText}>Simpan Perubahan</Text></TouchableOpacity><View style={{ height: 6 }} /><TouchableOpacity onPress={()=> setEdit(false)}><Text style={{ color:'#1976d2', textAlign:'center' }}>Batal</Text></TouchableOpacity></>) : null}
		</>); })()}</View>
		<View style={styles.sectionDivider} />
		<Text style={styles.sectionTitle}>Status Tugas</Text>
		{lastUpdated ? (<Text style={[styles.subtleSmall, { paddingVertical: 4 }]}>Terakhir diperbarui: {lastUpdated.toLocaleTimeString()}</Text>) : null}
		<View style={{ gap: 6 }}>{(() => { const visibleTasks = (liveTasks || []).filter((t:any)=> ['ASSIGNED','IN_PROGRESS','AWAITING_VALIDATION'].includes(String(t.status))); return visibleTasks; })().length === 0 ? (<Text style={styles.subtleSmall}>Belum ada tugas untuk order ini.</Text>) : ((liveTasks || []).filter((t:any)=> ['ASSIGNED','IN_PROGRESS','AWAITING_VALIDATION'].includes(String(t.status))).map((t: any) => (<View key={t.id} style={{ flexDirection: 'row', justifyContent:'space-between', alignItems:'center', paddingVertical: 4 }}><Text style={styles.infoValue}>{t.stage || 'Tanpa Stage'}</Text><View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>{t.status === 'ASSIGNED' ? (<Text style={styles.badgeBase}>ASSIGNED</Text>) : null}{t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' ? (<View style={[styles.checkbox, t.isChecked && styles.checkboxChecked, t.status === 'ASSIGNED' ? { opacity: 0.5 } : null]}><View style={[styles.checkboxInner, t.isChecked && styles.checkboxInnerChecked]} /></View>) : t.status === 'AWAITING_VALIDATION' ? (<Text style={[styles.badgeBase, styles.badgeInfo]}>Menunggu Validasi</Text>) : null}</View></View>)))}</View>
		{(() => { const hasActiveAssignment = orderTasks.some((t:any) => t.orderId === (order?.id ?? t.orderId) && !!t.assignedTo && t.status !== 'DONE' && t.status !== 'CANCELLED'); if (hasActiveAssignment) return null; return (<><InlineSelect label="Role Pekerjaan" value={role} options={(ROLE_OPTIONS as any)} onChange={(r)=> { setRole(r); setSelectedStages([]); setSelectedUserId(''); }} open={openDropdown==='rolePekerjaan'} onRequestOpen={()=>handleOpenDropdown('rolePekerjaan')} /><InlineSelect label="Pilih Staff" value={selectedUserId} options={users.filter(u => !role || u.jobRole === role).map(u=>({ label: u.fullName, value: u.id }))} onChange={(v)=> setSelectedUserId(v)} disabled={!role} open={openDropdown==='pilihStaff'} onRequestOpen={()=>handleOpenDropdown('pilihStaff')} /><Text style={styles.section}>Sub-tasks</Text>{(ROLE_TEMPLATES[role] || []).map((st) => { const active = selectedStages.includes(st); return (<TouchableOpacity key={st} onPress={()=> toggleStage(st)} style={[styles.stageItem, active && styles.stageItemActive]}><Text style={[styles.stageText, active && styles.stageTextActive]}>{st}</Text></TouchableOpacity>); })}<View style={{ height: 12 }} /><TouchableOpacity onPress={doAssignBulk} style={styles.primary}><Text style={styles.primaryText}>Simpan & Assign</Text></TouchableOpacity></>); })()}
		{previewUrl && <ImagePreviewModal url={toDisplayUrl(previewUrl)} onClose={()=> setPreviewUrl(null)} />}
	</>);

	const groupedValidations = useMemo(() => { const map = new Map<string, { userId: string; name: string; role: string | undefined; stages: string[]; count: number }>(); for (const v of validations) { const uid = v.assignedTo?.id || 'unknown'; const key = uid; const cur = map.get(key) || { userId: uid, name: v.assignedTo?.fullName || '-', role: v.assignedTo?.jobRole, stages: [], count: 0 } as any; if (v.stage) cur.stages.push(v.stage); cur.count += 1; map.set(key, cur); } return Array.from(map.values()); }, [validations]);
	const validateGroup = async (userId: string) => { if (!token || !order?.id) return; try { await api.tasks.validateUserForOrder(token, order.id, userId); const res = await api.tasks.awaitingValidation(token, order.id); setValidations(res); onChanged?.(); Alert.alert('Validasi', 'Semua tugas tervalidasi'); } catch (e:any) { Alert.alert('Gagal validasi', e.message || String(e)); } };
	const renderValidate = () => (<View>{!canValidate ? <Text>Anda tidak memiliki akses untuk validasi.</Text> : (groupedValidations.length === 0 ? <Text>Tidak ada tugas yang menunggu validasi.</Text> : (<FlatList data={groupedValidations} keyExtractor={(it)=>String(it.userId)} renderItem={({item}) => (<View style={styles.valCard}><Text style={{ fontWeight:'700', fontSize: 15 }}>{item.name}</Text><Text style={{ color:'#555' }}>{item.role || '-'}</Text><View style={{ height:6 }} /><Text style={{ color:'#333', marginBottom:6 }}>Sub-tugas:</Text><View style={styles.pillRow}>{item.stages.map((s, idx) => (<View key={idx} style={styles.pill}><Text style={styles.pillText}>{s}</Text></View>))}</View><View style={{ height:10 }} /><TouchableOpacity onPress={()=> validateGroup(item.userId)} style={[styles.primary, { paddingVertical: 10 }]}><Text style={styles.primaryText}>Validate ({item.count})</Text></TouchableOpacity></View>)} />))}</View>);

	return (<Modal visible={visible} animationType="slide" onRequestClose={onClose}><View style={{ flex:1, paddingTop: 12 }}><View style={styles.header}><TouchableOpacity onPress={onClose}><Text style={{ color:'#1976d2' }}>Tutup</Text></TouchableOpacity><Text style={styles.title}>Order #{order?.code || order?.id}</Text><TouchableOpacity onPress={() => { if (!token || !order?.id) return; Alert.alert('Hapus Order', 'Yakin hapus order ini?', [{ text:'Batal', style:'cancel' }, { text:'Hapus', style:'destructive', onPress: async () => { try { await api.orders.remove(token, order.id); onChanged?.(); onClose(); } catch(e:any){ Alert.alert('Gagal hapus', e.message || String(e)); } } }]); }}><Text style={{ color:'#c62828', fontWeight:'700' }}>Hapus</Text></TouchableOpacity></View><View style={styles.tabs}><TouchableOpacity onPress={()=> setTab('assign')} style={[styles.tab, tab==='assign' && styles.tabActive]}><Text style={tab==='assign'?styles.tabActiveText:styles.tabText}>Detail & Assign</Text></TouchableOpacity><TouchableOpacity onPress={()=> setTab('validate')} style={[styles.tab, tab==='validate' && styles.tabActive]}><Text style={tab==='validate'?styles.tabActiveText:styles.tabText}>Validasi</Text></TouchableOpacity></View><FlatList data={[{ key: 'content' }]} keyExtractor={(it)=>it.key} contentContainerStyle={{ padding:16 }} renderItem={() => (tab === 'assign' ? renderAssign() : renderValidate()) as any} />{showPicker && (<DateTimePicker value={showPicker.date} mode='date' display='default' onChange={onDateChange} />)}</View></Modal>);
};

const styles = StyleSheet.create({ /* keeping original styles for now */
	header: { paddingHorizontal: 16, paddingVertical: 10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1, borderBottomColor:'#eee' },
	title: { fontWeight:'700', fontSize:16 },
	tabs: { flexDirection:'row', marginTop: 8 },
	tab: { flex:1, paddingVertical: 12, alignItems:'center', borderBottomWidth:2, borderBottomColor:'transparent' },
	tabActive: { borderBottomColor:'#1976d2' },
	tabText: { color:'#666' },
	tabActiveText: { color:'#1976d2', fontWeight:'700' },
	section: { fontWeight:'700', marginBottom: 8, marginTop: 8 },
	input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, paddingHorizontal:10, paddingVertical:8, flex:1 },
	primary: { backgroundColor:'#1976d2', paddingVertical: 12, borderRadius: 8, alignItems:'center' },
	primaryText: { color:'white', fontWeight:'700' },
	valCard: { padding: 12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom: 8, backgroundColor:'#fff' },
	stageItem: { paddingVertical:10, paddingHorizontal:12, borderWidth:1, borderColor:'#ddd', borderRadius:8, marginBottom:8, backgroundColor:'#fff' },
	stageItemActive: { backgroundColor:'#e3f2fd', borderColor:'#90caf9' },
	stageText: { color:'#111' },
	stageTextActive: { color:'#0b5394', fontWeight:'700' },
	detailCard: { padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, backgroundColor:'#fafafa', marginBottom:12 },
	detailTitle: { fontSize:18, fontWeight:'800', color:'#111' },
	detailSubtitle: { marginTop:2, color:'#444', marginBottom:8 },
	rowGrid: { flexDirection:'row', flexWrap:'wrap' },
	infoRow: { width:'50%', paddingVertical:4 },
	infoLabel: { color:'#888', fontSize:12 },
	infoValue: { color:'#222', fontWeight:'600' },
	sectionDivider: { height:1, backgroundColor:'#eee', marginVertical:10 },
	sectionTitle: { fontWeight:'700', color:'#222' },
	pillRow: { flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:6 },
	pill: { paddingVertical:6, paddingHorizontal:10, borderRadius:16, borderWidth:1, borderColor:'#ddd', backgroundColor:'#fff' },
	pillText: { color:'#333', fontSize:12 },
	thumbImg: { width:72, height:72, borderRadius:8, backgroundColor:'#eee', marginRight:8 },
	noteText: { color:'#333', marginTop:6 },
	badgeBase: { paddingHorizontal:8, paddingVertical:4, borderRadius:8, fontSize:12, overflow:'hidden' },
	badgeNeutral: { backgroundColor:'#eceff1', color:'#37474f' },
	badgeInfo: { backgroundColor:'#e3f2fd', color:'#0b5394' },
	badgeSuccess: { backgroundColor:'#e8f5e9', color:'#2e7d32' },
	badgeDanger: { backgroundColor:'#ffebee', color:'#c62828' },
	editBtn: { paddingVertical:6, paddingHorizontal:10, backgroundColor:'#1976d2', borderRadius:6, marginLeft:8 },
	editBtnText: { color:'#fff', fontWeight:'700' },
	checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#1976d2', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
	checkboxChecked: { backgroundColor: '#e3f2fd' },
	checkboxInner: { width: 12, height: 12, borderRadius: 2, backgroundColor: 'transparent' },
	checkboxInnerChecked: { backgroundColor: '#1976d2' },
	subtleSmall: { color: '#999', fontSize: 12, textAlign: 'center', paddingVertical: 16 },
});

function toDisplayUrl(p?: string) { if (!p) return ''; if (/^https?:\/\//i.test(p)) return p; const base = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, ''); return p.startsWith('/uploads') ? base + p : p; }
function formatDateOnly(p?: string) { if (!p) return '-'; const m = /^\d{4}-\d{2}-\d{2}$/.exec(p); let d: Date; if (m) { const [y, mo, da] = p.split('-').map(Number); d = new Date(y, (mo || 1) - 1, da || 1); } else { d = new Date(p); } if (isNaN(d.getTime())) return p; return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }

