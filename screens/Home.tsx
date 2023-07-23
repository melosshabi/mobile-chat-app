import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import {componentProps} from '../App'
import { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer'
import Snackbar from 'react-native-snackbar'
import colors from '../colors'
import { TextInput } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'

export type HomeProps = DrawerScreenProps<componentProps, 'Home'>

type ChatsProps = {
  Chats: {roomNumber: number};
}

export default function Home({route}: HomeProps) {

  const navigation = useNavigation<DrawerNavigationProp<ChatsProps>>()

  useEffect(() => {
    if(route.params?.fromSignUp){
      Snackbar.show({
        text:"Account Created Successfully",
        duration:Snackbar.LENGTH_SHORT
      })
    }
  }, [route.params])

  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined)

  function handleInputChange(value: string) {
    let newValue = ''
    const numbers = '0123456789'

    for(let i = 0; i < value.length; i++){
      if(numbers.indexOf(value[i]) > -1){
        newValue += value[i];
      }else{
        Alert.alert("Please enter numbers only")
      }
    }
    if(parseInt(newValue) > 100 || parseInt(newValue) < 1){
     Alert.alert("Please enter a number between 1 and 100")
     setSelectedRoom('')
    }else setSelectedRoom(newValue);
  }

  return (
    <View style={styles.home}>
      <View style={styles.roomSelectionForm}>
        <View style={styles.textWrapper}>
          <Text style={styles.selectRoomTitle}>Select a Room</Text>
          <Text style={{color:'white'}}>1-100</Text>
        </View>
        <TextInput style={styles.roomSelectionInput} keyboardType='numeric' maxLength={3} value={selectedRoom} onChangeText={value => handleInputChange(value)} onSubmitEditing={() => navigation.navigate("Chats", {roomNumber: parseInt(selectedRoom as string)})}/>
        <Pressable style={styles.joinRoomBtn} onPress={() => navigation.navigate("Chats", {roomNumber: parseInt(selectedRoom as string)})}><Text style={{color:'white', fontSize:18}}>Join Room</Text></Pressable>
      </View>
      
    </View>
  )
}

const styles = StyleSheet.create({
  home:{
    height:'100%',
    backgroundColor:colors.darkGray,
    justifyContent:'center',
    alignItems:'center'
  },
  roomSelectionForm:{
    width:'90%',
    height:'40%',
    backgroundColor:colors.lightGray,
    alignItems:'center',
    justifyContent:'space-around',
  },
  textWrapper:{
    alignItems:'center'
  },
  selectRoomTitle:{
    color:'white',
    fontSize:25
  },
  roomSelectionInput:{
    width:'80%',
    borderWidth:1,
    borderColor:'white',
    borderRadius:8,
    padding:10,
    color:'white'
  },
  joinRoomBtn:{
    backgroundColor:colors.darkGray,
    paddingVertical:10,
    paddingHorizontal:20,
    borderRadius:8
  }
})