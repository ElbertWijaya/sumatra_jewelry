import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Modal, Pressable } from 'react-native';

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
    Animated.timing(anim, { toValue: modalVisible && !disabled ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [modalVisible, disabled]);

  const openDropdown = () => {
    if (disabled) return;
    requestAnimationFrame(() => {
      headerRef.current?.measureInWindow((x,y,width,height)=>{
        const spaceBelow = (global as any).windowHeight ? (global as any).windowHeight - (y + height) : 600;
        const spaceAbove = y;
        const direction: 'down'|'up' = spaceBelow < 260 && spaceAbove > spaceBelow ? 'up' : 'down';
        setDropdownDirection(direction);
        setDropdownPos({ top: y, left: x, width, height });
        setModalVisible(true);
        const spaceNeeded = Math.max(0, actualDropdownHeight - (direction === 'down' ? spaceBelow : spaceAbove));
        onDropdownNeedsSpace && onDropdownNeedsSpace(spaceNeeded, direction);
      });
    });
  };

  return (
    <View ref={headerRef} style={[styles.header, disabled && { opacity:0.5 }, styleHeader]}>
      <TouchableOpacity onPress={openDropdown} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <Text style={styles.labelInside}>{selectedLabel || label || 'Pilih'}</Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={()=> setModalVisible(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={()=> setModalVisible(false)} />
        {dropdownPos && (
          <View style={[styles.dropdown, {
            position:'absolute',
            left: dropdownPos.left,
            width: dropdownPos.width,
            ...(dropdownDirection === 'down'
              ? { top: dropdownPos.top + dropdownPos.height + 4 }
              : { bottom: (global as any).windowHeight - dropdownPos.top + 4 }),
            maxHeight: maxDropdownHeight,
          }]}>
            <Animated.View style={{ opacity: anim }}>
              <ScrollView ref={scrollRef} style={{ maxHeight: maxDropdownHeight }} nestedScrollEnabled>
                {normalized.map(opt => {
                  const active = opt.value === value;
                  return (
                    <TouchableOpacity key={opt.value} onPress={()=>{ onChange(opt.value); setModalVisible(false); }} style={[styles.item, active && styles.itemActive]}>
                      <Text style={[styles.itemText, active && styles.itemTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { borderWidth:1, borderColor:'#FFD700', backgroundColor:'#181512', paddingHorizontal:12, paddingVertical:10, borderRadius:8, minHeight:44 },
  labelInside: { color:'#ffe082', fontWeight:'600', fontSize:14 },
  chevron: { color:'#ffe082', fontSize:12, marginLeft:6 },
  dropdown: { backgroundColor:'#181512', borderRadius:10, borderWidth:1, borderColor:'#FFD700', overflow:'hidden' },
  item: { paddingHorizontal:14, height:48, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.15)' },
  itemActive: { backgroundColor:'#FFD700' },
  itemText: { color:'#ffe082', fontWeight:'600' },
  itemTextActive: { color:'#181512' },
});
