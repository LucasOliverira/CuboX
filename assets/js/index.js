// Graphics
var graphics = document.querySelectorAll("Graphic-viewer")
graphics.forEach(item=>{
    const title = item.getAttribute("top-content")
    var text = item.getAttribute("content")
    const name = item.getAttribute("name")

    const src = `../assets/imgs/graphics/${name}.png`

    text = text.replace("\n","<br>")

    // create

    const element = document.createElement("div")
    element.classList.add("content-text")
    element.innerHTML = `
        <h1 class="content-text">${title}</h1>
        <p class="content-description">${text}</p>
        <img class="content-image" src="${src}">
    `

    item.replaceWith(element)
})