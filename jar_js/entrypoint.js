var app_signature = null

!function(){
    async function entry_listener(app){
        if(app == null || app == undefined){
            throw new Error("App Signature is compromited, try refesh the page. If it dont fix use this site to try fix again: jarjs.com/?cp=contact&msg=app_signature_dont_created")
        }

        const config = await fetch(`${app.application_manager.host}jar_js/config.json`)
        .then(async res=>{
            return await res.json()
        })

        if(config.frames){
            config.frames.map(frame=>{
                if(frame.name && frame.index && frame.version){
                    const URL = `${app.application_manager.host}jar_js/frames/${frame.name}@${frame.version}/${frame.index}`
                    app.module_manager.open(URL)
                }
            })
        }

        app_signature = app
    }

    function gen_applicationSignature(){
        return new Promise((resolve, reject)=>{
            // Application Signature

            // Get
            var gets = {}
            function refreshGets(){
                const url_get_brute = (location.href.split("?").length>1?location.href.split("?")[1]:"")
                if(url_get_brute != ""){
                    const items = url_get_brute.split("&")
                    items.forEach(item=>{
                        const [key, value] = item.split("=")
                        gets[key] = value
                    })
                }
            }
            function hasGet(get){
                return gets[get]!=undefined
            }
            function getGet(get){
                if(hasGet(get)){
                    return gets[get]
                }else {
                    throw new Error("JarJS(Application Signature)[error]>> Get dont exist: "+get)
                }
            }
            function addGet(key, value){
                let new_url = location.href+`${(Object.keys(gets).length)>0?"&":"?"}${key}=${value}`
                window.history.pushState({}, "Title", new_url);
                refreshGets()
                refreshGets()
            }

            refreshGets()

            const get = {
                has: hasGet,
                get: getGet,
                add: addGet,
                gets
            }

            // Cookie

            function setCookie(name, value, days) {
                const d = new Date();
                d.setTime(d.getTime() + (days*24*60*60*1000));
                let expires = "expires="+ d.toUTCString();
                document.cookie = name + "=" + value + ";" + expires + ";path=/";
            }
            function getCookie(name) {
                name = name + "=";
                let decodedCookie = decodeURIComponent(document.cookie);
                let ca = decodedCookie.split(';');
                for(let i = 0; i <ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }
            function hasCookie(name){
                return getCookie(name) != ""
            }

            const cookie = {
                add: setCookie,
                get: getCookie,
                has: hasCookie
            }

            // Local Storage

            function getLocal(name){
                if(hasLocal(name)){
                    return window.localStorage.getItem(name)
                }
            }
            function setLocal(name, value){
                window.localStorage.setItem(name,value)
            }
            function removeLocal(name){
                if(hasLocal(name)){
                    window.localStorage.removeItem(name)
                }
            }
            function hasLocal(name){
                return window.localStorage.getItem(name) != null
            }

            // Session Storage

            function getSession(name){
                if(hasLocal(name)){
                    return window.sessionStorage.getItem(name)
                }
            }
            function setSession(name, value){
                window.sessionStorage.setItem(name,value)
            }
            function removeSession(name){
                if(hasLocal(name)){
                    window.sessionStorage.removeItem(name)
                }
            }
            function hasSession(name){
                return window.sessionStorage.getItem(name) != null
            }

            const storage = {
                getLocal,
                setLocal,
                removeLocal,
                hasLocal,
                getSession,
                setSession,
                removeSession,
                hasSession
            }

            // DOM

            function getDOMElement(query){
                const elements = document.querySelectorAll(query)
                if(elements.length==1){
                    return elements[0]
                }
                return elements
            }
            function createDOMElement(type,attributes,parent){
                const element = document.createElement(type)
                
                const attr_names = Object.keys(attributes)
                attr_names.map(a=>{
                    if(element[a] != null || element[a] != undefined){
                        element[a] = attributes[a]
                    }else {
                        element.setAttribute(a,attributes[a])
                    }
                })

                element["listener"] = addEventListener

                parent.appendChild(element)
                return element
            }
            function createDOMElementAnonymous(type,attributes,base){
                const element = document.createElement(type)
                
                const attr_names = Object.keys(attributes)
                attr_names.map(a=>{
                    if(element[a] != null || element[a] != undefined){
                        element[a] = attributes[a]
                    }else {
                        element.setAttribute(a,attributes[a])
                    }
                })

                element["listener"] = addEventListener

                if(base == undefined) return element

                base.appendChild(element)
                return element
            }
            function deleteDOMElement(element){
                element.parentElement.removeChild(element)
            }

            const dom = {
                get: getDOMElement,
                add: createDOMElement,
                remove: deleteDOMElement,
                addAnonymous: createDOMElementAnonymous
            }

            // Jar_module_manager

            class JAR_MODULE_MANAGER__ {
                constructor(dom){
                    this.dom = dom
                    console.log("Module Manager is ON")
                }

                open(url){
                    const module = this.dom.add("script",{src:url},document.body)
                    module.onerror = (e)=>{
                        dom.remove(module)
                        throw new ReferenceError(`Module dont exist: ${url}`)
                    }
                    module.onload = ()=>{
                        this.dom.remove(module)
                    }
                }
            }

            resolve({
                application_manager: {
                    get,
                    cookie,
                    dom,
                    storage,
                    host: location.protocol + "//" + location.host + "/"
                },
                module_manager: new JAR_MODULE_MANAGER__(dom)
            })
        })
    }

    gen_applicationSignature().then(app=>{
        entry_listener(app)
    })
}()
