import React, { useRef } from 'react';
import { Modal, View, TouchableOpacity, Text, PanResponder, Animated } from 'react-native';

interface Props { url: string; onClose: ()=>void; }

export const ImagePreviewModal: React.FC<Props> = ({ url, onClose }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const gesture = useRef({ mode: 'none' as 'none'|'pan'|'pinch', startScale:1, startX:0, startY:0, startTX:0, startTY:0, startDist:0 }).current;
  const dist = (a:any,b:any)=>{ const dx=a.pageX-b.pageX, dy=a.pageY-b.pageY; return Math.sqrt(dx*dx+dy*dy); };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onStartShouldSetPanResponderCapture:()=>true,
    onMoveShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponderCapture:()=>true,
    onPanResponderGrant: (e)=> {
      const touches = (e.nativeEvent as any).touches;
      gesture.startScale = (scale as any)._value || 1;
      gesture.startTX = (translateX as any)._value || 0;
      gesture.startTY = (translateY as any)._value || 0;
      if(touches.length>=2){
        gesture.mode='pinch';
        gesture.startDist = dist(touches[0], touches[1]);
      } else {
        gesture.mode='pan';
        gesture.startX = touches[0].pageX;
        gesture.startY = touches[0].pageY;
      }
    },
    onPanResponderMove: (e)=> {
      const touches = (e.nativeEvent as any).touches;
      // If second finger appears during pan, switch to pinch
      if(touches.length>=2 && gesture.mode!=='pinch') {
        gesture.mode='pinch';
        gesture.startScale = (scale as any)._value || 1;
        gesture.startDist = dist(touches[0], touches[1]);
        return; // wait next frame for scale calc
      }
      if(gesture.mode==='pinch' && touches.length>=2){
        const d = dist(touches[0], touches[1]);
        const factor = d / (gesture.startDist || d);
        let newScale = gesture.startScale * factor;
        newScale = Math.max(1, Math.min(6, newScale));
        scale.setValue(newScale);
      } else if(gesture.mode==='pan' && touches.length===1){
        const dx = touches[0].pageX - gesture.startX;
        const dy = touches[0].pageY - gesture.startY;
        translateX.setValue(gesture.startTX + dx);
        translateY.setValue(gesture.startTY + dy);
      }
    },
    onPanResponderRelease: (e)=>{
      // If one finger remains after pinch end we could switch to pan, but simpler: reset mode
      gesture.mode='none';
    },
    onPanResponderTerminationRequest: ()=>true,
    onPanResponderTerminate: ()=>{ gesture.mode='none'; }
  })).current;

  const reset = () => { scale.setValue(1); translateX.setValue(0); translateY.setValue(0); };

  return (
    <Modal visible transparent onRequestClose={()=>{ reset(); onClose(); }}>
      <View style={{ flex:1, backgroundColor:'#000' }}>
        <TouchableOpacity onPress={()=>{ reset(); onClose(); }} style={{ position:'absolute', top:40, left:20, zIndex:20, backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:14, paddingVertical:8, borderRadius:30 }}>
          <Text style={{ color:'#fff', fontSize:16 }}>Tutup</Text>
        </TouchableOpacity>
        <View style={{ flex:1 }} {...panResponder.panHandlers}>
          <Animated.Image source={{ uri:url }} resizeMode='contain' style={{ flex:1, transform:[{ translateX }, { translateY }, { scale }] }} />
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;
