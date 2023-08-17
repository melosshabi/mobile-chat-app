import { memo, useState } from "react"
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native"
import CustomVideo from "./CustomVideo"
import colors from "../colors"
import { auth } from "../firebase/firebasbe-config"
import { useNavigation } from "@react-navigation/native"
import RNFetchBlob from "rn-fetch-blob"
import VideoPlayer from "react-native-video-player"

const dvw = Dimensions.get('window').width
const dvh = Dimensions.get('window').height

const Message = memo(function Message({messageDoc, selectedRoom}:messageComponentProps){
    const navigation = useNavigation()

    function handleProfileNavigation(senderId:string, pictureUrl:string, displayName:string){
        if(auth.currentUser && senderId === auth.currentUser.uid) navigation.navigate('UserProfile' as never)
        else navigation.navigate('OthersProfile', {pictureUrl, displayName, selectedRoom})
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
      
      const [showMessageOptions, setShowMessageOptions] = useState<boolean>(false)

    return (
        <View style={{backgroundColor:'orange'}}>
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

          {showMessageOptions && 
            <View style={styles.messageOptionsWrapper}>
              <View style={styles.messageOptions}>
                <Pressable style={styles.messageOptionsBtns}><Text>Edit</Text></Pressable>
                <Pressable style={styles.messageOptionsBtns}><Text>Delete</Text></Pressable>
              </View>
            </View>
          }
          <Pressable onLongPress={() => setShowMessageOptions(true)} style={{backgroundColor:'red', marginVertical:5}}>
            <View style={[styles.message, messageDoc.senderID === auth.currentUser?.uid ? styles.loggedUserMessage : {}]}>
              {/* The pressable which navigates to the profile of the user whose pfp got tapped on */}
                <Pressable onPress={() => handleProfileNavigation(messageDoc.senderID, messageDoc.senderProfilePicture, messageDoc.senderName)} style={styles.profilePictureWrapper}><Image style={styles.messageProfilePicture} source={messageDoc.senderProfilePicture ? {uri:messageDoc.senderProfilePicture} : require('../images/user.png')}/></Pressable>
                    {/* Message Text */}  
                    <View style={styles.messageTextWrapper}>
                      {messageDoc.senderID !== auth.currentUser?.uid && <Text selectable={true} style={styles.senderName}>{messageDoc.senderName}</Text>}
                      <Text selectable={true} style={[styles.messageText, messageDoc.senderID === auth.currentUser?.uid ? styles.loggedUserMessageText : {}]}>{messageDoc.message}</Text>
                      {/* Message image */}
                      {messageDoc.imageUrl && <Pressable onPress={() => toggleFullscreenMedia({imageUrl:messageDoc.imageUrl, videoUrl:null})}><Image source={{uri:messageDoc.imageUrl}} style={styles.messagesImages}/></Pressable>}
                      {/* Message Video */}
                      {messageDoc.videoUrl && 
                        <CustomVideo uri={messageDoc.videoUrl} toggleFullscreenMedia={toggleFullscreenMedia}/>
                      }
                    </View>
                    {/* Date */}
                    <Text style={styles.dateSent}>{messageDoc.dateSent}, {messageDoc.timeSent}</Text>
            </View>
          </Pressable>
          </View>
    )
})
export default Message

const styles = StyleSheet.create({
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
      messageOptionsWrapper:{
        height:dvh,
        width:'100%',
        backgroundColor:'rgba(0, 0, 0, .9)',
        position:'absolute',
        zIndex:5,
        top:0,
        left:0,
      },
      messageOptions:{
        position:'absolute',
        backgroundColor:'blue'
      },
      messageOptionsBtns:{

      }
})