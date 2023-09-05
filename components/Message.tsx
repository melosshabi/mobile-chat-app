import { memo, useState } from "react"
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native"
import CustomVideo from "./CustomVideo"
import colors from "../colors"
import { auth } from "../firebase/firebasbe-config"
import { useNavigation } from "@react-navigation/native"

const dvw = Dimensions.get('window').width
const dvh = Dimensions.get('window').height

const Message = memo(function Message({messageDoc, selectedRoom, setMediaToViewInFullscreen, setShowMessageOptions, handleMessageToDeleteState, handleMessageToEditState}:messageComponentProps){
    const navigation = useNavigation()

    function handleProfileNavigation(senderId:string, pictureUrl:string, displayName:string){
        if(auth.currentUser && senderId === auth.currentUser.uid) navigation.navigate('UserProfile' as never, {fromChats:true, selectedRoom:selectedRoom})
        else navigation.navigate('OthersProfile', {pictureUrl, displayName, selectedRoom})
      }

      function toggleFullscreenMedia(newValue:mediaToViewInFullscreen | null){
        if(newValue === null) {
          navigation.setOptions({headerShown:true})
          setMediaToViewInFullscreen(null)
          return
        }
        navigation.setOptions({headerShown:false})
        setMediaToViewInFullscreen(newValue)
      }
    return (
        <View>
          <Pressable onLongPress={() => {
            if(messageDoc.senderID === auth.currentUser?.uid){
              setShowMessageOptions(true)
              handleMessageToDeleteState({
                messageId:messageDoc.docId,
                imageName:!messageDoc.imageName ? null : messageDoc.imageName,
                videoName:!messageDoc.videoName ? null : messageDoc.videoName,
              })
              handleMessageToEditState({
                messageDocId:messageDoc.docId,
                messageContent:messageDoc.message
              })
            }
            }} style={{marginVertical:5}}>
            <View style={[styles.message, messageDoc.senderID === auth.currentUser?.uid ? styles.loggedUserMessage : {}]}>
              {/* The pressable which navigates to the profile of the user whose pfp got tapped on */}
                <Pressable onPress={() => handleProfileNavigation(messageDoc.senderID, messageDoc.senderProfilePicture, messageDoc.senderName)} style={[styles.profilePictureWrapper]}><Image style={[styles.messageProfilePicture]} source={messageDoc.senderProfilePicture ? {uri:messageDoc.senderProfilePicture} : require('../images/user.png')}/></Pressable>
                    {/* Message Text */}  
                    <View style={styles.messageTextWrapper}>
                      {messageDoc.senderID !== auth.currentUser?.uid && <Text selectable={true} style={styles.senderName}>{messageDoc.senderName}</Text>}
                      <Text selectable={true} style={[styles.messageText, messageDoc.senderID === auth.currentUser?.uid ? styles.loggedUserMessageText : {}]}>{messageDoc.message} {messageDoc.edited && <Text style={styles.edited}>edited</Text>}</Text>
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
        height:'15%',
        width:'15%',
        marginRight:15,
        marginBottom:20
      },
      messageProfilePicture:{
        width:50,
        height:50,
        borderRadius:50,
        marginHorizontal:10,
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
        marginTop:10,
        
      },
      messagesImages:{
        width:150,
        height:150,
        marginLeft:10,
        marginBottom:10,
      },
      dateSent:{
        position:'absolute',
        color:'white',
        bottom:0,
        left:10,
        fontSize:13
      },
      edited:{
        fontSize:10,
        color:'rgba(255, 255, 255, .6)',
      }
})