import { StyleSheet, Text, View, Image, Pressable, Alert, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
// Colors
import colors from '../colors'
// Firebase
import {auth, storage} from '../firebase/firebasbe-config'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler'
// Image Picker
import { launchImageLibrary } from 'react-native-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { sendPasswordResetEmail, signOut, updateEmail, updateProfile } from 'firebase/auth'
import Snackbar from 'react-native-snackbar'
import { DrawerScreenProps } from '@react-navigation/drawer'
import RNFetchBlob from 'rn-fetch-blob'

type UserProfileProps = DrawerScreenProps<componentProps, 'UserProfile'>

export default function UserProfile({route}: UserProfileProps) {

  const navigation = useNavigation()

  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [profilePicture, setProfilePicture] = useState<string | undefined>("")
  const [newPictureSelected, setNewPictureSelected] = useState<boolean>(false)
  const [enableNameInput, setEnableNameInput] = useState<boolean>(false)
  const [enableEmailInput, setEnableEmailInput] = useState<boolean>(false)

  useEffect(() => {
    auth.onAuthStateChanged( ()=>{
      if(!auth.currentUser) navigation.navigate('SignIn' as never)
      else if(auth.currentUser.displayName && auth.currentUser.email && auth.currentUser.photoURL){
        setName(auth.currentUser.displayName)
        setEmail(auth.currentUser.email)
        setProfilePicture(auth.currentUser.photoURL)
      }
    })
  },[])

  function selectImage(){
    launchImageLibrary({mediaType:"photo"}, res => {
      if(res.assets) {
        setProfilePicture(res.assets[0].uri)
        setNewPictureSelected(true)
      }
    })
  }

  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false)
  const [updateState, setUpdateState] = useState<string>("Upload new picture")

  async function updateProfilePicture(){
    
    setUploadInProgress(true)
    setUpdateState("Uploading picture...")

    if(auth.currentUser){
      const metadata = {
        customMetadata:{
          'uploaderName':name,
          'uploaderId':auth.currentUser.uid
        }
      }

      const newPicture = await fetch(profilePicture!)
      const blob = await newPicture.blob()
      const storageRef = ref(storage, `Profile Pictures/ProfilePictureOf${auth.currentUser?.uid}`)
      await uploadBytes(storageRef, blob, metadata)
      .catch(err => {
        if(err.code === 'storage/quota-exceeded'){
          Snackbar.show({
            text:"The daily quota for the database has been exceeded",
            duration:Snackbar.LENGTH_LONG
          })
        }else if(err.code === 'storage/unauthorized'){
          Snackbar.show({
            text:"Permission Denied",
            duration:Snackbar.LENGTH_LONG
          })

          setUploadInProgress(false)
          setUpdateState("Upload new picture")
        }
      })
      setUpdateState("Fetching picture URL...")
      const newPictureUrl = await getDownloadURL(storageRef)
      setUpdateState("Updating Profile...")
      await updateProfile(auth.currentUser, {photoURL: newPictureUrl})
      .then(() => {
        setUploadInProgress(false)
        setNewPictureSelected(false)
        setUpdateState("Upload new picture")
        Snackbar.show({
          text:"Profile Picture Updated",
          duration:Snackbar.LENGTH_LONG,
        })
      })
   }
  }

  const [prevUsername, setPrevUsername] = useState<string>("")
  const [prevEmail, setPrevEmail] = useState<string>("")
  const [showSaveBtn, setShowSaveBtn] = useState<boolean>(false)
  const [updateInProgress, setUpdateInProgress] = useState<boolean>(false)

  function enableInputs(){
    setPrevUsername(name)
    setPrevEmail(email)
    setEnableNameInput(true)
    setEnableEmailInput(true)
    setShowSaveBtn(true)
  }

  async function updateAccount(){
    if(auth.currentUser){
      if(name === prevUsername && email === prevEmail){
        setEnableNameInput(false)
        setEnableEmailInput(false)
        setShowSaveBtn(false)
      }
      else if(name !== prevUsername && email === prevEmail){
        setEnableNameInput(false)
        setEnableEmailInput(false)
        setShowSaveBtn(false)
        setUpdateInProgress(true)
        await updateProfile(auth.currentUser, {displayName:name})
        Snackbar.show({
          text:"Profile Updated",
          duration:Snackbar.LENGTH_LONG,
        })
      }else if(name === prevUsername && email !== prevEmail){
        setEnableNameInput(false)
        setEnableEmailInput(false)
        setShowSaveBtn(false)
        setUpdateInProgress(true)
        await updateEmail(auth.currentUser, email)
        Snackbar.show({
          text:"Profile Updated",
          duration:Snackbar.LENGTH_LONG,
        })
      }else{
        setEnableNameInput(false)
        setEnableEmailInput(false)
        setShowSaveBtn(false)
        setUpdateInProgress(true)
        await Promise.all([updateProfile(auth.currentUser, {displayName: name}), updateEmail(auth.currentUser, email).catch(err => console.log(err))])
        Snackbar.show({
          text:"Profile Updated",
          duration:Snackbar.LENGTH_LONG,
        })
      }
    }
  }

  async function resetPassword(){
    await sendPasswordResetEmail(auth, email)
    .then(() => {
      Alert.alert("Password reset email was sent, signing out in 6 seconds")
      setTimeout(async () => {
        await signOut(auth)
        navigation.navigate('SignIn' as never)
      }, 6000)
    })
  }

  // This function downloads the current profile picture url to the user's device
  async function downloadCurrentImage(){
    const date = new Date()
    const pictureDir = RNFetchBlob.fs.dirs.PictureDir

    RNFetchBlob.config({
      addAndroidDownloads:{
        useDownloadManager : true,
        mime:'image',
        path:`${pictureDir}/${Math.floor(date.getTime() + date.getSeconds() / 2)}.jpg`,
        description:"Profile Picture",
        notification:true,
        mediaScannable:true
      }
    }).fetch('GET', auth.currentUser?.photoURL as string)
  }

  BackHandler.addEventListener('hardwareBackPress', () => {
    if(route.params?.fromChats){
      navigation.navigate("Chats", {roomNumber: route.params.selectedRoom})
    }
    return true
  })

  return (
    <View style={styles.userProfile}>
      {/* Profile Picture */}
      <View style={styles.profilePictureWrapper}>
        <Text style={[styles.text, styles.headingText]}>Profile Picture</Text>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:'80%', backgroundColor:'transparent'}}>
        <View style={{flexDirection:'column'}}>
          <Image style={styles.profilePicture} source={profilePicture ? {uri:profilePicture} : require('../images/user.png')}/>
        </View>
        <View style={styles.updateProfilePictureWrapper}>
          <Pressable style={styles.selectNewImageBtn}><Text style={{color:'white', fontSize:16}} onPress={selectImage}>Select new picture</Text></Pressable>
          {newPictureSelected && <Pressable style={[styles.selectNewImageBtn, uploadInProgress ? styles.inputsDisabled : {}]} onPress={updateProfilePicture} disabled={uploadInProgress}><Text style={{color:'white', fontSize:16}}>{updateState}</Text></Pressable>}
          {!newPictureSelected && <Pressable style={[styles.selectNewImageBtn]} onPress={downloadCurrentImage}><Text style={{color:'white'}}>Download Current Picture</Text></Pressable>}
        </View>
        </View>
      </View>

      {/* Other info */}
      <View style={styles.userInfo}>
        <Text style={[styles.text, {fontSize:25, textAlign:'center', marginVertical:15}]}>Account Information</Text>

        <View style={styles.inputsWrappers}>  
          <Text style={[styles.text, {marginBottom:10}]}>Username</Text>
          <TextInput style={[styles.inputs, !enableEmailInput ? styles.inputsDisabled : {}]} placeholder="Username" value={name} onChangeText={value => setName(value)} placeholderTextColor='white' editable={enableNameInput}/>
        </View>

        <View style={styles.inputsWrappers}>
          <Text style={[styles.text, {marginBottom:10}]}>Email</Text>
          <TextInput style={[styles.inputs, !enableEmailInput ? styles.inputsDisabled : {}]} placeholder='Email' value={email} onChangeText={value => setEmail(value)} placeholderTextColor='white' editable={enableEmailInput}/>
        </View>
        
        <View>
          { !showSaveBtn ? <Pressable style={({pressed}) => [styles.accountInfoBtns, {backgroundColor: pressed ? colors.lighterBlack : colors.black}]} onPress={enableInputs}><Text style={[styles.text, {fontSize:18, textAlign:'center'}]}>Edit Account Information</Text></Pressable> : 
            <Pressable style={({pressed}) => [styles.accountInfoBtns, {backgroundColor: pressed ? colors.lighterBlack : colors.black}, updateInProgress ? styles.inputsDisabled : {}]} onPress={updateAccount} disabled={updateInProgress}><Text style={[styles.text, {fontSize:18, textAlign:'center'}]}>{!updateInProgress ? 'Save Changes' : 'Saving Changes'}</Text></Pressable>}
          <Pressable style={({pressed}) => [styles.accountInfoBtns, {backgroundColor: pressed ? colors.lighterBlack : colors.black}]} onPress={resetPassword}><Text style={[styles.text, {fontSize:18, textAlign:'center'}]}>Reset Password</Text></Pressable>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text:{
    color:'white'
  },
  headingText:{
    fontSize:19
  },
  userProfile:{
    width:'100%',
    height:'100%',
    backgroundColor:colors.black,
    alignItems:'center',
    justifyContent:'space-around'
  },
  profilePictureWrapper:{
    width: '90%',
    height: '25%',
    backgroundColor:colors.lighterBlack,
    marginTop:20,
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
    width:'55%',
    marginTop:'5%',
    alignItems:'center',
    justifyContent:'space-around',
  },
  selectNewImageBtn:{
    width:'90%',
    backgroundColor:colors.lighterBlack,
    borderRadius:8,
    alignItems:'center',
    paddingVertical:13,
    elevation:5,
    shadowColor:'white'
  },
  userInfo:{
    width:'90%',
    backgroundColor:colors.lighterBlack,
    elevation:3,
    shadowColor:'white',
    borderRadius:8
  },
  inputsWrappers:{
    width:'90%',
    marginLeft:'5%',
    marginVertical:15,
  },
  inputs:{
    color:'white',
    borderColor:'white',
    borderWidth:1,
    borderRadius:5,
    paddingHorizontal:10
  },
  inputsDisabled:{
    opacity:.5
  },
  accountInfoBtns:{
    width:'65%',
    alignSelf:'center',
    paddingVertical:15,
    paddingHorizontal:10,
    marginVertical:15,
    borderRadius:8,
    backgroundColor:colors.black,
    elevation:3,
    shadowColor:'white'
  }
})