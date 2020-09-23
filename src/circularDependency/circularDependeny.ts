import {DependencyId, Entry} from "../index";

export const checkForCircularDependency = (entry: Entry, aggregatedDependencies: DependencyId[]) => {


    const circular = entry.dependencyArray.filter(u => aggregatedDependencies.indexOf(u)>-1)


    if (circular.length > 0) {
        console.log(entry.dependencyArray)
        console.log(aggregatedDependencies)
        throw new Error("circular dependecy for:" + circular.map(e => e.toString()).join(" "))
    }
}
