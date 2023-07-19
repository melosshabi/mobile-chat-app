import { Image, Pressable, StyleSheet, Text, TextInput, View, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { componentProps } from '../App'
import colors from '../colors'

type ChatsProps = DrawerScreenProps<componentProps, 'Chats'>

export default function Chats({route}: ChatsProps) {
    
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false)

    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })
        Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })
    }, [])

  return (
    <View style={styles.chatsWrapper}>
      <View style={styles.chats}>
        <View><Text>Hello!</Text></View>
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
    }
})