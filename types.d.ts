type componentProps = {
    RoomSelector:{fromSignUp:boolean} | undefined
    Chats:{roomNumber: number}
    SignIn:undefined
    SignUp:undefined
    UserProfile:{fromChats:boolean, selectedRoom:number} | undefined
    OthersProfile:{pictureUrl:string, displayName:string, selectedRoom:string}
  }

type messageDocType = {
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
        edited:boolean;
        timeSent:string;
}

type media = {
    url : string | undefined,
    mediaType: string | undefined,
    mediaName:string | undefined
  }

type mediaToViewInFullscreen = {
    imageUrl: string | null,
    videoUrl: string | null
}

type messageComponentProps = {
    messageDoc:messageDocType,
    selectedRoom:string,
    setMediaToViewInFullscreen:React.Dispatch<React.SetStateAction<mediaToViewInFullscreen | null>>,
    setShowMessageOptions:React.Dispatch<React.SetStateAction<boolean>>,
    handleMessageToDeleteState:(messageToDelete: messageToDelete) => void
    handleMessageToEditState:(messageToEdit: messageToEdit) => void
}

type messageToDelete = {
  messageId:string,
  imageName:string | null,
  videoName:string | null
}

type messageToEdit = {
  messageDocId:string,
  messageContent:string
}