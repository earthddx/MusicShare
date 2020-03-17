import { createMuiTheme } from'@material-ui/core/styles'
import { orange, green } from '@material-ui/core/colors'

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: orange,
        secondary: green
    }
})

export default theme