import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { label: string; value: string; options: string[]; onChange(v:string): void; }

export const InlineSelect: React.FC<Props> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={()=> setOpen(o=>!o)}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'Pilih'}</Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.options}> 
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={()=>{ onChange(opt); setOpen(false); }} style={[styles.opt, value===opt && styles.optActive]}>
              <Text style={[styles.optText, value===opt && styles.optTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  header: { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor:'#ddd', paddingHorizontal:14, paddingVertical:13, borderRadius:10 },
  label: { flex:1, fontSize:13, fontWeight:'600', color:'#444' },
  value: { fontSize:13, color:'#222', marginRight:10 },
  arrow: { fontSize:12, color:'#666' },
  options: { flexDirection:'row', flexWrap:'wrap', paddingTop:10, gap:8 },
  opt: { paddingVertical:6, paddingHorizontal:14, backgroundColor:'#f2f2f2', borderRadius:20 },
  optActive: { backgroundColor:'#222' },
  optText: { color:'#333', fontSize:13 },
  optTextActive: { color:'#fff' },
});
