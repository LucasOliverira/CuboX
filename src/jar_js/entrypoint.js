!async function(){
    // Start modules and default modules

    function startModule(url){
        return new Promise((resolve,reject)=>{
            const script = document.createElement("script")
            script.src = url
            const func = ()=>{
                script.remove()
                resolve()
            }
            script.onload = func
            script.onerror = func
            document.head.appendChild(script)
        })
    }

    await startModule("./jar_js/frames/@application_signature/index.js")

    const config = await fetch(`${app_signature.application_manager.host}jar_js/config.json`)
    .then(async res=>{
        return await res.json()  
    })

    if(config.frames){
        config.frames.map(frame=>{
            if(frame.name && frame.index && frame.version){
                const URL = `${app_signature.application_manager.host}jar_js/frames/${frame.name}@${frame.version}/${frame.index}`
                app_signature.module_manager.open(URL)
            }
        })
    }
}()