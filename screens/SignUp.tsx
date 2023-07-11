import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import colors from '../colors'
import { Formik } from 'formik'
import * as yup from 'yup'

export default function SignUp() {

    const signUpSchema = yup.object().shape({
      email:yup.string().email("Please enter an email"),
      username:yup.string().min(4, "Username must be at least 4 characters long"),
      password:yup.string().min(6, "Password must be at least 6 characters long")
    })

    const [signUpProgress, setSignUpProgress] = useState<boolean>(false)
    const [emailError, setEmailError] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    async function signUp(email:string, password:string){
    }
  return (
    <View style={styles.signUp}>
      <Text style={styles.headingText}>Welcome!</Text>
      <Formik
        initialValues={{email: '', password:'', }}
        validationSchema={signUpSchema}
        onSubmit={values => signUp(values.email, values.password)}
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
         <Pressable onPress={handleSubmit} style={[styles.signUpBtn, signUpProgress ? styles.disabledBtn : {}]} disabled={signUpProgress}><Text style={styles.signUpBtnText}>{signUpProgress ? 'Signing in' : 'Sign In'}</Text></Pressable>
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
    disabledBtn:{}
})