import { Image, Pressable, StyleSheet, Text, TextInput, View, Keyboard, Dimensions, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { componentProps } from '../App'
import colors from '../colors'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { auth, db } from '../firebase/firebasbe-config'
import { FlatList } from 'react-native-gesture-handler'

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
    
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false)
    const [messages, setMessages] = useState<message[] | null>()
    let flatListRef:any; 

    useEffect((): any => {

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

    async function sendMessage(){
      if(!newMessage) return

      setNewMessage('')

      const messagesCol = collection(db, 'messages')
      await addDoc(messagesCol, {
        message:newMessage,
        senderID:auth.currentUser?.uid,
        senderName:auth.currentUser?.displayName,
        senderProfilePicture:auth.currentUser?.photoURL,
        roomSentTo:route.params.roomNumber.toString(),
        imageName:null,
        imageUrl:null,
        videoName:null,
        videoUrl:null,
        timeSent:serverTimestamp()
      })
    }

    useEffect(() => {
      flatListRef.scrollToEnd()
    }, [messages])

  return (
    <View style={styles.chatsWrapper}>
      <View style={[styles.chats, isKeyboardVisible ? {height: dvh / 1.2} : {}]}>
        <View>

        <FlatList style={{width:"100%"}} data={messages} ref={ref => flatListRef = ref} onContentSizeChange={() => flatListRef.scrollToEnd()} keyExtractor={message => message.docId} renderItem={({item}) => (
          <View style={[styles.message, item.senderID === auth.currentUser?.uid ? styles.loggedUserMessage : {}]}>
            <View style={styles.profilePictureWrapper}><Image style={styles.messageProfilePicture} source={{uri:item.senderProfilePicture}}/></View>
                  {/* Message Text */}  
                  <View style={styles.messageTextWrapper}>
                    {item.senderID !== auth.currentUser?.uid && <Text selectable={true} style={styles.senderName}>{item.senderName}</Text>}
                    <Text selectable={true} style={[styles.messageText, item.senderID === auth.currentUser?.uid ? styles.loggedUserMessageText : {}]}>{item.message}</Text>
                  </View>
                  {/* Date */}
                  <Text style={styles.dateSent}>{item.dateSent}, {item.timeSent}</Text>
          </View>
        )
        }/>

        </View>
      </View>
      <View style={[styles.messageForm, isKeyboardVisible ? {marginBottom:10} : {}]}>
            <Pressable style={({pressed}) => [{backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}, styles.addFileBtn]}><Image source={require('../images/plus.png')} style={styles.plusIcon}/></Pressable>
            <TextInput onSubmitEditing={() => sendMessage()} style={styles.messageInput} placeholder='Message' placeholderTextColor='rgba(255, 255, 255, .5)' value={newMessage} onChangeText={value => setNewMessage(value)}/>
            <Pressable onPress={() => sendMessage()} style={({pressed}) => [styles.sendButton, {backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}]}><Image source={require('../images/send-button.png')} style={styles.sendButtonIcon} /></Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    chatsWrapper:{
        height:'100%',
        backgroundColor:colors.darkGray,
        justifyContent:'space-between'
    },
    chats:{
        height:'92%',
    },
    messageForm:{
        height:'8%',
        width:'100%',
        backgroundColor:colors.lightGray,
        justifyContent:'space-between',
        flexDirection:'row',
        paddingVertical:5,
    },
    addFileBtn:{
        width:60,
        justifyContent:'center',
        alignItems:'center',
        paddingVertical:5,
        borderRadius:50
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
      paddingHorizontal:10
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
    dateSent:{
      position:'absolute',
      color:'white',
      bottom:0,
      left:10,
      fontSize:13
    }
})