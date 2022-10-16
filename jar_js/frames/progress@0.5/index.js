var progress = function(app){
    var loaded_pages = {}
    var stacks = {}
    var pg_total = 0
    var atualStack
    var actual_page
    const root = document.querySelector("div.root")

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
        if(app_signature.application_manager.storage.hasLocal("loaded_pages")){
            loaded_pages = await JSON.parse(app_signature.application_manager.storage.getLocal("loaded_pages"))
        }

        if(loaded_pages[pageName]!=undefined){
            // remove

            const head_elements = document.head.querySelectorAll("*[head_element]")
            head_elements.forEach(element=>{
                element.remove()
            })

            const element_sacrify = toDom(loaded_pages[pageName])

            const head = element_sacrify.querySelector("head")
            const body = element_sacrify.querySelector("body")


            const children = head.children
            for(var x=0;x<children.length;x++){
                const child = children[x]
                child.setAttribute("head_element",null)
            }

            document.head.innerHTML += head.innerHTML

            root.innerHTML = body.innerHTML

            const scripts = root.querySelectorAll("script")
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

            actual_page = pageName

            if(PROGRESS_CONFIGS.call_after_change){
                window[PROGRESS_CONFIGS.call_after_change]()
            }
        }else {
            ShowError(`Page dont exist or PageStack not loaded, page: ${pageName}`)
        }
    }

    function applicationDownload(){
        return new Promise(async (resolve,reject)=>{
            var leng = Object.getOwnPropertyNames(stacks).length
            var pg_loaded = 0;

            for(var x=0;x<leng;x++) pg_total += stacks[Object.getOwnPropertyNames(stacks)[x]].length;

            for(var x=0;x<leng;x++){
                const pages = stacks[Object.getOwnPropertyNames(stacks)[x]]

                for(var i=0;i<pages.length;i++){
                    const page = pages[i]

                    await getPageContent(`${app.host}pages/${page}.html`).then(content=>{
                        loaded_pages[page] = content
                        const msg = PROGRESS_CONFIGS.loading_message
                        pg_loaded += 1

                        root.innerHTML = `
                            <style>body{background: #222222;display: flex;flex-direction: column;align-items: center;justify-content: center;overflow: hidden;height: 100vh;font-family: system-ui;}div.root{display: flex;flex-direction: column;align-items: center;justify-content: center;width:100%;}p.p-main{font-size: 20px;padding-top: 50px;color: #ffffff;margin-bottom: -40px;}svg{background: #222222;z-index: -999;}.progress-sec{margin-bottom: 40px;width: 30%;display: flex;flex-direction: column;align-items: center;}progress{width: 100%;}.p-progress{color: #fff;}
                            </style>
                            <p class="p-main">${(msg!=undefined?msg:"This Application is Loading")}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                                <circle cx="50" cy="50" r="0" fill="none" stroke="#3886bc" stroke-width="1">
                                    <animate attributeName="r" repeatCount="indefinite" dur="2s" values="0;45" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="0s"></animate>
                                    <animate attributeName="opacity" repeatCount="indefinite" dur="2s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="0s"></animate>
                                </circle>
                                <circle cx="50" cy="50" r="0" fill="none" stroke="#daefff" stroke-width="1">
                                    <animate attributeName="r" repeatCount="indefinite" dur="2s" values="0;45" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="-1s"></animate>
                                    <animate attributeName="opacity" repeatCount="indefinite" dur="2s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="-1s"></animate>
                                </circle>
                            </svg>
                            <div class="progress-sec">
                                <progress class="progress" value="${(pg_loaded/pg_total)*100}" max="100"></progress>
                                <p class="p-progress">${pg_loaded}/${pg_total} pages loaded</p>
                            </div>
                        `
                    })
                }

                if(leng-1 == x){
                    const storage_value = JSON.stringify(loaded_pages)
                    app_signature.application_manager.storage.setLocal("loaded_pages", storage_value);

                    resolve()
                }
            }
        })
    }

    function ShowError(msg){
            console.error(`Progress Error: ${msg}`)
            root.innerHTML = `
                <style>body{background:#161616;}p{font-family:system-ui;font-size:15px;width:100%;display:flex;justify-content:center;padding-top:50px;color:#ff6b6bba;}</style>
                <p>Progress Error: ${msg}</p>
            `
    }

    return {
        set: setPage,
        load: loadStack,
        loadStacks,
        applicationDownload,
        reload_app(){
            if(app.storage.hasLocal("loaded_pages")){
                app.storage.removeLocal("loaded_pages")
                location.reload()
            }
        },
        getActualPage(){
            return actual_page
        },
        loaded_pages
    }
}(app_signature.application_manager)

!async function(app){
    await progress.loadStacks()

    if(PROGRESS_CONFIGS.call_after_load){
        window[PROGRESS_CONFIGS.call_after_load]()
    }

    if(PROGRESS_CONFIGS.load_all_pages){
        if(app_signature.application_manager.storage.hasLocal("loaded_pages")==false){
            await progress.applicationDownload().then(()=>{
                setTimeout(()=>{
                    if(app.get.has("cp")){
                        progress.set(app.get.get("cp"))
                    }else {
                        progress.set("index")
                    }
                },2000)
            })
        }else {
            if(app.get.has("cp")){
                progress.set(app.get.get("cp"))
            }else {
                progress.set("index")
            }
        }
    }else {
        // Load custom Stack

        if(app.get.has("cs")){
            await progress.load(app.get.get("cs"))
        }else {
            await progress.load("index")
        }

        if(app.get.has("cp")){
            progress.set(app.get.get("cp"))
        }else {
            progress.set("index")
        }
    }

    // Load custom page
}(app_signature.application_manager) // Start