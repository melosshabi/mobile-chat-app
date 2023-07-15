import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import colors from '../colors'
import { Formik } from 'formik'
import * as yup from 'yup'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import {auth} from '../firebase/firebasbe-config'

type HomeProps = {
  Home: {fromSignUp:boolean} | undefined
}

export default function SignUp() {

  const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()

  const signUpSchema = yup.object().shape({
    email:yup.string().email("Please enter an email"),
    username:yup.string().min(4, "Username must be at least 4 characters long"),
    password:yup.string().min(6, "Password must be at least 6 characters long")
  })

  const [signUpProgress, setSignUpProgress] = useState<boolean>(false)
  // This variable are used for errors returned from firebase
  const [emailError, setEmailError] = useState<string>('')

  async function signUp(username:string, email:string, password:string){
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
      await updateProfile(newUser, {displayName:username})
      navigation.navigate('Home', {fromSignUp:true})
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
       <View style={styles.form}>
        {/* Username */}
        <View style={styles.inputWrapper}>
          <TextInput
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            placeholder='Username'
            style={styles.inputs}
            autoCapitalize='none'
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
          />
         
         {errors.email && (<Text style={styles.error}>{errors.email}</Text>)}
         {emailError && (<Text style={styles.error}>{emailError}</Text>)}
         </View>

         {/* Password */}
         <View style={[styles.inputWrapper, {marginBottom:50}]}>
           <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder='Password'
            style={styles.inputs}
            secureTextEntry={true}
            autoCapitalize='none'
          />
          {errors.password && (<Text style={styles.error}>{errors.password}</Text>)}
         </View>
         
         <Pressable onPress={() => handleSubmit()} style={[styles.signUpBtn, signUpProgress && styles.disabledBtn]} disabled={signUpProgress}><Text style={styles.signUpBtnText}>{signUpProgress ? 'Signing up' : 'Sign up'}</Text></Pressable>
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
        marginVertical:15
    },
    form:{},
    inputWrapper:{
        height:'16%',
        margin:5,
        justifyContent:'center',
    },
    inputs:{
        color:'white',
        paddingVertical:5,
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
      opacity:.6
    }
})