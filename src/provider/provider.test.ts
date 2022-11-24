import type {Method} from "../kuiper"
import type { Task, Tasks,Parameters} from "./index"
import { Provider, Service} from "./index"

enum ApiRoutes {
    testGet = "/get",
    testPost = "/post",
}

interface ApiTasks extends Tasks<ApiRoutes> {
    [ApiRoutes.testGet]: Task<ApiRoutes.testGet, null>
    [ApiRoutes.testPost]: Task<ApiRoutes.testPost, {key: string}>
}


class ApiService extends Service<ApiRoutes, ApiTasks> {
    baseUrl = "https://httpbin.org"

    headers(_route: ApiRoutes): [string, string][] {
        return [["Content-Type", "application/json"]]
    }

    methods(route: ApiRoutes): Method {
        switch (route) {
            case ApiRoutes.testGet:
                return "GET"
            case ApiRoutes.testPost:
                return "POST"
        }
    }

    tasks(route: ApiRoutes, data: ApiTasks[ApiRoutes]["data"]): Parameters {
        switch (route) {
            case ApiRoutes.testGet:
                return {}
            case ApiRoutes.testPost:
                return {body: data}
        }
    }
}


test("Test provider `testGet`", async () => {
    const provider = new Provider<ApiRoutes, ApiTasks>(new ApiService())
    const response = await provider.request(ApiRoutes.testGet, null)
    expect(response.ok).toBe(true)
})
