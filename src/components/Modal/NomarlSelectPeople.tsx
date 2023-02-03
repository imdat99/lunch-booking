import { IEventDetail } from '@app/server/firebaseType'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Typography } from '@mui/material'

type PropsType = {
  handleOnClose: () => void
  selectingMembers: IEventDetail[]
  handleClickRow: (user: IEventDetail) => void
  dellMember: (uid: string) => void
  allMembers: IEventDetail[]
}
function NomarlSelectPeople({ selectingMembers, handleClickRow, dellMember, allMembers }: PropsType) {
  return (
    <>
      {allMembers?.map((item: IEventDetail) => (
        <Box className="flex w-full" key={item.uid}>
          <Box
            className={`hover:cursor-pointer ${selectingMembers.find((user) => item.uid === user.uid) ? 'bg-green-300' : ''} p-3 rounded-md mb-2`}
            onClick={() => handleClickRow(item)}
          >
            <Typography>{item.name || item.email || 'no name'}</Typography>
          </Box>
          {item.isGuess && item.uid && (
            <Button onClick={() => dellMember(item.uid || '')}>
              <DeleteForeverIcon />
            </Button>
          )}
        </Box>
      ))}
    </>
  )
}

export default NomarlSelectPeople
