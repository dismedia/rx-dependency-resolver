import {Observable, of, zip} from "rxjs";
import {delay, shareReplay, switchMap, tap} from "rxjs/operators";
import {checkForCircularDependency} from "./circularDependency/circularDependeny";
import {diLog, DiLog} from "./log/diLog";


type provider<T> = Observable<T>


export type Entry = { creator: Creator<any>, dependencyArray: DependencyArray, instance: any, strategyType: ResolveStrategyType }

export type DependencyId = Symbol;
export type DependencyArray = DependencyId[];

export type Creator<T> = (...params: any[]) => Observable<T>

interface Container {
    register(dependencyId: DependencyId, creator, deps: DependencyArray, strategyType: ResolveStrategyType)

    get<T>(dependencyId: DependencyId): Observable<T>
}

export type ResolveStrategyType = "create" | "lazySingleton"
export type ResolveStrategy = (dependencies: any[], creator: Creator<any>) => Observable<any>


export const resolveStrategies: { [key: string]: ResolveStrategy } = {

    create: (dependencies: any[], creator: Creator<any>) =>
        dependencies.length ? zip(...dependencies).pipe(
            switchMap(array => creator(...array))
        ) : creator(),

    lazySingleton: (dependencies: any[], creator: Creator<any>) =>
        dependencies.length ? zip(...dependencies).pipe(
            switchMap(array => creator(...array)),
            shareReplay()
        ) : creator().pipe(
            shareReplay()
        ),

}


export const containerFactory: (log?:DiLog) => Container = (log=diLog) => {

    const map = new Map<DependencyId, Entry>()
    const register = (dependencyId: DependencyId, creator: Creator<any>, dependencyArray: DependencyArray, strategyType: ResolveStrategyType) => {

        map.set(dependencyId, {
            creator,
            dependencyArray,
            instance: null,
            strategyType
        })
    }


    const get = <T>(dependencyId: DependencyId, aggregatedDependencies: DependencyId[] = []) => {

        const entry = map.get(dependencyId);

        checkForCircularDependency(entry, aggregatedDependencies)

        aggregatedDependencies = [...aggregatedDependencies, ...entry.dependencyArray]


        const dependencies: any[] = entry.dependencyArray.map(dependencyId => get(dependencyId, aggregatedDependencies))
        entry.instance = entry.instance ? entry.instance : resolveStrategies[entry.strategyType](dependencies, entry.creator)


        return entry.instance.pipe(
            tap((e) => log.resolved(entry, dependencyId, entry.dependencyArray))
        );

    }


    return {

        register, get
    }


}






