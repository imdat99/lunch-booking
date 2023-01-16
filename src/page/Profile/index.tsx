/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import { getHomeDataByUid } from '@app/libs/api/home'
import { auth } from '@app/server/firebase'
import { store } from '@app/stores'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { listUserStore } from '@app/stores/listUser'
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
import * as Yup from 'yup'

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const listUser = useAppSelector(listUserStore)
  const status = useAppSelector(userStatus)
  const dispatch = useAppDispatch()
  const [showMessage, setShowMessage] = useState<'success' | 'error' | null>(null)

  const { userUid } = useParams()

  //state for images
  const [imgQRPreview, setImgQRPreview] = useState(loginUser?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)

  const [imgAvatarPreview, setImgAvatarPreview] = useState(loginUser?.photoURL)
  const [imgAvatarObj, setImgAvatarObj] = useState<any>(null)
  //

  const [listEvent, setListEvent] = useState<any>({})
  const normalUser = listUser.find((user) => user.uid === userUid)
  const isLoginUser = normalUser?.uid === loginUser.uid
  const userFormData = useMemo(() => (isLoginUser ? loginUser : normalUser), [loginUser, normalUser, isLoginUser])

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
    getHomeDataByUid(normalUser?.uid || '').then((e) => {
      setListEvent(e)
    })
  }, [dispatch, normalUser?.uid])

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
        store.dispatch(clearUser())
      })
    } catch (error) {
      console.log('ERROR LOGGING OUT', error)
    }
  }

  const handleCloseMessage = () => {
    dispatch(idle())
    setShowMessage(null)
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Must not be empty').min(6, 'At least 6 characters').max(30, 'At max 30 characters'),
    ldapAcc: Yup.string().required('Must not be empty').min(4, 'At least 4 characters').max(12, 'At max 12 characters'),
    phone: Yup.string().required('Must not be empty').max(12, 'At max 12 characters'),
    address: Yup.string().required('Must not be empty').max(40, 'At max 40 characters'),
    bankName: Yup.string().required('Must not be empty').max(15, 'At max 15 characters'),
    bankAccountName: Yup.string().required('Must not be empty').min(6, 'At least 6 characters').max(30, 'At max 30 characters'),
    bankAccount: Yup.string().required('Must not be empty').max(15, 'At max 15 characters'),
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
          <Avatar alt="avatar" src={normalUser?.photoURL!} sx={{ width: 120, height: 120 }} />
        )}
        <span className="py-2 text-xl">{isLoginUser ? loginUser.name : normalUser?.name}</span>
        <span className="text-md">{isLoginUser ? loginUser.email : normalUser?.email}</span>
        <span className="pt-2 text-md">
          <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
          <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
        </span>
      </div>
      {/*Information section*/}
      <div className="px-6 py-4 md:self-center md:w-[600px] lg:w-[900px] xl:w-[1200px]">
        <Formik
          initialValues={{ ...userFormData }}
          onSubmit={(values) => {
            dispatch(updateUserInfo(values.uid as string, values, imgObj, imgAvatarObj))
          }}
          validationSchema={validationSchema}
        >
          {({ values, handleChange, handleBlur, handleSubmit, errors }) => (
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
              />
              {errors.name && <span className="text-sm font-bellota text-red-600">{errors.name}</span>}
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
              />
              {errors.ldapAcc && <span className="text-sm font-bellota text-red-600">{errors.ldapAcc}</span>}
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
              />
              {errors.phone && <span className="text-sm font-bellota text-red-600">{errors.phone}</span>}
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
              />
              {errors.address && <span className="text-sm font-bellota text-red-600">{errors.address}</span>}
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
              />
              {errors.bankName && <span className="text-sm font-bellota text-red-600">{errors.bankName}</span>}
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
              />
              {errors.bankAccountName && <span className="text-sm font-bellota text-red-600">{errors.bankAccountName}</span>}
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
              />
              {errors.bankAccount && <span className="text-sm font-bellota text-red-600">{errors.bankAccount}</span>}

              <div className="flex flex-col pb-8">
                <span className="font-bellota text-sm">Mã QR</span>
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
                    <Button variant="contained" type="submit" className="self-center" disabled={status === 'updating'}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            </form>
          )}
        </Formik>
      </div>
      {showMessage && (
        <Snackbar open={true} onClose={handleCloseMessage} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={showMessage} sx={{ width: '100%', backgroundColor: '#baf7c2' }}>
            {showMessage === 'success' ? (
              <span className="font-bold"> {'Cập nhật user thành công!'} </span>
            ) : (
              <span className="font-bold"> {'Cập nhật thất bại!'} </span>
            )}
          </Alert>
        </Snackbar>
      )}
    </div>
  )
}

export default Profile
