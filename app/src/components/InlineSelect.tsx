import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type Option = { label: string; value: string } | string;
interface Props { label: string; value: string; options: Option[]; onChange(v:string): void; maxHeight?: number; disabled?: boolean; styleHeader?: any }

export const InlineSelect: React.FC<Props> = ({ label, value, options, onChange, maxHeight = 220, disabled = false, styleHeader }) => {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { if (disabled && open) setOpen(false); }, [disabled, open]);
  const normalized = React.useMemo(() => (
    (options || []).map((opt) => typeof opt === 'string' ? { label: opt, value: opt } : opt)
  ), [options]);
  const selectedLabel = React.useMemo(() => normalized.find(o => o.value === value)?.label || '', [normalized, value]);
  return (
    <View style={styles.wrapper}>
  <TouchableOpacity style={[styles.header, styleHeader, disabled && styles.headerDisabled]} onPress={()=> { if (!disabled) setOpen(o=>!o); }} activeOpacity={disabled ? 1 : 0.7} disabled={disabled}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueWrap}>
      <Text style={[styles.value, disabled && styles.valueDisabled]}>
        {selectedLabel || 'Pilih'}
      </Text>
      <Text style={[styles.arrow, disabled && styles.valueDisabled]}>{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
    {open && !disabled && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight }} nestedScrollEnabled>
            {normalized.map(opt => {
              const active = value === opt.value;
              return (
                <TouchableOpacity key={opt.value} style={[styles.item, active && styles.itemActive]} onPress={()=>{ onChange(opt.value); setOpen(false); }}>
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  header: { flexDirection:'row', alignItems:'center', backgroundColor:'#23201c', borderWidth:1, borderColor:'#FFD700', paddingHorizontal:16, paddingVertical:12, borderRadius:10 },
  label: { flex:1, fontSize:12, fontWeight:'600', color:'#FFD700', textAlign:'left', flexWrap:'wrap' },
  valueWrap: { flexDirection:'row', alignItems:'center', flex:1, flexWrap:'wrap' },
  value: { fontSize:15, color:'#FFD700', textAlign:'right', flex:1, fontWeight:'700', paddingRight:2 },
  valueDisabled: { color:'#bfae6a' },
  headerDisabled: { backgroundColor:'#181512', borderColor:'#bfae6a' },
  arrow: { fontSize:14, color:'#FFD700', fontWeight:'700' },
  dropdown: { marginTop:6, borderWidth:1, borderColor:'#FFD700', borderRadius:12, backgroundColor:'#23201c', overflow:'hidden', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:3 },
  item: { paddingVertical:12, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  itemActive: { backgroundColor:'#181512' },
  itemText: { fontSize:14, color:'#333' },
  itemTextActive: { color:'#FFD700', fontWeight:'700' },
});
  // ...existing code...
