const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// 
// Without express middleware: new request -> run route handler
// 
// With express middleware:    new request -> do something -> run route handler
// 

app.listen(port, () => {
  console.log('Server is up on port ' + port)
})