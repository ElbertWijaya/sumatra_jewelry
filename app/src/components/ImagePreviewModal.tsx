import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, Dimensions, Image as RNImage, Animated, PanResponder } from 'react-native';

interface Props { url: string; onClose: ()=>void; }

export const ImagePreviewModal: React.FC<Props> = ({ url, onClose }) => {
  const screen = Dimensions.get('window');
  const [dim, setDim] = useState<{w:number;h:number}|null>(null);

  // Animated values for simple double-tap zoom + pan
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentScale = useRef(1);
  const lastTapRef = useRef<number>(0);
  const baseHeightRef = useRef<number>(0);
  // Accumulated offsets
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const loggedNoSpaceRef = useRef(false);

  const targetZoom = 2; // modest zoom
  const escalateZoom = 3; // fallback zoom if 2x still no pan space
  const escalatedRef = useRef(false);
  const AnimatedImage = useRef(Animated.createAnimatedComponent(RNImage)).current;

  // Helper to animate to a certain scale & optionally reset translation
  const animateScale = (to:number) => {
    Animated.timing(scale, { toValue: to, duration: 180, useNativeDriver: true }).start(()=> {
      currentScale.current = to;
      if (to === 1) {
        translateX.setValue(0);
        translateY.setValue(0);
      }
    });
  };

  const toggleZoom = () => {
    if (!dim) {
      console.log('[ImagePreview] double-tap ignored: dimensions not ready');
      return;
    }
    const baseH = dim.h * (screen.width / dim.w);
    const next = currentScale.current === 1 ? targetZoom : 1;
    animateScale(next);
    if (next === 1) {
      offsetXRef.current = 0;
      offsetYRef.current = 0;
      translateX.setValue(0);
      translateY.setValue(0);
      loggedNoSpaceRef.current = false;
      escalatedRef.current = false;
      console.log('[ImagePreview] reset zoom -> 1');
      return;
    }
    // After requesting initial targetZoom, evaluate space
    const scaledW = screen.width * next;
    const scaledH = baseH * next;
    const extraW = Math.max(0, (scaledW - screen.width) / 2);
    const extraH = Math.max(0, (scaledH - baseH) / 2);
    console.log('[ImagePreview] zoom activated', { scale: next, baseH, scaledW, scaledH, extraW, extraH });
    if (extraW === 0 && extraH === 0 && !escalatedRef.current) {
      // escalate once to provide pan space
      escalatedRef.current = true;
      const esc = escalateZoom;
      console.log('[ImagePreview] escalating zoom for pan space', { from: next, to: esc });
      animateScale(esc);
      const escScaledW = screen.width * esc;
      const escScaledH = baseH * esc;
      const escExtraW = Math.max(0, (escScaledW - screen.width) / 2);
      const escExtraH = Math.max(0, (escScaledH - baseH) / 2);
      console.log('[ImagePreview] escalated zoom metrics', { escScaledW, escScaledH, escExtraW, escExtraH });
    }
  };

  // Pan only when zoomed in
  const panResponder = useRef(PanResponder.create({
  // Capture initial touch (needed for double-tap timing) but only treat moves as pan when zoomed
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: () => currentScale.current > 1,
    onPanResponderGrant: () => {
      startXRef.current = offsetXRef.current;
      startYRef.current = offsetYRef.current;
      // double-tap detection only needs timing; position handled on release
    },
  onPanResponderMove: (_, g) => {
      if (!dim || currentScale.current === 1) return; // ignore moves when not zoomed
      const baseH = baseHeightRef.current; // container height at scale 1
      const scaledW = screen.width * currentScale.current;
      const scaledH = baseH * currentScale.current;
      // extra area beyond container (container width = screen.width, height = baseH)
      const extraW = Math.max(0, (scaledW - screen.width) / 2);
      const extraH = Math.max(0, (scaledH - baseH) / 2);
      if (!loggedNoSpaceRef.current && extraW === 0 && extraH === 0) {
        console.log('[ImagePreview] onPanResponderMove: still no extra space to pan', { scaledW, scaledH, extraW, extraH, scale: currentScale.current });
        loggedNoSpaceRef.current = true;
      }
      const clamp = (v:number, lim:number) => Math.min(lim, Math.max(-lim, v));
      const nextX = startXRef.current + g.dx;
      const nextY = startYRef.current + g.dy;
      const clampedX = clamp(nextX, extraW);
      const clampedY = clamp(nextY, extraH);
      translateX.setValue(clampedX);
      translateY.setValue(clampedY);
      offsetXRef.current = clampedX;
      offsetYRef.current = clampedY;
    },
    onPanResponderRelease: (_, g) => {
      const now = Date.now();
      const isTap = Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5;
      if (isTap) {
        if (now - lastTapRef.current < 260) {
          toggleZoom();
        }
        lastTapRef.current = now;
      }
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => {}
  })).current;

  useEffect(()=>{
    RNImage.getSize(url,
      (w,h)=> setDim({ w, h }),
      ()=> setDim({ w: screen.width, h: screen.height })
    );
  }, [url]);

  const reset = () => {
    animateScale(1);
  offsetXRef.current = 0;
  offsetYRef.current = 0;
  };

  return (
    <Modal visible transparent onRequestClose={()=>{ reset(); onClose(); }}>
      <View style={{ flex:1, backgroundColor:'#000' }}>
        <TouchableOpacity onPress={()=>{ reset(); onClose(); }} style={{ position:'absolute', top:40, left:20, zIndex:20, backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:14, paddingVertical:8, borderRadius:30 }}>
          <Text style={{ color:'#fff', fontSize:16 }}>Tutup</Text>
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          {dim && (()=>{
            const baseH = dim.h * (screen.width / dim.w); // base (scale=1) height
            baseHeightRef.current = baseH;
            const shouldCenter = baseH < screen.height; // center vertically if shorter
            return (
              <View style={{ flex:1, justifyContent: shouldCenter ? 'center' : 'flex-start', alignItems:'center' }}>
                <View
                  {...panResponder.panHandlers}
                  style={{ width: screen.width, height: baseH, overflow:'hidden' }}
                >
                  {/* Pan layer (translate only) */}
                  <Animated.View style={{
                    width: screen.width,
                    height: baseH,
                    transform: [ { translateX }, { translateY } ]
                  }}>
                    {/* Scale only on image so translation not scaled */}
                    <AnimatedImage
                      source={{ uri:url }}
                      style={{
                        width: screen.width,
                        height: baseH,
                        resizeMode:'cover',
                        transform: [ { scale } ]
                      }}
                    />
                  </Animated.View>
                </View>
              </View>
            );
          })()}
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;
