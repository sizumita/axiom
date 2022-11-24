/* eslint-disable @typescript-eslint/no-unused-vars */
import type {Body, Method} from "../kuiper"
import kuiper from "../kuiper"
import {makeOptionWithBody} from "../util"

export class Service<T extends string, E extends Tasks<T>> {
    fetcher?: Fetcher
    baseUrl = ""

    headers(route: T): [string, string][] {
        return []
    }

    methods(route: T): Method {
        throw new Error("unimplemented")
    }

    tasks(route: E): Parameters {
        throw new Error("unimplemented")
    }

    constructor(fetcher?: Fetcher) {
        this.fetcher = fetcher
    }
}


export type Parameters = {
    params?: { [p: string]: string },
    queries?: { [p: string]: string },
    body?: Body
}


export type Task<T extends string, D> = [T, D]

export type Tasks<T extends string> = { [k in T]: Task<k, unknown> }[T]

export class Provider<T extends string, E extends Tasks<T>> {
    private service: Service<T, E>

    constructor(service: Service<T, E>) {
        this.service = service
    }

    async request(route: E) {
        const f = typeof this.service.fetcher === "undefined" ? kuiper : kuiper(this.service.fetcher)

        const task = this.service.tasks(route)
        let parsedRoutePath = route[0] as string

        // replace url params
        for (const [key, value] of Object.entries(task?.params ?? {})) {
            parsedRoutePath = parsedRoutePath.replaceAll(`{${key}}`, value)
        }
        const url = new URL(this.service.baseUrl + parsedRoutePath)

        // set queries
        Object.entries(task?.queries ?? {}).map(([key, value]) => url.searchParams.set(key, value))

        return await f(this.service.baseUrl + parsedRoutePath,
            makeOptionWithBody(this.service.methods(route[0]), {
                headers: this.service.headers(route[0]),
            }, task?.body))
    }
}
