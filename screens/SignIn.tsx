import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import colors from '../colors';
import * as yup from 'yup'
import { Formik } from 'formik';

export default function SignIn() {
  const signInSchema = yup.object().shape({
    email:yup.string().email("Please enter an email"),
  })

  const [signInProgress, setSignInProgress] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  async function signIn(email:string, password:string){

  }
  return (
    <View style={styles.signIn}>
      <Text style={styles.headingText}>Welcome Back!</Text>
      <Formik
        initialValues={{email: '', password:'', }}
        validationSchema={signInSchema}
        onSubmit={values => signIn(values.email, values.password)}
      >
     {({ handleChange, handleBlur, handleSubmit, errors, values }) => (
       <View style={styles.form}>
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
         <View style={styles.inputWrapper}>
           <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder='Password'
            style={styles.inputs}
            secureTextEntry={true}
            autoCapitalize='none'
          />
         </View>
         {passwordError && (<Text style={styles.error}>{passwordError}</Text>)}
         <Pressable onPress={handleSubmit} style={[styles.signInBtn, signInProgress ? styles.disabledBtn : {}]} disabled={signInProgress}><Text style={styles.signInBtnText}>{signInProgress ? 'Signing in' : 'Sign In'}</Text></Pressable>
       </View>
     )}
   </Formik>
  </View>
    )
}

const styles = StyleSheet.create({
  headingText:{
    fontSize:40,
    textAlign:"center",
    marginTop:30,
    color:'white'
  },
  signIn:{
    backgroundColor:colors.lightGray,
    height:'100%',
  },
  form:{
    height:'90%',
    // justifyContent:'center'
  },
  inputWrapper:{
    height:'20%',
    margin:10,
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
  signInBtn:{
    width:"45%",
    paddingVertical:12 ,
    paddingHorizontal:15,
    backgroundColor:colors.darkGray,
    borderWidth:1,
    borderColor:'white',
    borderRadius:8,
    alignSelf:'center',
  },
  disabledBtn:{},
  signInBtnText:{
    fontSize:20,
    textAlign:'center',
    color:'white' 
  },
})