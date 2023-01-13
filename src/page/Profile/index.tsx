/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import { getHomeDataByUid } from '@app/libs/api/home'
import { auth } from '@app/server/firebase'
import { store } from '@app/stores'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { listUserStore } from '@app/stores/listUser'
import { clearUser, updateUserInfo, userStatus, userStore } from '@app/stores/user'
import LogoutIcon from '@mui/icons-material/Logout'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import ReplyIcon from '@mui/icons-material/Reply'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { signOut } from 'firebase/auth'
import { Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const users = useAppSelector(listUserStore)
  const status = useAppSelector(userStatus)
  const [imgPreview, setImgPreview] = useState(loginUser?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)
  const [listEvent, setListEvent] = useState<any>({})

  const { userUid } = useParams()
  const dispatch = useAppDispatch()

  const normalUser = users.find((user) => user.uid === userUid)
  const isLoginUser = normalUser?.uid === loginUser.uid
  const userFormData = useMemo(() => (isLoginUser ? loginUser : normalUser), [loginUser, normalUser, isLoginUser])

  const handlePreviewChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgObj(fileUploaded)
      setImgPreview(URL.createObjectURL(fileUploaded))
    }
  }

  useEffect(() => {
    return () => {
      if (imgPreview) {
        URL.revokeObjectURL(imgPreview)
      }
    }
  }, [imgPreview])

  useEffect(() => {
    setImgPreview(loginUser?.qrCodeURL)
  }, [loginUser])

  useEffect(() => {
    getHomeDataByUid(normalUser?.uid || '').then((e) => {
      setListEvent(e)
    })
  }, [dispatch, normalUser?.uid])

  console.log(listEvent)

  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        store.dispatch(clearUser())
      })
    } catch (error) {
      console.log('ERROR LOGGING OUT', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/*Header section*/}
      <div className="bg-gradient-to-b from-[#CAF5B1] to-[#8AD769] h-72 rounded-b-2xl flex flex-col items-center justify-center">
        <div className="flex justify-between pb-2 self-stretch">
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
        {normalUser?.photoURL ? (
          <img src={normalUser.photoURL} alt="" referrerPolicy="no-referrer" className="rounded-full w-28" />
        ) : (
          <img src={ProfilePicture} alt="" referrerPolicy="no-referrer" className="rounded-full w-28" />
        )}
        <span className="py-2 text-xl">{normalUser?.name || ''}</span>
        <span className="text-md">{normalUser?.email || ''}</span>
        <span className="pt-2 text-md">
          <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
          <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
        </span>
      </div>
      {/*Details section*/}
      <div className="px-6 py-4">
        <Formik
          initialValues={{ ...userFormData }}
          onSubmit={(values) => {
            dispatch(updateUserInfo(values.uid as string, values, imgObj))
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              <div className="flex flex-col pt-2 pb-8">
                <span className="font-serif text-sm">Mã QR</span>
                <div className="self-center pt-3">
                  {isLoginUser && imgPreview && <img alt="qrcode" className="max-w-xs" src={imgPreview} />}
                  {!isLoginUser && normalUser?.qrCodeURL && <img src={normalUser?.qrCodeURL} className="max-w-xs" alt="qrcode" />}
                </div>
                {isLoginUser && (
                  <>
                    <IconButton size={'large'} color="primary" aria-label="upload picture" component="label" onChange={handlePreviewChange}>
                      <input hidden accept="image/*" type="file" />
                      <PhotoCamera fontSize={'large'} />
                    </IconButton>
                    <Button variant="contained" type="submit" className="self-center" disabled={status === 'loading'}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Profile
