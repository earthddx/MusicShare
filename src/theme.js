import { createMuiTheme } from "@material-ui/core/styles";
import { red, grey } from "@material-ui/core/colors";

const theme = createMuiTheme({
  palette: {
    fontFamily:'Roboto',
    type: "dark",
    primary: { main: red[700] },
    secondary: { main: grey[900] },
    
  },
});

export default theme;
