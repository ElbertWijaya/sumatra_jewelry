import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, Dimensions, Image as RNImage, ActivityIndicator } from 'react-native';

interface Props { url: string; onClose: ()=>void; }

export const ImagePreviewModal: React.FC<Props> = ({ url, onClose }) => {
  const screen = Dimensions.get('window');
  const [dim, setDim] = useState<{w:number;h:number}|null>(null);

  // No zoom or pan. Just static preview.

  useEffect(()=>{
    RNImage.getSize(url,
      (w,h)=> setDim({ w, h }),
      ()=> setDim({ w: screen.width, h: screen.width })
    );
  }, [url]);

  const reset = () => {};

  return (
    <Modal visible transparent onRequestClose={()=>{ reset(); onClose(); }}>
      <View style={{ flex:1, backgroundColor:'#000' }}>
        <TouchableOpacity onPress={()=>{ reset(); onClose(); }} style={{ position:'absolute', top:40, left:20, zIndex:20, backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:14, paddingVertical:8, borderRadius:30 }}>
          <Text style={{ color:'#fff', fontSize:16 }}>Tutup</Text>
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          {dim ? (()=>{
            const scaledH = dim.h * (screen.width / dim.w);
            const marginTop = scaledH < screen.height ? (screen.height - scaledH)/2 : 0;
            return (
              <View style={{ flex:1, alignItems:'center', paddingTop: marginTop }}>
                <RNImage source={{ uri:url }} style={{ width: screen.width, height: scaledH, resizeMode:'cover' }} />
              </View>
            );
          })() : (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ color:'#ccc', marginTop:8 }}>Memuat gambar...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;
