function injectHTML(url,tag){
    fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error('HTTP error',response.status)
        }
        return response.text();
    })
    .then(htmlString => {
        document.getElementById(tag).innerHTML = htmlString;   
    })
    .catch(error => {
        console.error('Error fetching HTML:', error);
    })
} 
document.addEventListener('DOMContentLoaded', (e) => {
    injectHTML('src/front/components/header.html','header')
    injectHTML('src/front/components/footer.html','footer')
})