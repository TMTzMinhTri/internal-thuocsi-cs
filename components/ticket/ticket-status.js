
import { Box } from '@material-ui/core';
import styles from './ticket.module.css'

export function TicketStatus({ status, options }) {
    let info = options[status]
    if (!info) {
        return ""
    }

    return <Box className={styles.ticketStatus} style={{
        border: "solid 2px " + info.color,
        color: info.color,
    }}>
        {info.label}
    </Box>
}