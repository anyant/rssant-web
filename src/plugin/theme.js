import theme from 'muse-ui/lib/theme'
import {
    antGreen,
    antBlue,
    antGold,
    antRed,
    antTextSemi,
    antTextGrey,
    antTextLight,
    antTextWhite,
    antBackWhite,
    antBackGrey,
    antLineGrey,
} from '@/plugin/common'

theme.add('rssant', {
    primary: antBlue,
    secondary: antRed,
    success: antGreen,
    warning: antGold,
    info: antBlue,
    error: antRed,
    text: {
        primary: antTextSemi,
        secondary: antTextGrey,
        alternate: antTextWhite,
        disabled: antTextLight,
        hint: antTextLight,
    },
    divider: antLineGrey,
    background: {
        paper: antBackWhite,
        chip: antBackGrey,
        default: antBackWhite,
    }
}, 'light');

theme.use('rssant');
