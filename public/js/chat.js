const socket = io()

const $messageform = document.querySelector('#msg-form')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $messagesendlocation = document.querySelector('#send-location')
const $message = document.querySelector('#message')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
         //new message element
         const $newmessage = $message.lastElementChild

         //height of the new message
         const newmessagestyle = getComputedStyle($newmessage)
         const newmessagemargin = parseInt(newmessagestyle.marginBottom)
         const newmessageheight = $newmessage.offsetHeight + newmessagemargin

         //visible height
         const visibleheight = $message.offsetHeight

         //height of msg container
         const containerheight = $message.scrollHeight

         //how far have i scroll
         const scrolloffset = $message.scrollTop + visibleheight

         if(containerheight - newmessageheight <= scrolloffset) {
               $message.scrollTop = $message.scrollHeight
         }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationmessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomdata', ({ room, users}) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



$messageform.addEventListener('submit', (e) => {
       e.preventDefault()

       $messageformbutton.setAttribute('disabled', 'disabled')

       const message = document.querySelector('input').value

       socket.emit('sendmessage', message, (error) => {
           $messageformbutton.removeAttribute('disabled')
           $messageforminput.value = ''
           $messageforminput.focus()

           if(error) {
               return console.log(error)
           }
           console.log('message delivered')
       })
})


$messagesendlocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported to your browser')
    }

    $messagesendlocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
          //console.log(position)
          socket.emit('sendLocation', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
          }, () => {
              $messagesendlocation.removeAttribute('disabled')
              console.log('location shared!')
          })
    })
})


socket.emit('join', { username, room}, (error) => {
       if(error) {
           alert(error)
           location.href = '/'
       }
})