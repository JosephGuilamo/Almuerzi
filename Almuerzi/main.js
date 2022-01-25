let mealsState = []
let user = {}
let ruta = 'login' // login, register, orders

const stringToHtml = (string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(string, 'text/html')
    return doc.body.firstChild
    
}

const renderItem = (item) => {
   const element = stringToHtml(`<li data-id="${item._id}">${item.name}</li>`)

   element.addEventListener('click', () => {
        const mealList = document.getElementById('meals-list')
        Array.from(mealList.children).forEach( x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealIdInput = document.getElementById('meals-id')
        mealIdInput.value = item._id
    })
   return element
}
const renderOrder = (order,meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHtml(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)
    console.log(element)  
    return element
}

const initializeForm = () => {
    const orderForm = document.getElementById('order')
    const token = localStorage.getItem('token')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if (!mealIdValue) {
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }

        const order = {
            meal_id:  mealIdValue,
            user_id: user._id,
        }
        fetch('http://localhost:3000/api/orders',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify(order)   
        }).then(x => x.json())
          .then(respuesta => {
              const renderedOrder = renderOrder(respuesta,mealsState)
              const ordersList = document.getElementById('orders-list')
              ordersList.appendChild(renderedOrder)
              submit.removeAttribute('disabled')
            })
    }

}

const inicializeData = () =>  {
    fetch('http://localhost:3000/api/meals')
    .then(response => response.json())
    .then(data => {
        mealsState = data
        const mealList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItems = data.map(renderItem)
        mealList.removeChild(mealList.firstElementChild)
        listItems.forEach(element => mealList.appendChild(element))
        submit.removeAttribute('disabled')
        fetch('http://localhost:3000/api/orders')
        .then(response => response.json())
        .then(ordersData => {
            const ordersList = document.getElementById('orders-list')
            const listOrders = ordersData.map(orderData => renderOrder(orderData,data))  
            
            ordersList.removeChild(ordersList.firstElementChild)
            listOrders.forEach(element => ordersList.appendChild(element))   
        })
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    initializeForm()
    inicializeData()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginFrom = document.getElementById('login-form')
    loginFrom.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

     fetch('http://localhost:3000/api/auth/login',{
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({email , password})
     }).then( x => x.json())
        .then( respuesta => {
            localStorage.setItem('token',respuesta.token)
            ruta = 'orders'
            return respuesta.token
        }).then( token => {
            return fetch('http://localhost:3000/api/auth/me',{
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    authorization: token,
                },
            })
        })
        .then( x=> x.json())
        .then(fetchedUser => {
            localStorage.setItem('user',JSON.stringify(fetchedUser))
            user = fetchedUser
            renderOrders()
        })
    }
}

window.onload = () => {
    renderApp()
}