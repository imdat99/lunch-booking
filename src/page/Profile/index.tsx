/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'
import ReplyIcon from '@mui/icons-material/Reply'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import PhotoCamera from '@mui/icons-material/PhotoCamera'

import { auth } from '@app/server/firebase'
import { store } from '@app/stores'
import { useAppSelector, useAppDispatch } from '@app/stores/hook'
import { clearUser, userStore, userStatus, updateUserInfo } from '@app/stores/user'
import { Formik } from 'formik'
import { signOut } from 'firebase/auth'
import { Link } from 'react-router-dom'

const Profile = () => {
  const user = useAppSelector(userStore)
  const status = useAppSelector(userStatus)
  const [imgPreview, setImgPreview] = useState(user?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)

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
    setImgPreview(user?.qrCodeURL)
  }, [user])

  const dispatch = useAppDispatch()

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
            <Link to="/">
              <ReplyIcon fontSize={'large'} />
            </Link>
          </button>
          <button className="px-4" onClick={logout}>
            <LogoutIcon fontSize={'large'} />
          </button>
        </div>
        <img src="/src/assets/profile-picture.png" alt="" referrerPolicy="no-referrer" className="rounded-full w-28" />
        <span className="py-2 text-xl">{user?.name || ''}</span>
        <span className="text-md">{user?.email || ''}</span>
        <span className="pt-4 text-md">
          <span className="font-bellota">Chủ chi</span>: <span className="font-bold">4 lần</span> |<span className="font-bellota"> Tham gia</span>:{' '}
          <span className="font-bold">4 lần</span>
        </span>
      </div>
      {/*Details section*/}
      <div className="px-6 py-4">
        <Formik
          initialValues={{ ...user }}
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
              />
              <TextField
                label="Địa chỉ"
                variant="standard"
                fullWidth={true}
                id="address"
                name="address"
                value={values.address}
                onChange={handleChange}
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
                onBlur={handleBlur}
              />
              <div className="flex flex-col pt-2 pb-8">
                <span className="font-serif text-sm">Mã QR</span>
                {imgPreview && (
                  <div className="self-center pt-3">
                    <img alt="qrcode" className="h-56" src={imgPreview} />
                  </div>
                )}
                <IconButton size={'large'} color="primary" aria-label="upload picture" component="label" onChange={handlePreviewChange}>
                  <input hidden accept="image/*" type="file" />
                  <PhotoCamera fontSize={'large'} />
                </IconButton>
                <Button variant="contained" type="submit" className="self-center" disabled={status === 'loading'}>
                  Save
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Profile
