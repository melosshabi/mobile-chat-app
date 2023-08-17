import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import colors from '../colors'
import { Formik } from 'formik'
import * as yup from 'yup'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import {auth, storage} from '../firebase/firebasbe-config'
import { launchImageLibrary } from 'react-native-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

type RoomSelectorProps = {
  RoomSelector: {fromSignUp:boolean} | undefined
}

export default function SignUp() {

  const navigation = useNavigation<DrawerNavigationProp<RoomSelectorProps>>()

  const signUpSchema = yup.object().shape({
    email:yup.string().email("Please enter an email"),
    username:yup.string().min(4, "Username must be at least 4 characters long"),
    password:yup.string().min(6, "Password must be at least 6 characters long"),
  })

  const [signUpProgress, setSignUpProgress] = useState<boolean>(false)
  // This variable are used for errors returned from firebase
  const [emailError, setEmailError] = useState<string>('')
  const [profilePicture, setProfilePicture] = useState<string>("")

  function openImagePicker(){
    launchImageLibrary({mediaType:'photo'}, res => {
      if(res.assets){
          setProfilePicture(res.assets[0].uri as string)
      }
    })
  }

  async function signUp(username:string, email:string, password:string){

    if(!profilePicture) return

    setSignUpProgress(true)
    let newUser = null
    await createUserWithEmailAndPassword(auth, email, password)
    .then(res => newUser = res.user)
    .catch(err => {
      switch(err.code){
        case 'auth/email-already-in-use':
          setEmailError("Email is already taken")
          setSignUpProgress(false)
          break;
        case 'auth/invalid-email':
          setEmailError("Invalid email")
          setSignUpProgress(false)
          break;
      }
    })
    if(newUser != null){
      const localUrl = await fetch(profilePicture)
      const blob = await localUrl.blob()
      const storageRef = ref(storage, `Profile Pictures/ProfilePictureOf${auth.currentUser?.uid}`)
      const metadata = {
        customMetadata:{
          'uploaderName':auth.currentUser?.displayName!,
          'uploaderId':auth.currentUser?.uid!
        }
      }
      await uploadBytes(storageRef, blob, metadata)
      const profilePictureUrl = await getDownloadURL(storageRef)
      await updateProfile(newUser, {displayName:username, photoURL:profilePictureUrl})
      navigation.navigate('RoomSelector', {fromSignUp:true})
    }
  }

  return (
    <View style={styles.signUp}>
      <Text style={styles.headingText}>Welcome!</Text>
      <Formik
        initialValues={{username:'', email: '', password:'' }}
        validationSchema={signUpSchema}
        onSubmit={values => signUp(values.username, values.email, values.password)}
      >
     {({ handleChange, handleBlur, handleSubmit, errors, values }) => (
       <View>
        {/* Username */}
        <View style={styles.inputWrapper}>
          <TextInput
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            placeholder='Username'
            style={styles.inputs}
            autoCapitalize='none'
            placeholderTextColor='white'
        />
        {errors.username && (<Text style={styles.error}>{errors.username}</Text>)}
        </View>

         {/* Email */}
         <View style={styles.inputWrapper}>
          <TextInput
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            placeholder='Email'
            style={styles.inputs}
            autoCapitalize='none'
            placeholderTextColor='white'
          />
         
         {errors.email && (<Text style={styles.error}>{errors.email}</Text>)}
         {emailError && (<Text style={styles.error}>{emailError}</Text>)}
         </View>

         {/* Password */}
         <View style={[styles.inputWrapper]}>
           <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder='Password'
            style={styles.inputs}
            secureTextEntry={true}
            autoCapitalize='none'
            placeholderTextColor='white'
          />
          {errors.password && (<Text style={styles.error}>{errors.password}</Text>)}
         </View>

         {/* Profile Picture */}
         <View style={styles.profilePictureWrapper}>
            <Pressable onPress={openImagePicker} style={({pressed}) => [styles.pfpBtn, pressed && {backgroundColor:colors.darkGray2}]}><Text style={{color:'white'}}>{!profilePicture ? 'Choose profile picture' : 'Change profile picture'}</Text></Pressable>
            {profilePicture && <Image source={{uri:profilePicture}} style={{width:80, height:80}}/>}
         </View>
         <Pressable onPress={() => handleSubmit()} style={({pressed}) => [styles.signUpBtn, signUpProgress && styles.disabledBtn, pressed && {backgroundColor:colors.darkGray2}]} disabled={signUpProgress}><Text style={styles.signUpBtnText}>{signUpProgress ? 'Signing up' : 'Sign up'}</Text></Pressable>
       </View>
     )}
   </Formik>
  </View>
  )
}

const styles = StyleSheet.create({
    signUp:{
        height:'100%',
        backgroundColor:colors.lightGray
    },
    headingText:{
        fontSize:35,
        textAlign:'center',
        marginVertical:15,
        color:'white'
    },
    inputWrapper:{
        height:'16%',
        margin:5,
        justifyContent:'center',
    },
    inputs:{
        color:'white',
        paddingVertical:7,
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:"white",
        borderRadius:8,
        fontSize:20
    },
    error:{
        color:'red',
        marginVertical:5,
        marginHorizontal:8,
        fontSize:15
    },
    signUpBtn:{
        width:"45%",
        paddingVertical:12 ,
        paddingHorizontal:15,
        backgroundColor:colors.darkGray,
        borderWidth:1,
        borderColor:'white',
        borderRadius:8,
        alignSelf:'center',
    },
    signUpBtnText:{
        fontSize:20,
        textAlign:'center',
        color:'white' 
    },
    disabledBtn:{
      opacity:.45
    },
    profilePictureWrapper:{
      height:'25%',
      alignItems:'center',
      justifyContent:'center'
    },
    pfpBtn:{
      backgroundColor:colors.darkGray,
      alignSelf:'center',
      marginTop:20,
      marginBottom:5,
      justifyContent:'center',
      paddingHorizontal:15,
      paddingVertical:10,
      borderRadius:8,
      borderColor:'white',
      borderWidth:1
    }
})