import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { User } from "./entity/User"
import { send } from "process"

const userRepository = AppDataSource.getRepository(User)

AppDataSource.initialize()
    .then(async () => {
        // create express app
        const app = express()

        // register express routes from defined application routes
        Routes.forEach((route) => {
            ;(app as any)[route.method](
                route.route,
                (req: Request, res: Response, next: Function) => {
                    const result = new (route.controller as any)()[
                        route.action
                    ](req, res, next)
                    if (result instanceof Promise) {
                        result.then((result) =>
                            result !== null && result !== undefined
                                ? res.send(result)
                                : undefined,
                        )
                    } else if (result !== null && result !== undefined) {
                        res.json(result)
                    }
                },
            )
        })

        // setup express app here
        // ...

        app.get("/test", async (req, res) => {
            const allUsers = await userRepository.find()
            console.log(allUsers)
            res.status(200).json(allUsers)
        })

        // start express server
        app.listen(8002)

        // insert new users for test
        // await AppDataSource.manager.save(
        //     AppDataSource.manager.create(User, {
        //         firstName: "Timber",
        //         lastName: "Saw",
        //         age: 27,
        //     }),
        // )

        // await AppDataSource.manager.save(
        //     AppDataSource.manager.create(User, {
        //         firstName: "Phantom",
        //         lastName: "Assassin",
        //         age: 24,
        //     }),
        // )

        console.log(
            "Express server has started on port 8002. Open http://localhost:8002/users to see results",
        )
    })
    .catch((error) => console.log(error))
