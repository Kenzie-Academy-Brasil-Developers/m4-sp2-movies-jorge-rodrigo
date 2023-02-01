import { Client } from "pg"

const client: Client = new Client({
    user: 'jorge',
    password: '3142',
    host: 'localhost',
    database: 'movies',
    port: 5432,
})

const startDatabase = async ():Promise<void> => {
  await client.connect()
  console.log("database connected")
}

export {client, startDatabase}