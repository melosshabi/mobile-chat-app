import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Video from 'react-native-video'

type Props = {
    uri:string
}

const dvw = Dimensions.get('window').width

export default function CustomVideo({uri}:Props) {

    const [paused, setPaused] = useState(true)
    const icons = {
        playIcon:require('../images/play.png'),
        pauseIcon:require('../images/pause.png')
    }

  return (
    <View style={{width: dvw / 1.5, height: dvw / 1.5}}>
        <Video source={{uri}} onTouchStart={() => setPaused(prev => !prev)} resizeMode='contain' controls={false} paused={paused} style={{width:'100%', height:'100%', backgroundColor:'rgba(0, 0, 0, 0.1)'}} />
        <View style={styles.controls}><Pressable onPress={() => setPaused(prev => !prev)} style={({pressed}) => [{backgroundColor:pressed ? 'rgba(255, 255, 255, .2)' : 'transparent'}]}><Image style={styles.controlsImages} source={paused ? icons.playIcon : icons.pauseIcon}/></Pressable></View>
    </View>
  )
}

const styles = StyleSheet.create({
    controls:{
        // backgroundColor:'red',
        position:'absolute',
        bottom:0,
        width:'100%'
    },
    controlsImages:{
        width:40,
        height:40
    }
})