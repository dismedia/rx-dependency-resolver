export interface DiLog{
     resolved : (entry, id, dependencies)=>void
}


export const resolved = (entry, id, dependencies) => {

    console.log("resolved ",
        id.toString()
            .replace("Symbol(", "[")
            .replace(")", "]"), "which depends on ",
        dependencies.map(d => d.toString()
            .replace("Symbol(", "[")
            .replace(")", "]")));
}




export const diLog:DiLog={

    resolved

}
