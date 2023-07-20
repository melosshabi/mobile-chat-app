import { Image, Pressable, StyleSheet, Text, TextInput, View, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { componentProps } from '../App'
import colors from '../colors'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
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

export default function Chats({route}: ChatsProps) {
    
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false)
    const [messages, setMessages] = useState<message[] | null>()

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
                    const date = doc.data().timeSent.toDate()
                    const day = date.getDate()
                    let month;
                    const year = date.getFullYear()
                    const hours = date.getHours()
                    const minutes = date.getMinutes()

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
                        dateSent:`${day} ${month} ${year}`, timeSent:`${hours}: ${minutes}`, docId:doc.id})
                })
                setMessages(messages)
            })
        }

        fetchMessages()
        return () => mounted = false
    }, [])

  return (
    <View style={styles.chatsWrapper}>
      <View style={styles.chats}>
        <View>

        <FlatList style={{width:"100%"}} data={messages} keyExtractor={message => message.docId} renderItem={({item}) => (
          <View style={[styles.message, item.senderID === auth.currentUser?.uid ? styles.loggedUserMessage : {}]}>
            <View style={styles.profilePictureWrapper}><Image style={styles.messageProfilePicture} source={{uri:item.senderProfilePicture}}/></View>
                  <View style={item.senderID === auth.currentUser?.uid ? {alignItems:'flex-end', marginRight:15} : {}}>
                    {item.senderID !== auth.currentUser?.uid && <Text style={styles.senderName}>{item.senderName}</Text>}
                    <Text style={{color:'white', maxWidth:'89%', minWidth:'20%'}}>{item.message}</Text>
                  </View>
          </View>
        )
        }/>

        </View>
      </View>
      <View style={[styles.messageForm, {marginBottom: isKeyboardVisible ? 10 : 0}]}>
            <Pressable style={({pressed}) => [{backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}, styles.addFileBtn]}><Image source={require('../images/plus.png')} style={styles.plusIcon}/></Pressable>
            <TextInput style={styles.messageInput} placeholder='Message' placeholderTextColor='rgba(255, 255, 255, .5)'/>
            <Pressable style={({pressed}) => [styles.sendButton, {backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}]}><Image source={require('../images/send-button.png')} style={styles.sendButtonIcon} /></Pressable>
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
        paddingVertical:5
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
      maxWidth:'95%',
      marginVertical:15,
      paddingVertical:15,
      backgroundColor:colors.lightGray,
      borderRadius:5,
      flexDirection:'row',
    },
    loggedUserMessage:{
      maxWidth:'95%',
      flexDirection:'row-reverse',
      justifyContent:'flex-start',
      marginRight:18
    },
    profilePictureWrapper:{
      height:'100%',
      width:'15%',
      marginRight:10,
    },
    messageProfilePicture:{
      width:50,
      height:50,
      borderRadius:50,
      marginHorizontal:10
    },
    senderName:{
      color:'white',
      fontSize:15,
      fontWeight:'bold',
      marginBottom:10
    }
})