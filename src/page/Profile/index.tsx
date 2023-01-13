/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import { PAGES } from '@app/contants'
import { getHomeDataByUid } from '@app/libs/api/home'
import { auth } from '@app/server/firebase'
import { store } from '@app/stores'
import { setCurrentPage } from '@app/stores/footer'
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
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const users = useAppSelector(listUserStore)
  const status = useAppSelector(userStatus)
  const [imgPreview, setImgPreview] = useState(loginUser?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)
  const { userUid } = useParams()

  const paramUser = users.find((user) => user.uid === userUid)

  console.log(paramUser?.uid)
  const isEditable = paramUser?.uid === loginUser.uid

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

  const dispatch = useAppDispatch()

  const [listEvent, setListEvent] = useState<any>({})

  useEffect(() => {
    dispatch(setCurrentPage(PAGES.HOME))

    getHomeDataByUid(paramUser?.uid || '').then((e) => {
      setListEvent(e)
    })
  }, [dispatch, paramUser?.uid])

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
        <div className="flex justify-between self-stretch">
          <button className="px-4">
            <Link to="/">
              <ReplyIcon fontSize={'large'} />
            </Link>
          </button>
          {isEditable && (
            <button className="px-4" onClick={logout}>
              <LogoutIcon fontSize={'large'} />
            </button>
          )}
        </div>
        {paramUser?.photoURL ? (
          <img src={paramUser.photoURL} alt="" referrerPolicy="no-referrer" className="rounded-full w-28 mb-3 shadow-xl" />
        ) : (
          <img src={ProfilePicture} alt="" referrerPolicy="no-referrer" className="rounded-full w-28 mb-3 shadow-xl" />
        )}
        <span className="text-xl">{paramUser?.name || ''}</span>
        <span className="text-md">{paramUser?.email || ''}</span>
        <span className="pt-4 text-md">
          <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
          <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
        </span>
      </div>
      {/*Details section*/}
      <div className="px-6 py-4">
        <Formik
          initialValues={{ ...paramUser }}
          onSubmit={(values) => {
            dispatch(updateUserInfo(values.uid as string, values, imgObj))
          }}
        >
          {({ values, handleChange, handleBlur, handleSubmit }) => (
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
                disabled={!isEditable}
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
                disabled={!isEditable}
              />
              <TextField
                label="Địa chỉ"
                variant="standard"
                fullWidth={true}
                id="address"
                name="address"
                value={values.address}
                onChange={handleChange}
                disabled={!isEditable}
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
                disabled={!isEditable}
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
                disabled={!isEditable}
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
                disabled={!isEditable}
                onBlur={handleBlur}
              />
              <div className="flex flex-col pt-2 pb-8">
                <span className="font-serif text-sm">Mã QR</span>
                <div className="self-center pt-3">
                  {imgPreview && isEditable && <img alt="qrcode" className="max-w-xs" src={imgPreview} />}
                  {paramUser?.photoURL && !isEditable && <img src={paramUser?.qrCodeURL} className="max-w-xs" alt="qrcode" />}
                </div>
                {isEditable && (
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
