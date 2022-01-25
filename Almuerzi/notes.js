window.onload = () => {
    fetch('http://localhost:3000/api/meals',{
         method: 'GET',
         mode: 'cors',
         cache: 'no-cache',
         credentials: 'same-origin',
         headers: {
            'Content-Type':'application/json'
         },
         redirect: 'follow',
         body: JSON.stringify({ user: 'lala', password: 'chanchito'}) ,
    })
    .then(response => response.json())
    .then(data => console.log(data))

}