/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import { LoadingScreen } from '@app/components/Suspense'
import { getHomeDataByUid } from '@app/libs/api/home'
import { getUserByUid } from '@app/libs/api/userAPI'
import { auth } from '@app/server/firebase'
import { User } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { clearNotiList } from '@app/stores/noti'
import { clearUser, idle, updateUserInfo, userStatus, userStore } from '@app/stores/user'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import LogoutIcon from '@mui/icons-material/Logout'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import ReplyIcon from '@mui/icons-material/Reply'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { signOut } from 'firebase/auth'
import { Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const status = useAppSelector(userStatus)
  const dispatch = useAppDispatch()
  const [showMessage, setShowMessage] = useState<'success' | 'error' | null>(null)
  const [currentMember, setCurrentMember] = useState<User>()
  const [loading, setLoading] = useState<boolean>(false)

  const { userUid } = useParams()

  //state for images
  const [imgQRPreview, setImgQRPreview] = useState(loginUser?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)

  const [imgAvatarPreview, setImgAvatarPreview] = useState(loginUser?.photoURL)
  const [imgAvatarObj, setImgAvatarObj] = useState<any>(null)

  const [listEvent, setListEvent] = useState<any>({})
  const isLoginUser = currentMember?.uid === loginUser.uid
  const userFormData = useMemo(() => (isLoginUser ? loginUser : currentMember), [loginUser, isLoginUser, currentMember])

  const getCurrentMemberInfo = async () => {
    try {
      setLoading(true)
      const memberInfo = await getUserByUid(userUid!)
      setCurrentMember(memberInfo)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log('Error when get member', e)
    }
  }

  useEffect(() => {
    getCurrentMemberInfo()
  }, [])

  //Handle QR Image
  useEffect(() => {
    return () => {
      if (imgQRPreview) {
        URL.revokeObjectURL(imgQRPreview)
      }
    }
  }, [imgQRPreview])

  const handlePreviewQRChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgObj(fileUploaded)
      setImgQRPreview(URL.createObjectURL(fileUploaded))
    }
  }

  useEffect(() => {
    setImgQRPreview(loginUser?.qrCodeURL)
  }, [loginUser])

  //Handle User Avatar Image
  useEffect(() => {
    return () => {
      if (imgAvatarPreview) {
        URL.revokeObjectURL(imgAvatarPreview)
      }
    }
  }, [imgAvatarPreview])

  const handlePreviewAvatarChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgAvatarObj(fileUploaded)
      setImgAvatarPreview(URL.createObjectURL(fileUploaded))
    }
  }

  useEffect(() => {
    setImgAvatarPreview(loginUser?.photoURL)
  }, [loginUser])

  //--------------------------------------

  useEffect(() => {
    getHomeDataByUid(loginUser?.uid || '').then((e) => {
      setListEvent(e)
    })
  }, [dispatch, loginUser?.uid])

  useEffect(() => {
    if (status === 'succeeded') {
      setShowMessage('success')
    } else if (status === 'failed') {
      setShowMessage('error')
    }
  }, [status])

  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        dispatch(clearUser())
        dispatch(clearNotiList())
      })
    } catch (error) {
      console.log('ERROR LOGGING OUT', error)
    }
  }

  const handleCloseMessage = () => {
    dispatch(idle())
    setShowMessage(null)
  }
  const handleSubmitMember = async (formValues: any) => {
    try {
      setLoading(true)
      await dispatch(updateUserInfo(loginUser.uid as string, formValues, imgObj, imgAvatarObj))
      await getCurrentMemberInfo()
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log('Error when update member', e)
    }
  }

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="min-h-screen bg-white">
          <div className="bg-gradient-to-b from-[#CAF5B1] to-[#8AD769] h-72 rounded-b-2xl flex flex-col items-center justify-center">
            <div className="flex justify-between self-stretch">
              <button className="px-4">
                <ReplyIcon
                  onClick={() => {
                    history.back()
                  }}
                  fontSize={'large'}
                />
              </button>
              {isLoginUser && (
                <button className="px-4" onClick={logout}>
                  <LogoutIcon fontSize={'large'} />
                </button>
              )}
            </div>
            {isLoginUser ? (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton color="primary" aria-label="upload picture" component="label" onChange={handlePreviewAvatarChange}>
                    <input hidden accept="image/*" type="file" />
                    <div className="bg-white w-[40px] h-[40px] rounded-full">
                      <AccountCircleSharpIcon sx={{ width: 40, height: 40 }} />
                    </div>
                  </IconButton>
                }
              >
                <Avatar alt="avatar" src={imgAvatarPreview ? imgAvatarPreview : ProfilePicture} sx={{ width: 120, height: 120 }} />
              </Badge>
            ) : (
              <Avatar alt="avatar" src={currentMember?.photoURL!} sx={{ width: 120, height: 120 }} />
            )}
            <span className="py-2 text-xl">{currentMember?.name || ''}</span>
            <span className="pt-2 text-md">
              <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
              <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
            </span>
          </div>
          <div className="px-6 py-4">
            <Formik
              initialValues={{ ...userFormData }}
              onSubmit={(values) => {
                handleSubmitMember(values)
              }}
              fontSize={'large'}
            />
          </button>
          {isLoginUser && (
            <button className="px-4" onClick={logout}>
              <LogoutIcon fontSize={'large'} />
            </button>
          )}
        </div>
        {isLoginUser ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton color="primary" aria-label="upload picture" component="label" onChange={handlePreviewAvatarChange}>
                <input hidden accept="image/*" type="file" />
                <div className="bg-white w-[40px] h-[40px] rounded-full">
                  <AccountCircleSharpIcon sx={{ width: 40, height: 40 }} />
                </div>
              </IconButton>
            }
          >
            <Avatar alt="avatar" src={imgAvatarPreview ? imgAvatarPreview : ProfilePicture} sx={{ width: 120, height: 120 }} />
          </Badge>
        ) : (
          <Avatar alt="avatar" src={normalUser?.photoURL || ''} sx={{ width: 120, height: 120 }} />
        )}
        <span className="py-2 text-xl">{isLoginUser ? loginUser.name : normalUser?.name}</span>
        <span className="text-md">{isLoginUser ? loginUser.email : normalUser?.email}</span>
        <span className="pt-2 text-md">
          <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
          <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
        </span>
      </div>
      <div className="px-6 py-4">
        <Formik
          initialValues={{ ...userFormData }}
          onSubmit={(values) => {
            dispatch(updateUserInfo(values.uid as string, values, imgObj, imgAvatarObj))
          }}
        >
          {({ values, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <TextField
                label="Tên hiển thị"
                variant="standard"
                fullWidth={true}
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isLoginUser}
                error={!values.name || values.name.length > 50}
              />
              <TextField
                label="LDAP"
                variant="standard"
                fullWidth={true}
                id="ldapAcc"
                name="ldapAcc"
                value={values.ldapAcc}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isLoginUser}
                error={!values.ldapAcc || values.ldapAcc.length > 10}
              />
              <TextField
                label="Điện thoại"
                variant="standard"
                fullWidth={true}
                id="phone"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isLoginUser}
                type={'number'}
                error={!values.phone || values.phone.length > 20}
              />
              <TextField
                label="Địa chỉ"
                variant="standard"
                fullWidth={true}
                id="address"
                name="address"
                value={values.address}
                onChange={handleChange}
                disabled={!isLoginUser}
                onBlur={handleBlur}
                error={!values.address || values.address.length > 50}
              />
              <TextField
                label="Ngân hàng"
                variant="standard"
                fullWidth={true}
                id="bankName"
                name="bankName"
                value={values.bankName}
                onChange={handleChange}
                disabled={!isLoginUser}
                onBlur={handleBlur}
                error={!values.bankName || values.bankName.length > 50}
              />
              <TextField
                label="Chủ tài khoản"
                variant="standard"
                fullWidth={true}
                id="bankAccountName"
                name="bankAccountName"
                value={values.bankAccountName}
                onChange={handleChange}
                disabled={!isLoginUser}
                onBlur={handleBlur}
                error={!values.bankAccountName || values.bankAccountName.length > 50}
              />
              <TextField
                label="Số tài khoản"
                variant="standard"
                fullWidth={true}
                id="bankAccount"
                name="bankAccount"
                value={values.bankAccount}
                onChange={handleChange}
                disabled={!isLoginUser}
                onBlur={handleBlur}
                error={!values.bankAccount || values.bankAccount.length > 20}
              />
              <div className="flex flex-col pt-2 pb-8">
                <span className="font-serif text-sm">Mã QR</span>
                <div className="self-center pt-3">
                  {isLoginUser && imgQRPreview && <img alt="qrcode" className="max-w-xs" src={imgQRPreview} />}
                  {!isLoginUser && normalUser?.qrCodeURL && <img src={normalUser?.qrCodeURL} className="max-w-xs" alt="qrcode" />}
                </div>
                {isLoginUser && (
                  <>
                    <IconButton size={'large'} color="primary" aria-label="upload picture" component="label" onChange={handlePreviewQRChange}>
                      <input hidden accept="image/*" type="file" />
                      <PhotoCamera fontSize={'large'} />
                    </IconButton>
                    <Button
                      variant="contained"
                      type="submit"
                      className="self-center"
                      disabled={status === 'updating' || !values.name || !values.bankAccount || !values.bankName || !values.bankAccountName}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Alert>
            </Snackbar>
          )}
        </div>
      )}
    </>
  )
}

export default Profile
