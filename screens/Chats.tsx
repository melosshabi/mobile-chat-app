import { Image, Pressable, StyleSheet, Text, TextInput, View, Keyboard, Dimensions, Animated, Easing, SafeAreaView, FlatList, BackHandler, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import colors from '../colors'
// Firebase
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import { auth, db, storage } from '../firebase/firebasbe-config'
import { launchImageLibrary } from 'react-native-image-picker'
import Message from '../components/Message'
import RNFetchBlob from 'rn-fetch-blob'
import VideoPlayer from 'react-native-video-player'

type ChatsProps = DrawerScreenProps<componentProps, 'Chats'>

const dvw = Dimensions.get('window').width
const dvh = Dimensions.get('window').height

export default function Chats({route}: ChatsProps) {
    const navigation = useNavigation()

    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false)
    const [messages, setMessages] = useState<messageDocType[]>([])

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

    useEffect((): any => {

        navigation.setOptions({title:`Room ${route.params.roomNumber}`})
        Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })
        Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })

        async function fetchMessages(){
          const messagesRef = collection(db, 'messages')
          const messagesQuery = query(messagesRef, where('roomSentTo', '==', route.params.roomNumber.toString()), orderBy('timeSent'))
          
          onSnapshot(messagesQuery, snapshot => {
              let messages: messageDocType[] = [] 
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
                      dateSent:`${day} ${month} ${year}`, timeSent:`${hours}:${minutes}`, edited:doc.data().edited, docId:doc.id})
                  }
              })
              setMessages(messages.reverse())
          },)
          setShowSpinner(false)
      }

        fetchMessages()
        return () => fetchMessages()
    }, [])

    const [newMessage, setNewMessage] = useState<string>("")

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

      if(editingMessage){
        await updateMessage()
        return
      }
      console.log("Did not exit the function")
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
        setShowUploadProgress(false)
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
        edited:false,
        timeSent:serverTimestamp()
      })
      setImageToUpload(undefined)
      setVideoToUpload(undefined)
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
            path:`${pictureDir}/Mela's Chat App/${Math.floor(date.getTime() + date.getSeconds() / 2)}.jpg`,
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

    const [showMessageOptions, setShowMessageOptions] = useState<boolean>(false)
    // The variable which will hold the document id of the message the user wants to delete
    const [messageToDelete, setMessageToDelete] = useState<messageToDelete | undefined>(undefined)
    const [messageToEdit, setMessageToEdit] = useState<messageToEdit | undefined>(undefined)
    const [editingMessage, setEditingMessage] = useState<boolean>(false)

        // BackHandler function to prevent the default action which is to take the user back to the room selection screen
        BackHandler.addEventListener('hardwareBackPress', () => {
          if(mediaToViewInFullscreen){
            setMediaToViewInFullscreen(null)
            return true
          }
          if(showMessageOptions){
            setShowMessageOptions(false)
            return true
          }
          Alert.alert("Are you sure you want to leave the room?", "", [
            {
            text:"No",
          },
          {
            text:"Yes", onPress: () => navigation.navigate("RoomSelector", undefined)
          }
          ])
          return true
        })

        async function deleteMessage(){
          
          setShowMessageOptions(false)

          if(messageToDelete?.imageName){
            const imageRef = ref(storage, `MessagesImages/${messageToDelete.imageName}`)
            await deleteObject(imageRef)
          }
          if(messageToDelete?.videoName){
            const videoRef = ref(storage, `MessagesVideos/${messageToDelete.videoName}`)
            await deleteObject(videoRef)
          }

          const messageDocRef = doc(db, 'messages', messageToDelete?.messageId as string)
          await deleteDoc(messageDocRef)

          setMessageToDelete(undefined)
          setMessageToEdit(undefined)
        }

        function handleEditPress(){
          setNewMessage(`${messageToEdit?.messageContent}`)
          setEditingMessage(true)
          setShowMessageOptions(false)
        }

        function cancelEdit(){
          setNewMessage("")
          setEditingMessage(false)
        }

        function handleMessageToEditState(messageToEdit:messageToEdit){
          setMessageToEdit(messageToEdit)
        }

        function handleMessageToDeleteState(messageToDelete:messageToDelete){
          setMessageToDelete(messageToDelete)
        }

        async function updateMessage(){
          setEditingMessage(false)

          if(newMessage === messageToEdit?.messageContent){
            setNewMessage('')
            return
          }
          const editedMessage = newMessage
          setNewMessage('')
          const messageDocRef = doc(db, 'messages', messageToEdit?.messageDocId as string)
          await updateDoc(messageDocRef, {message:editedMessage, edited:true})
        }

  return (
    <SafeAreaView style={styles.chatsWrapper}>
      {/* Spinner */}
      {showSpinner &&
      <View style={styles.loadingWrapper}>
        <Animated.Image style={[styles.loadingImage, {transform:[{rotate:spin}]}]} source={require('../images/loading.png')}/>
      </View>}
      {/* Fullscreen Media */}
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

        {/* Edit and delete options */}
          {showMessageOptions && 
              <Pressable style={styles.messageOptionsWrapper} onPress={() => setShowMessageOptions(false)}>
                <View style={styles.messageOptions}>
                  <Pressable style={({pressed}) => [styles.messageOptionsBtns, pressed ? {backgroundColor:colors.lighterBlack} : {}, {borderBottomColor:'white', borderWidth:1}]} onPress={handleEditPress}><Text style={styles.messageOptionsText}>Edit</Text></Pressable>
                  <Pressable style={({pressed}) => [styles.messageOptionsBtns, pressed ? {backgroundColor:colors.lighterBlack} : {}]} onPress={deleteMessage}><Text style={styles.messageOptionsText}>Delete</Text></Pressable>
                </View>
              </Pressable>
          }

      <View style={[{height: !fileSelected ? '91%' : '79%'}, isKeyboardVisible ? {height: dvh / 1.2} : {}]}>
        <View>
          <FlatList 
            style={{width:"100%"}} 
            inverted={true}
            data={messages}
            keyExtractor={message => message.docId} renderItem={({item}) => (
              <Message messageDoc={item} selectedRoom={route.params.roomNumber.toString()} setMediaToViewInFullscreen={setMediaToViewInFullscreen} setShowMessageOptions={setShowMessageOptions} handleMessageToDeleteState={handleMessageToDeleteState} handleMessageToEditState={handleMessageToEditState}/>
        )}
        />
        </View>
      </View>
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
        {
          editingMessage && 
            <View style={[styles.editingMessageNotif, {bottom: !isKeyboardVisible ? '8.5%' : '10%'}]}>
              <Pressable onPress={cancelEdit}style={({pressed}) => [{padding:5, borderRadius:10},{backgroundColor: pressed ? 'rgba(255, 255, 255, .2)' : 'transparent'}]}>
                <Image source={require('../images/x-mark.png')} style={{width:25, height:25}}/>
              </Pressable>
              <Text style={{color:'white', textAlign:'center', fontSize:18}}>Editing Message</Text>
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
        backgroundColor:colors.black,
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
        backgroundColor:colors.black,
        justifyContent:'space-between',
        flexDirection:'row',
        paddingVertical:5,
        borderTopColor:'white',
        borderTopWidth:1
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
      messageOptionsWrapper:{
        height:dvh,
        width:dvw,
        backgroundColor:'rgba(0, 0, 0, .9)',
        position:'absolute',
        zIndex:19,
        top:0,
        left:0,
        justifyContent:'flex-end',
        alignItems:'center',
      },
      messageOptions:{
        width:dvw,
        height:dvh / 7,
        marginBottom:'19%',
        justifyContent:'space-around',
        borderColor:'white',
        borderWidth:1,
        borderBottomLeftRadius:20,
        borderBottomRightRadius:20,
        backgroundColor:colors.black,
      },
      messageOptionsBtns:{
        height:'50%',
        justifyContent:'center',
      },
      messageOptionsText:{
        fontSize:24,
        textAlign:'center',
        color:'white'
      },
      editingMessageNotif:{
        width:dvw / 2,
        height:35,
        position:'absolute',
        left: dvw / 4,
        backgroundColor:colors.lightGray,
        alignItems:'center',
        justifyContent:'space-around',
        borderRadius:8,
        flexDirection:'row',
      }
})