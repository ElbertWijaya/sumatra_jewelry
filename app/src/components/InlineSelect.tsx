import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';


type Option = { label: string; value: string } | string;
interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange(v: string): void;
  maxHeight?: number;
  disabled?: boolean;
  styleHeader?: any;
  open?: boolean;
  onRequestOpen?: () => void;
}

export const InlineSelect: React.FC<Props> = ({ label, value, options, onChange, maxHeight = 220, disabled = false, styleHeader, open: controlledOpen, onRequestOpen }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  React.useEffect(() => { if (disabled && open) setInternalOpen(false); }, [disabled, open]);
  const normalized = React.useMemo(() => (
    (options || []).map((opt) => typeof opt === 'string' ? { label: opt, value: opt } : opt)
  ), [options]);
  const selectedLabel = React.useMemo(() => normalized.find(o => o.value === value)?.label || '', [normalized, value]);

  // Animated close + scroll up effect + dynamic height
  const ITEM_HEIGHT = 48;
  const MAX_VISIBLE = 5;
  const anim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const visibleCount = Math.min(normalized.length, MAX_VISIBLE);
  const dynamicHeight = visibleCount * ITEM_HEIGHT;
  useEffect(() => {
    if (open && !disabled) {
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(scrollAnim, { toValue: 0, duration: 180, useNativeDriver: false })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(scrollAnim, { toValue: -20, duration: 180, useNativeDriver: false })
      ]).start();
    }
  }, [open, disabled, normalized.length]);
  const dropdownHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, normalized.length > 0 ? dynamicHeight : 48] });
  const dropdownOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const dropdownTranslateY = scrollAnim.interpolate({ inputRange: [-20, 0], outputRange: [-20, 0] });

  const handlePress = () => {
    if (disabled) return;
    if (onRequestOpen) {
      onRequestOpen();
    } else {
      setInternalOpen(o => !o);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.header, styleHeader, disabled && styles.headerDisabled]} onPress={handlePress} activeOpacity={disabled ? 1 : 0.7} disabled={disabled}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueWrap}>
          <Text style={[styles.value, disabled && styles.valueDisabled]}>
            {selectedLabel || 'Pilih'}
          </Text>
          <Text style={[styles.arrow, disabled && styles.valueDisabled]}>{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {open && !disabled ? (
        <Animated.View
          style={[styles.dropdown, {
            height: dropdownHeight,
            opacity: dropdownOpacity,
            transform: [{ translateY: dropdownTranslateY }],
            minHeight: 0,
            justifyContent: normalized.length === 0 ? 'center' : undefined,
            alignItems: normalized.length === 0 ? 'center' : undefined,
          }]}
          pointerEvents={'auto'}
        >
          {normalized.length > 0 ? (
            normalized.length > MAX_VISIBLE ? (
              <ScrollView style={{ maxHeight: MAX_VISIBLE * ITEM_HEIGHT }} nestedScrollEnabled>
                {normalized.map(opt => {
                  const active = value === opt.value;
                  return (
                    <TouchableOpacity key={opt.value} style={[styles.item, active && styles.itemActive]} onPress={() => { onChange(opt.value); if (controlledOpen === undefined) setInternalOpen(false); }}>
                      <Text style={[styles.itemText, active && styles.itemTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              normalized.map(opt => {
                const active = value === opt.value;
                return (
                  <TouchableOpacity key={opt.value} style={[styles.item, active && styles.itemActive]} onPress={() => { onChange(opt.value); if (controlledOpen === undefined) setInternalOpen(false); }}>
                    <Text style={[styles.itemText, active && styles.itemTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })
            )
          ) : (
            <Text style={{ color: '#FFD700', fontSize: 14, padding: 12 }}>Tidak ada data</Text>
          )}
        </Animated.View>
      ) : null}
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
  itemText: { fontSize:14, color:'#FFD700' },
  itemTextActive: { color:'#fff', fontWeight:'700' },
});
  // ...existing code...
