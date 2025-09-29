import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Modal, Pressable, findNodeHandle } from 'react-native';


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
  onDropdownNeedsSpace?: (space: number, direction: 'down'|'up') => void;
}

export const InlineSelect: React.FC<Props> = ({ label, value, options, onChange, maxHeight = 220, disabled = false, styleHeader, open: controlledOpen, onRequestOpen, onDropdownNeedsSpace }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number, width: number, height: number}|null>(null);
  const normalized = React.useMemo(() => (
    (options || []).map((opt) => typeof opt === 'string' ? { label: opt, value: opt } : opt)
  ), [options]);
  const selectedLabel = React.useMemo(() => normalized.find(o => o.value === value)?.label || '', [normalized, value]);

  // Animated open/close effect + dynamic height (single driver)
  const ITEM_HEIGHT = 48;
  const MAX_VISIBLE = 5;
  const scrollRef = useRef<ScrollView>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const dynamicHeight = normalized.length * ITEM_HEIGHT;
  const maxDropdownHeight = Math.min(dynamicHeight, ITEM_HEIGHT * MAX_VISIBLE);
  const actualDropdownHeight = normalized.length > MAX_VISIBLE ? maxDropdownHeight : dynamicHeight;
  const [dropdownDirection, setDropdownDirection] = useState<'down'|'up'>('down');
  const headerRef = useRef<View>(null);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: modalVisible && !disabled ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // all props animated in JS
    }).start();
    // Scroll to selected option when opening
    if (modalVisible && !disabled && normalized.length > MAX_VISIBLE) {
      setTimeout(() => {
        const idx = normalized.findIndex(o => o.value === value);
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            y: Math.max(0, (idx === -1 ? 0 : idx) * ITEM_HEIGHT),
            animated: true,
          });
        }
      }, 200); // after animation
    }
  }, [modalVisible, disabled, normalized.length]);
  const dropdownHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, normalized.length > 0 ? maxDropdownHeight : 48] });
  const dropdownOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const dropdownTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  // Auto flip dropdown if not enough space below
  const handlePress = () => {
    if (disabled) return;
    if (onRequestOpen) {
      onRequestOpen();
    } else {
      // Measure tombol untuk posisi dropdown
      headerRef.current?.measureInWindow((x, y, w, h) => {
        setDropdownPos({
          top: y,
          left: x,
          width: w,
          height: h,
        });
        setModalVisible(true);
      });
    }
  };

  console.log('[InlineSelect] render', { label, disabled });
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={{ position: 'relative', flex: 0, overflow: 'visible' }}>
          <TouchableOpacity
            ref={headerRef}
            style={[styles.header, styleHeader, disabled && styles.headerDisabled]}
            onPress={() => {
              if (disabled) {
                console.log('[InlineSelect] TouchableOpacity pressed but disabled', { label });
              } else {
                handlePress();
              }
            }}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            <View style={styles.valueRowWrap}>
              <Text style={[styles.value, disabled && styles.valueDisabled]}>{selectedLabel || 'Pilih'}</Text>
              <Text style={[styles.arrow, disabled && styles.valueDisabled]}>{modalVisible ? '▲' : '▼'}</Text>
            </View>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)}>
              {dropdownPos && (
                <Animated.View
                  style={[
                    styles.dropdownModal,
                    {
                      position: 'absolute',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      minWidth: dropdownPos.width,
                      maxWidth: dropdownPos.width,
                      borderTopLeftRadius: 22,
                      borderTopRightRadius: 22,
                      opacity: dropdownOpacity,
                      transform: [{ translateY: dropdownTranslateY }],
                      maxHeight: maxDropdownHeight,
                    },
                  ]}
                >
                  <ScrollView
                    ref={scrollRef}
                    style={{ maxHeight: maxDropdownHeight, width: dropdownPos.width, minWidth: dropdownPos.width, maxWidth: dropdownPos.width }}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {normalized.length > 0 ? (
                      normalized.map(opt => {
                        const active = value === opt.value;
                        return (
                          <TouchableOpacity key={opt.value} style={[styles.item, { width: dropdownPos.width, minWidth: dropdownPos.width, maxWidth: dropdownPos.width }, active && styles.itemActive]} onPress={() => { onChange(opt.value); setModalVisible(false); }}>
                            <Text style={[styles.itemText, active && styles.itemTextActive]}>{opt.label}</Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <Text style={{ color: '#FFD700', fontSize: 14, padding: 12 }}>Tidak ada data</Text>
                    )}
                  </ScrollView>
                </Animated.View>
              )}
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: { marginBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 24 },
  label: { fontSize:15, fontWeight:'600', color:'#FFD700', textAlign:'left', marginLeft:2, marginRight:18, flex:1, minWidth:0 },
  header: { backgroundColor:'#23201c', borderWidth:2.5, borderColor:'#FFD700', borderRadius:22, minHeight:40, justifyContent:'center', paddingLeft:20, paddingRight:10, paddingVertical:0, width:150, alignSelf:'flex-end' },
  valueRowWrap: { flexDirection:'row', alignItems:'center', justifyContent:'flex-end', minHeight:32 },
  value: { fontSize:17, color:'#FFD700', fontWeight:'700', textAlign:'right', flexShrink:1, flexGrow:0, paddingRight:12 },
  valueDisabled: { color:'#bfae6a' },
  headerDisabled: { backgroundColor:'#181512', borderColor:'#bfae6a' },
  arrow: { fontSize:13, color:'#FFD700', fontWeight:'700', marginLeft:2 },
  dropdown: { borderWidth:1, borderColor:'#FFD700', borderRadius:12, backgroundColor:'#23201c', overflow:'visible', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:3 },
  item: { paddingVertical:10, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  itemActive: { backgroundColor:'#181512' },
  itemText: { fontSize:15, color:'#FFD700' },
  itemTextActive: { color:'#fff', fontWeight:'700' },
  dropdownModal: {
    backgroundColor: '#23201c',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 160,
    maxWidth: 320,
    zIndex: 9999,
  },
});

// (hapus deklarasi styles lama, sudah digantikan di atas)
  // ...existing code...
