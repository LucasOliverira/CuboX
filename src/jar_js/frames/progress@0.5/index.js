var progress = function(app){
    var loaded_pages = {}
    var stacks = {}
    var atualStack = undefined
    var attemps_default = 2

    app.storage.setLocal("progress_error_attemps",0)

    function loadStacks(){
        return new Promise(async (resolve,reject)=>{
            const pages = await fetch(`${app.host}pages/pages.json`)
            .then(async res=>{
                return await res.json()  
            })

            stacks = pages.stacks
            resolve(stacks)
        })
    }

    function getPageContent(url){
        return new Promise((resolve,reject)=>{
            const xhr = new XMLHttpRequest()
            xhr.open("GET",url)
            xhr.onreadystatechange = ()=>{
                if(xhr.readyState == 4){
                    if(xhr.status == 200 || xhr.status == 304){
                        const response = xhr.responseText

                        resolve(response)
                    }else {
                        ShowError(`Page not found or exist: ${url}`)
                        reject(`Page not found or exist: ${url}`)
                    }
                }
            }
            xhr.send()
        })
    }

    function loadStack(stack){
        return new Promise((resolve,reject)=>{
            if(stacks[stack]){
                loaded_pages = {}
                const pages = stacks[stack]

                pages.map(async (page,i)=>{
                    await getPageContent(`${app.host}pages/${page}.html`).then(content=>{
                        loaded_pages[page] = content
                    })

                    if(pages.length-1 == i){   
                        atualStack = stack     
                        resolve()
                    }
                })
            }else {
                ShowError(`Stack dont exist: ${stack}`)
                reject(`Stack dont exist: ${stack}`)
            }
        })
    }

    var toDom = function(str) {
        var tmp = document.createElement("html");
        tmp.innerHTML = str;
        return tmp;
    };

    async function setPage(pageName){
        if(loaded_pages[pageName]!=undefined){
            // remove

            const head_elements = document.head.children    
            for(var x=0;x<head_elements.length;x++){
                const element = head_elements[x]

                if(element.hasAttribute("attention")){
                    element.remove()
                }
            }

            const element_sacrify = toDom(loaded_pages[pageName])

            const head = element_sacrify.querySelector("head")
            const body = element_sacrify.querySelector("body")


            const children = head.children
            for(var x=0;x<children.length;x++){
                const child = children[x]
                child.setAttribute("attention",true)
            }

            document.head.innerHTML += head.innerHTML

            document.body.innerHTML = body.innerHTML

            const scripts = document.body.querySelectorAll("script")
            scripts.forEach(script=>{
                const new_script = document.createElement("script")
                new_script.textContent = script.textContent
                const attrs = script.attributes
                for(var i=0;i<attrs.length;i++){
                    const { name, value } = attrs[i]
                    new_script.setAttribute(name,value)
                }
                script.replaceWith(new_script)
            })
        }else {
            ShowError(`Page dont exist or PageStack not loaded, page: ${pageName}`)
        }
    }

    function ShowError(msg){
            const attemps = parseInt(app.storage.getLocal("progress_error_attemps"))
            if(attemps < attemps_default){
                app.storage.setLocal("progress_error_attemps",attemps+1)
                location.reload()
            }else {
                app.storage.setLocal("progress_error_attemps",0)
                document.body.innerHTML = `
                    <style>body{background:#161616;}p{font-family:system-ui;font-size:15px;width:100%;display:flex;justify-content:center;padding-top:50px;color:#ff6b6bba;}</style>
                    <p>Progress Error: ${msg}</p>
                `
            }
    }

    return {
        set: setPage,
        load: loadStack,
        loadStacks,
        stack: atualStack,
        stacks
    }
}(app_signature.application_manager)

!async function(app){
    await progress.loadStacks()

    // Load custom Stack

    if(app.get.has("cs")){
        await progress.load(app.get.get("cs"))
    }else {
        await progress.load("index")
    }

    // Load custom page

    if(app.get.has("cp")){
        progress.set(app.get.get("cp"))
    }else {
        progress.set("index")
    }
}(app_signature.application_manager) // Start