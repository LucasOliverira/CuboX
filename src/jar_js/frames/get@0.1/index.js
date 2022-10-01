var get = (moduleName,callback)=>{}, set = (moduleName,returns)=>{}, route = (routeName,path)=>{}, complex = (complexName,paths)=>{}, getComplex = (complexName)=>{};
!function(){
    var context = {
        modules: [],
        routes: [],
        complex: []
    }

    set = (moduleName, data)=>{
        context.modules[moduleName] = data
    }

    function createInstance(src){
        const script = document.createElement("script")
        script.async = false
        script.type = "text/javascript"
        script.src = src
        document.head.appendChild(script)
        return script
    }

    function getModule(module){
        if(!module) throw new Error("Module is null")
        var instance
        if(module.indexOf("/")!=-1){
            instance = createInstance(module)
        }else {
            const src = getRoute(module)
            instance = createInstance(src)
        }
        instance.addEventListener("load",()=>{
            document.dispatchEvent(new CustomEvent(module,{detail:context.modules[module]}))
        })
    }

    get = (moduleName, callback)=>{
        if(typeof moduleName == "object"){
            var final = []
            moduleName.forEach(module => {
                getModule(module)
                document.addEventListener(module,e=>{
                    if(final.length == moduleName.length-1){
                        final.push(e.detail)
                        callback(...final)
                    }else {
                        final.push(e.detail)
                    }
                })
            });
        }else {
            getModule(moduleName)
            document.addEventListener(moduleName,e=>{
                callback(e.detail)
            })
        }
    }

    route = (routeName, path)=>{
        context.routes[routeName] = path
    }

    function getRoute(routeName){
        const path = context.routes[routeName]
        if(!path) throw new Error("Route not exist")
        return path
    }

    complex = (complexName, paths)=>{
        context.complex[complexName] = paths
    }

    getComplex = (complexName)=>{
        const paths = context.routes[complexName]
        if(!paths) throw new Error("Complex not exist")
        return paths
    }
}();