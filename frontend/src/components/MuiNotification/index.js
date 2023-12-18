// ** Imports
import { useState, useCallback, useEffect, Fragment, useRef } from 'react'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles'
import { styled } from '@mui/material/styles'

import { Bell} from "react-feather"

import {
  Button,
  Badge,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown
} from "reactstrap"

import PerfectScrollbar from "react-perfect-scrollbar"
import classnames from "classnames"

import CustomAvatar from './avatar'
import Loader from './Loader';

const getInitials = string => string?.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

// ** Styled Avatar component
const Avatar = styled(CustomAvatar)({
    width: 38,
    height: 38,
    fontSize: '1.125rem'
})


const Notif = props => {
    const { instance } = props

    // ** States
    const [anchorEl, setAnchorEl] = useState(null)

    const [ isLoading, setLoading ] = useState(false)
    const [ newCount, setNewCount ] = useState(0)
    const pageRef = useRef(-1)
    const hitBottom = useRef(false)
    const isLast = useRef(false)

    const [isAllRead, setAllRead] = useState(false)

    const [ notifications, setNotifs ] = useState([])

    const getNotifs = useCallback(
        async (page=0) =>
        {
            if (hitBottom.current === true || isLast.current === true)
            {
                return
            }
            setLoading(true)

            const { data } = await instance.get(`/p/action/?page=${page}`)
            if (data?.success)
            {
                const { notifs, read_notifs } = data?.data

                const map = new Map(
                    read_notifs.map((value, idx) => {
                      return [value, value];
                    }),
                );
                notifs.forEach(
                    (item, idx) =>
                    {
                        item.isRead = map.has(item.id)
                    }
                )

                setNotifs((prev) => [...prev, ...notifs])

                if (notifs.length)
                {
                    pageRef.current = page
                    hitBottom.current = false
                }
                else {
                    isLast.current = true
                }

                var readed_notif = notifs.find(item => item.isRead === false)

                if (readed_notif) {
                    setAllRead(true)
                }
            }
            setLoading(false)
        },
        [instance]
    )

    const getCount = useCallback(
        async () =>
        {
            const { data } = await instance.get(`/p/count/`)
            if (data?.success)
            {

                if (data.data?.new_count > 0) {
                    setNewCount(data.data?.new_count)
                } else {
                    setNewCount(0)
                }
            }
        },
        [instance]
    )

    useEffect(
        () =>
        {
            getCount()
        },
        []
    )

    useEffect(
        () =>
        {
            if (anchorEl && !notifications.length)
            {
                getNotifs()
            }
        },
        [anchorEl, newCount]
    )

    const handleDropdownOpen = event => {
        setAnchorEl(event.currentTarget)
    }

    const requestToServer = useCallback(
        async (pk) =>
        {
            const { data } = await instance.get(`/p/state/${pk}/`).catch(err => err)
            return { success, data } = data
        },
        [instance]
    )

    const hidePopUp = useCallback(
        () =>
        {
            setAnchorEl(null)
        },
        []
    )

    // neg medegdel deer darah uyd
    const handleDropdownClose = useCallback(
        async (id, isRead, index, url) => {
            hidePopUp()
            if (!isRead)
            {
                const { success, data } = await requestToServer(id)
                if (data)
                {
                    setNotifs((prev) => {
                        const newa = [...prev]
                        newa[index].isRead = true
                        return newa
                    })
                    setNewCount((prev) => prev !== 0 ? prev - 1 : prev)
                }
            }
            if (url)
            {
                window.open(url, '_blank')
            }
        },
        [instance]
    )

    const readAll = useCallback(
        async () =>
        {
            hidePopUp()
            const { success, data } = await requestToServer('all')
            if (data && success)
            {
                setNotifs((prev) => {
                    const newa = [...prev]
                    newa.forEach((item, ix) => item.isRead = true)
                    return newa
                })
                setNewCount(0)
            }
        },
        [instance]
    )

    const RenderAvatar = useCallback(
        ({ notification }) => {
            const { avatarAlt="img", icon, name, avatarColor="primary" } = notification
            if (icon) {
                return <Avatar alt={avatarAlt} src={icon} />
            }
            else {
                return (
                    <Avatar skin='light' color={avatarColor}>
                        {getInitials(name)}
                    </Avatar>
                )
            }
        },
        []
    )

    function diff_times(dt)
    {
        var text = ''

        var today = new Date();
        var diffMs = (today - dt);
        var days = Math.floor(diffMs / 86400000); // days
        var hours = Math.floor((diffMs % 86400000) / 3600000); // hours
        var minute = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

        if (days && hours && minute) {
            text = `${days}ө ${hours}ц ${minute}м өмнө`
        } else if(hours && minute) {
            text = `${hours}ц ${minute}м өмнө`
        } else if(minute) {
            text = `${minute} минутын өмнө`
        } else {
            text = 'дөнгөж сая'
        }

        return text
    }


    const renderNotificationItems = () => {
        return (
            <PerfectScrollbar
                component="li"
                className="media-list scrollable-container"
                options={{
                    wheelPropagation: false,
                }}
            >
                {
                    notifications.map((notification, index) => {
                        return (
                            <div className={classnames("list-item d-flex ")} onClick={() => handleDropdownClose(notification.id, notification.isRead, index, notification.url)} key={index}>
                                <div className="me-1">
                                    <RenderAvatar notification={notification} />
                                </div>
                                <div className="container-fluid">
                                    <h6 className='font-weight-bold'>{notification?.name}</h6>
                                    <small>{notification.title}</small>
                                    <div className='d-flex justify-content-between mx-0'>
                                        <div>
                                            <Badge pill color="light-danger">
                                                {notification.lvl_name}
                                            </Badge>
                                        </div>
                                        {
                                            notification.isRead === false
                                            ?
                                                <small className='text-primary fw-bold'>{diff_times(new Date(notification?.created_at))}</small>
                                            :
                                                notification.created_at
                                        }
                                        {
                                            notification.isRead === false
                                            ?
                                            (
                                                <i className="fas fa-circle text-primary"/>
                                            )
                                            : null
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </PerfectScrollbar>
        );
    };

    return (
        <Fragment>
            <UncontrolledDropdown
                tag="li"
                className="dropdown-notification nav-item list-unstyled ms-auto mt-1 me-1"
            >
                <DropdownToggle
                    tag="p"
                    className="nav-link cursor-pointer position-relative"
                    onClick={(e) => e.preventDefault()}
                >
                    <Bell size={21} onClick={handleDropdownOpen}/>
                    <Badge pill color="danger" className="badge-up" onClick={handleDropdownOpen}>
                        {newCount}
                    </Badge>
                </DropdownToggle>
                <DropdownMenu end tag="ul" className="dropdown-menu-media mt-0">
                    <li className="dropdown-menu-header">
                        <DropdownItem className="d-flex" tag="div" header >
                            <h4 className="notification-title mb-0 me-auto">Мэдэгдэл</h4>
                            <Badge tag="div" color="light-primary" pill>
                                {newCount} шинэ
                            </Badge>
                        </DropdownItem>
                    </li>
                    {
                        isLoading
                        ?
                            <Loader/>
                        :
                            anchorEl && notifications.length != 0
                            ?
                                <>
                                    {renderNotificationItems()}
                                    {
                                        isAllRead &&
                                            <li className="dropdown-menu-footer">
                                                <Button color="primary" block onClick={newCount > 0 ? readAll : null}>
                                                    Бүгдийг унших
                                                </Button>
                                            </li>
                                    }
                                </>
                            :
                                <p className="mt-1 text-center">
                                    Одоогоор мэдэгдэл байхгүй байна.
                                </p>
                    }
                </DropdownMenu>
            </UncontrolledDropdown>
        </Fragment>
    )
}


export const MuiNotification = (props) =>
{

    return (
        <Notif {...props} />
    )
}
