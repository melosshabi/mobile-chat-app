import { StyleSheet, Text, View, Image, Dimensions, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
// Colors
import colors from '../colors'
// Firebase
import {auth} from '../firebase/firebasbe-config'
import { useNavigation } from '@react-navigation/native'

export default function UserProfile() {

  const navigation = useNavigation()

  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    auth.onAuthStateChanged( ()=>{
      if(!auth.currentUser) navigation.navigate('SignIn' as never)
      else{
        setName(auth.currentUser.displayName)
        setEmail(auth.currentUser.email)
        setProfilePicture(auth.currentUser.photoURL)
      }
    })
  },[])
  return (
    <View style={styles.userProfile}>
      <View style={styles.profilePictureWrapper}>
        <View style={{flexDirection:'column'}}>
          <Image style={styles.profilePicture} source={{uri:profilePicture}}/>
          <Image style={styles.profilePicture} source={{uri:profilePicture}}/>
        </View>
        <View style={styles.updateProfilePictureWrapper}>
          <Pressable style={styles.selectNewImageBtn}><Text style={{color:'white', fontSize:16}}>Select new picture</Text></Pressable>
          <Pressable style={styles.selectNewImageBtn}><Text style={{color:'white', fontSize:16}}>Upload new picture</Text></Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  userProfile:{
    width:'100%',
    height:'100%',
    backgroundColor:colors.darkGray,
    alignItems:'center'
  },
  profilePictureWrapper:{
    width: '90%',
    height: '30%',
    backgroundColor:colors.lightGray,
    marginTop:20,
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
    borderRadius:8,
    elevation:3,
    shadowColor:'white',
  },
  profilePicture:{
    width:100,
    height:100,
    borderRadius:50,
    marginVertical:5
  },
  updateProfilePictureWrapper:{
    height:'80%',
    width:'50%',
    backgroundColor:colors.darkGray,
    marginTop:'5%',
    alignItems:'center',
    justifyContent:'space-around',
  },
  selectNewImageBtn:{
    width:'90%',
    backgroundColor:colors.lightGray,
    borderRadius:8,
    alignItems:'center',
    paddingVertical:13,
    elevation:3,
    shadowColor:'white'
  }
})