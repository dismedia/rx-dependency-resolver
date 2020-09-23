import {containerFactory} from "./index";
import {EMPTY, of, zip} from "rxjs";
import {catchError, delay, tap} from "rxjs/operators";


describe("container", () => {
    it("should be able to use creator when asked for instance", (done) => {

        const container = containerFactory()

        const itemSymbol: Symbol = Symbol("item");
        const item = {}

        const creator = jest.fn().mockReturnValue(of(item));

        container.register(itemSymbol, creator, [], "create")

        container.get(itemSymbol).subscribe((r) => {
            expect(r).toBe(item);
            expect(creator).toHaveBeenCalled();
            done();
        })


    })

    it("should be able to use creator to resolve dependency", (done) => {

        const container = containerFactory()

        const itemSymbol0: Symbol = Symbol("item0");
        const item0 = {}
        const creator0 = jest.fn().mockReturnValue(of(item0));


        const itemSymbol1: Symbol = Symbol("item1");
        const item1 = {}

        const creator1 = jest.fn().mockReturnValue(of(item1));


        container.register(itemSymbol0, creator0, [], "create")
        container.register(itemSymbol1, creator1, [itemSymbol0], "create")

        container.get(itemSymbol1).subscribe((r) => {
            expect(r).toBe(item1);
            expect(creator0).toHaveBeenCalled();
            expect(creator1).toHaveBeenCalledWith(item0);
            done();
        })
    })

    it("should be able to use creator when asked for instance (lazy singleton)", (done) => {

        const container = containerFactory()

        const itemSymbol: Symbol = Symbol("item");
        const item = {}

        const creator = jest.fn().mockReturnValue(of(item));

        container.register(itemSymbol, creator, [], "lazySingleton")


        container.get(itemSymbol).subscribe((r) => {
            expect(r).toBe(item);
            expect(creator).toHaveBeenCalled();
            done();
        })

    })

    it("should use once created value when asked for a second time (lazy singleton)", (done) => {

        const container = containerFactory()

        const itemSymbol: Symbol = Symbol("item");
        const item = {}

        const creator = jest.fn().mockReturnValue(of(item).pipe(delay(1000)));

        container.register(itemSymbol, creator, [], "lazySingleton")

        zip(container.get(itemSymbol), container.get(itemSymbol)).subscribe(([r0, r1]) => {


            expect(r0).toBe(item)
            expect(r1).toBe(item)
            expect(creator).toHaveBeenCalledTimes(1);
            done();

        })

    })


    xit("should detect circular reference", (done) => {

        const container = containerFactory()

        const itemSymbol0: Symbol = Symbol("item1");
        const itemSymbol1: Symbol = Symbol("item2");
        const itemSymbol2: Symbol = Symbol("item3");

        const creator0 = jest.fn().mockReturnValue(of({value: 0}).pipe(delay(500)));
        const creator1 = jest.fn().mockReturnValue(of({value: 1}).pipe(delay(500)));
        const creator2 = jest.fn().mockReturnValue(of({value: 2}).pipe(delay(500)));


        container.register(itemSymbol0, creator0, [itemSymbol1], "lazySingleton")
        container.register(itemSymbol1, creator1, [itemSymbol2], "lazySingleton")
        container.register(itemSymbol2, creator2, [itemSymbol0], "lazySingleton")


        zip(container.get(itemSymbol0), container.get(itemSymbol1), container.get(itemSymbol2)).pipe(
            catchError((e) => {


                expect(e).toBeDefined();
                done()
                return EMPTY
            })
        )

            .subscribe(([r0, r1, r2]) => {
            },)


    })

})
