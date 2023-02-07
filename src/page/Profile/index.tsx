/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import GroupModal from '@app/components/Modal/GroupModal'
import { LoadingScreen } from '@app/components/Suspense'
import { getHomeDataByUid } from '@app/libs/api/home'
import { createGroup, deleteGroup, getUserByUid, getUserGroupsByUserId } from '@app/libs/api/userAPI'
import { auth } from '@app/server/firebase'
import { User, UserGroup } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { clearNotiList } from '@app/stores/noti'
import { clearUser, idle, updateUserInfo, userStatus, userStore } from '@app/stores/user'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
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
import { Container } from '@mui/system'
import { signOut } from 'firebase/auth'
import { Formik } from 'formik'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

import { IDropdownMembers } from '../Events/Add'
type ModalType = {
  isOpen: boolean
  groupId: string
}

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const status = useAppSelector(userStatus)
  const dispatch = useAppDispatch()
  const [showMessage, setShowMessage] = useState<'success' | 'error' | null>(null)
  const [currentMember, setCurrentMember] = useState<User>()
  const [modalData, setModalData] = useState<ModalType>({ isOpen: false, groupId: '' })
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
  const [userGroup, setUserGroup] = useState<IDropdownMembers[]>()
  const getGroupByUser = () => {
    getUserGroupsByUserId(loginUser.uid || '').then((group: UserGroup[] | undefined) => {
      const lstGroup = group?.map((item) => ({
        label: item.groupName,
        value: item.groupId,
        isCreator: item.createUser == loginUser.uid ? true : false,
      }))
      setUserGroup(lstGroup)
    })
  }

  const handleDelete = (groupId: string) => {
    try {
      // setLoading(true)
      if (groupId) {
        deleteGroup(groupId).then(() => {
          // setLoading(false)
          setModalData({ isOpen: false, groupId: '' })
          getGroupByUser()
        })
      }
    } catch (error) {
      console.log(error)

      // setLoading(false)
    }
  }
  useEffect(() => {
    getCurrentMemberInfo()
    getGroupByUser()
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
    getHomeDataByUid(userUid!).then((e) => {
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

  const handleSelectedMember = (data: any) => {
    createGroup(data).then(({ isSuccess, GroupData }: any) => {
      if (isSuccess) {
        // const newGroup = { label: GroupData.groupName, value: GroupData.groupId, isCreator: true }
        // const tempGroups = _.cloneDeep(userGroup)
        // tempGroups?.push(newGroup)
        // setUserGroup(tempGroups)
        getGroupByUser()
      }
      console.log(isSuccess, GroupData)
    })
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

  // Form validation
  const validationSchema = yup.object().shape({
    name: yup.string().required('Vui lòng nhập tên').max(30, 'Tên không được quá 30 kí tự'),
    ldapAcc: yup.string().max(10, 'LDAP không quá 10 kí tự'),
    phone: yup
      .string()
      .matches(/^[0-9]*$/, 'Số điện thoại không được có kí tự')
      .max(20, 'Số điện thoại không quá 20 số'),
    address: yup.string().max(50, 'Địa chỉ không quá 50 kí tự'),
    bankName: yup.string().required('Vui lòng nhập tên ngân hàng').max(30, 'Tên ngân hàng không được quá 30 kí tự'),
    bankAccountName: yup.string().required('Vui lòng nhập tên').max(30, 'Tên không được quá 30 kí tự'),
    bankAccount: yup.string().required('Vui lòng nhập số tài khoản').max(20, 'Số tài khoản không được quá 20 kí tự'),
  })

  function isInvalidForm(errors: any) {
    return errors.name || errors.bankAccount || errors.bankName || errors.bankAccountName
  }

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="min-h-screen bg-white">
          <div className="bg-gradient-to-b from-[#CAF5B1] to-[#8AD769] ">
            <Container>
              <div className="h-72 rounded-b-2xl flex flex-col items-center justify-center">
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
                  <Avatar alt="avatar" src={currentMember?.photoURL || ''} sx={{ width: 120, height: 120 }} />
                )}
                <span className="py-2 text-xl">{currentMember?.name || ''}</span>
                <span className="pt-2 text-md">
                  <span className="font-bellota">Chủ chi</span>: <span className="font-bold">{listEvent.isHostCount} lần</span> |
                  <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} lần</span>
                </span>
              </div>
            </Container>
          </div>
          <Container>
            <div className="px-6 py-4">
              <div className="mb-3" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.42)' }}>
                <span className="mb-2">Group</span>
                <AddIcon
                  color="success"
                  onClick={() => {
                    setModalData({ isOpen: true, groupId: '' })
                  }}
                />
                <div>
                  {userGroup?.map((group) => (
                    <div key={group.value} style={{ margin: '10px' }}>
                      <span>{group.label}</span>
                      {group.isCreator ? (
                        <EditIcon
                          onClick={() => {
                            // setIsEditingNote(true)
                            setModalData({ isOpen: true, groupId: group.value! })
                          }}
                          sx={{ cursor: 'pointer', width: '16px', marginLeft: '5px' }}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Formik
                initialValues={{ ...userFormData }}
                onSubmit={(values) => {
                  handleSubmitMember(values)
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
                      helperText={errors.name || ''}
                      error={Boolean(errors.name)}
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
                      helperText={errors.ldapAcc || ''}
                      error={Boolean(errors.ldapAcc)}
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
                      helperText={errors.phone || ''}
                      error={Boolean(errors.phone)}
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
                      helperText={errors.address || ''}
                      error={Boolean(errors.address)}
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
                      helperText={errors.bankName || ''}
                      error={Boolean(errors.bankName)}
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
                      helperText={errors.bankAccountName || ''}
                      error={Boolean(errors.bankAccountName)}
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
                      helperText={errors.bankAccount || ''}
                      error={Boolean(errors.bankAccount)}
                    />
                    <div className="flex flex-col pb-8">
                      <span className="font-bellota text-sm">Mã QR</span>
                      <div className="self-center pt-3">
                        {isLoginUser && imgQRPreview && <img alt="qrcode" className="max-w-xs" src={imgQRPreview} />}
                        {!isLoginUser && currentMember?.qrCodeURL && <img src={currentMember?.qrCodeURL} className="max-w-xs" alt="qrcode" />}
                      </div>
                      {isLoginUser && (
                        <>
                          <IconButton size={'large'} color="primary" aria-label="upload picture" component="label" onChange={handlePreviewQRChange}>
                            <input hidden accept="image/*" type="file" />
                            <PhotoCamera fontSize={'large'} />
                          </IconButton>
                          <Button variant="contained" type="submit" className="self-center" disabled={isInvalidForm(errors)}>
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                )}
              </Formik>
            </div>

            <GroupModal
              open={modalData?.isOpen}
              setOpen={setModalData}
              handleSelectedMember={handleSelectedMember}
              groupId={modalData.groupId}
              setLoading={setLoading}
              handleDelete={handleDelete}
              // selectedListMember={selectedListMember}
              // selectedGroup={selectedGroup}
            />

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
          </Container>
        </div>
      )}
    </>
  )
}

export default Profile
