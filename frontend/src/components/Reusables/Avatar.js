import React from 'react'
import { Badge} from '@mui/material'
import Avatar from '@mui/material/Avatar';
import Camera from '../assets/Images/camera.png';


const AvatarCircle = (props) => {
  const { userIcon, changeInput, click, reference } = props;
  const getRandomColor = () => {
    var letters = 'BCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }
  const badgeStyles = {
    bottom: "8px",
    right: "8px",
  }
  return (
    <Badge
      overlap={"circular"}
      badgeContent={
      <Avatar onClick={click} style={{ cursor: "pointer", width: "1rem", height: "1rem", backgroundColor: "white", border: "1px solid grey", aspectRatio:1 /1, width:'2rem', height:'2rem'}}>
          <img src={Camera} style={{ aspectRatio: 1 / 1, width: "2rem" }} />
          <input
            type="file"
            id="actual-btn"
            ref={reference}
            onChange={(e) => changeInput(e)}
            hidden
            data-testid="file-upload-input"
          />
      </Avatar>
      }
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      sx={{
        '.MuiBadge-dot': {
          backgroundColor: 'transparent',
        },
        '.MuiBadge-badge': badgeStyles,
      }}
    >
      <Avatar sx={{ display: "flex",bgcolor:'transparent', justifyContent: "center", alignItems: "center", boxShadow: "-4px -4px 4px 0px rgba(0, 0, 0, 0.25) inset",width:'100px',height:'100px'}}>
        <img src={userIcon}  style={{ width: "100px", height: "100px" }}/>
      </Avatar>
    </Badge>

  )
}

export default AvatarCircle