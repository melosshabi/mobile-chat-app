import { Image, Pressable, StyleSheet, Text, TextInput, View, Keyboard, Dimensions, Animated, Easing, SafeAreaView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'
import { componentProps } from '../App'
import colors from '../colors'
// Firebase
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import { auth, db, storage } from '../firebase/firebasbe-config'
import VideoPlayer from 'react-native-video-player';
import RNFetchBlob from 'rn-fetch-blob'
import CustomVideo from '../components/CustomVideo'
import { launchImageLibrary } from 'react-native-image-picker'


type ChatsProps = DrawerScreenProps<componentProps, 'Chats'>

type message = {
    message: string;
    senderID: string;
    senderName: string;
    senderProfilePicture: string;
    roomSentTo: string;
    docId:string;
    imageName: string | null;
    imageUrl: string | null;
    videoName: string | null;
    videoUrl: string | null;
    dateSent:string;
    timeSent:string;
}

const dvw = Dimensions.get('window').width
const dvh = Dimensions.get('window').height

export default function Chats({route}: ChatsProps) {
    
    const navigation = useNavigation()

    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false)
    const [messages, setMessages] = useState<message[] | null>()
    const scrollViewRef = useRef(null)
    const [allowScroll, setAllowScroll] = useState<boolean>(true)

    useEffect((): any => {

        navigation.setOptions({title:`Room ${route.params.roomNumber}`})
        Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })
        Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })

        let mounted = true

        async function fetchMessages(){
            const messagesRef = collection(db, 'messages')
            const messagesQuery = query(messagesRef, where('roomSentTo', '==', route.params.roomNumber.toString()), orderBy('timeSent'))
            onSnapshot(messagesQuery, snapshot => {
                let messages: message[] = []

                snapshot.forEach(doc => {

                    if(doc.data().timeSent !== null){

                    const date = doc.data().timeSent.toDate()
                    const day = date.getDate()
                    let month;
                    const year = date.getFullYear()
                    let hours = date.getHours()
                    let minutes = date.getMinutes()

                    if(hours === 24) hours = "00"
                    if(minutes.toString().length === 1) minutes = `0${minutes}`

                    switch(date.getMonth()){
                        case 0:
                         month = "Jan";
                          break;
                        case 1:
                          month = "Feb";
                            break;
                        case 2:
                          month = "Mar";
                            break;
                        case 3:
                          month = "Apr";
                            break;
                        case 4:
                          month = "May";
                            break;
                        case 5:
                          month = "June";
                            break;
                        case 6:
                          month = "July";
                            break;
                        case 7:
                          month = "Aug";
                            break;
                        case 8:
                            month = "Sep";
                              break;
                        case 9:
                          month = "Oct";
                            break;
                        case 10:
                          month = "Nov";
                            break;
                        case 11:
                          month = "Dec";
                            break;
                        default:
                          month = "";
                      }

                      messages.push({message:doc.data().message, senderID:doc.data().senderID, senderName:doc.data().senderName, 
                        senderProfilePicture:doc.data().senderProfilePicture, roomSentTo:doc.data().roomSentTo, 
                        imageName:doc.data().imageName, imageUrl:doc.data().imageUrl, videoName:doc.data().videoName, videoUrl: doc.data().videoUrl,
                        dateSent:`${day} ${month} ${year}`, timeSent:`${hours}:${minutes}`, docId:doc.id})
                    }
                })
                setMessages(messages)
            })
        }

        fetchMessages()
        return () => mounted = false
    }, [])

    const [newMessage, setNewMessage] = useState<string>("")

    type media = {
      url : string | undefined,
      mediaType: string | undefined,
      mediaName:string | undefined
    }

    // This variable is used to decide whether to render the file preview or not
    const [fileSelected, setFileSelected] = useState<boolean>(false)
    // The variables which will hold the links to the local images or videos
    const [imageToUpload, setImageToUpload] = useState<media | undefined>(undefined)
    const [videoToUpload, setVideoToUpload] = useState<media | undefined>(undefined)
    // This variable is used to render the upload progress bar
    const [showUploadProgress, setShowUploadProgress] = useState<boolean>(false)
    const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0)

    function selectMedia(){
      launchImageLibrary({mediaType:'mixed'},res => {
        if(res.assets){
          if(res.assets[0].type === 'image/jpeg'){
            setImageToUpload({
              url:res.assets[0].uri,
              mediaType:res.assets[0].type,
              mediaName:res.assets[0].fileName
            })
            setFileSelected(true)
          }else if(res.assets[0].type === 'video/mp4'){
            setVideoToUpload({
              url:res.assets[0].uri,
              mediaType:res.assets[0].type,
              mediaName:res.assets[0].fileName
            })
            setFileSelected(true)
          }
        }
      })
    }

    async function sendMessage(){
      if(!newMessage && !imageToUpload && !videoToUpload) return

      let imageName: string | undefined | null = undefined
      let imageUrl: string | null = null

      let videoName: string | undefined | null = undefined
      let videoUrl: string | null = null

      if(imageToUpload && auth.currentUser){
        setFileSelected(false)
        const metadata = {
          customMetadata:{
            'uploaderName':auth.currentUser.displayName!,
            'uploaderId':auth.currentUser.uid
          }
        }

        imageName = imageToUpload.mediaName
        const localUrl = await fetch(imageToUpload.url!)
        const blob = await localUrl.blob()
        const storageRef = ref(storage, `MessagesImages/${imageName}`)
        await uploadBytes(storageRef, blob, metadata)
        imageUrl = await getDownloadURL(storageRef)
      }

      if(videoToUpload && auth.currentUser){
        setFileSelected(false)
        setShowUploadProgress(true)
        const metadata = {
          customMetadata:{
            'uploaderName':auth.currentUser.displayName!,
            'uploaderId':auth.currentUser.uid.toString()
          }
        }

        videoName = videoToUpload.mediaName
        const localUrl = await fetch(videoToUpload.url!)
        const blob = await localUrl.blob()
        const storageRef = ref(storage, `MessagesVideos/${videoName}`)
        const videoUploadTask = uploadBytesResumable(storageRef, blob, metadata)
        videoUploadTask.on('state_changed', async snapshot =>{
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setVideoUploadProgress(progress)
        })
        await videoUploadTask
        videoUrl = await getDownloadURL(storageRef)
      }
      
      setNewMessage('')

      imageName = imageName ?? null
      videoName = videoName ?? null

      const messagesCol = collection(db, 'messages')
      await addDoc(messagesCol, {
        message:newMessage,
        senderID:auth.currentUser?.uid,
        senderName:auth.currentUser?.displayName,
        senderProfilePicture:auth.currentUser?.photoURL,
        roomSentTo:route.params.roomNumber.toString(),
        imageUrl,
        videoName,
        videoUrl,
        timeSent:serverTimestamp()
      })
    }

    type mediaToViewInFullscreen = {
      imageUrl: string | null,
      videoUrl: string | null
    }
    const [mediaToViewInFullscreen, setMediaToViewInFullscreen] = useState<mediaToViewInFullscreen | null>(null)

    function toggleFullscreenMedia(newValue:mediaToViewInFullscreen | null){
      if(newValue === null) {
        navigation.setOptions({headerShown:true})
        setMediaToViewInFullscreen(null)
        return
      }
      navigation.setOptions({headerShown:false})
      setMediaToViewInFullscreen(newValue)
    }
    
    async function downloadMedia(){
      const date = new Date()
      if(mediaToViewInFullscreen?.imageUrl){
        const pictureDir = RNFetchBlob.fs.dirs.PictureDir
        RNFetchBlob.config({
          addAndroidDownloads:{
            useDownloadManager:true,
            mime:'image',
            path:`${pictureDir}/${Math.floor(date.getTime() + date.getSeconds() / 2)}.jpg`,
            description:"Image download",
            notification:true,
            mediaScannable:true
          }
        }).fetch('GET', mediaToViewInFullscreen.imageUrl)
      }else if(mediaToViewInFullscreen?.videoUrl){
        const videoDir = RNFetchBlob.fs.dirs.DownloadDir
        RNFetchBlob.config({
          addAndroidDownloads:{
            useDownloadManager:true,
            mime:'video',
            path:`${videoDir}/Mela's Chat App/${Math.floor(date.getTime() + date.getSeconds() / 2)}.mp4`,
            description:"Video download",
            notification:true,
            mediaScannable:true
          }
        }).fetch('GET', mediaToViewInFullscreen?.videoUrl)
      }
    }

    // Code to spin the loading icon
    const [showSpinner, setShowSpinner] = useState<boolean>(true)
    const spinVal = new Animated.Value(0)

    Animated.loop(Animated.timing(spinVal, {
      toValue:1,
      duration:2000,
      easing:Easing.linear,
      useNativeDriver:true
    })).start()

    const spin = spinVal.interpolate({
      inputRange:[0, 1],
      outputRange: ['0deg', '360deg']
    })

    // Function that checks if the scrollview has reached the bottom
    function reachedTheEnd({layoutMeasurement, contentOffset, contentSize}: any){
      const paddingToBottom = 20
      return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    }

    // Variable to animate the unread messages notif
    const moveUnreadNotif = new Animated.Value(20)

    const unreadNotifAnim = Animated.timing(moveUnreadNotif, {
      toValue:55,
      duration:500,
      easing:Easing.linear,
      useNativeDriver: false
    })
    
    useEffect(() => {
      if(!allowScroll) unreadNotifAnim.start()
    } ,[messages])

  return (
    <SafeAreaView style={styles.chatsWrapper}>
      {/* Spinner */}
      {showSpinner &&
      <View style={styles.loadingWrapper}>
        <Animated.Image style={[styles.loadingImage, {transform:[{rotate:spin}]}]} source={require('../images/loading.png')}/>
      </View>}
      {mediaToViewInFullscreen &&
      <Pressable style={styles.fullscreenMediaWrapper}>
        {/* crossDownload is the styling object for the cross and download icons */}
        {/* The button that closes the fullscreen */}
        <Pressable onPress={() => toggleFullscreenMedia(null)} style={({pressed}) => [styles.closeFullscreenMediaBtn, pressed ? {backgroundColor:'rgba(255, 255, 255, .1)'} : {}]}><Image style={styles.crossDownload} source={require('../images/cross.png')}/></Pressable>
        {/* Download button */}
        <Pressable onPress={downloadMedia} style={({pressed}) => [styles.downloadFullscreenmediaBtn, pressed ? {backgroundColor:'rgba(255, 255, 255, .1)'} : {}]}><Image style={styles.crossDownload} source={require("../images/download.png")}/></Pressable>
        <View style={styles.fullscreenMediaWrapper}>
          {mediaToViewInFullscreen?.imageUrl && <Image style={styles.fullscreenImage} source={{uri:mediaToViewInFullscreen.imageUrl}}/>}
          {mediaToViewInFullscreen?.videoUrl && 
            <View style={styles.fullscreenVideoWrapper}>
              <VideoPlayer style={styles.fullscreenVideo} video={{uri:mediaToViewInFullscreen.videoUrl}} disableControlsAutoHide pauseOnPress/>
            </View>
          }
        </View>
      </Pressable>
      }
      
      <View style={[{height: !fileSelected ? '91%' : '79%'}, isKeyboardVisible ? {height: dvh / 1.2} : {}]}>
        <View>
          <Pressable onPressIn={() => setAllowScroll(false)} onPressOut={() => setAllowScroll(true)}>
          <ScrollView ref={scrollViewRef} onContentSizeChange={() => {
            if(allowScroll) scrollViewRef.current?.scrollToEnd({animated:false})
            if(showSpinner) setTimeout(() => {setShowSpinner(false)}, 1000)
            }}
            onScroll={({nativeEvent}) => {
              if(reachedTheEnd(nativeEvent)){ 
                setAllowScroll(true)
                moveUnreadNotif.setValue(20)
              }
              else setAllowScroll(false)
            }}
            >
            {messages?.map((message, index)=>(
              <View style={[styles.message, message.senderID === auth.currentUser?.uid ? styles.loggedUserMessage : {}]} key={index}>
                {/* Profile Picture */}
                <View style={styles.profilePictureWrapper}><Image style={styles.messageProfilePicture} source={{uri:message.senderProfilePicture}}/></View>

                {/* Message text */}
                <View style={styles.messageTextWrapper}>
                    {message.senderID !== auth.currentUser?.uid && <Text selectable={true} style={styles.senderName}>{message.senderName}</Text>}
                    <Text selectable={true} style={[styles.messageText, message.senderID === auth.currentUser?.uid ? styles.loggedUserMessageText : {}]}>{message.message}</Text>
                    {/* Message image */}
                    {message.imageUrl && <Pressable onPress={() => toggleFullscreenMedia({imageUrl:message.imageUrl, videoUrl:null})}><Image source={{uri:message.imageUrl}} style={styles.messagesImages}/></Pressable>}
                    {/* Message Video */}
                    {message.videoUrl && 
                      <CustomVideo uri={message.videoUrl} toggleFullscreenMedia={toggleFullscreenMedia}/>
                    }
                </View>
                    {/* Date */}
                    <Text style={styles.dateSent}>{message.dateSent}, {message.timeSent}</Text>
                </View>
            ))}
          </ScrollView>
          </Pressable>
        </View>
      </View>
      <Animated.View style={[styles.unreadMessagesNotif, {bottom:moveUnreadNotif}]}><Text style={{color:'white', fontSize:15, fontWeight:'bold', textAlign:'center'}}>Unread messages below</Text></Animated.View>
      { fileSelected &&
        <View style={styles.mediaPreview}>
          {imageToUpload && <Image source={{uri:imageToUpload.url}} style={{width:80, height:80}}/>}
          {videoToUpload && <View>
              <Image source={require('../images/video.png')} style={{width:80, height:80}}/>
              <Text style={{color:'white', textAlign:'center'}}>video</Text>
            </View>
            }
        </View>}
        {
          showUploadProgress && 
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressBar2, {width:videoUploadProgress}]}></View>
            </View>
          </View>
        }
      <View style={[styles.messageForm, isKeyboardVisible ? {marginBottom:15} : {}]}>
            <Pressable onPress={selectMedia} style={({pressed}) => [{backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}, styles.addFileBtn]}><Image source={require('../images/plus.png')} style={styles.plusIcon}/></Pressable>
            <TextInput onSubmitEditing={() => sendMessage()} style={styles.messageInput} placeholder='Message' placeholderTextColor='rgba(255, 255, 255, .5)' value={newMessage} onChangeText={value => setNewMessage(value)}/>
            <Pressable onPress={() => sendMessage()} style={({pressed}) => [styles.sendButton, {backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}]}><Image source={require('../images/send-button.png')} style={styles.sendButtonIcon} /></Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    chatsWrapper:{
        height:'100%',
        backgroundColor:colors.darkGray,
        justifyContent:'space-between'
    },
    loadingWrapper:{
      width:dvw,
      height:dvh,
      position:'absolute',
      zIndex:1,
      backgroundColor:'rgba(0, 0, 0, .99)',
      justifyContent:'center',
      alignItems:'center'
    },
    loadingImage:{
      width:150,
      height:150
    },
    messageForm:{
        height:'8%',
        width:'100%',
        backgroundColor:colors.lightGray,
        justifyContent:'space-between',
        flexDirection:'row',
        paddingVertical:5,
    },
    unreadMessagesNotif:{
      backgroundColor:'red',
      width:dvw / 1.5,
      position:'absolute',
      marginLeft: dvw / 6,
      borderTopRightRadius:10,
      borderTopLeftRadius:10,
      zIndex:0,
    },
    addFileBtn:{
        width:60,
        justifyContent:'center',
        alignItems:'center',
        paddingVertical:5,
        borderRadius:50,
    },
    plusIcon:{
        width:40,
        height:40,
    },
    messageInput:{
        width:'60%',
        color:'white',
        borderColor:'white',
        borderWidth:1,
        borderRadius:5,
        paddingLeft:5
    },
    sendButton:{
        width:'15%',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:8
    },
    sendButtonIcon:{
        width:40,
        height:40,
        marginLeft:10
    },
    message:{
      marginVertical:15,
      paddingVertical:10,
      backgroundColor:colors.lightGray,
      borderRadius:5,
      flexDirection:'row',
      alignSelf:'flex-start',
      marginLeft:10,
      elevation:3,
      shadowColor:'white',
      shadowOffset:{
        width:100,
        height:50,
      },
      position:'relative'
    },
    loggedUserMessage:{
      maxWidth:'95%',
      minWidth:'35%',
      flexDirection:'row-reverse',
      justifyContent:'flex-start',
      alignSelf:'flex-end',
      marginLeft:10,
    },
    profilePictureWrapper:{
      height:'100%',
      width:'15%',
      marginRight:15,
      marginBottom:20
    },
    messageProfilePicture:{
      width:50,
      height:50,
      borderRadius:50,
      marginHorizontal:10
    },
    senderName:{
      width:'100%',
      color:'white',
      fontSize:15,
      fontWeight:'bold',
      textAlign:'left',
    },
    messageTextWrapper:{
      maxWidth:dvw / 1.25,
      marginBottom:10
    },
    messageText:{
      color:'white', 
      minWidth:'30%',
      maxWidth:'98%',
      paddingTop:5,
      textAlign:'left',
      marginBottom:8
    },
    loggedUserMessageText:{
      textAlign:'center',
      marginTop:10
    },
    messagesImages:{
      width:150,
      height:150,
      marginLeft:10
    },
    dateSent:{
      position:'absolute',
      color:'white',
      bottom:0,
      left:10,
      fontSize:13
    },
    fullscreenMediaWrapper:{
      height:dvh,
      width:dvw,
      position:'absolute',
      top:0,
      left:0,
      backgroundColor:'rgba(0, 0, 0, .8)',
      zIndex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    fullscreenImage:{
      width:300,
      height:300
    },
    fullscreenVideoWrapper:{
      width:'80%',
      height:'80%',
      justifyContent:'center',
      alignItems:'center',
    },
    fullscreenVideo:{
      minWidth: dvw / 1.3,
      minHeight: dvw / 1.3,
      borderColor:'white'
    },
    closeFullscreenMediaBtn:{
      width:70,
      height:70,
      position:'absolute',
      top:10,
      left:10,
      zIndex:2,
      borderRadius:50,
    },
    crossDownload:{
      width:70,
      height:70
    },
    downloadFullscreenmediaBtn:{
      width:70,
      height:70,
      position:'absolute',
      top:10,
      right:10,
      zIndex:2,
      borderRadius:50
    },
    mediaPreview:{
      position:'absolute',
      bottom:'8%',
      flexDirection:'row'
    },
    progressBarWrapper:{
      width:'80%',
      height:'3%',
      backgroundColor:colors.lightGray,
      position:'absolute',
      marginLeft:'10%',
      bottom:'8%',
      borderColor:'rgba(255, 255, 255, 0.1)',
      borderWidth:1,
      justifyContent:'center',
      alignItems:'center'
    },
    progressBar:{
      width:'90%',
      height:8,
      backgroundColor:'rgba(0, 0, 0, .1)',
      borderRadius:15
    },
    progressBar2:{
      height:'100%',
      backgroundColor:colors.darkGray,
      borderRadius:12
    }
})