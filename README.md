# rx-dependency-resolver
reactive dependency resolver

## Purpose:
 
 Declarative way for implement dependency chain for ()=>Observable
 
 ## Use Case:

Lets assume that we have following factories 
+ config : which is fetched via http 

` type ConfigFactory=()=>Observable<Config>`

+ db which creates Connection and needs config to connect

` type ConnectionFactory=(c:Config)=>Observable<Connection>`

+ service which needs db connection  to 

` type Service=(c:Connection)=>Observable<Service>`


now rx-dependency-resolver gives an ability to 'connect' observable factories in declarative way
 
```javascript
//define 
const configSymbol: Symbol = Symbol("config");
const dbSymbol: Symbol = Symbol("db");
const serviceSymbol: Symbol = Symbol("service");

//register factories and (connect) dependencies

container.register(configSymbol, configFactory, [], "lazySingleton")
container.register(dbSymbol, connectionFactory, [configSymbol], "lazySingleton")
container.register(serviceSymbol, serviceFactory, [connectionSymbol], "lazySingleton")

//use 
  
container.get(serviceSymbol).subscribe((r) => {
 r.use()         
})
```
