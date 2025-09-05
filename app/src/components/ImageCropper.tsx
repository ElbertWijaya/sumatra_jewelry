import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

interface AssetInfo { uri: string; width: number; height: number; fileName?: string | null; mimeType?: string | null }
interface Props {
  asset: AssetInfo;
  onCancel: () => void;
  onSave: (croppedUri: string) => Promise<void> | void;
}

const ImageCropper: React.FC<Props> = ({ asset, onCancel, onSave }) => {
  const screenW = Dimensions.get('window').width;
  const screenH = Dimensions.get('window').height;
  const baseScale = screenW / asset.width;
  const baseDisplayH = asset.height * baseScale;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: (screenH - baseDisplayH) / 2 });
  const side = Math.min(screenW * 0.72, Math.min(baseDisplayH, screenW) * 0.72);
  const [rect, setRect] = useState({ x: (screenW - side)/2, y: (screenH - side)/2, w: side, h: side });

  const modeRef = useRef<'move' | 'tl' | 'tr' | 'bl' | 'br' | 'panImage' | 'pinch' | 'none'>('none');
  const startRef = useRef({ rect: { ...rect }, offset: { ...offset }, zoom: 1, dist: 0, touches: 0 });

  const near = (x:number,y:number,a:number,b:number,s:number) => Math.abs(x-a)<=s && Math.abs(y-b)<=s;
  const which = (x:number,y:number) => {
    if (near(x,y,rect.x,rect.y,28)) return 'tl';
    if (near(x,y,rect.x+rect.w,rect.y,28)) return 'tr';
    if (near(x,y,rect.x,rect.y+rect.h,28)) return 'bl';
    if (near(x,y,rect.x+rect.w,rect.y+rect.h,28)) return 'br';
    if (x>=rect.x && x<=rect.x+rect.w && y>=rect.y && y<=rect.y+rect.h) return 'move';
    return 'panImage';
  };
  const clampRect = (r: typeof rect) => {
    const min=40; let {x,y,w,h}=r; if(w<min)w=min; if(h<min)h=min; if(x<0)x=0; if(y<0)y=0; if(x+w>screenW)x=screenW-w; if(y+h>screenH)y=screenH-h; return {x,y,w,h};
  };
  const distance=(a:any,b:any)=>{const dx=a.pageX-b.pageX, dy=a.pageY-b.pageY; return Math.sqrt(dx*dx+dy*dy);};

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:()=>true,
    onPanResponderGrant:e=>{
      const t=e.nativeEvent.touches; startRef.current.rect={...rect}; startRef.current.offset={...offset}; startRef.current.zoom=zoom; startRef.current.touches=t.length;
      if(t.length===1){ const p=t[0]; modeRef.current=which(p.pageX,p.pageY); }
      else if(t.length>=2){ modeRef.current='pinch'; startRef.current.dist=distance(t[0],t[1]); }
    },
    onPanResponderMove:(e,g)=>{
      const t=e.nativeEvent.touches;
      if(modeRef.current==='pinch' && t.length>=2){
        const d=distance(t[0],t[1]); const factor=d/(startRef.current.dist||d); const newZoom=Math.min(5,Math.max(1,startRef.current.zoom*factor)); setZoom(newZoom); return; }
      if(t.length!==1) return; const dx=g.dx, dy=g.dy; switch(modeRef.current){
        case 'move': setRect(clampRect({ ...startRef.current.rect, x:startRef.current.rect.x+dx, y:startRef.current.rect.y+dy })); break;
        case 'tl': setRect(clampRect({ x:startRef.current.rect.x+dx, y:startRef.current.rect.y+dy, w:startRef.current.rect.w-dx, h:startRef.current.rect.h-dy })); break;
        case 'tr': setRect(clampRect({ x:startRef.current.rect.x, y:startRef.current.rect.y+dy, w:startRef.current.rect.w+dx, h:startRef.current.rect.h-dy })); break;
        case 'bl': setRect(clampRect({ x:startRef.current.rect.x+dx, y:startRef.current.rect.y, w:startRef.current.rect.w-dx, h:startRef.current.rect.h+dy })); break;
        case 'br': setRect(clampRect({ x:startRef.current.rect.x, y:startRef.current.rect.y, w:startRef.current.rect.w+dx, h:startRef.current.rect.h+dy })); break;
        case 'panImage': setOffset({ x:startRef.current.offset.x+dx, y:startRef.current.offset.y+dy }); break;
      }
    },
    onPanResponderRelease:()=>{ modeRef.current='none'; }
  })).current;

  const doCrop = async () => {
    const totalScale=baseScale*zoom;
    const originX=Math.max(0,Math.round((rect.x - offset.x)/totalScale));
    const originY=Math.max(0,Math.round((rect.y - offset.y)/totalScale));
    const cropW=Math.min(asset.width-originX, Math.round(rect.w/totalScale));
    const cropH=Math.min(asset.height-originY, Math.round(rect.h/totalScale));
    let uri=asset.uri;
    if(cropW>0 && cropH>0){ try{ const r=await ImageManipulator.manipulateAsync(uri,[{crop:{originX,originY,width:cropW,height:cropH}}],{compress:0.85,format:ImageManipulator.SaveFormat.JPEG}); uri=r.uri; }catch{} }
    await onSave(uri);
  };

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} style={styles.barBtn}><Text style={styles.barBtnText}>Batal</Text></TouchableOpacity>
        <Text style={styles.title}>Crop</Text>
        <TouchableOpacity onPress={doCrop} style={styles.barBtn}><Text style={styles.barBtnText}>Simpan</Text></TouchableOpacity>
      </View>
      <Image source={{ uri: asset.uri }} style={{ position:'absolute', left:offset.x, top:offset.y, width:asset.width*baseScale*zoom, height:asset.height*baseScale*zoom }} />
      <View style={StyleSheet.absoluteFill} pointerEvents='none'>
        <View style={[styles.mask,{ top:0, height:rect.y }]} />
        <View style={[styles.mask,{ top:rect.y, height:rect.h, left:0, width:rect.x }]} />
        <View style={[styles.mask,{ top:rect.y, height:rect.h, left:rect.x+rect.w, right:0 }]} />
        <View style={[styles.mask,{ top:rect.y+rect.h, bottom:0 }]} />
      </View>
      <View style={[styles.cropRect,{ left:rect.x, top:rect.y, width:rect.w, height:rect.h }]}> 
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
      </View>
      {(['tl','tr','bl','br'] as const).map(k=>{ const size=28; const pos:any={ tl:{ left:rect.x-size/2, top:rect.y-size/2 }, tr:{ left:rect.x+rect.w-size/2, top:rect.y-size/2 }, bl:{ left:rect.x-size/2, top:rect.y+rect.h-size/2 }, br:{ left:rect.x+rect.w-size/2, top:rect.y+rect.h-size/2 } }; return <View key={k} style={[styles.handle,pos[k],{width:size,height:size}]} pointerEvents='none' />; })}
      <View style={styles.bottomBar} pointerEvents='none'>
        <Text style={styles.meta}>Zoom {zoom.toFixed(2)}</Text>
        <Text style={styles.meta}>Geser gambar/kotak, pinch untuk zoom</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:{ position:'absolute', left:0, top:0, right:0, bottom:0, backgroundColor:'#000' },
  topBar:{ position:'absolute', top:0, left:0, right:0, height:60, backgroundColor:'rgba(0,0,0,0.55)', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14 },
  bottomBar:{ position:'absolute', left:0, right:0, bottom:0, padding:10, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center' },
  barBtn:{ paddingVertical:6, paddingHorizontal:12, backgroundColor:'rgba(255,255,255,0.18)', borderRadius:8 },
  barBtnText:{ color:'#fff', fontSize:13 },
  title:{ color:'#fff', fontWeight:'600', fontSize:16 },
  mask:{ position:'absolute', left:0, right:0, backgroundColor:'rgba(0,0,0,0.55)' },
  cropRect:{ position:'absolute', borderWidth:2, borderColor:'#fff', overflow:'hidden' },
  handle:{ position:'absolute', backgroundColor:'#fff', borderRadius:14, borderWidth:1, borderColor:'#222' },
  gridRow:{ flex:1, borderTopWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  meta:{ color:'#ccc', fontSize:11, marginTop:2 },
});

export default ImageCropper;
