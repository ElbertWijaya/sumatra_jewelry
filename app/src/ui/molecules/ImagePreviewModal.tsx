import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, Dimensions, Image as RNImage, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

interface Props { url: string; onClose: ()=>void; }

export const ImagePreviewModal: React.FC<Props> = ({ url, onClose }) => {
  const screen = Dimensions.get('window');
  const [dim, setDim] = useState<{w:number;h:number}|null>(null);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(()=>{
    RNImage.getSize(url,
      (w,h)=> setDim({ w, h }),
      ()=> setDim({ w: screen.width, h: screen.width })
    );
  }, [url]);

  const reset = () => {
    scale.value = withTiming(1, { duration: 150 });
    translateX.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(0, { duration: 150 });
  };

  const pinch = Gesture.Pinch()
    .onStart(()=>{
      startScale.value = scale.value;
    })
    .onUpdate((e: any)=>{
      const next = Math.max(1, Math.min(4, startScale.value * e.scale));
      scale.value = next;
      // when shrinking back to 1, also reset translations
      if (next === 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    })
    .onEnd(()=>{
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e: any)=>{
      if (!dim) return;
      if (scale.value <= 1) return;
      const baseW = screen.width;
      const baseH = dim.h * (screen.width / dim.w);
      const dispW = baseW * scale.value;
      const dispH = baseH * scale.value;
      const maxX = Math.max(0, (dispW - screen.width) / 2);
      const maxY = Math.max(0, (dispH - screen.height) / 2);
      const nx = startX.value + e.translationX;
      const ny = startY.value + e.translationY;
      translateX.value = Math.max(-maxX, Math.min(maxX, nx));
      translateY.value = Math.max(-maxY, Math.min(maxY, ny));
    })
    .onEnd(()=>{
      if (scale.value <= 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });
  const composed = Gesture.Simultaneous(pinch, pan);

  const imageStyle = useAnimatedStyle(()=>({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ]
  }));

  return (
    <Modal visible transparent onRequestClose={()=>{ reset(); onClose(); }}>
      <GestureHandlerRootView style={{ flex:1, backgroundColor:'#000' }}>
        <TouchableOpacity onPress={()=>{ reset(); onClose(); }} style={{ position:'absolute', top:40, left:20, zIndex:20, backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:14, paddingVertical:8, borderRadius:30 }}>
          <Text style={{ color:'#fff', fontSize:16 }}>Tutup</Text>
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          {dim ? (
            <GestureDetector gesture={composed}>
              <Animated.View style={{ width: screen.width, height: screen.height, alignItems:'center', justifyContent:'center', backgroundColor:'#000' }}>
                <Animated.Image source={{ uri:url }} style={[{ width: screen.width, height: dim.h * (screen.width / dim.w), resizeMode:'contain' }, imageStyle]} />
              </Animated.View>
            </GestureDetector>
          ) : (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ color:'#ccc', marginTop:8 }}>Memuat gambar...</Text>
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ImagePreviewModal;
