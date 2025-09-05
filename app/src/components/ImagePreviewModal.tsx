import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, Dimensions, Image as RNImage, Animated, ActivityIndicator } from 'react-native';
// Gesture Handler (ensure package installed). If unavailable, panning will be disabled gracefully.
let PanGestureHandler: any, GHState: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gh = require('react-native-gesture-handler');
  PanGestureHandler = gh.PanGestureHandler;
  GHState = gh.State;
} catch (e) {
  console.warn('[ImagePreview] react-native-gesture-handler not found, panning disabled');
}

interface Props { url: string; onClose: ()=>void; }

export const ImagePreviewModal: React.FC<Props> = ({ url, onClose }) => {
  const screen = Dimensions.get('window');
  const [dim, setDim] = useState<{w:number;h:number}|null>(null);
  const dimRef = useRef<{w:number;h:number}|null>(null);

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
    currentScale.current = to;
    Animated.timing(scale, { toValue: to, duration: 160, useNativeDriver: true }).start(() => {
      if (to === 1) {
        translateX.setValue(0);
        translateY.setValue(0);
        offsetXRef.current = 0;
        offsetYRef.current = 0;
      }
    });
  };

  const toggleZoom = () => {
    if (!dimRef.current) {
      console.log('[ImagePreview] double-tap ignored: dim not ready (no fallback used)');
      return;
    }
    const d = dimRef.current;
    const baseH = d.h * (screen.width / d.w);
    baseHeightRef.current = baseH;
    const next = currentScale.current === 1 ? targetZoom : 1;
    animateScale(next);
    if (next === 1) {
      loggedNoSpaceRef.current = false;
      escalatedRef.current = false;
      console.log('[ImagePreview] reset zoom -> 1');
      return;
    }
    const scaledW = screen.width * next;
    const scaledH = baseH * next;
    const extraW = Math.max(0, (scaledW - screen.width) / 2);
    const extraH = Math.max(0, (scaledH - baseH) / 2);
    console.log('[ImagePreview] zoom activated', { scale: next, baseH, scaledW, scaledH, extraW, extraH });
    if (extraW === 0 && extraH === 0 && !escalatedRef.current) {
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

  // Gesture Handler based panning
  const onPanEvent = PanGestureHandler ? Animated.event<any>(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  ) : undefined;

  const panStateRef = useRef<'IDLE'|'ACTIVE'>('IDLE');

  const handlePanStateChange = (e: any) => {
    const { state, translationX, translationY } = e.nativeEvent as any;
    if (state === GHState.BEGAN || state === GHState.ACTIVE) {
      if (currentScale.current === 1) return; // ignore when not zoomed
      if (panStateRef.current === 'IDLE') {
        startXRef.current = offsetXRef.current;
        startYRef.current = offsetYRef.current;
        panStateRef.current = 'ACTIVE';
        console.log('[ImagePreview] pan begin', { startX: startXRef.current, startY: startYRef.current, scale: currentScale.current });
      }
      if (!dimRef.current) return;
      const d = dimRef.current;
      const baseH = d.h * (screen.width / d.w);
      const scaledW = screen.width * currentScale.current;
      const scaledH = baseH * currentScale.current;
      const extraW = Math.max(0, (scaledW - screen.width) / 2);
      const extraH = Math.max(0, (scaledH - baseH) / 2);
      const rawX = startXRef.current + translationX;
      const rawY = startYRef.current + translationY;
      const clamp = (v:number, lim:number) => Math.min(lim, Math.max(-lim, v));
      const clampedX = clamp(rawX, extraW);
      const clampedY = clamp(rawY, extraH);
      translateX.setValue(clampedX);
      translateY.setValue(clampedY);
      offsetXRef.current = clampedX;
      offsetYRef.current = clampedY;
    } else if (state === GHState.END || state === GHState.CANCELLED || state === GHState.FAILED) {
      if (panStateRef.current === 'ACTIVE') {
        console.log('[ImagePreview] pan end', { finalX: offsetXRef.current, finalY: offsetYRef.current });
      }
      panStateRef.current = 'IDLE';
    }
  };

  // Tap detector (double-tap) on outer press (fallback): we keep existing toggle via pan release logic is gone, so we add an overlay for double tap timing.
  const onBackdropPress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 260) {
      toggleZoom();
    }
    lastTapRef.current = now;
  };

  useEffect(()=>{
    let cancelled = false;
    console.log('[ImagePreview] getSize start', url);
    RNImage.getSize(url,
      (w,h)=> { if(!cancelled){ console.log('[ImagePreview] getSize success', {w,h}); dimRef.current = { w, h }; setDim({ w, h }); } },
      (err)=> { if(!cancelled){ console.log('[ImagePreview] getSize fail (using width only)', err); const fallback = { w: screen.width, h: screen.width }; dimRef.current = fallback; setDim(fallback); } }
    );
    return ()=> { cancelled = true; };
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
        <View style={{ flex:1 }} onTouchEnd={onBackdropPress}>
          {dim && (
            (() => {
              const baseH = dim.h * (screen.width / dim.w);
              baseHeightRef.current = baseH;
              const shouldCenter = baseH < screen.height;
              const content = (
                <View style={{ width: screen.width, height: baseH, overflow:'hidden' }}>
                  <Animated.View style={{ width: screen.width, height: baseH, transform:[ { translateX }, { translateY } ] }}>
                    <AnimatedImage
                      source={{ uri:url }}
                      onLoad={(e)=>{
                        const { width: iw, height: ih } = e.nativeEvent.source;
                        if (!dimRef.current || (dimRef.current.w !== iw || dimRef.current.h !== ih)) {
                          console.log('[ImagePreview] onLoad update dims', { iw, ih });
                          dimRef.current = { w: iw, h: ih };
                          setDim({ w: iw, h: ih });
                        }
                      }}
                      style={{ width: screen.width, height: baseH, resizeMode:'cover', transform:[ { scale } ] }}
                    />
                  </Animated.View>
                </View>
              );
              return (
                <View style={{ flex:1, justifyContent: shouldCenter ? 'center' : 'flex-start', alignItems:'center' }}>
                  {PanGestureHandler ? (
                    <PanGestureHandler
                      enabled={currentScale.current > 1}
                      onGestureEvent={onPanEvent}
                      onHandlerStateChange={handlePanStateChange}
                    >
                      <View>{content}</View>
                    </PanGestureHandler>
                  ) : content}
                </View>
              );
            })()
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;
