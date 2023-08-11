import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native'
import React, {useState } from 'react'
import Video from 'react-native-video'

type mediaToViewInFullscreen = {
    imageUrl: string | null,
    videoUrl: string | null
}

type Props = {
    uri:string;
    toggleFullscreenMedia:(newValue:mediaToViewInFullscreen) => void
}

const dvw = Dimensions.get('window').width

export default function CustomVideo({uri, toggleFullscreenMedia}:Props) {

    const [paused, setPaused] = useState(true)
    const [progress, setProgress] = useState<number>(0)
    const [videoFinished, setVideoFinished] = useState<boolean>(false)
    const icons = {
        playIcon:require('../images/play.png'),
        pauseIcon:require('../images/pause.png'),
        fullscreenIcon:require('../images/fullscreen.png')
    }

  return (
    <Pressable style={{width: dvw / 1.5, height: dvw / 1.5}} onLongPress={() => console.log("baLLS")}>
        <Video repeat={true} source={{uri}} resizeMode='contain' controls={false} paused={paused} style={{width:'100%', height:'100%', backgroundColor:'rgba(0, 0, 0, 0.1)'}} onProgress={progress => {
            setProgress((progress.currentTime / progress.playableDuration) * 100)
        }} 
        onEnd={() => {
            setPaused(true)
            setProgress(0)
            setVideoFinished(true)
        }}
        />

        <View style={styles.controls}>
            {/* Play and pause button */}
            <Pressable onPress={() => {
                    setPaused(prev => !prev)
                    if(videoFinished) setProgress(0)
                    setVideoFinished(false)
                }} style={({pressed}) => [styles.buttons, {backgroundColor:pressed ? 'rgba(255, 255, 255, .1)' : 'transparent'}]}><Image style={styles.controlsImages} source={paused ? icons.playIcon : icons.pauseIcon}/></Pressable>
            <View style={styles.progressbarWrapper}>
                <View style={[styles.progressbar, {width:`${progress}%`}]}></View>
            </View>
            {/* Fullscreen button */}
            <Pressable style={({pressed}) => [styles.buttons, {backgroundColor:pressed ? 'rgba(255, 255, 255, .1)' : 'transparent'}]}
                onPress={() => {
                    toggleFullscreenMedia({imageUrl:null, videoUrl:uri})
                    setPaused(true)
                }}
            ><Image source={icons.fullscreenIcon} style={styles.controlsImages}></Image></Pressable>
        </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    controls:{
        position:'absolute',
        bottom:0,
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    controlsImages:{
        width:30,
        height:30
    },
    buttons:{
        width:'20%',
        paddingVertical:5,
        backgroundColor:"red",
        alignItems:'center'
    },
    progressbarWrapper:{
        width:'60%',
        height:5,
        backgroundColor:'rgba(255, 255, 255, .1)',
        borderRadius:12
    },
    progressbar:{
        backgroundColor:'red',
        height:'100%',
        borderRadius:12
    }
})