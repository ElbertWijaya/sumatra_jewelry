import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type Option = { label: string; value: string } | string;
interface Props { label: string; value: string; options: Option[]; onChange(v:string): void; maxHeight?: number }

export const InlineSelect: React.FC<Props> = ({ label, value, options, onChange, maxHeight = 220 }) => {
  const [open, setOpen] = React.useState(false);
  const normalized = React.useMemo(() => (
    (options || []).map((opt) => typeof opt === 'string' ? { label: opt, value: opt } : opt)
  ), [options]);
  const selectedLabel = React.useMemo(() => normalized.find(o => o.value === value)?.label || '', [normalized, value]);
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={()=> setOpen(o=>!o)} activeOpacity={0.7}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueWrap}>
          <Text style={styles.value}>{selectedLabel || 'Pilih'}</Text>
          <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {open && (
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
  header: { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor:'#ddd', paddingHorizontal:16, paddingVertical:14, borderRadius:12 },
  label: { flex:1, fontSize:13, fontWeight:'600', color:'#444' },
  valueWrap: { flexDirection:'row', alignItems:'center' },
  value: { fontSize:13, color:'#222', marginRight:10, maxWidth:140, textAlign:'right' },
  arrow: { fontSize:12, color:'#666' },
  dropdown: { marginTop:6, borderWidth:1, borderColor:'#ddd', borderRadius:12, backgroundColor:'#fff', overflow:'hidden', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, shadowOffset:{ width:0, height:2 }, elevation:2 },
  item: { paddingVertical:12, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  itemActive: { backgroundColor:'#222' },
  itemText: { fontSize:14, color:'#333' },
  itemTextActive: { color:'#fff', fontWeight:'600' },
});
