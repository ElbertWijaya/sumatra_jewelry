// Deprecated legacy ImagePreviewModal – replaced by @ui/molecules/ImagePreviewModal.
import React from 'react';
import { View, Text } from 'react-native';

const ImagePreviewModal: React.FC<any> = () => (
  <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.85)'}}>
    <Text style={{color:'#ccc',padding:24,textAlign:'center'}}>Legacy ImagePreviewModal removed.</Text>
  </View>
);

export default ImagePreviewModal;
